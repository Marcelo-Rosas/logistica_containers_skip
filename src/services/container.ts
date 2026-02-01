import { supabase } from '@/lib/supabase/client'
import {
  Container,
  ContainerStats,
  ContainerItem,
  BillingStrategy,
  LogisticsEvent,
  InventoryItem,
} from '@/lib/types'

// Helper to get current user's organization_id
const getOrganizationId = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  if (user.user_metadata?.organization_id) {
    return user.user_metadata.organization_id
  }

  const { data: userData, error } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (error || !userData) {
    console.error('Error fetching organization_id', error)
    throw new Error('Organization ID not found for user')
  }

  return userData.organization_id
}

// Helper to determine strategy
const determineStrategy = (items: any[]): BillingStrategy => {
  if (!items || items.length === 0) return 'QUANTITY'
  const hasVolume = items.some((i) => (i.cbm || 0) > 0)
  if (hasVolume) return 'VOLUME'
  const hasWeight = items.some((i) => (i.unit_net_weight || 0) > 0)
  if (hasWeight) return 'WEIGHT'
  return 'QUANTITY'
}

// Helper to calculate occupancy
const calculateOccupancy = (current: number, initial: number) => {
  if (initial <= 0) return 0
  return Math.min(100, Math.round((current / initial) * 100))
}

export const getContainers = async (filters?: {
  status?: string
  search?: string
}): Promise<ContainerStats[]> => {
  let query = supabase.from('containers_stats_view').select('*')

  if (filters?.status && filters.status !== 'todos') {
    query = query.ilike('status', filters.status)
  }

  if (filters?.search) {
    query = query.or(
      `container_number.ilike.%${filters.search}%,bl_number.ilike.%${filters.search}%,client_name.ilike.%${filters.search}%`,
    )
  }

  const { data, error } = await query.order('container_number', {
    ascending: true,
  })

  if (error) throw error

  // Map any necessary fields if types don't match perfectly, though they should with the new type definition
  return data as ContainerStats[]
}

export const getContainer = async (id: string): Promise<Container | null> => {
  const { data, error } = await supabase
    .from('containers')
    .select(
      `
      *,
      consignee:customers!containers_consignee_id_fkey(*),
      notify:customers!containers_notify_id_fkey(*),
      supplier:suppliers(*),
      warehouse:warehouses(*),
      storage_location:storage_locations(*),
      type_details:container_types!containers_container_type_fkey(*)
    `,
    )
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  // Fetch items to determine strategy and calculate occupancy
  const { data: items } = await supabase
    .from('container_items')
    .select('*')
    .eq('container_id', id)

  const container = data as unknown as Container
  container.active_strategy = determineStrategy(items || [])

  // Calculate Occupancy
  if (container.active_strategy === 'VOLUME') {
    container.occupancy_rate = calculateOccupancy(
      container.total_cbm || 0,
      container.initial_capacity_cbm || 1,
    )
  } else if (container.active_strategy === 'WEIGHT') {
    container.occupancy_rate = calculateOccupancy(
      container.total_net_weight || 0,
      container.initial_total_net_weight || 1,
    )
  } else {
    container.occupancy_rate = calculateOccupancy(
      container.total_volumes || 0,
      container.initial_total_volumes || 1,
    )
  }
  container.sku_count = items?.length || 0

  return container
}

export const createContainer = async (
  values: Partial<Container>,
): Promise<Container> => {
  const orgId = await getOrganizationId()

  const payload = {
    ...values,
    organization_id: orgId,
    status: values.status || 'Pendente',
    created_by: (await supabase.auth.getUser()).data.user?.id,
  }

  const { data, error } = await supabase
    .from('containers')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateContainer = async (
  id: string,
  values: Partial<Container>,
): Promise<Container> => {
  const { data, error } = await supabase
    .from('containers')
    .update({
      ...values,
      updated_at: new Date().toISOString(),
      updated_by: (await supabase.auth.getUser()).data.user?.id,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const getContainerItems = async (
  containerId: string,
): Promise<ContainerItem[]> => {
  const { data, error } = await supabase
    .from('container_items')
    .select('*')
    .eq('container_id', containerId)
    .order('item_number', { ascending: true })

  if (error) throw error
  return data
}

// Legacy support for InventoryItem type
export const getInventory = async (
  containerId: string,
): Promise<InventoryItem[]> => {
  const items = await getContainerItems(containerId)
  return items.map((item) => ({
    ...item,
    sku: item.product_code,
    name: item.product_name,
    quantity: item.available_quantity,
    unit_volume_m3: (item.cbm || 0) / (item.original_quantity || 1),
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
    destination: (evt.metadata as any)?.destination,
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
  const { error } = await supabase.rpc('register_exit_event', {
    p_container_id: params.container_id,
    p_item_id: params.inventory_id,
    p_quantity: params.quantity,
    p_doc_number: params.doc_number,
    p_destination: params.destination,
    p_responsible: params.responsible,
    p_user_id: (await supabase.auth.getUser()).data.user?.id,
  })

  if (error) throw error
  return true
}

export const createContainerWithItems = async (
  containerData: any,
  items: any[],
  requestId: string,
) => {
  const orgId = await getOrganizationId()

  let containerType = '20ft'
  if (containerData.tipo?.includes('40')) containerType = '40ft'
  if (containerData.tipo?.includes('HC')) containerType = '40hc'

  const { data: container, error: containerError } = await supabase
    .from('containers')
    .insert({
      container_number: containerData.codigo,
      bl_number: containerData.bl_number,
      consignee_id: containerData.cliente_id,
      organization_id: orgId,
      status: 'Ativo',
      container_type: containerType,
      initial_capacity_cbm: containerData.total_volume_m3 || 33.2,
      total_cbm: containerData.total_volume_m3 || 0,
      total_gross_weight: containerData.total_weight_kg || 0,
      notes: `Vessel: ${containerData.vessel || 'N/A'}, Voyage: ${containerData.voyage || 'N/A'}`,
    })
    .select()
    .single()

  if (containerError) throw containerError

  const rpcItems = items.map((item) => ({
    container_id: container.id,
    product_code: item.sku || 'UNKNOWN',
    product_name: item.name || 'Unknown Item',
    description: item.name || 'Unknown Item',
    original_quantity: Number(item.quantity) || 0,
    unit: 'un',
    request_id: requestId,
  }))

  const { data: itemResults, error: itemsError } = await supabase.rpc(
    'rpc_container_items_insert_batch',
    {
      items: rpcItems,
    },
  )

  if (itemsError) throw itemsError

  return { container, itemResults }
}
