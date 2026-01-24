/* Mock service to simulate data fetching and operations - Populated with Rodrigues & Marinho Scenario */
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
  InvoiceItem,
  SystemSettings,
  BillingStrategy,
} from './types'
import { addDays, differenceInDays } from 'date-fns'

// --- MOCK DATA ---
let settings: SystemSettings = {
  tariffs: {
    dry20: 2500,
    dry40: 3000,
    dry40hc: 3200,
    rounding: true,
  },
  measurement: {
    day: 25,
    time: '18:00',
    auto: false,
    notify: false,
  },
}

let clients: Client[] = [
  {
    id: 'cli-001',
    nome: 'Global RPX Importadora e Exportadora Ltda',
    cnpj: '38.220.385/0001-75',
    contato: 'Import Dept',
    email: 'import@globalrpx.com.br',
    created_at: '2024-01-10T10:00:00Z',
  },
  {
    id: 'cli-002',
    nome: 'Rodrigues & Marinho Fitness Ltda',
    cnpj: '60.273.698/0001-40',
    contato: 'Logistics Manager',
    email: 'logistica@rodriguesmarinho.com.br',
    created_at: '2024-01-15T14:30:00Z',
  },
]

let billsOfLading: BillOfLading[] = [
  {
    id: 'bl-001',
    number: 'MIQOTAO015443',
    internal_ref: 'S250131868',
    client_id: 'cli-001',
    client_name: 'Global RPX Importadora e Exportadora Ltda',
    shipper: 'Qingdao Long Glory Technology Co., Ltd.',
    consignee:
      'Global RPX Importadora e Exportadora Ltda (CNPJ: 38.220.385/0001-75)',
    notify_party: 'Rodrigues & Marinho Fitness Ltda (CNPJ: 60.273.698/0001-40)',
    vessel: 'APL CHANGI',
    voyage: '069W',
    port_of_loading: 'Qingdao, China',
    port_of_discharge: 'Navegantes, Brazil',
    total_weight_kg: 13870,
    total_volume_m3: 55,
    container_count: 1,
    status: 'Processed',
    created_at: '2026-01-20T08:00:00Z',
    freight_terms: 'Freight Collect',
    freight_cost: 2250.0,
    freight_currency: 'USD',
    handling_fee: 50.0,
    handling_fee_currency: 'USD',
  },
]

// Mock Inventory Items with Net Weight
// Total Items: 55. Total Net Weight: ~10,106 kg (Simulated)
const inventoryMockData = [
  { sku: 'LGLF-D61', name: 'Functional Trainer', qty: 15, gw: 150, nw: 140 }, // 15 * 140 = 2100kg
  { sku: 'LG-T24 Max', name: 'New Treadmill', qty: 10, gw: 171, nw: 160 }, // 10 * 160 = 1600kg
  { sku: 'PWHO-254', name: 'Spinning Bike', qty: 30, gw: 60, nw: 55 }, // 30 * 55 = 1650kg
]
// Total Inventory Weight: 5350kg (example)

let inventory: InventoryItem[] = inventoryMockData.map((item, index) => ({
  id: `inv-${index + 1}`,
  container_id: 'cont-001',
  sku: item.sku,
  name: item.name,
  quantity: item.qty,
  unit_volume_m3: 0.8, // approx
  unit_value: 100,
  gross_weight_kg: item.gw,
  net_weight_kg: item.nw,
  package_count: 10,
}))

let containers: Container[] = [
  {
    id: 'cont-001',
    codigo: 'CMAU6623595',
    bl_id: 'bl-001',
    bl_number: 'MIQOTAO015443',
    seal: 'M1871552',
    capacidade: '40ft',
    tipo: '40HC',
    status: 'Ativo',
    occupancy_rate: 85,
    sku_count: 3,

    // Metrics
    total_volume_m3: 55, // Current
    total_weight_kg: 13870, // BL Gross
    total_net_weight_kg: 5350, // Sum of Inventory Net Weight
    total_quantity: 55, // Sum of Qty

    // Initial States
    initial_capacity_m3: 76.4, // 40HC Capacity
    max_weight_capacity: 28500, // 40HC Payload
    initial_total_net_weight_kg: 5350, // Initial Cargo Weight (at entry)
    initial_quantity: 55, // Initial Count

    created_at: '2026-01-20T09:00:00Z',
    cliente_id: 'cli-002',
    cliente_nome: 'Rodrigues & Marinho Fitness Ltda',
    arrival_date: '2026-01-25',
    storage_start_date: '2026-01-26',
    base_monthly_cost: 3200.0,
  },
]

let allocations: Allocation[] = [
  {
    id: 'alloc-001',
    container_id: 'cont-001',
    container_code: 'CMAU6623595',
    cliente_id: 'cli-002',
    cliente_nome: 'Rodrigues & Marinho Fitness Ltda',
    data_entrada: '2026-01-26T08:00:00Z',
    custo_mensal: 3000,
    created_at: '2026-01-26T08:00:00Z',
    status: 'Ativo',
    packing_list_url: '#',
  },
]

let events: LogisticsEvent[] = []
let invoices: Invoice[] = []
let recentActivity: ActivityLog[] = []
let divergences: Divergence[] = []
let ediLogs: EDILog[] = []

// --- HELPERS ---

const getBillingStrategy = (items: InventoryItem[]): BillingStrategy => {
  if (items.length === 0) return 'QUANTITY'

  // 1. Prioritize Volume (All items must have volume data)
  const hasVolume = items.every((i) => (i.unit_volume_m3 || 0) > 0)
  if (hasVolume) return 'VOLUME'

  // 2. Fallback to Weight (All items must have Net/Gross weight data)
  // Use Net Weight from Packing List as per requirements
  const hasWeight = items.every(
    (i) => (i.net_weight_kg || i.gross_weight_kg || 0) > 0,
  )
  if (hasWeight) return 'WEIGHT'

  // 3. Fallback to Quantity
  return 'QUANTITY'
}

const calculateOccupancy = (
  container: Container,
  strategy: BillingStrategy,
) => {
  let current = 0
  let total = 1

  if (strategy === 'VOLUME') {
    // Volume strategy is based on Space Occupancy (Container Capacity)
    current = container.total_volume_m3 || 0
    total = container.initial_capacity_m3 || 67.7
  } else if (strategy === 'WEIGHT') {
    // Weight strategy is based on Initial Cargo Weight (Packing List Sum)
    current = container.total_net_weight_kg || 0
    total =
      container.initial_total_net_weight_kg ||
      container.max_weight_capacity ||
      1
  } else {
    // QUANTITY
    // Quantity strategy is based on Initial Item Count
    current = container.total_quantity || 0
    total = container.initial_quantity || 1
  }

  // Prevent division by zero and ensure 0-100 range
  if (total <= 0) total = 1
  return Math.min(100, Math.round((current / total) * 100))
}

// --- API FUNCTIONS ---

// Settings
export const getSettings = async () => Promise.resolve({ ...settings })
export const updateSettings = async (newSettings: SystemSettings) => {
  settings = newSettings
  return Promise.resolve(settings)
}

// System Reset
export const resetSystemData = async () => {
  clients = []
  billsOfLading = []
  inventory = []
  containers = []
  allocations = []
  events = []
  invoices = []
  recentActivity = []
  divergences = []
  ediLogs = []
  return Promise.resolve({ success: true })
}

// Clients
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

// Containers
export const getContainers = async () => Promise.resolve([...containers])
export const getContainer = async (id: string) => {
  const container = containers.find((c) => c.id === id || c.codigo === id)
  if (!container) throw new Error('Container not found')

  // Dynamically determine active strategy based on current inventory configuration
  const containerInventory = inventory.filter(
    (i) => i.container_id === container.id,
  )
  container.active_strategy = getBillingStrategy(containerInventory)

  // Update occupancy rate based on that strategy
  container.occupancy_rate = calculateOccupancy(
    container,
    container.active_strategy,
  )

  return Promise.resolve(container)
}

export const createContainer = async (data: any) => {
  const is40 =
    data.tipo?.includes('40') || data.capacidade?.includes('40') || false
  const isHC = data.tipo?.includes('HC') || false

  let basePrice = settings.tariffs.dry20
  if (is40) basePrice = settings.tariffs.dry40
  if (isHC) basePrice = settings.tariffs.dry40hc

  const newContainer: Container = {
    id: `c${Date.now()}`,
    ...data,
    status: 'Pendente',
    created_at: new Date().toISOString(),
    occupancy_rate: 0,
    sku_count: 0,
    total_volume_m3: 0,
    total_weight_kg: 0,
    total_net_weight_kg: 0,
    total_quantity: 0,

    initial_capacity_m3: isHC ? 76.4 : is40 ? 67.7 : 33.2,
    max_weight_capacity: is40 || isHC ? 28500 : 21000,
    // These will be set upon Entry/Registration of Packing List
    initial_total_net_weight_kg: 0,
    initial_quantity: 0,

    base_monthly_cost: basePrice,
  }
  containers.unshift(newContainer)

  if (data.cliente_id) {
    const client = clients.find((c) => c.id === data.cliente_id)
    allocations.push({
      id: `alloc-${Date.now()}`,
      container_id: newContainer.id,
      container_code: newContainer.codigo,
      cliente_id: data.cliente_id,
      cliente_nome: client?.nome || 'Cliente',
      data_entrada: data.arrival_date || new Date().toISOString(),
      custo_mensal: newContainer.base_monthly_cost,
      created_at: new Date().toISOString(),
      status: 'Ativo',
    })
  }
  return Promise.resolve(newContainer)
}

// Allocations & Events
export const getAllocations = async () => Promise.resolve([...allocations])
export const getEvents = async () => Promise.resolve([...events])

export const registerEntry = async (data: any) => {
  const container = containers.find((c) => c.id === data.container)
  const client = clients.find((c) => c.id === data.client)

  if (container && client) {
    container.status = 'Ativo'
    container.cliente_id = client.id
    container.cliente_nome = client.nome
    container.storage_start_date = data.data_entrada

    // Simulate Initial Cargo State based on typical full load if not provided
    // In a real app, this would come from the Packing List upload
    const mockCargoWeight = 12000 // kg
    const mockCargoQty = 100 // items
    const mockCargoVolume = 30 // m3

    container.total_volume_m3 = mockCargoVolume
    container.total_quantity = mockCargoQty
    container.total_net_weight_kg = mockCargoWeight

    // Set Initial Baselines for Billing
    container.initial_quantity = mockCargoQty
    container.initial_total_net_weight_kg = mockCargoWeight
    // initial_capacity_m3 is already set based on container type

    allocations.push({
      id: `alloc-${Date.now()}`,
      container_id: container.id,
      container_code: container.codigo,
      cliente_id: client.id,
      cliente_nome: client.nome,
      data_entrada: data.data_entrada,
      custo_mensal: container.base_monthly_cost || 3000,
      created_at: new Date().toISOString(),
      status: 'Ativo',
    })

    events.unshift({
      id: `evt-${Date.now()}`,
      type: 'entry',
      container_id: container.id,
      container_code: container.codigo,
      sku: 'ALL',
      quantity: 1,
      volume_m3: container.total_volume_m3,
      doc_number: 'ENTRY',
      destination: 'WAREHOUSE',
      responsible: 'SYSTEM',
      timestamp: new Date().toISOString(),
      value: 0,
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
  const item = inventory.find((i) => i.id === data.inventory_id)
  if (!item) throw new Error('Item not found')

  const evt: LogisticsEvent = {
    id: `evt-${Date.now()}`,
    type: 'exit',
    container_id: data.container_id,
    container_code: '',
    sku: item.sku,
    quantity: data.quantity,
    volume_m3: item.unit_volume_m3 * data.quantity,
    weight_kg:
      (item.net_weight_kg || item.gross_weight_kg || 0) * data.quantity,
    value: item.unit_value * data.quantity,
    timestamp: new Date().toISOString(),
    doc_number: data.doc_number,
    destination: data.destination,
    responsible: data.responsible,
  }

  // Update Inventory
  item.quantity -= data.quantity

  // Update Container Metrics
  const container = containers.find((c) => c.id === data.container_id)
  if (container) {
    evt.container_code = container.codigo

    // Update Volume
    container.total_volume_m3 = Math.max(
      0,
      container.total_volume_m3 - evt.volume_m3,
    )

    // Update Weight (Use exact item weight)
    const weightToRemove = evt.weight_kg || 0
    container.total_net_weight_kg = Math.max(
      0,
      (container.total_net_weight_kg || 0) - weightToRemove,
    )

    // Update Quantity
    container.total_quantity = Math.max(
      0,
      (container.total_quantity || 0) - evt.quantity,
    )

    // Recalculate Occupancy
    const containerInventory = inventory.filter(
      (i) => i.container_id === container.id,
    )
    container.active_strategy = getBillingStrategy(containerInventory)
    container.occupancy_rate = calculateOccupancy(
      container,
      container.active_strategy,
    )
  }

  // Persistent Logging
  events.unshift(evt)

  return Promise.resolve(evt)
}

// Inventory
export const getInventory = async (containerId: string) =>
  Promise.resolve(
    inventory.filter((i) => i.container_id === containerId && i.quantity > 0),
  )

// BLs & Divergences
export const getBLs = async () => Promise.resolve([...billsOfLading])
export const getBL = async (id: string) =>
  Promise.resolve(billsOfLading.find((b) => b.id === id))
export const createBL = async (data: any) => {
  const newBL: BillOfLading = {
    id: `bl-${Date.now()}`,
    ...data,
    status: 'Processed',
    created_at: new Date().toISOString(),
  }
  billsOfLading.unshift(newBL)
  return Promise.resolve(newBL)
}
export const uploadBL = async (file: File, clientId: string) => {
  // Mock OCR logic
  const client = clients.find((c) => c.id === clientId)
  return {
    number: `BL${Math.floor(Math.random() * 1000000)}`,
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
export const getDivergences = async () => Promise.resolve([...divergences])
export const getEDILogs = async (blId: string) =>
  Promise.resolve(ediLogs.filter((e) => e.bl_id === blId))

// Dashboard & Billing
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const activeAllocations = allocations.filter(
    (a) => a.status === 'Ativo',
  ).length
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
  const pendingExitCosts = activeAllocations * 1000 // approx

  const statusCounts = containers.reduce(
    (acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return Promise.resolve({
    activeAllocations,
    occupancyRate,
    activeClients,
    pendingExitCosts,
    nextBillingDate: `${settings.measurement.day}/${new Date().getMonth() + 2}`, // approx
    statusDistribution: Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      fill: '',
    })),
  })
}

export const getRecentActivity = async () =>
  Promise.resolve([...recentActivity])
export const getInvoices = async () => Promise.resolve([...invoices])

export const generateMeasurements = async () =>
  Promise.resolve({
    success: true,
    message: 'Processamento de medições concluído.',
  })

// --- REFINED BILLING LOGIC ---
export const simulateBilling = async () => {
  const simulated: Invoice[] = []
  const groupedAllocations: Record<string, Allocation[]> = {}

  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()
  const measurementDay = settings.measurement.day

  // Determine Next Measurement Date (Configurable Day, e.g., 25th)
  let nextMeasurementDate = new Date(currentYear, currentMonth, measurementDay)
  if (today.getDate() > measurementDay) {
    nextMeasurementDate = new Date(
      currentYear,
      currentMonth + 1,
      measurementDay,
    )
  }

  // Previous Measurement Date (cycle start)
  const prevMeasurementDate = new Date(nextMeasurementDate)
  prevMeasurementDate.setMonth(prevMeasurementDate.getMonth() - 1)

  // Due Date Logic: Measurement + 10 days EXACTLY
  const dueDate = addDays(nextMeasurementDate, 10).toISOString()

  allocations.forEach((a) => {
    if (
      a.status === 'Ativo' ||
      (a.data_saida && new Date(a.data_saida) > prevMeasurementDate)
    ) {
      if (!groupedAllocations[a.cliente_id])
        groupedAllocations[a.cliente_id] = []
      groupedAllocations[a.cliente_id].push(a)
    }
  })

  Object.entries(groupedAllocations).forEach(([clientId, allocs]) => {
    if (allocs.length === 0) return

    const items: InvoiceItem[] = []

    allocs.forEach((alloc) => {
      const container = containers.find((c) => c.id === alloc.container_id)
      if (!container) return

      // Determine Base Price dynamically from Settings
      let basePrice = settings.tariffs.dry20
      if (container.tipo?.includes('40')) basePrice = settings.tariffs.dry40
      if (container.tipo?.includes('HC')) basePrice = settings.tariffs.dry40hc

      const entryDate = new Date(alloc.data_entrada)

      let amount = 0
      let description = ''
      let calculationMethod: 'pro_rata' | 'volume_snapshot'
      let meta: Partial<InvoiceItem> = {}

      // Identify Strategy
      const containerItems = inventory.filter(
        (i) => i.container_id === container.id,
      )
      const strategy = getBillingStrategy(containerItems)

      // Logic: First Month Pro-rata vs Subsequent Snapshot
      if (entryDate > prevMeasurementDate) {
        // First Month Logic: Pro-rata based on TIME (Days Active)
        const daysActive = differenceInDays(nextMeasurementDate, entryDate)
        const daysToBill = Math.max(1, daysActive)

        amount = (daysToBill / 30) * basePrice
        description = `Armazenagem (${strategy}) - Pro-rata Inicial - ${container.codigo}`
        calculationMethod = 'pro_rata'

        meta = {
          days_pro_rated: daysToBill,
          base_cost: basePrice,
          billing_strategy: strategy,
        }
      } else {
        // Subsequent Month: Snapshot Logic (Occupancy Based on Strategy)
        let currentMetric = 0
        let originalMetric = 1
        let unit = ''

        if (strategy === 'VOLUME') {
          currentMetric = container.total_volume_m3
          originalMetric = container.initial_capacity_m3 || 67.7
          unit = 'm³'
        } else if (strategy === 'WEIGHT') {
          // Use Net Weight from Packing List Sum
          currentMetric = container.total_net_weight_kg || 0
          originalMetric =
            container.initial_total_net_weight_kg ||
            container.max_weight_capacity ||
            1
          unit = 'kg'
        } else {
          // QUANTITY
          currentMetric = container.total_quantity || 0
          originalMetric = container.initial_quantity || 1
          unit = 'und'
        }

        const ratio = Math.min(1, currentMetric / originalMetric)
        amount = ratio * basePrice

        description = `Armazenagem (${strategy}) - Mensal - ${container.codigo}`
        calculationMethod = 'volume_snapshot'

        meta = {
          snapshot_date: nextMeasurementDate.toISOString(),
          metric_used: Number(currentMetric.toFixed(2)),
          metric_total: Number(originalMetric.toFixed(2)),
          metric_unit: unit,
          occupancy_percentage: Number((ratio * 100).toFixed(2)),
          base_cost: basePrice,
          savings: basePrice - amount,
          billing_strategy: strategy,
        }
      }

      items.push({
        id: `item-${Math.random()}`,
        description,
        amount: settings.tariffs.rounding ? Number(amount.toFixed(2)) : amount,
        type: 'storage',
        reference_id: container.id,
        calculation_method: calculationMethod,
        ...meta,
      })
    })

    simulated.push({
      id: 'draft',
      client_id: clientId,
      client_name: allocs[0].cliente_nome,
      month: nextMeasurementDate.getMonth() + 1,
      year: nextMeasurementDate.getFullYear(),
      total_amount: items.reduce((sum, i) => sum + i.amount, 0),
      status: 'Draft',
      due_date: dueDate,
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
