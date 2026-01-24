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
} from './types'

// 1. Clients
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

// 2. Bill of Lading
let billsOfLading: BillOfLading[] = [
  {
    id: 'bl-001',
    number: 'MIQOTAO015443',
    internal_ref: 'S250131868',
    client_id: 'cli-001', // Global RPX is Consignee
    client_name: 'Global RPX Importadora e Exportadora Ltda',
    shipper: 'Qingdao Long Glory Technology Co., Ltd.',
    consignee:
      'Global RPX Importadora e Exportadora Ltda (CNPJ: 38.220.385/0001-75)',
    notify_party: 'Rodrigues & Marinho Fitness Ltda (CNPJ: 60.273.698/0001-40)',
    vessel: 'APL CHANGI',
    voyage: '069W', // Assumed
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

// 3. Containers
let containers: Container[] = [
  {
    id: 'cont-001',
    codigo: 'CMAU6623595',
    bl_id: 'bl-001',
    bl_number: 'MIQOTAO015443',
    seal: 'M1871552',
    capacidade: '40ft', // Display helper
    tipo: '40HC',
    status: 'Ativo',
    occupancy_rate: 85, // 55m3 / 67.7m3 approx
    sku_count: 23,
    total_volume_m3: 55,
    total_weight_kg: 13870,
    created_at: '2026-01-20T09:00:00Z',
    cliente_id: 'cli-002', // Rodrigues & Marinho managing it
    cliente_nome: 'Rodrigues & Marinho Fitness Ltda',
    arrival_date: '2026-01-25',
    storage_start_date: '2026-01-26',
  },
]

// 4. Inventory (Detailed Packing List)
// Generating 23 items to match totals roughly
const inventoryMockData = [
  {
    sku: 'LGLF-D61',
    name: 'Functional Trainer',
    qty: 15,
    pkgs: 15,
    gw: 1500,
    pkgType: 'PLY WOODEN BOX',
  },
  {
    sku: 'LG-T24 Max',
    name: 'New Treadmill',
    qty: 10,
    pkgs: 10,
    gw: 1710,
    pkgType: 'CARTON BOX',
  },
  {
    sku: 'PWHO-254',
    name: 'Spinning Bike',
    qty: 30,
    pkgs: 30,
    gw: 1200,
    pkgType: 'CARTON BOX',
  },
  {
    sku: 'LGLF-B12',
    name: 'Bench Press',
    qty: 20,
    pkgs: 10,
    gw: 800,
    pkgType: 'CARTON BOX',
  },
  {
    sku: 'LG-E55',
    name: 'Elliptical Trainer',
    qty: 12,
    pkgs: 12,
    gw: 960,
    pkgType: 'CARTON BOX',
  },
  {
    sku: 'LG-R33',
    name: 'Rowing Machine',
    qty: 18,
    pkgs: 9,
    gw: 720,
    pkgType: 'CARTON BOX',
  },
  {
    sku: 'LGLF-D62',
    name: 'Cable Crossover',
    qty: 5,
    pkgs: 10,
    gw: 1000,
    pkgType: 'PLY WOODEN BOX',
  },
  {
    sku: 'ACC-001',
    name: 'Dumbbell Set 5-25kg',
    qty: 10,
    pkgs: 5,
    gw: 1500,
    pkgType: 'PLY WOODEN BOX',
  },
  {
    sku: 'ACC-002',
    name: 'Kettlebell Set',
    qty: 20,
    pkgs: 4,
    gw: 800,
    pkgType: 'PLY WOODEN BOX',
  },
  {
    sku: 'LG-M01',
    name: 'Yoga Mats',
    qty: 50,
    pkgs: 2,
    gw: 100,
    pkgType: 'BUBBLE',
  },
  {
    sku: 'LG-ST01',
    name: 'Step Platform',
    qty: 20,
    pkgs: 4,
    gw: 120,
    pkgType: 'CARTON BOX',
  },
  {
    sku: 'LG-B05',
    name: 'Exercise Ball',
    qty: 30,
    pkgs: 3,
    gw: 60,
    pkgType: 'BUBBLE',
  },
  {
    sku: 'LGLF-S01',
    name: 'Smith Machine',
    qty: 4,
    pkgs: 8,
    gw: 1200,
    pkgType: 'PLY WOODEN BOX',
  },
  {
    sku: 'LGLF-L02',
    name: 'Leg Press',
    qty: 3,
    pkgs: 3,
    gw: 900,
    pkgType: 'PLY WOODEN BOX',
  },
  {
    sku: 'LG-C01',
    name: 'Climber',
    qty: 5,
    pkgs: 5,
    gw: 400,
    pkgType: 'CARTON BOX',
  },
  {
    sku: 'ACC-003',
    name: 'Weight Plates 20kg',
    qty: 20,
    pkgs: 1,
    gw: 400,
    pkgType: 'PLY WOODEN BOX',
  },
  {
    sku: 'ACC-004',
    name: 'Weight Plates 10kg',
    qty: 20,
    pkgs: 1,
    gw: 200,
    pkgType: 'PLY WOODEN BOX',
  },
  {
    sku: 'ACC-005',
    name: 'Barbell Bars',
    qty: 15,
    pkgs: 1,
    gw: 300,
    pkgType: 'TUBE',
  },
  {
    sku: 'LG-TR02',
    name: 'Treadmill Home',
    qty: 8,
    pkgs: 8,
    gw: 640,
    pkgType: 'CARTON BOX',
  },
  {
    sku: 'LG-SB02',
    name: 'Spinning Bike Pro',
    qty: 10,
    pkgs: 10,
    gw: 500,
    pkgType: 'CARTON BOX',
  },
  {
    sku: 'LGLF-M05',
    name: 'Multi Gym',
    qty: 2,
    pkgs: 4,
    gw: 600,
    pkgType: 'PLY WOODEN BOX',
  },
  {
    sku: 'ACC-006',
    name: 'Resistance Bands',
    qty: 100,
    pkgs: 1,
    gw: 20,
    pkgType: 'CARTON BOX',
  },
  {
    sku: 'ACC-007',
    name: 'Jump Ropes',
    qty: 50,
    pkgs: 1,
    gw: 10,
    pkgType: 'CARTON BOX',
  },
]

// Adjust totals to match 283 pcs, 129 pkgs, 13870 kg
// The mock data above is approximate. I will use it to populate InventoryItems.

let inventory: InventoryItem[] = inventoryMockData.map((item, index) => ({
  id: `inv-${index + 1}`,
  container_id: 'cont-001',
  sku: item.sku,
  name: item.name,
  quantity: item.qty,
  unit_volume_m3: 0.1, // Approximate average
  unit_value: 100, // Mock value
  model: item.sku,
  packaging_type: item.pkgType,
  gross_weight_kg: item.gw,
  net_weight_kg: item.gw * 0.9, // 10% tare assumption
  package_count: item.pkgs,
}))

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
let recentActivity: ActivityLog[] = [
  {
    id: 'act-001',
    message: 'BL MIQOTAO015443 processado com sucesso.',
    timestamp: '2026-01-20 08:05',
    type: 'success',
  },
  {
    id: 'act-002',
    message: 'Container CMAU6623595 registrado (40HC).',
    timestamp: '2026-01-20 09:00',
    type: 'info',
  },
]
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
    const client = clients.find((c) => c.id === data.cliente_id)
    allocations.push({
      id: `alloc-${Date.now()}`,
      container_id: newContainer.id,
      container_code: newContainer.codigo,
      cliente_id: data.cliente_id,
      cliente_nome: client?.nome || 'Cliente',
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

  // Sum pending costs
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
