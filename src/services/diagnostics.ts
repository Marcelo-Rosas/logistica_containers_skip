import { supabase } from '@/lib/supabase/client'

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bl_create_container_items`
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

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
    const headers: Record<string, string> = {
      apikey: ANON_KEY,
      'Content-Type': 'application/json',
    }

    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`
    }

    return headers
  },

  async runRawRequest(
    url: string,
    method: string,
    body?: any,
  ): Promise<Partial<QAResult>> {
    const headers = (await this.getAuthHeaders()) as any

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
          bl_number: `QA-${requestId.substring(0, 8)}`,
          cliente_id: '00000000-0000-0000-0000-000000000000',
          total_volume_m3: 33.2,
          total_weight_kg: 1200,
          vessel: 'QA-VESSEL',
          voyage: 'QA-VOYAGE',
          items: [{ sku: 'TEST-SKU', name: 'Test Item', quantity: 10 }],
        },
      ],
    })
  },

  async testDuplicate(requestId: string) {
    // Re-use same payload logic as happy path to simulate duplicate
    return this.runRawRequest(EDGE_FUNCTION_URL, 'POST', {
      request_id: requestId,
      bl_number: `QA-${requestId.substring(0, 8)}`,
      containers: [
        {
          codigo: `QA-CONT-DUPE`,
          tipo: '20ft',
          bl_number: `QA-${requestId.substring(0, 8)}`,
          cliente_id: '00000000-0000-0000-0000-000000000000',
          total_volume_m3: 33.2,
          total_weight_kg: 1200,
          vessel: 'QA-VESSEL',
          voyage: 'QA-VOYAGE',
          items: [{ sku: 'TEST-SKU', name: 'Test Item', quantity: 10 }],
        },
      ],
    })
  },

  async testRLS() {
    const randomOrgId = '00000000-0000-0000-0000-000000000000'
    return this.runRawRequest(EDGE_FUNCTION_URL, 'POST', {
      request_id: crypto.randomUUID(),
      organization_id: randomOrgId, // Attempt to inject foreign org
      bl_number: 'QA-RLS-TEST',
      containers: [],
    })
  },
}
