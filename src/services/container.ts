/* Container Service using Supabase with Hierarchical Strategy */
import { supabase } from '@/lib/supabase/client'
import {
  Container,
  InventoryItem,
  BillingStrategy,
  LogisticsEvent,
} from '@/lib/types'

// Helper to determine strategy
const determineStrategy = (items: any[]): BillingStrategy => {
  if (!items || items.length === 0) return 'QUANTITY'

  // 1. Volume (if items have CBM data)
  const hasVolume = items.some((i) => (i.cbm || 0) > 0)
  if (hasVolume) return 'VOLUME'

  // 2. Weight (if items have Net Weight data)
  const hasWeight = items.some((i) => (i.unit_net_weight || 0) > 0)
  if (hasWeight) return 'WEIGHT'

  // 3. Quantity (Fallback)
  return 'QUANTITY'
}

// Helper to calculate occupancy
const calculateOccupancy = (current: number, initial: number) => {
  if (initial <= 0) return 0
  return Math.min(100, Math.round((current / initial) * 100))
}

export const getContainers = async (): Promise<Container[]> => {
  const { data, error } = await supabase
    .from('containers')
    .select(
      `
      *,
      customers (name)
    `,
    )
    .order('created_at', { ascending: false })

  if (error) throw error

  return data.map(mapContainerFromDB)
}

export const getContainer = async (id: string): Promise<Container> => {
  const { data: containerData, error: containerError } = await supabase
    .from('containers')
    .select(
      `
      *,
      customers (name, id)
    `,
    )
    .or(`id.eq.${id},container_number.eq.${id}`)
    .single()

  if (containerError) throw containerError

  // Fetch items to determine strategy
  const { data: items } = await supabase
    .from('container_items')
    .select('*')
    .eq('container_id', containerData.id)

  const container = mapContainerFromDB(containerData)

  // Dynamic Strategy Calculation
  container.active_strategy = determineStrategy(items || [])

  // Occupancy Calculation based on Strategy
  if (container.active_strategy === 'VOLUME') {
    container.occupancy_rate = calculateOccupancy(
      container.total_volume_m3,
      container.initial_capacity_m3,
    )
  } else if (container.active_strategy === 'WEIGHT') {
    container.occupancy_rate = calculateOccupancy(
      container.total_net_weight_kg,
      container.initial_total_net_weight_kg,
    )
  } else {
    container.occupancy_rate = calculateOccupancy(
      container.total_quantity,
      container.initial_quantity,
    )
  }

  // Count SKUs
  container.sku_count = items?.length || 0

  return container
}

export const getInventory = async (
  containerId: string,
): Promise<InventoryItem[]> => {
  const { data, error } = await supabase
    .from('container_items')
    .select('*')
    .eq('container_id', containerId)
    .gt('available_quantity', 0)

  if (error) throw error

  return data.map((item) => ({
    id: item.id,
    container_id: item.container_id,
    sku: item.product_code,
    name: item.product_name,
    quantity: item.available_quantity,
    unit_volume_m3: (item.cbm || 0) / (item.original_quantity || 1), // Approx
    unit_net_weight_kg: item.unit_net_weight || 0,
    total_net_weight_kg: item.total_net_weight || 0,
    unit_value: 0,
  }))
}

export const getEvents = async (): Promise<LogisticsEvent[]> => {
  const { data, error } = await supabase
    .from('container_movements')
    .select(
      `
      *,
      containers (container_number)
    `,
    )
    .order('created_at', { ascending: false })

  if (error) return []

  return data.map((evt) => ({
    id: evt.id,
    type: evt.movement_type as 'entry' | 'exit',
    container_id: evt.container_id,
    container_code: evt.containers?.container_number,
    sku: (evt.metadata as any)?.sku || 'UNKNOWN',
    quantity: (evt.metadata as any)?.quantity || 0,
    volume_m3: (evt.metadata as any)?.volume_removed,
    weight_kg: (evt.metadata as any)?.weight_removed,
    timestamp: evt.created_at || new Date().toISOString(),
    responsible: (evt.metadata as any)?.responsible,
    doc_number: (evt.metadata as any)?.doc_number,
  }))
}

export const createExitEvent = async (params: {
  container_id: string
  inventory_id: string
  quantity: number
  doc_number: string
  destination: string
  responsible: string
}) => {
  // Use the RPC function defined in migration
  const { data, error } = await supabase.rpc('register_exit_event', {
    p_container_id: params.container_id,
    p_item_id: params.inventory_id,
    p_quantity: params.quantity,
    p_doc_number: params.doc_number,
    p_destination: params.destination,
    p_responsible: params.responsible,
    p_user_id: (await supabase.auth.getUser()).data.user?.id,
  })

  if (error) throw error
  return { ...params, sku: 'ITEM' } // Mock return for UI update
}

// Mapper
const mapContainerFromDB = (db: any): Container => ({
  id: db.id,
  codigo: db.container_number,
  status: db.status,
  tipo: db.container_type || 'Unknown',
  cliente_id: db.consignee_id,
  cliente_nome: db.customers?.name,

  total_volume_m3: db.total_cbm || 0,
  total_net_weight_kg: db.total_net_weight || 0,
  total_weight_kg: db.total_gross_weight || 0,
  total_quantity: db.total_volumes || 0,

  initial_capacity_m3: db.initial_capacity_cbm || 76.4,
  initial_total_net_weight_kg: db.initial_total_net_weight || 1,
  initial_quantity: db.initial_total_volumes || 1,

  occupancy_rate: 0, // Calculated later if needed
  sku_count: 0,
  base_monthly_cost: db.base_monthly_cost || 3000,
  created_at: db.created_at || new Date().toISOString(),
  arrival_date: db.arrival_date,
  storage_start_date: db.storage_start_date,
})
