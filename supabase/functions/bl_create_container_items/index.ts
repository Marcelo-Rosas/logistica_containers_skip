import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Auth & Context Setup
    // Manual JWT verification logic to ensure robust handling even if --no-verify-jwt is used
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Create Supabase client with the user's token (context propagation)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      },
    )

    // Verify user validity (extra security check)
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({
          error: 'Invalid or expired token',
          details: userError,
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // 2. Parse Body & Input Validation
    let body
    try {
      body = await req.json()
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { request_id, bl_number, containers } = body

    // QA-01: UUID Validation
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!request_id || !uuidRegex.test(request_id)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request_id. Must be a valid UUID.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    if (!containers || !Array.isArray(containers)) {
      return new Response(
        JSON.stringify({ error: 'Invalid containers array.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // 3. Process Logic (RPC Integration)
    const results = []

    // Iterate over containers and call the RPC for each
    for (const container of containers) {
      // Prepare container payload for RPC
      // Mapping input fields to what RPC/DB expects (p_container: Json)
      const containerPayload = {
        ...container,
        bl_number: bl_number, // Ensure BL number is propagated
        container_number: container.codigo || container.container_number, // Fallback
        container_type: container.tipo || container.container_type,
      }

      const itemsPayload = container.items || []

      // Call RPC using the authenticated client (preserves RLS)
      const { data, error } = await supabaseClient.rpc(
        'rpc_create_container_with_items',
        {
          p_container: containerPayload,
          p_items: itemsPayload,
          p_request_id: request_id,
        },
      )

      if (error) {
        // Handle database errors (including duplicate checks if RPC returns error for it)
        // If it's a constraint violation for duplicate, we might want to flag it as skipped/duplicate
        if (
          error.code === '23505' ||
          error.message?.toLowerCase().includes('duplicate')
        ) {
          results.push({
            container: containerPayload.container_number,
            status: 'duplicate',
            message: 'Container/Item already exists',
            error: error.message,
          })
        } else {
          results.push({
            container: containerPayload.container_number,
            status: 'error',
            error: error.message,
          })
        }
      } else {
        results.push({
          container: containerPayload.container_number,
          status: 'success',
          data,
        })
      }
    }

    // 4. Response
    // Return 200 OK with results summary.
    // QA-03 says duplicate should return status 200, 409 or 422.
    // Since we process a batch, we return 200 with individual statuses unless all failed badly.

    return new Response(
      JSON.stringify({
        message: 'Processing complete',
        request_id,
        results,
      }),
      {
        status: 200, // Always 200 for batch processing unless catastrophic failure
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
