import { supabase } from '@/lib/supabase/client'
import {
  ContainerType,
  Warehouse,
  StorageLocation,
  Client,
  Supplier,
} from '@/lib/types'

export const getContainerTypes = async (): Promise<ContainerType[]> => {
  const { data, error } = await supabase
    .from('container_types')
    .select('*')
    .eq('is_active', true)
    .order('code')

  if (error) throw error
  return data
}

export const getWarehouses = async (): Promise<Warehouse[]> => {
  const { data, error } = await supabase
    .from('warehouses')
    .select('id, name, code')
    .eq('is_active', true)
    .order('name')

  if (error) throw error
  return data
}

export const getStorageLocations = async (
  warehouseId?: string,
): Promise<StorageLocation[]> => {
  let query = supabase.from('storage_locations').select('*').order('code')

  if (warehouseId) {
    query = query.eq('warehouse_id', warehouseId)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export const getCustomers = async (): Promise<Client[]> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) throw error
  return data
}

export const getSuppliers = async (): Promise<Supplier[]> => {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) throw error
  return data
}
