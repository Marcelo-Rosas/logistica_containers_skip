/* Type definitions for the application entities */

export type Client = {
  id: string
  name: string
  trade_name?: string | null
  email?: string | null
  phone?: string | null
  cnpj?: string | null
}

export type Supplier = {
  id: string
  name: string
  trade_name?: string | null
  email?: string | null
}

export type ContainerType = {
  code: string
  name: string
  nominal_volume_m3: number | null
  description?: string | null
}

export type Warehouse = {
  id: string
  name: string
  code: string
}

export type StorageLocation = {
  id: string
  code: string
  type?: string | null
  warehouse_id: string
  is_occupied?: boolean | null
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

// Represents the View: public.containers_stats_view
export type ContainerStats = {
  id: string
  container_number: string
  container_code?: string
  bl_number?: string | null
  client_id?: string | null
  client_name?: string | null
  status: ContainerStatus
  container_type: string | null
  container_type_name?: string | null
  occupancy_percentage: number | null
  items_count: number | null
  total_gross_weight: number | null
  total_available: number | null
  total_released: number | null
  nominal_volume_m3: number | null
  used_volume: number | null
  start_date?: string | null
  yard_location?: string | null
}

// Represents the Table: public.containers
export type Container = {
  id: string
  container_number: string
  bl_number?: string | null
  status: ContainerStatus
  container_type?: string | null

  // Relations (IDs)
  organization_id: string
  consignee_id?: string | null
  supplier_id?: string | null
  warehouse_id?: string | null
  storage_location_id?: string | null

  // Metrics
  total_cbm: number | null
  total_gross_weight: number | null
  total_net_weight: number | null
  total_volumes: number | null

  // Initial / Capacities
  initial_capacity_cbm: number | null
  initial_total_net_weight: number | null
  initial_total_volumes: number | null
  base_monthly_cost: number | null

  // Timestamps
  arrival_date?: string | null
  storage_start_date?: string | null
  created_at: string
  updated_at?: string | null

  // Extended Data (Joined)
  consignee?: Client
  supplier?: Supplier
  warehouse?: Warehouse
  storage_location?: StorageLocation
  type_details?: ContainerType

  // Computeds
  occupancy_rate?: number
  active_strategy?: BillingStrategy
  sku_count?: number
}

export type ContainerItem = {
  id: string
  container_id: string
  product_code: string
  product_name: string
  description?: string | null

  // Quantities
  original_quantity: number
  available_quantity: number
  reserved_quantity: number | null
  released_quantity: number | null
  damaged_quantity: number | null

  // Metrics
  cbm: number | null
  unit_net_weight: number | null
  total_net_weight: number | null

  packaging_type?: string | null
  created_at?: string | null
}

// Deprecated / Compatibility types (to be phased out or mapped)
export type InventoryItem = ContainerItem & {
  sku: string
  name: string
  quantity: number
  unit_volume_m3: number
  unit_net_weight_kg: number
  total_net_weight_kg: number
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
  items: any[]
}

export type ContainerTypeDef = {
  id: string
  name: string
  volume_m3: number
  price: number
}
