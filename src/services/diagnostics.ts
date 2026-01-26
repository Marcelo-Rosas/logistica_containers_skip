import { supabase } from '@/lib/supabase/client'

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bl_create_container_items`
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export interface QAResult {
  test_id: string
  description: string
  status: number
  headers: Record<string, string>
  body: any
  passed: boolean
}

export const DiagnosticsService = {
  async getAuthHeaders() {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return {
      apikey: ANON_KEY,
      Authorization: session?.access_token
        ? `Bearer ${session.access_token}`
        : undefined,
      'Content-Type': 'application/json',
    }
  },

  async runRawRequest(
    url: string,
    method: string,
    body?: any,
    customHeaders: Record<string, string> = {},
  ): Promise<Partial<QAResult>> {
    const authHeaders = (await this.getAuthHeaders()) as any
    const headers = { ...authHeaders, ...customHeaders }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      })

      const resHeaders: Record<string, string> = {}
      response.headers.forEach((val, key) => {
        // Capture specific headers requested
        if (
          [
            'access-control-allow-origin',
            'access-control-allow-headers',
            'access-control-allow-methods',
            'content-type',
          ].includes(key.toLowerCase())
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
    const headers = await this.getAuthHeaders()
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/user`,
        {
          method: 'GET',
          headers: headers as any,
        },
      )
      const body = await response.json()
      return {
        status: response.status,
        headers: {},
        body,
      }
    } catch (e: any) {
      return { status: 0, headers: {}, body: { error: e.message } }
    }
  },

  async testInvalidUUID() {
    return this.runRawRequest(EDGE_FUNCTION_URL, 'POST', {
      request_id: 'invalid-uuid-string',
    })
  },

  async testHappyPath(requestId: string) {
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
    // Re-use same payload logic as happy path to simulate duplicate
    // The Edge Function should handle this idempotently
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
    // To properly test RLS failure on Edge Function, we would need to sign a token for another user
    // or attempt to access data that doesn't belong to us.
    // However, since we can't easily generate other users' tokens here, we simulate by sending
    // an organization_id in body that differs from the token's org (if the logic trusted body).
    // The acceptance criteria QA-04 asks for cross-org access prohibition.
    // We will verify that the function ignores body org_id and uses token.
    // But actually, to fail, we should try to insert for another org if possible.
    // Since we are creating new data, RLS prevents inserting if org_id mismatches.
    const randomOrgId = '00000000-0000-0000-0000-000000000000'
    return this.runRawRequest(EDGE_FUNCTION_URL, 'POST', {
      request_id: crypto.randomUUID(),
      organization_id: randomOrgId, // Attempt to inject foreign org
      bl_number: 'QA-RLS-TEST',
      containers: [
        {
          codigo: `QA-RLS-${Math.floor(Math.random() * 1000)}`,
          tipo: '20ft',
          items: [],
        },
      ],
    })
  },
}
