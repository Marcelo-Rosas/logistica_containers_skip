import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  // RF-05: CORS Preflight - Respond to OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Auth & Context Setup
    const authHeader = req.headers.get('Authorization')
    const apiKey = req.headers.get('apikey')

    // RF-01: Ensure apikey is present
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing apikey header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // RF-02: User Context Propagation
    // Create Supabase client with the user's token (context propagation) to respect RLS
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader ?? '' },
        },
      },
    )

    // Verify user validity only if auth header is present
    if (authHeader) {
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

    const { request_id } = body

    // RF-04: UUID Validation
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

    // RF-03: Canonical Payload Contract Support
    // Supports { container, items, request_id } (Single) OR { containers: [], request_id } (Batch)
    let containersToProcess = []

    if (body.container) {
      // Canonical Contract (Single Mode)
      containersToProcess.push({
        ...body.container,
        items: body.items || [],
      })
    } else if (body.containers && Array.isArray(body.containers)) {
      // Legacy/Batch Mode
      // Propagate root-level bl_number if missing in container
      const rootBlNumber = body.bl_number
      containersToProcess = body.containers.map((c: any) => ({
        ...c,
        bl_number: c.bl_number || rootBlNumber,
      }))
    } else {
      return new Response(
        JSON.stringify({
          error:
            'Invalid payload. Must provide "container" (Canonical) OR "containers" array.',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // 3. Process Logic (RPC Integration)
    const results = []

    for (const container of containersToProcess) {
      // Map input to what RPC/DB expects
      const containerPayload = {
        bl_number: container.bl_number,
        container_number: container.container_number || container.codigo,
        container_type: container.container_type || container.tipo,
        ...container,
      }

      // Ensure items is an array
      const itemsPayload = container.items || containerPayload.items || []

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
        // QA-03: Handle duplicates or errors
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
    // RF-05: Ensure headers on success
    return new Response(
      JSON.stringify({
        message: 'Processing complete',
        request_id,
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error: any) {
    // RF-05: Ensure CORS on 500 errors
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
