/* Mock service to simulate data fetching and operations */
import { Client, Container, Allocation, ActivityLog } from './types'

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
    codigo: 'CONT-A001',
    capacidade: '20ft',
    status: 'Ocupado',
    created_at: '2022-11-01',
    cliente_id: '1',
  },
  {
    id: '102',
    codigo: 'CONT-A002',
    capacidade: '40ft',
    status: 'Disponível',
    created_at: '2022-11-01',
  },
  {
    id: '103',
    codigo: 'CONT-B101',
    capacidade: '20ft',
    status: 'Manutenção',
    created_at: '2022-12-05',
  },
  {
    id: '104',
    codigo: 'CONT-B102',
    capacidade: '40ft',
    status: 'Ocupado',
    created_at: '2023-01-10',
    cliente_id: '3',
  },
  {
    id: '105',
    codigo: 'CONT-C201',
    capacidade: '20ft',
    status: 'Ocupado',
    created_at: '2023-02-15',
    cliente_id: '2',
  },
  {
    id: '106',
    codigo: 'CONT-C202',
    capacidade: '40ft',
    status: 'Disponível',
    created_at: '2023-03-20',
  },
]

let allocations: Allocation[] = [
  {
    id: 'a1',
    container_id: '101',
    container_code: 'CONT-A001',
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
    container_code: 'CONT-B102',
    cliente_id: '3',
    cliente_nome: 'Agro Exportadora',
    data_entrada: '2023-11-15',
    custo_mensal: 800,
    created_at: '2023-11-15',
    status: 'Ativo',
  },
  {
    id: 'a3',
    container_id: '105',
    container_code: 'CONT-C201',
    cliente_id: '2',
    cliente_nome: 'Tech Solutions Ltda',
    data_entrada: '2023-12-05',
    custo_mensal: 550,
    created_at: '2023-12-05',
    status: 'Ativo',
  },
  {
    id: 'a4',
    container_id: '102',
    container_code: 'CONT-A002',
    cliente_id: '4',
    cliente_nome: 'Logística Rápida',
    data_entrada: '2023-09-01',
    data_saida: '2023-12-01',
    custo_mensal: 900,
    created_at: '2023-09-01',
    status: 'Finalizado',
  },
]

let recentActivity: ActivityLog[] = [
  {
    id: '1',
    message: 'Container [CONT-A001] entrou para Importadora Global S.A.',
    timestamp: '2h atrás',
    type: 'info',
  },
  {
    id: '2',
    message: 'Custo de saída calculado para [CONT-A002]',
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

// Service Functions
export const getClients = async () => Promise.resolve([...clients])
export const getContainers = async () => Promise.resolve([...containers])
export const getAllocations = async () => Promise.resolve([...allocations])
export const getRecentActivity = async () =>
  Promise.resolve([...recentActivity])

export const getDashboardStats = async () => {
  const activeAllocations = allocations.filter(
    (a) => a.status === 'Ativo',
  ).length
  const occupiedContainers = containers.filter(
    (c) => c.status === 'Ocupado',
  ).length
  const occupancyRate =
    containers.length > 0
      ? Math.round((occupiedContainers / containers.length) * 100)
      : 0
  const activeClients = new Set(
    allocations.filter((a) => a.status === 'Ativo').map((a) => a.cliente_id),
  ).size

  return Promise.resolve({
    activeAllocations,
    occupancyRate,
    activeClients,
    pendingExitCosts: 12500.0, // Hardcoded for simplicity
    nextBillingDate: '01/02/2026',
  })
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
      status: 'Ocupado',
      cliente_id: client.id,
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
      status: 'Disponível',
      cliente_id: undefined,
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

export const generateMeasurements = async () => {
  console.log('Mock: Measurements generated')
  return Promise.resolve({
    success: true,
    message: 'Medições mensais geradas com sucesso!',
  })
}
