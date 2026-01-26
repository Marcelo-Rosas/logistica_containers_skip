import { supabase } from '@/lib/supabase/client'

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bl_create_container_items`

export interface QAResult {
  test_id: string
  description: string
  status: number | string // Allow 'SKIPPED' string
  headers: Record<string, string>
  body: any
  passed: boolean
}

// RF-02: Anon Key Prioritization
const getAnonKey = () => {
  // Priority: VITE_SUPABASE_ANON_KEY -> VITE_SUPABASE_PUBLISHABLE_KEY
  const key =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

  if (!key) {
    throw new Error(
      'Missing anon key in env (VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY)',
    )
  }
  return key
}

export const DiagnosticsService = {
  // RF-01: Authentication Header Consistency
  async getAuthHeaders() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const headers: Record<string, string> = {
      apikey: getAnonKey(),
      'Content-Type': 'application/json',
    }

    // RF-01: Only include Authorization if session exists and is valid
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    } else {
      // If we are testing an authenticated endpoint, this might fail,
      // but RF-01 says "must never be sent as undefined".
      // We do NOT throw here because some tests might want to check unauthenticated access.
      // However, the test runner should check session if needed.
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
        // RF-05: Capture specific headers including CORS
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
      // RF-01 Check: If no Authorization header is generated (no session),
      // we should probably fail this check fast if the user expects to be logged in.
      // However, runRawRequest handles the fetch.

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
    // RF-03: Uses Canonical Contract even for negative test
    return this.runRawRequest(EDGE_FUNCTION_URL, 'POST', {
      request_id: 'invalid-uuid-string',
      container: {
        container_number: 'QA-INVALID-UUID',
        container_type: '20ft',
        bl_number: 'QA-TEST-INVALID',
      },
      items: [],
    })
  },

  async testHappyPath(requestId: string) {
    // QA-02: Happy Path
    // RF-03: Must follow canonical contract { container, items, request_id }
    return this.runRawRequest(EDGE_FUNCTION_URL, 'POST', {
      request_id: requestId,
      container: {
        bl_number: `QA-${requestId.substring(0, 8)}`,
        container_number: `QA-CONT-${Math.floor(Math.random() * 1000)}`,
        container_type: '20ft',
      },
      items: [{ sku: 'TEST-SKU', name: 'Test Item', quantity: 10 }],
    })
  },

  async testDuplicate(requestId: string) {
    // QA-03: Duplicate / Idempotency
    // Re-use same request_id and payload
    // Using Canonical Contract
    return this.runRawRequest(EDGE_FUNCTION_URL, 'POST', {
      request_id: requestId,
      container: {
        bl_number: `QA-${requestId.substring(0, 8)}`,
        container_number: `QA-CONT-DUPE`,
        container_type: '20ft',
      },
      items: [],
    })
  },

  async testRLS() {
    // QA-04: RLS / Cross-Org Access
    // Since we don't have a cross-org token, we perform an Injection Attack test.
    // If we try to inject a different organization_id, backend should ignore it or fail.
    const randomOrgId = '00000000-0000-0000-0000-000000000000'

    return this.runRawRequest(EDGE_FUNCTION_URL, 'POST', {
      request_id: crypto.randomUUID(),
      container: {
        organization_id: randomOrgId, // Injection attempt
        container_number: `QA-RLS-${Math.floor(Math.random() * 1000)}`,
        container_type: '20ft',
        bl_number: 'QA-RLS-TEST',
      },
      items: [],
    })
  },
}
