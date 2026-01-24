/* Type definitions for the application entities */

export type Client = {
  id: string
  nome: string
  contato: string
  email: string
  created_at: string
  cnpj?: string // Added for data completeness
}

export type ContainerStatus =
  | 'Ativo'
  | 'Parcial'
  | 'Vazio'
  | 'Pendente'
  | 'Cheio'
  | 'Fechado'
  | 'Disponível'
  | 'Ocupado'
  | 'Manutenção'

export type ContainerTypeDef = {
  id: string
  name: string
  volume_m3: number
  price: number
}

export type Container = {
  id: string
  cliente_id?: string
  cliente_nome?: string
  bl_id?: string // Linked BL
  bl_number?: string // Helper for display
  codigo: string
  bl_number_legacy?: string // Keeping for backward compatibility if needed, but bl_id is primary
  capacidade: string
  tipo?: string
  status: ContainerStatus
  occupancy_rate: number // 0-100
  sku_count: number
  total_volume_m3: number // Current volume occupied by cargo
  total_weight_kg: number
  created_at: string
  arrival_date?: string
  storage_start_date?: string
  seal?: string // New field
  // New billing fields
  initial_capacity_m3?: number // Max capacity for billing (e.g. 76 for 40HC)
  base_monthly_cost?: number // Base price (e.g. 3200)
}

export type Allocation = {
  id: string
  container_id: string
  container_code: string
  cliente_id: string
  cliente_nome: string
  data_entrada: string
  data_saida?: string
  packing_list_url?: string
  custo_mensal: number // Keeps legacy or override
  created_at: string
  status: 'Ativo' | 'Finalizado'
}

export type Measurement = {
  id: string
  alocacao_id: string
  mes_referencia: string
  valor_cobrado: number
  status_pagamento: 'Pendente' | 'Pago' | 'Atrasado'
  created_at: string
}

export type InvoiceItem = {
  id: string
  description: string
  amount: number
  type: 'storage' | 'exit_fee' | 'handling' | 'other'
  reference_id?: string // container_id or event_id
  // New billing details
  calculation_method?: 'pro_rata' | 'volume_snapshot'
  days_pro_rated?: number
  snapshot_date?: string
  used_volume_m3?: number
  occupancy_percentage?: number
  base_cost?: number
  savings?: number
}

export type Invoice = {
  id: string
  client_id: string
  client_name: string
  month: number
  year: number
  total_amount: number
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue'
  due_date: string
  created_at: string
  items: InvoiceItem[]
}

export type ActivityLog = {
  id: string
  message: string
  timestamp: string
  type: 'info' | 'success' | 'warning'
}

export type DashboardStats = {
  activeAllocations: number
  occupancyRate: number
  activeClients: number
  pendingExitCosts: number
  nextBillingDate: string
  statusDistribution: {
    status: string
    count: number
    fill: string
  }[]
}

export type InventoryItem = {
  id: string
  container_id: string
  sku: string
  name: string
  quantity: number
  unit_volume_m3: number
  unit_value: number
  // New fields
  model?: string
  packaging_type?: string
  gross_weight_kg?: number
  net_weight_kg?: number
  package_count?: number
}

export type LogisticsEvent = {
  id: string
  type: 'entry' | 'exit'
  container_id: string
  container_code: string
  sku: string
  quantity: number
  volume_m3: number
  doc_number: string
  destination: string
  responsible: string
  timestamp: string
  value: number
  fee?: number
}

// New Types for BL Story
export type BillOfLading = {
  id: string
  number: string
  internal_ref?: string // New field
  client_id: string
  client_name: string
  shipper: string
  consignee: string
  notify_party?: string // New field
  forwarding_agent?: string // New field (optional but good to have)
  vessel: string
  voyage: string
  port_of_loading: string
  port_of_discharge: string
  total_weight_kg: number
  total_volume_m3: number
  container_count: number
  status: 'Pending' | 'Processed' | 'Divergent' | 'Cleared'
  created_at: string
  file_url?: string
  // Financials
  freight_terms?: string // New field
  freight_cost?: number // New field
  freight_currency?: string // New field
  handling_fee?: number // New field
  handling_fee_currency?: string // New field
}

export type Divergence = {
  id: string
  bl_id: string
  bl_number: string
  type:
    | 'Weight'
    | 'Volume'
    | 'Container Number'
    | 'Seal'
    | 'NCM'
    | 'Missing EDI'
  severity: 'Critical' | 'Warning' | 'Info'
  description: string
  status: 'Open' | 'Resolved' | 'Ignored'
  created_at: string
  edi_value?: string
  bl_value?: string
}

export type EDILog = {
  id: string
  bl_id: string
  payload_snippet: string
  received_at: string
  status: 'Matched' | 'Divergent' | 'Orphaned'
}
