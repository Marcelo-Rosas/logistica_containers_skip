/* Type definitions for the application entities */

export type Client = {
  id: string
  nome: string
  contato: string
  email: string
  created_at: string
}

export type ContainerStatus = 'Disponível' | 'Ocupado' | 'Manutenção'

export type Container = {
  id: string
  cliente_id?: string
  codigo: string
  capacidade: string
  status: ContainerStatus
  created_at: string
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
