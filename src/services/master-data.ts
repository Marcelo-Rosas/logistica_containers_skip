import { supabase } from '@/lib/supabase/client'
import {
  ContainerType,
  Warehouse,
  StorageLocation,
  Client,
  Supplier,
} from '@/lib/types'

// Helper to get current user's organization_id
export const getOrganizationId = async () => {
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
    // Fallback or throw
    console.warn('Organization ID lookup failed', error)
    return null
  }

  return userData.organization_id
}

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

  // Map database fields to Client type if necessary
  return data.map((c) => ({
    id: c.id,
    name: c.name,
    trade_name: c.trade_name,
    email: c.email,
    phone: c.phone,
    cnpj: c.tax_id,
  }))
}

export const createCustomer = async (
  customer: Partial<Client>,
): Promise<Client> => {
  const orgId = await getOrganizationId()

  const payload = {
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    tax_id: customer.cnpj, // Mapping cnpj to tax_id
    organization_id: orgId,
    is_active: true,
  }

  const { data, error } = await supabase
    .from('customers')
    .insert(payload)
    .select()
    .single()

  if (error) throw error

  return {
    id: data.id,
    name: data.name,
    trade_name: data.trade_name,
    email: data.email,
    phone: data.phone,
    cnpj: data.tax_id,
  }
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
