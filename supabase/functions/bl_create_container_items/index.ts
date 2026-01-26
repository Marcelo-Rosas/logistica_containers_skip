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

    // Create Supabase client with the user's token (context propagation)
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
    let user = null
    if (authHeader) {
      const {
        data: { user: u },
        error: userError,
      } = await supabaseClient.auth.getUser()
      if (userError || !u) {
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
      user = u
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

    // RF-03: Canonical Payload Contract Support
    // Supports { container, items, request_id } (Single) OR { containers: [], request_id } (Batch)
    let containersToProcess = []

    if (body.container && body.items) {
      // Canonical Contract (Single Mode)
      // Normalize to internal array structure
      containersToProcess.push({
        ...body.container,
        items: body.items,
      })
    } else if (body.containers && Array.isArray(body.containers)) {
      // Legacy/Batch Mode
      containersToProcess = body.containers
    } else {
      return new Response(
        JSON.stringify({
          error:
            'Invalid payload. Must provide "container" and "items" (Canonical) OR "containers" array.',
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
        bl_number: container.bl_number || body.bl_number,
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
    // QA-02: Happy Path returns 200 with results
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
