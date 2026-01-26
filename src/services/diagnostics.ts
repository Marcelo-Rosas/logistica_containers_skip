import { supabase } from '@/lib/supabase/client'

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bl_create_container_items`

export interface QAResult {
  test_id: string
  description: string
  status: number
  headers: Record<string, string>
  body: any
  passed: boolean
}

const getAnonKey = () => {
  // Priority: VITE_SUPABASE_ANON_KEY -> VITE_SUPABASE_PUBLISHABLE_KEY
  const key =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  if (!key) {
    throw new Error(
      'Missing anon key env var (VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY)',
    )
  }
  return key
}

export const DiagnosticsService = {
  async getAuthHeaders() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const headers: Record<string, string> = {
      apikey: getAnonKey(),
      'Content-Type': 'application/json',
    }

    // Conditional Authorization: Only include if access_token exists
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }

    return headers
  },

  async runRawRequest(
    url: string,
    method: string,
    body?: any,
    customHeaders: Record<string, string> = {},
  ): Promise<Partial<QAResult>> {
    let authHeaders = {}
    try {
      authHeaders = await this.getAuthHeaders()
    } catch (e: any) {
      return {
        status: 0,
        headers: {},
        body: { error: e.message },
      }
    }

    const headers = { ...authHeaders, ...customHeaders }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      })

      const resHeaders: Record<string, string> = {}
      response.headers.forEach((val, key) => {
        // Capture specific headers including CORS and debugging ones
        if (
          key.toLowerCase().startsWith('access-control-allow') ||
          ['content-type', 'x-deno-ray', 'x-request-id', 'date'].includes(
            key.toLowerCase(),
          )
        ) {
          resHeaders[key.toLowerCase()] = val
        }
      })

      let resBody
      try {
        const text = await response.text()
        resBody = text ? JSON.parse(text) : {}
      } catch {
        resBody = { error: 'Failed to parse JSON body' }
      }

      return {
        status: response.status,
        headers: resHeaders,
        body: resBody,
      }
    } catch (error: any) {
      return {
        status: 0,
        headers: {},
        body: { error: error.message },
      }
    }
  },

  async testAuth() {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/user`,
        {
          method: 'GET',
          headers: headers as any,
        },
      )

      let resBody
      try {
        const text = await response.text()
        resBody = text ? JSON.parse(text) : {}
      } catch {
        resBody = { error: 'Failed to parse JSON body' }
      }

      return {
        status: response.status,
        headers: {},
        body: resBody,
      }
    } catch (e: any) {
      return { status: 0, headers: {}, body: { error: e.message } }
    }
  },

  async testInvalidUUID() {
    // QA-01: Invalid UUID Validation
    // Sends a complete standardized payload structure but with an invalid request_id
    // to verify the Edge Function validation logic specifically for UUIDs
    return this.runRawRequest(EDGE_FUNCTION_URL, 'POST', {
      request_id: 'invalid-uuid-string',
      bl_number: 'QA-TEST-INVALID-UUID',
      containers: [],
    })
  },

  async testHappyPath(requestId: string) {
    // QA-02: Happy Path
    return this.runRawRequest(EDGE_FUNCTION_URL, 'POST', {
      request_id: requestId,
      bl_number: `QA-${requestId.substring(0, 8)}`,
      containers: [
        {
          codigo: `QA-CONT-${Math.floor(Math.random() * 1000)}`,
          tipo: '20ft',
          items: [{ sku: 'TEST-SKU', name: 'Test Item', quantity: 10 }],
        },
      ],
    })
  },

  async testDuplicate(requestId: string) {
    // QA-03: Duplicate / Idempotency
    // Re-use same request_id and payload to simulate duplicate
    return this.runRawRequest(EDGE_FUNCTION_URL, 'POST', {
      request_id: requestId,
      bl_number: `QA-${requestId.substring(0, 8)}`,
      containers: [
        {
          codigo: `QA-CONT-DUPE`,
          tipo: '20ft',
          items: [],
        },
      ],
    })
  },

  async testRLS() {
    // QA-04: RLS / Cross-Org Access
    // Attempt to inject a foreign organization_id to verify RLS isolation
    const randomOrgId = '00000000-0000-0000-0000-000000000000'
    return this.runRawRequest(EDGE_FUNCTION_URL, 'POST', {
      request_id: crypto.randomUUID(),
      organization_id: randomOrgId, // Injection attempt at root
      bl_number: 'QA-RLS-TEST',
      containers: [
        {
          organization_id: randomOrgId, // Injection attempt at item level
          codigo: `QA-RLS-${Math.floor(Math.random() * 1000)}`,
          tipo: '20ft',
          items: [],
        },
      ],
    })
  },
}
