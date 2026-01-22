/* Mock service to simulate data fetching and operations */
import {
  Client,
  Container,
  Allocation,
  ActivityLog,
  DashboardStats,
  InventoryItem,
  LogisticsEvent,
} from './types'

// Initial Data (Mutable to allow updates during session)
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
  },
  {
    id: '104',
    codigo: 'MEDU2345678',
    bl_number: '06BRZ2311012',
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
    custo_mensal: 800,
    created_at: '2023-11-15',
    status: 'Ativo',
  },
]

let recentActivity: ActivityLog[] = [
  {
    id: '1',
    message: 'Container [CMAU3754293] entrou para Importadora Global S.A.',
    timestamp: '2h atrás',
    type: 'info',
  },
  {
    id: '2',
    message: 'Custo de saída calculado para [MSKU9012345]',
    timestamp: '5h atrás',
    type: 'success',
  },
  {
    id: '3',
    message: 'Medição mensal gerada para Agro Exportadora',
    timestamp: '1d atrás',
    type: 'info',
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
  {
    id: 'inv3',
    container_id: '104',
    sku: 'SKU-003',
    name: 'Soja Granel',
    quantity: 5000,
    unit_volume_m3: 0.005,
    unit_value: 2,
  },
  {
    id: 'inv4',
    container_id: '105',
    sku: 'SKU-004',
    name: 'Peças Auto',
    quantity: 200,
    unit_volume_m3: 0.1,
    unit_value: 300,
  },
]

let events: LogisticsEvent[] = [
  {
    id: 'evt1',
    type: 'entry',
    container_id: '101',
    container_code: 'CMAU3754293',
    sku: 'SKU-001',
    quantity: 500,
    volume_m3: 25,
    doc_number: 'NF-1001',
    destination: 'Depósito A',
    responsible: 'João Silva',
    timestamp: '2026-01-10T10:00:00Z',
    value: 75000,
  },
  {
    id: 'evt2',
    type: 'entry',
    container_id: '101',
    container_code: 'CMAU3754293',
    sku: 'SKU-002',
    quantity: 1000,
    volume_m3: 10,
    doc_number: 'NF-1002',
    destination: 'Depósito A',
    responsible: 'João Silva',
    timestamp: '2026-01-10T11:00:00Z',
    value: 25000,
  },
  {
    id: 'evt3',
    type: 'exit',
    container_id: '101',
    container_code: 'CMAU3754293',
    sku: 'SKU-001',
    quantity: 50,
    volume_m3: 2.5,
    doc_number: 'OUT-5001',
    destination: 'Loja Centro',
    responsible: 'Maria Costa',
    timestamp: '2026-01-20T14:30:00Z',
    value: 7500,
  },
]

// Service Functions
export const getClients = async () => Promise.resolve([...clients])
export const getContainers = async () => Promise.resolve([...containers])
export const getAllocations = async () => Promise.resolve([...allocations])
export const getRecentActivity = async () =>
  Promise.resolve([...recentActivity])

export const getInventory = async (containerId: string) => {
  return Promise.resolve(
    inventory.filter((i) => i.container_id === containerId && i.quantity > 0),
  )
}

export const getEvents = async () => Promise.resolve([...events])

export const createExitEvent = async (data: {
  container_id: string
  inventory_id: string
  quantity: number
  doc_number: string
  destination: string
  responsible: string
}) => {
  const itemIndex = inventory.findIndex((i) => i.id === data.inventory_id)
  if (itemIndex === -1) throw new Error('Item not found')

  const item = inventory[itemIndex]
  if (item.quantity < data.quantity) throw new Error('Quantidade insuficiente')

  const container = containers.find((c) => c.id === data.container_id)
  if (!container) throw new Error('Container not found')

  // Update Inventory
  inventory[itemIndex] = {
    ...item,
    quantity: item.quantity - data.quantity,
  }

  // Create Event
  const newEvent: LogisticsEvent = {
    id: `evt${Date.now()}`,
    type: 'exit',
    container_id: data.container_id,
    container_code: container.codigo,
    sku: item.sku,
    quantity: data.quantity,
    volume_m3: item.unit_volume_m3 * data.quantity,
    doc_number: data.doc_number,
    destination: data.destination,
    responsible: data.responsible,
    timestamp: new Date().toISOString(),
    value: item.unit_value * data.quantity,
  }

  events.unshift(newEvent)

  // Also update recent activity
  recentActivity.unshift({
    id: `log${Date.now()}`,
    message: `Saída registrada: ${data.quantity}x ${item.sku} de ${container.codigo}`,
    timestamp: 'Agora',
    type: 'warning',
  })

  return Promise.resolve(newEvent)
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const activeAllocations = allocations.filter(
    (a) => a.status === 'Ativo',
  ).length

  // Calculate average occupancy of non-empty containers
  const occupiedContainers = containers.filter((c) => c.occupancy_rate > 0)
  const totalOccupancy = occupiedContainers.reduce(
    (acc, curr) => acc + curr.occupancy_rate,
    0,
  )
  const occupancyRate =
    occupiedContainers.length > 0
      ? Math.round(totalOccupancy / occupiedContainers.length)
      : 0

  const activeClients = new Set(
    allocations.filter((a) => a.status === 'Ativo').map((a) => a.cliente_id),
  ).size

  const statusCount = containers.reduce(
    (acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const statusDistribution = [
    {
      status: 'Ativo',
      count: (statusCount['Ativo'] || 0) + (statusCount['Cheio'] || 0),
      fill: 'var(--color-ativo)',
    },
    {
      status: 'Parcial',
      count: statusCount['Parcial'] || 0,
      fill: 'var(--color-parcial)',
    },
    {
      status: 'Vazio',
      count: statusCount['Vazio'] || 0,
      fill: 'var(--color-vazio)',
    },
    {
      status: 'Pendente',
      count: statusCount['Pendente'] || 0,
      fill: 'var(--color-pendente)',
    },
  ]

  return Promise.resolve({
    activeAllocations,
    occupancyRate,
    activeClients,
    pendingExitCosts: 12500.0, // Hardcoded for simplicity
    nextBillingDate: '01/02/2026',
    statusDistribution,
  })
}

export const createContainer = async (data: any) => {
  const client = clients.find((c) => c.id === data.cliente_id)

  const newContainer: Container = {
    id: `c${Date.now()}`,
    codigo: data.codigo,
    bl_number: data.bl_number,
    capacidade: data.tipo?.includes('40') ? '40ft' : '20ft',
    tipo: data.tipo,
    status: 'Pendente',
    occupancy_rate: 0,
    sku_count: 0,
    total_volume_m3: 0,
    total_weight_kg: 0,
    created_at: new Date().toISOString(),
    cliente_id: client?.id,
    cliente_nome: client?.nome,
    arrival_date: data.arrival_date,
    storage_start_date: data.storage_start_date,
  }

  containers.unshift(newContainer)

  recentActivity.unshift({
    id: `log${Date.now()}`,
    message: `Novo container registrado: ${newContainer.codigo}`,
    timestamp: 'Agora',
    type: 'info',
  })

  return Promise.resolve(newContainer)
}

export const registerEntry = async (data: {
  client: string
  container: string
  data_entrada: Date
  file?: File | null
}) => {
  const client = clients.find((c) => c.id === data.client)
  const container = containers.find((c) => c.id === data.container)

  if (!client || !container) {
    throw new Error('Cliente ou Container não encontrado')
  }

  const newAllocation: Allocation = {
    id: `a${Date.now()}`,
    container_id: container.id,
    container_code: container.codigo,
    cliente_id: client.id,
    cliente_nome: client.nome,
    data_entrada: data.data_entrada.toISOString(),
    custo_mensal: container.capacidade === '40ft' ? 800 : 500, // Mock cost logic
    created_at: new Date().toISOString(),
    status: 'Ativo',
    packing_list_url: data.file
      ? `https://supabase-storage.com/packing-lists/${data.file.name}`
      : undefined,
  }

  allocations.unshift(newAllocation)

  // Update container status
  const containerIndex = containers.findIndex((c) => c.id === container.id)
  if (containerIndex >= 0) {
    containers[containerIndex] = {
      ...containers[containerIndex],
      status: 'Ativo',
      cliente_id: client.id,
      cliente_nome: client.nome,
    }
  }

  // Log activity
  recentActivity.unshift({
    id: `log${Date.now()}`,
    message: `Nova alocação: ${container.codigo} para ${client.nome}`,
    timestamp: 'Agora',
    type: 'info',
  })

  return Promise.resolve({
    success: true,
    message: 'Entrada registrada com sucesso!',
  })
}

export const registerExit = async (id: string, dataSaida: Date) => {
  const allocationIndex = allocations.findIndex((a) => a.id === id)
  if (allocationIndex === -1) throw new Error('Alocação não encontrada')

  const allocation = allocations[allocationIndex]

  // Update allocation
  allocations[allocationIndex] = {
    ...allocation,
    status: 'Finalizado',
    data_saida: dataSaida.toISOString(),
  }

  // Update container status
  const containerIndex = containers.findIndex(
    (c) => c.id === allocation.container_id,
  )
  if (containerIndex >= 0) {
    containers[containerIndex] = {
      ...containers[containerIndex],
      status: 'Vazio',
      cliente_id: undefined,
      cliente_nome: undefined,
      occupancy_rate: 0,
      sku_count: 0,
      total_volume_m3: 0,
      total_weight_kg: 0,
    }
  }

  // Simulate Make.com trigger
  console.log('--- MAKE.COM WEBHOOK TRIGGERED ---')
  console.log('Payload:', {
    allocationId: id,
    exitDate: dataSaida,
    costCalculation: true,
  })
  console.log('----------------------------------')

  // Log activity
  recentActivity.unshift({
    id: `log${Date.now()}`,
    message: `Saída registrada: ${allocation.container_code}`,
    timestamp: 'Agora',
    type: 'success',
  })

  return Promise.resolve({
    success: true,
    message: 'Saída registrada e custos calculados!',
  })
}

export const processRemoval = async (
  containerId: string,
  sku: string,
  qty: number,
) => {
  const container = containers.find((c) => c.id === containerId)
  if (!container) throw new Error('Container not found')

  // Mock update logic
  const containerIndex = containers.findIndex((c) => c.id === containerId)
  if (containerIndex >= 0) {
    const newOccupancy = Math.max(0, container.occupancy_rate - 5) // reduce by 5% mock
    containers[containerIndex] = {
      ...containers[containerIndex],
      occupancy_rate: newOccupancy,
      status: newOccupancy === 0 ? 'Vazio' : 'Parcial',
    }
  }

  recentActivity.unshift({
    id: `log${Date.now()}`,
    message: `Remoção parcial: ${qty}x ${sku} de ${container.codigo}`,
    timestamp: 'Agora',
    type: 'info',
  })

  return Promise.resolve({ success: true })
}

export const generateMeasurements = async () => {
  console.log('Mock: Measurements generated')
  return Promise.resolve({
    success: true,
    message: 'Medições mensais geradas com sucesso!',
  })
}
