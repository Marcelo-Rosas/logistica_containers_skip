/* Mock service to simulate data fetching and operations - Cleaned for Fresh Start */
import {
  Client,
  Container,
  Allocation,
  ActivityLog,
  DashboardStats,
  InventoryItem,
  LogisticsEvent,
  Invoice,
  BillOfLading,
  Divergence,
  EDILog,
} from './types'

// Initial Data - Empty for Fresh Start
let clients: Client[] = []
let containers: Container[] = []
let allocations: Allocation[] = []
let inventory: InventoryItem[] = []
let events: LogisticsEvent[] = []
let invoices: Invoice[] = []
let recentActivity: ActivityLog[] = []
let billsOfLading: BillOfLading[] = []
let divergences: Divergence[] = []
let ediLogs: EDILog[] = []

// Service Functions
export const getClients = async () => Promise.resolve([...clients])
export const createClient = async (data: Omit<Client, 'id' | 'created_at'>) => {
  const newClient: Client = {
    id: `cli-${Date.now()}`,
    ...data,
    created_at: new Date().toISOString(),
  }
  clients.push(newClient)
  return Promise.resolve(newClient)
}

export const getContainers = async () => Promise.resolve([...containers])
export const getContainer = async (id: string) => {
  const container = containers.find((c) => c.id === id || c.codigo === id)
  if (!container) throw new Error('Container not found')
  return Promise.resolve(container)
}
export const getAllocations = async () => Promise.resolve([...allocations])
export const getRecentActivity = async () =>
  Promise.resolve([...recentActivity])
export const getInventory = async (containerId: string) =>
  Promise.resolve(
    inventory.filter((i) => i.container_id === containerId && i.quantity > 0),
  )
export const getEvents = async () => Promise.resolve([...events])
export const getInvoices = async () => Promise.resolve([...invoices])

export const createContainer = async (data: any) => {
  const newContainer: Container = {
    id: `c${Date.now()}`,
    ...data,
    status: 'Pendente',
    created_at: new Date().toISOString(),
    occupancy_rate: 0,
    sku_count: 0,
    total_volume_m3: 0,
    total_weight_kg: 0,
  }
  containers.unshift(newContainer)

  // Create mock allocation if client is provided
  if (data.cliente_id) {
    allocations.push({
      id: `alloc-${Date.now()}`,
      container_id: newContainer.id,
      container_code: newContainer.codigo,
      cliente_id: data.cliente_id,
      cliente_nome: data.cliente_nome || 'Cliente',
      data_entrada: data.arrival_date || new Date().toISOString(),
      custo_mensal: 2500, // Default mock cost
      created_at: new Date().toISOString(),
      status: 'Ativo',
    })
  }

  return Promise.resolve(newContainer)
}

// New BL Functions
export const getBLs = async () => Promise.resolve([...billsOfLading])
export const getBL = async (id: string) =>
  Promise.resolve(billsOfLading.find((b) => b.id === id))
export const getDivergences = async () => Promise.resolve([...divergences])
export const getEDILogs = async (blId: string) =>
  Promise.resolve(ediLogs.filter((e) => e.bl_id === blId))

// Mock OCR Upload
export const uploadBL = async (file: File, clientId: string) => {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const client = clients.find((c) => c.id === clientId)
  const mockNumber = `BL${Math.floor(Math.random() * 1000000)}`

  // Return extracted data (simulated)
  return {
    number: mockNumber,
    client_id: clientId,
    client_name: client?.nome || 'Unknown',
    shipper: 'Global Suppliers Ltd',
    consignee: client?.nome || 'Unknown',
    vessel: 'MSC SIMULATION',
    voyage: '101W',
    port_of_loading: 'SHANGHAI',
    port_of_discharge: 'SANTOS',
    total_weight_kg: 24500,
    total_volume_m3: 33.2,
    container_count: 1,
    containers: [
      {
        codigo: `MSCU${Math.floor(Math.random() * 1000000)}`,
        tipo: "Dry Box 20'",
        seal: '123456',
        weight: 24500,
      },
    ],
  }
}

export const createBL = async (data: any) => {
  const newBL: BillOfLading = {
    id: `bl-${Date.now()}`,
    ...data,
    status: 'Processed',
    created_at: new Date().toISOString(),
  }

  billsOfLading.unshift(newBL)

  // Create linked containers
  data.containers.forEach((c: any) => {
    containers.unshift({
      id: `c-${Date.now()}-${Math.random()}`,
      codigo: c.codigo,
      bl_number: newBL.number,
      bl_id: newBL.id,
      capacidade: c.tipo.includes('40') ? '40ft' : '20ft',
      tipo: c.tipo,
      status: 'Pendente',
      occupancy_rate: 0,
      sku_count: 0,
      total_volume_m3: 0,
      total_weight_kg: c.weight,
      created_at: new Date().toISOString(),
      cliente_id: newBL.client_id,
      cliente_nome: newBL.client_name,
    })
  })

  recentActivity.unshift({
    id: `act-${Date.now()}`,
    type: 'success',
    message: `BL ${newBL.number} cadastrado com ${data.containers.length} containers.`,
    timestamp: 'Agora',
  })

  return Promise.resolve(newBL)
}

// Logic Stub
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const activeAllocations = allocations.filter(
    (a) => a.status === 'Ativo',
  ).length
  const totalContainers = containers.length

  // Calculate average occupancy of active containers
  const activeContainers = containers.filter(
    (c) => c.status !== 'Vazio' && c.status !== 'Pendente',
  )
  const occupancyRate =
    activeContainers.length > 0
      ? Math.round(
          activeContainers.reduce((acc, c) => acc + c.occupancy_rate, 0) /
            activeContainers.length,
        )
      : 0

  const activeClients = new Set(
    allocations.filter((a) => a.status === 'Ativo').map((a) => a.cliente_id),
  ).size

  // Sum pending costs (mock logic: assume 1000 per active allocation not invoiced)
  // Real logic would be complex, simplified for dashboard
  const pendingExitCosts = activeAllocations * 1250

  const statusCounts = containers.reduce(
    (acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const statusDistribution = Object.entries(statusCounts).map(
    ([status, count]) => ({
      status,
      count,
      fill: '', // Color handled by component
    }),
  )

  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1)

  return Promise.resolve({
    activeAllocations,
    occupancyRate,
    activeClients,
    pendingExitCosts,
    nextBillingDate:
      '25/' +
      (nextMonth.getMonth() + 1).toString().padStart(2, '0') +
      '/' +
      nextMonth.getFullYear(),
    statusDistribution,
  })
}

export const registerEntry = async (data: any) => {
  const container = containers.find((c) => c.id === data.container)
  const client = clients.find((c) => c.id === data.client)

  if (container && client) {
    container.status = 'Ativo'
    container.cliente_id = client.id
    container.cliente_nome = client.nome
    container.storage_start_date = data.data_entrada

    allocations.push({
      id: `alloc-${Date.now()}`,
      container_id: container.id,
      container_code: container.codigo,
      cliente_id: client.id,
      cliente_nome: client.nome,
      data_entrada: data.data_entrada,
      custo_mensal: 2500,
      created_at: new Date().toISOString(),
      status: 'Ativo',
    })
  }

  return Promise.resolve({ success: true, message: 'ok' })
}

export const registerExit = async (id: string, date: Date) => {
  const allocation = allocations.find((a) => a.id === id)
  if (allocation) {
    allocation.status = 'Finalizado'
    allocation.data_saida = date.toISOString()

    const container = containers.find((c) => c.id === allocation.container_id)
    if (container) {
      container.status = 'Vazio'
      container.occupancy_rate = 0
    }
  }
  return Promise.resolve({ success: true, message: 'ok' })
}

export const createExitEvent = async (data: any) => {
  const evt = {
    ...data,
    id: `evt-${Date.now()}`,
    type: 'exit',
    volume_m3: 0, // Should look up inventory item
    value: 0,
    timestamp: new Date().toISOString(),
  } as LogisticsEvent

  events.unshift(evt)

  // Update Inventory
  const item = inventory.find((i) => i.id === data.inventory_id)
  if (item) {
    item.quantity -= data.quantity
    evt.volume_m3 = item.unit_volume_m3 * data.quantity
    evt.value = item.unit_value * data.quantity
  }

  return Promise.resolve(evt)
}

export const generateMeasurements = async () =>
  Promise.resolve({
    success: true,
    message: 'Processamento de medições concluído.',
  })

export const simulateBilling = async () => {
  // Generate simulated invoices based on active allocations
  const simulated: Invoice[] = []
  const groupedAllocations: Record<string, Allocation[]> = {}

  allocations.forEach((a) => {
    if (a.status === 'Ativo') {
      if (!groupedAllocations[a.cliente_id])
        groupedAllocations[a.cliente_id] = []
      groupedAllocations[a.cliente_id].push(a)
    }
  })

  Object.entries(groupedAllocations).forEach(([clientId, allocs]) => {
    if (allocs.length === 0) return

    const items = allocs.map((a) => ({
      id: `item-${Math.random()}`,
      description: `Armazenagem - ${a.container_code}`,
      amount: a.custo_mensal,
      type: 'storage' as const,
      reference_id: a.container_id,
    }))

    simulated.push({
      id: 'draft',
      client_id: clientId,
      client_name: allocs[0].cliente_nome,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      total_amount: items.reduce((sum, i) => sum + i.amount, 0),
      status: 'Draft',
      due_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      items,
    })
  })

  return Promise.resolve(simulated)
}

export const generateMonthlyInvoices = async (simulatedInvoices: Invoice[]) => {
  simulatedInvoices.forEach((inv) => {
    invoices.unshift({
      ...inv,
      id: `inv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: 'Sent',
      created_at: new Date().toISOString(),
    })
  })
  return Promise.resolve({ success: true, count: simulatedInvoices.length })
}
