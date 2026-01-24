/* Type definitions for the application entities */

export type Client = {
  id: string
  nome: string
  contato: string
  email: string
  created_at: string
  cnpj?: string
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

export type BillingStrategy = 'VOLUME' | 'WEIGHT' | 'QUANTITY'

export type Container = {
  id: string
  cliente_id?: string
  cliente_nome?: string
  bl_id?: string
  bl_number?: string
  codigo: string
  bl_number_legacy?: string
  capacidade: string
  tipo?: string
  status: ContainerStatus
  occupancy_rate: number
  sku_count: number

  // Metrics
  total_volume_m3: number
  total_weight_kg: number // Gross Weight (BL)
  total_net_weight_kg?: number // Net Weight (Inventory Sum)
  total_quantity?: number

  // Initial / Capacities for Calculation
  initial_capacity_m3?: number
  max_weight_capacity?: number // Payload capacity (e.g. 28000kg)
  initial_quantity?: number

  // Computed
  active_strategy?: BillingStrategy

  created_at: string
  arrival_date?: string
  storage_start_date?: string
  seal?: string
  base_monthly_cost?: number
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
  custo_mensal: number
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
  reference_id?: string
  calculation_method?: 'pro_rata' | 'volume_snapshot'
  billing_strategy?: BillingStrategy

  // Meta for display
  days_pro_rated?: number
  snapshot_date?: string

  metric_used?: number
  metric_total?: number
  metric_unit?: string
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
  weight_kg?: number
  doc_number: string
  destination: string
  responsible: string
  timestamp: string
  value: number
  fee?: number
}

export type BillOfLading = {
  id: string
  number: string
  internal_ref?: string
  client_id: string
  client_name: string
  shipper: string
  consignee: string
  notify_party?: string
  forwarding_agent?: string
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
  freight_terms?: string
  freight_cost?: number
  freight_currency?: string
  handling_fee?: number
  handling_fee_currency?: string
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

export type SystemSettings = {
  tariffs: {
    dry20: number
    dry40: number
    dry40hc: number
    rounding: boolean
  }
  measurement: {
    day: number
    time: string
    auto: boolean
    notify: boolean
  }
}
