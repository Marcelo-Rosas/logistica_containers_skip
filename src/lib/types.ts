/* Type definitions for the application entities */

export type Client = {
  id: string
  nome: string
  contato: string
  email: string
  created_at: string
}

export type ContainerStatus =
  | 'Ativo'
  | 'Parcial'
  | 'Vazio'
  | 'Pendente'
  | 'Cheio'
  | 'Fechado'
  | 'Disponível'
  | 'Ocupado'
  | 'Manutenção'

export type ContainerTypeDef = {
  id: string
  name: string
  volume_m3: number
  price: number
}

export type Container = {
  id: string
  cliente_id?: string
  cliente_nome?: string
  codigo: string
  bl_number?: string
  capacidade: string
  tipo?: string
  status: ContainerStatus
  occupancy_rate: number // 0-100
  sku_count: number
  total_volume_m3: number
  total_weight_kg: number
  created_at: string
  arrival_date?: string
  storage_start_date?: string
}

export type Allocation = {
  id: string
  container_id: string
  container_code: string
  cliente_id: string
  cliente_nome: string
  data_entrada: string
  data_saida?: string
  packing_list_url?: string
  custo_mensal: number
  created_at: string
  status: 'Ativo' | 'Finalizado'
}

export type Measurement = {
  id: string
  alocacao_id: string
  mes_referencia: string
  valor_cobrado: number
  status_pagamento: 'Pendente' | 'Pago' | 'Atrasado'
  created_at: string
}

export type ActivityLog = {
  id: string
  message: string
  timestamp: string
  type: 'info' | 'success' | 'warning'
}

export type DashboardStats = {
  activeAllocations: number
  occupancyRate: number
  activeClients: number
  pendingExitCosts: number
  nextBillingDate: string
  statusDistribution: {
    status: string
    count: number
    fill: string
  }[]
}

export type InventoryItem = {
  id: string
  container_id: string
  sku: string
  name: string
  quantity: number
  unit_volume_m3: number
  unit_value: number
}

export type LogisticsEvent = {
  id: string
  type: 'entry' | 'exit'
  container_id: string
  container_code: string
  sku: string
  quantity: number
  volume_m3: number
  doc_number: string
  destination: string
  responsible: string
  timestamp: string
  value: number
}
