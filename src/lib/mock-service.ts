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
} from './types'
import { addDays, differenceInDays, isBefore, isAfter, getDate } from 'date-fns'

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
    initial_capacity_m3: 67.7, // Standard 40HC volume for billing denominator
    base_monthly_cost: 3200.0, // Base price for 40HC
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
    custo_mensal: 3000, // This might be overridden by dynamic calculation
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
  const is40 =
    data.tipo?.includes('40') || data.capacidade?.includes('40') || false
  const newContainer: Container = {
    id: `c${Date.now()}`,
    ...data,
    status: 'Pendente',
    created_at: new Date().toISOString(),
    occupancy_rate: 0,
    sku_count: 0,
    total_volume_m3: 0,
    total_weight_kg: 0,
    // Defaults based on type
    initial_capacity_m3: is40 ? 67.7 : 33.2,
    base_monthly_cost: is40 ? 3200.0 : 2200.0,
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

export const getBLs = async () => Promise.resolve([...billsOfLading])
export const getBL = async (id: string) =>
  Promise.resolve(billsOfLading.find((b) => b.id === id))
export const getDivergences = async () => Promise.resolve([...divergences])
export const getEDILogs = async (blId: string) =>
  Promise.resolve(ediLogs.filter((e) => e.bl_id === blId))

export const uploadBL = async (file: File, clientId: string) => {
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const client = clients.find((c) => c.id === clientId)
  const mockNumber = `BL${Math.floor(Math.random() * 1000000)}`

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

  data.containers.forEach((c: any) => {
    const is40 = c.tipo.includes('40')
    containers.unshift({
      id: `c-${Date.now()}-${Math.random()}`,
      codigo: c.codigo,
      bl_number: newBL.number,
      bl_id: newBL.id,
      capacidade: is40 ? '40ft' : '20ft',
      tipo: c.tipo,
      status: 'Pendente',
      occupancy_rate: 0,
      sku_count: 0,
      total_volume_m3: 0,
      total_weight_kg: c.weight,
      created_at: new Date().toISOString(),
      cliente_id: newBL.client_id,
      cliente_nome: newBL.client_name,
      initial_capacity_m3: is40 ? 67.7 : 33.2,
      base_monthly_cost: is40 ? 3200.0 : 2200.0,
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
      fill: '',
    }),
  )

  const nextMonth = new Date()
  if (nextMonth.getDate() > 25) {
    nextMonth.setMonth(nextMonth.getMonth() + 1)
  }
  nextMonth.setDate(25)

  return Promise.resolve({
    activeAllocations,
    occupancyRate,
    activeClients,
    pendingExitCosts,
    nextBillingDate: nextMonth.toLocaleDateString('pt-BR'),
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
    // Ensure billing defaults if missing
    if (!container.base_monthly_cost) container.base_monthly_cost = 3200
    if (!container.initial_capacity_m3) container.initial_capacity_m3 = 67.7

    allocations.push({
      id: `alloc-${Date.now()}`,
      container_id: container.id,
      container_code: container.codigo,
      cliente_id: client.id,
      cliente_nome: client.nome,
      data_entrada: data.data_entrada,
      custo_mensal: container.base_monthly_cost,
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
    volume_m3: 0,
    value: 0,
    timestamp: new Date().toISOString(),
  } as LogisticsEvent

  events.unshift(evt)

  const item = inventory.find((i) => i.id === data.inventory_id)
  if (item) {
    item.quantity -= data.quantity
    evt.volume_m3 = item.unit_volume_m3 * data.quantity
    evt.value = item.unit_value * data.quantity

    // Update container metrics
    const container = containers.find((c) => c.id === data.container_id)
    if (container) {
      container.total_volume_m3 = Math.max(
        0,
        container.total_volume_m3 - evt.volume_m3,
      )
      if (container.initial_capacity_m3) {
        container.occupancy_rate = Math.round(
          (container.total_volume_m3 / container.initial_capacity_m3) * 100,
        )
      }
    }
  }

  return Promise.resolve(evt)
}

export const generateMeasurements = async () =>
  Promise.resolve({
    success: true,
    message: 'Processamento de medições concluído.',
  })

// --- NEW BILLING LOGIC ---

// Helper to get volume at a specific past date
const getVolumeAtDate = (container: Container, date: Date) => {
  // Current volume is the volume AFTER all exits.
  // To get past volume, we must ADD back the volume of exits that happened AFTER the date.
  const exitsAfterDate = events.filter(
    (e) =>
      e.container_id === container.id &&
      e.type === 'exit' &&
      new Date(e.timestamp) > date,
  )

  const volumeRestored = exitsAfterDate.reduce((sum, e) => sum + e.volume_m3, 0)
  return container.total_volume_m3 + volumeRestored
}

export const simulateBilling = async () => {
  const simulated: Invoice[] = []
  const groupedAllocations: Record<string, Allocation[]> = {}

  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()

  // Determine Next Measurement Date (25th of current or next month)
  let nextMeasurementDate = new Date(currentYear, currentMonth, 25)
  // If today is past the 25th, we are in the cycle ending next month
  // But usually simulation is for the *upcoming* invoice.
  // If today is Jan 26, the next invoice is Feb 25.
  if (today.getDate() > 25) {
    nextMeasurementDate = new Date(currentYear, currentMonth + 1, 25)
  }

  // Determine Previous Measurement Date (Start of this cycle)
  const prevMeasurementDate = new Date(nextMeasurementDate)
  prevMeasurementDate.setMonth(prevMeasurementDate.getMonth() - 1)

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

      const baseCost = container.base_monthly_cost || 3200
      const capacity = container.initial_capacity_m3 || 67.7
      const entryDate = new Date(alloc.data_entrada)

      let amount = 0
      let description = ''
      let calculationMethod: 'pro_rata' | 'volume_snapshot'
      let meta: Partial<InvoiceItem> = {}

      // Logic: First Month Pro-rata OR Volume Snapshot
      // Check if entry date is AFTER the previous measurement date
      // Meaning: This is the first billing cycle for this container
      if (entryDate > prevMeasurementDate) {
        // Pro-rata: (Days until 25th / 30) * Base
        const daysActive = differenceInDays(nextMeasurementDate, entryDate)
        // Ensure at least 1 day if entered same day? Spec says "Days until 25th"
        const daysToBill = Math.max(1, daysActive)

        amount = (daysToBill / 30) * baseCost
        description = `Armazenagem (Pro-rata) - ${container.codigo}`
        calculationMethod = 'pro_rata'

        meta = {
          days_pro_rated: daysToBill,
          snapshot_date: nextMeasurementDate.toISOString(),
          base_cost: baseCost,
        }
      } else {
        // Subsequent Month: Volume Snapshot Logic
        // Bill based on volume at the START of the period (Previous Snapshot)
        // Spec: "Snapshot on 25th ... to determine billing for subsequent period"
        // So we look at volume at `prevMeasurementDate`.
        // However, exits BEFORE 25th reduce the bill.

        // Let's use the volume at `prevMeasurementDate` (The snapshot that started this period)
        // Wait, Spec: "If exit before 25th ... reduced bill for NEXT month".
        // This implies the bill generated ON the 25th covers the PAST period or FUTURE?
        // Usually storage is billed month-to-month.
        // If "Snapshot on 25th determines billing for SUBSEQUENT period", then:
        // Jan 25 Snapshot -> Determines Bill for Jan 26-Feb 25.
        // We are currently simulating the bill generated ON `nextMeasurementDate`.
        // This bill covers the period ending on `nextMeasurementDate`?
        // Or is it a pre-bill for next month?
        // "Medição ... record snapshot ... determine billing for subsequent period".
        // This sounds like: Jan 25 Snapshot -> Bill for Feb.
        // So the bill we generate NOW (approaching Jan 25) is based on... what?
        // Likely the Jan 25 bill covers the period that just passed (Jan 10-25) if pro-rata.
        // And for old containers, it covers Dec 26 - Jan 25.
        // And the COST is determined by the Dec 25 Snapshot.

        // Let's stick to:
        // If Old Container: Cost = (Volume @ Last Snapshot / Capacity) * Base.
        // Last Snapshot = `prevMeasurementDate`.

        const volumeAtSnapshot = getVolumeAtDate(container, prevMeasurementDate)
        const occupancy = Math.min(100, (volumeAtSnapshot / capacity) * 100)
        const factor = volumeAtSnapshot / capacity

        amount = factor * baseCost
        description = `Armazenagem (Volume) - ${container.codigo}`
        calculationMethod = 'volume_snapshot'

        meta = {
          snapshot_date: prevMeasurementDate.toISOString(),
          used_volume_m3: Number(volumeAtSnapshot.toFixed(2)),
          occupancy_percentage: Number(occupancy.toFixed(1)),
          base_cost: baseCost,
          savings: baseCost - amount,
        }
      }

      items.push({
        id: `item-${Math.random()}`,
        description,
        amount,
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
      due_date: addDays(nextMeasurementDate, 10).toISOString(), // Due 10 days after measurement
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
