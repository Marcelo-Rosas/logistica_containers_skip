/*
 * Legacy Bridge Service
 *
 * This file previously contained mock data. It is now acting as a bridge
 * to the real Supabase services to maintain compatibility with legacy components
 * that might still be importing from here.
 *
 * New code should import directly from '@/services/*'
 */

import {
  getContainers as getContainersService,
  createContainer as createContainerService,
  getContainer as getContainerService,
  getEvents as getEventsService,
  registerEntry as registerEntryService,
  createExitEvent as createExitEventService,
  getInventory as getInventoryService,
} from '@/services/container'
import { getCustomers, createCustomer } from '@/services/master-data'
import { SystemSettings, DashboardStats } from '@/lib/types'

// Re-exports for compatibility
export const getContainers = getContainersService
export const createContainer = createContainerService
export const getContainer = getContainerService
export const getEvents = getEventsService
export const registerEntry = registerEntryService
export const createExitEvent = createExitEventService
export const getInventory = getInventoryService

// Client Adapters
export const getClients = async () => {
  const customers = await getCustomers()
  return customers.map((c) => ({
    id: c.id,
    nome: c.name,
    cnpj: c.cnpj || '',
    contato: c.phone || '',
    email: c.email || '',
    created_at: new Date().toISOString(),
  }))
}

export const createClient = async (data: any) => {
  return createCustomer({
    name: data.nome,
    phone: data.contato,
    email: data.email,
  })
}

// Stubs for features not yet fully implemented in backend but needed for compilation
export const getSettings = async (): Promise<SystemSettings> =>
  Promise.resolve({
    tariffs: { dry20: 0, dry40: 0, dry40hc: 0, rounding: true },
    measurement: { day: 25, time: '18:00', auto: false, notify: false },
  })

export const updateSettings = async (s: SystemSettings) => Promise.resolve(s)
export const resetSystemData = async () => Promise.resolve({ success: true })

export const getAllocations = async () => Promise.resolve([])
export const getInvoices = async () => Promise.resolve([])
export const getRecentActivity = async () => Promise.resolve([])
export const getDivergences = async () => Promise.resolve([])
export const getEDILogs = async () => Promise.resolve([])
export const getBLs = async () => Promise.resolve([])
export const getBL = async () => Promise.resolve(undefined)
export const createBL = async () => Promise.resolve({})
export const uploadBL = async () => Promise.resolve({})

export const getDashboardStats = async (): Promise<DashboardStats> =>
  Promise.resolve({
    activeAllocations: 0,
    occupancyRate: 0,
    activeClients: 0,
    pendingExitCosts: 0,
    nextBillingDate: new Date().toISOString(),
    statusDistribution: [],
  })

export const simulateBilling = async () => Promise.resolve([])
export const generateMonthlyInvoices = async () =>
  Promise.resolve({ success: true, count: 0 })
export const generateMeasurements = async () =>
  Promise.resolve({ success: true, message: 'N/A' })
export const registerExit = async () =>
  Promise.resolve({ success: true, message: 'N/A' })
