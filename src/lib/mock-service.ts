/* Mock service to simulate data fetching and operations */
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

// Initial Data
let clients: Client[] = [
  {
    id: '1',
    nome: 'Importadora Global S.A.',
    contato: 'Carlos Silva',
    email: 'carlos@global.com',
    created_at: '2023-01-15',
  },
  {
    id: '2',
    nome: 'Tech Solutions Ltda',
    contato: 'Mariana Costa',
    email: 'mariana@techsol.com',
    created_at: '2023-02-20',
  },
  {
    id: '3',
    nome: 'Agro Exportadora',
    contato: 'Roberto Mendes',
    email: 'roberto@agro.com',
    created_at: '2023-03-10',
  },
  {
    id: '4',
    nome: 'Logística Rápida',
    contato: 'Fernanda Lima',
    email: 'fernanda@lograpida.com',
    created_at: '2023-04-05',
  },
  {
    id: '5',
    nome: 'Varejo Express',
    contato: 'Paulo Souza',
    email: 'paulo@varejo.com',
    created_at: '2023-05-12',
  },
]

let containers: Container[] = [
  {
    id: '101',
    codigo: 'CMAU3754293',
    bl_number: '06BRZ2311002',
    bl_id: 'bl1',
    capacidade: '20ft',
    tipo: "Dry Box 20'",
    status: 'Ativo',
    occupancy_rate: 85,
    sku_count: 12,
    total_volume_m3: 28.5,
    total_weight_kg: 12500,
    created_at: '2022-11-01',
    cliente_id: '1',
    cliente_nome: 'Importadora Global S.A.',
    arrival_date: '2022-11-01',
    base_cost_brl: 500,
  },
  {
    id: '102',
    codigo: 'MSKU9012345',
    bl_number: '06BRZ2311005',
    capacidade: '40ft',
    tipo: "Dry Box 40'",
    status: 'Vazio',
    occupancy_rate: 0,
    sku_count: 0,
    total_volume_m3: 0,
    total_weight_kg: 0,
    created_at: '2022-11-01',
    arrival_date: '2022-11-05',
    base_cost_brl: 800,
  },
  {
    id: '103',
    codigo: 'HLBU5678901',
    bl_number: '06BRZ2311008',
    capacidade: '20ft',
    tipo: "Dry Box 20'",
    status: 'Manutenção',
    occupancy_rate: 0,
    sku_count: 0,
    total_volume_m3: 0,
    total_weight_kg: 0,
    created_at: '2022-12-05',
    arrival_date: '2022-12-05',
    base_cost_brl: 500,
  },
  {
    id: '104',
    codigo: 'MEDU2345678',
    bl_number: '06BRZ2311012',
    bl_id: 'bl2',
    capacidade: '40ft HC',
    tipo: "Dry Box 40' HC",
    status: 'Parcial',
    occupancy_rate: 45,
    sku_count: 8,
    total_volume_m3: 35.2,
    total_weight_kg: 8400,
    created_at: '2023-01-10',
    cliente_id: '3',
    cliente_nome: 'Agro Exportadora',
    arrival_date: '2023-01-10',
    base_cost_brl: 950,
  },
  {
    id: '105',
    codigo: 'COSU3456789',
    bl_number: '06BRZ2311015',
    capacidade: '20ft',
    tipo: "Dry Box 20'",
    status: 'Cheio',
    occupancy_rate: 98,
    sku_count: 24,
    total_volume_m3: 32.8,
    total_weight_kg: 21000,
    created_at: '2023-02-15',
    cliente_id: '2',
    cliente_nome: 'Tech Solutions Ltda',
    arrival_date: '2023-02-15',
    base_cost_brl: 600,
  },
  {
    id: '106',
    codigo: 'ONEY4567890',
    bl_number: '06BRZ2311018',
    capacidade: '40ft',
    tipo: "Dry Box 40'",
    status: 'Pendente',
    occupancy_rate: 10,
    sku_count: 2,
    total_volume_m3: 5.0,
    total_weight_kg: 1200,
    created_at: '2023-03-20',
    arrival_date: '2023-03-20',
    base_cost_brl: 800,
  },
]

let allocations: Allocation[] = [
  {
    id: 'a1',
    container_id: '101',
    container_code: 'CMAU3754293',
    cliente_id: '1',
    cliente_nome: 'Importadora Global S.A.',
    data_entrada: '2023-10-01',
    custo_mensal: 500,
    created_at: '2023-10-01',
    status: 'Ativo',
  },
  {
    id: 'a2',
    container_id: '104',
    container_code: 'MEDU2345678',
    cliente_id: '3',
    cliente_nome: 'Agro Exportadora',
    data_entrada: '2023-11-15',
    custo_mensal: 950,
    created_at: '2023-11-15',
    status: 'Ativo',
  },
]

let inventory: InventoryItem[] = [
  {
    id: 'inv1',
    container_id: '101',
    sku: 'SKU-001',
    name: 'Eletrônicos A',
    quantity: 500,
    unit_volume_m3: 0.05,
    unit_value: 150,
  },
  {
    id: 'inv2',
    container_id: '101',
    sku: 'SKU-002',
    name: 'Cabos HDMI',
    quantity: 1000,
    unit_volume_m3: 0.01,
    unit_value: 25,
  },
]

let events: LogisticsEvent[] = []
let invoices: Invoice[] = []
let recentActivity: ActivityLog[] = []

// BL Data
let billsOfLading: BillOfLading[] = [
  {
    id: 'bl1',
    number: '06BRZ2311002',
    client_id: '1',
    client_name: 'Importadora Global S.A.',
    shipper: 'Shenzhen Logistics Ltd',
    consignee: 'Importadora Global S.A.',
    vessel: 'MAERSK SEOUL',
    voyage: '204E',
    port_of_loading: 'SHENZHEN',
    port_of_discharge: 'SANTOS',
    total_weight_kg: 25000,
    total_volume_m3: 56.5,
    container_count: 2,
    status: 'Cleared',
    created_at: '2023-10-01T08:00:00Z',
  },
  {
    id: 'bl2',
    number: '06BRZ2311012',
    client_id: '3',
    client_name: 'Agro Exportadora',
    shipper: 'Agro Exportadora',
    consignee: 'Rotterdam Foods BV',
    vessel: 'MSC GULSUN',
    voyage: '112W',
    port_of_loading: 'SANTOS',
    port_of_discharge: 'ROTTERDAM',
    total_weight_kg: 18400,
    total_volume_m3: 35.2,
    container_count: 1,
    status: 'Divergent',
    created_at: '2023-11-10T14:30:00Z',
  },
]

let divergences: Divergence[] = [
  {
    id: 'div1',
    bl_id: 'bl2',
    bl_number: '06BRZ2311012',
    type: 'Weight',
    severity: 'Warning',
    description: 'Peso no EDI difere do BL (-500kg)',
    status: 'Open',
    created_at: '2023-11-12T10:00:00Z',
    bl_value: '18900 kg',
    edi_value: '18400 kg',
  },
]

let ediLogs: EDILog[] = [
  {
    id: 'edi1',
    bl_id: 'bl1',
    payload_snippet: 'UNB+UNOA:2+SHENZHEN+SANTOS...',
    received_at: '2023-10-02T09:00:00Z',
    status: 'Matched',
  },
  {
    id: 'edi2',
    bl_id: 'bl2',
    payload_snippet: 'UNB+UNOA:2+SANTOS+ROTTERDAM...',
    received_at: '2023-11-12T10:00:00Z',
    status: 'Divergent',
  },
]

// Service Functions
export const getClients = async () => Promise.resolve([...clients])
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
  }
  containers.unshift(newContainer)
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

  // Return extracted data (mocked)
  return {
    number: mockNumber,
    client_id: clientId,
    client_name: client?.nome || 'Unknown',
    shipper: 'Global Suppliers Ltd',
    consignee: client?.nome || 'Unknown',
    vessel: 'MSC WONDER',
    voyage: '305W',
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
      total_volume_m3: 0, // Unknown until packing list
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
  return Promise.resolve({
    activeAllocations: 12,
    occupancyRate: 65,
    activeClients: 5,
    pendingExitCosts: 12500,
    nextBillingDate: '25/02/2026',
    statusDistribution: [],
  })
}

export const registerEntry = async (data: any) =>
  Promise.resolve({ success: true, message: 'ok' })
export const registerExit = async (id: string, date: Date) =>
  Promise.resolve({ success: true, message: 'ok' })
export const createExitEvent = async (data: any) => {
  const evt = { ...data, id: 'new', volume_m3: 0, value: 0 } as LogisticsEvent
  return Promise.resolve(evt)
}
export const generateMeasurements = async () =>
  Promise.resolve({ success: true, message: 'ok' })
export const simulateBilling = async () => Promise.resolve([])
export const generateMonthlyInvoices = async () =>
  Promise.resolve({ success: true, count: 0 })
