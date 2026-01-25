/* Type definitions for the application entities */

export type Client = {
  id: string
  nome: string
  contato?: string
  email: string
  created_at?: string
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
  tipo?: string
  status: ContainerStatus
  occupancy_rate: number
  sku_count: number

  // Metrics (Current State)
  total_volume_m3: number
  total_weight_kg: number // Gross or Net depending on context, we map Net here mostly
  total_net_weight_kg: number
  total_quantity: number

  // Initial / Capacities for Calculation (Original State)
  initial_capacity_m3: number
  initial_total_net_weight_kg: number
  initial_quantity: number

  // Computed
  active_strategy?: BillingStrategy

  created_at: string
  arrival_date?: string
  storage_start_date?: string
  seal?: string
  base_monthly_cost: number
}

export type InventoryItem = {
  id: string
  container_id: string
  sku: string
  name: string
  quantity: number
  unit_volume_m3: number
  unit_value?: number
  unit_net_weight_kg: number
  total_net_weight_kg: number
  packaging_type?: string
}

export type LogisticsEvent = {
  id: string
  type: 'entry' | 'exit'
  container_id: string
  container_code?: string
  sku: string
  quantity: number
  volume_m3?: number
  weight_kg?: number
  doc_number?: string
  destination?: string
  responsible?: string
  timestamp: string
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

export type ActivityLog = {
  id: string
  message: string
  timestamp: string
  type: 'info' | 'success' | 'warning'
}

export type BillOfLading = {
  id: string
  number: string
  client_id?: string
  client_name?: string
}

export type ContainerTypeDef = {
  id: string
  name: string
  volume_m3: number
  price: number
}
