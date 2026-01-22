/* Containers Grid View Page - Enhanced for Advanced Management */
import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import {
  getContainers,
  createContainer,
  getClients,
  processRemoval,
} from '@/lib/mock-service'
import { Container, Client, ContainerTypeDef } from '@/lib/types'
import {
  Box,
  CheckCircle2,
  AlertCircle,
  Clock,
  Package,
  Ruler,
  Weight,
  MoreVertical,
  Plus,
  FileSpreadsheet,
  Trash2,
  Ship,
  UserPlus,
  CalendarIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const containerTypes: ContainerTypeDef[] = [
  { id: '20ft', name: "Dry Box 20'", volume_m3: 33.2, price: 2500 },
  { id: '40ft', name: "Dry Box 40'", volume_m3: 67.7, price: 3000 },
  { id: '40hc', name: "Dry Box 40' HC", volume_m3: 76.4, price: 3200 },
]

export default function Containers() {
  const [containers, setContainers] = useState<Container[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [filter, setFilter] = useState('todos')
  const [search, setSearch] = useState('')
  const [isNewContainerOpen, setIsNewContainerOpen] = useState(false)
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false)
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(
    null,
  )

  // New Container Form State
  const [newContainerData, setNewContainerData] = useState({
    id: '',
    bl: '',
    type: '',
    clientId: '',
    arrivalDate: '',
    storageDate: '',
  })

  // Exit Form State
  const [exitData, setExitData] = useState({
    sku: '',
    qty: 0,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [cData, clientData] = await Promise.all([
      getContainers(),
      getClients(),
    ])
    setContainers(cData)
    setClients(clientData)
  }

  const handleCreateContainer = async () => {
    if (
      !newContainerData.id ||
      !newContainerData.bl ||
      !newContainerData.type ||
      !newContainerData.arrivalDate
    ) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    try {
      const typeDef = containerTypes.find(
        (t) => t.name === newContainerData.type,
      )
      await createContainer({
        codigo: newContainerData.id,
        bl_number: newContainerData.bl,
        tipo: newContainerData.type,
        cliente_id: newContainerData.clientId,
        arrival_date: newContainerData.arrivalDate,
        storage_start_date: newContainerData.storageDate,
      })
      toast.success('Container criado com sucesso!')
      setIsNewContainerOpen(false)
      loadData()
      setNewContainerData({
        id: '',
        bl: '',
        type: '',
        clientId: '',
        arrivalDate: '',
        storageDate: '',
      })
    } catch (e) {
      toast.error('Erro ao criar container')
    }
  }

  const handleExitEvent = async () => {
    if (!selectedContainer || !exitData.sku || exitData.qty <= 0) {
      toast.error('Preencha os dados da saída')
      return
    }
    try {
      await processRemoval(selectedContainer.id, exitData.sku, exitData.qty)
      toast.success('Saída registrada e equipe notificada!')
      setIsExitDialogOpen(false)
      loadData()
      setExitData({ sku: '', qty: 0 })
      setSelectedContainer(null)
    } catch (e) {
      toast.error('Erro ao registrar saída')
    }
  }

  const filteredContainers = containers.filter((c) => {
    const matchesSearch = c.codigo.toLowerCase().includes(search.toLowerCase())
    const matchesFilter =
      filter === 'todos' ||
      c.status.toLowerCase().includes(filter.toLowerCase())
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo':
      case 'Cheio':
        return 'bg-emerald-500 hover:bg-emerald-600 text-white border-transparent'
      case 'Parcial':
      case 'Ocupado':
        return 'bg-blue-500 hover:bg-blue-600 text-white border-transparent'
      case 'Vazio':
      case 'Disponível':
        return 'bg-slate-200 hover:bg-slate-300 text-slate-700 border-transparent'
      case 'Pendente':
        return 'bg-amber-500 hover:bg-amber-600 text-white border-transparent'
      case 'Manutenção':
      case 'Fechado':
        return 'bg-red-500 hover:bg-red-600 text-white border-transparent'
      default:
        return 'bg-slate-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Ativo':
      case 'Cheio':
        return <CheckCircle2 className="h-3 w-3" />
      case 'Parcial':
      case 'Ocupado':
        return <Box className="h-3 w-3" />
      case 'Pendente':
        return <Clock className="h-3 w-3" />
      case 'Manutenção':
      case 'Fechado':
        return <AlertCircle className="h-3 w-3" />
      default:
        return <Box className="h-3 w-3" />
    }
  }

  const getOccupancyColor = (rate: number) => {
    if (rate > 75) return 'bg-emerald-500'
    if (rate > 40) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const selectedType = containerTypes.find(
    (t) => t.name === newContainerData.type,
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Containers Físicos
          </h2>
          <p className="text-muted-foreground mt-1">
            Gerencie o estoque e status da frota
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Dialog
            open={isNewContainerOpen}
            onOpenChange={setIsNewContainerOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Novo Contêiner
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Novo Contêiner</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Adicione um novo contêiner ao sistema de armazenagem.
                </p>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>ID do Contêiner *</Label>
                    <Input
                      placeholder="Ex: CMAU3754293"
                      value={newContainerData.id}
                      onChange={(e) =>
                        setNewContainerData({
                          ...newContainerData,
                          id: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Número BL *</Label>
                    <Input
                      placeholder="Ex: 06BRZ2311002"
                      value={newContainerData.bl}
                      onChange={(e) =>
                        setNewContainerData({
                          ...newContainerData,
                          bl: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Contêiner</Label>
                  <Select
                    value={newContainerData.type}
                    onValueChange={(val) =>
                      setNewContainerData({ ...newContainerData, type: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {containerTypes.map((t) => (
                        <SelectItem key={t.id} value={t.name}>
                          {t.name} - {t.volume_m3} m³ - R${' '}
                          {t.price.toLocaleString('pt-BR')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Cliente *</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-xs"
                    >
                      <UserPlus className="h-3 w-3 mr-1" /> Novo Cliente
                    </Button>
                  </div>
                  <Select
                    value={newContainerData.clientId}
                    onValueChange={(val) =>
                      setNewContainerData({
                        ...newContainerData,
                        clientId: val,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data de Chegada *</Label>
                    <div className="relative">
                      <Input
                        type="date"
                        value={newContainerData.arrivalDate}
                        onChange={(e) =>
                          setNewContainerData({
                            ...newContainerData,
                            arrivalDate: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Início Armazenagem *</Label>
                    <div className="relative">
                      <Input
                        type="date"
                        value={newContainerData.storageDate}
                        onChange={(e) =>
                          setNewContainerData({
                            ...newContainerData,
                            storageDate: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {selectedType && (
                  <div className="rounded-lg bg-slate-50 p-4 space-y-2 border">
                    <h4 className="font-medium text-sm">Resumo do Contêiner</h4>
                    <div className="grid grid-cols-2 text-sm gap-y-1">
                      <span className="text-muted-foreground">Tipo:</span>
                      <span className="font-medium">{selectedType.name}</span>
                      <span className="text-muted-foreground">Capacidade:</span>
                      <span className="font-medium">
                        {selectedType.volume_m3} m³
                      </span>
                      <span className="text-muted-foreground">Custo Base:</span>
                      <span className="font-medium">
                        R$ {selectedType.price.toLocaleString('pt-BR')}/mês
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsNewContainerOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleCreateContainer}>Criar Contêiner</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-2 items-center bg-card p-4 rounded-lg border shadow-sm">
        <Input
          placeholder="Buscar ID..."
          className="max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="ativo">Ativos</SelectItem>
            <SelectItem value="parcial">Parciais</SelectItem>
            <SelectItem value="vazio">Vazios</SelectItem>
            <SelectItem value="pendente">Pendentes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredContainers.map((container) => (
          <Card
            key={container.id}
            className="hover:border-primary/50 transition-colors group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-slate-200" />
            <CardHeader className="flex flex-row items-start justify-between pb-2 pl-6">
              <div className="space-y-1">
                <CardTitle className="font-mono text-xl tracking-tight flex items-center gap-2">
                  {container.codigo}
                  <Badge
                    variant="outline"
                    className={cn(
                      'ml-2 font-normal text-xs py-0 h-5',
                      getStatusColor(container.status),
                    )}
                  >
                    <span className="flex items-center gap-1">
                      {getStatusIcon(container.status)}
                      {container.status}
                    </span>
                  </Badge>
                </CardTitle>
                <div className="text-sm text-muted-foreground flex flex-col">
                  <span className="font-medium text-foreground truncate max-w-[200px]">
                    {container.cliente_nome || 'Sem cliente'}
                  </span>
                  <span className="text-xs flex items-center gap-1">
                    <Ship className="h-3 w-3" /> BL: {container.bl_number}
                  </span>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Ações</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedContainer(container)
                      setIsExitDialogOpen(true)
                    }}
                  >
                    Registrar saída
                  </DropdownMenuItem>
                  <DropdownMenuItem>Simular medição</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Exportar</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>

            <CardContent className="pl-6 pb-2">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Ocupação</span>
                    <span className="font-medium">
                      {container.occupancy_rate}%
                    </span>
                  </div>
                  <Progress
                    value={container.occupancy_rate}
                    className="h-2"
                    indicatorClassName={getOccupancyColor(
                      container.occupancy_rate,
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 py-2">
                  <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-md border text-center">
                    <Package className="h-4 w-4 text-muted-foreground mb-1" />
                    <span className="text-sm font-bold">
                      {container.sku_count}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase">
                      SKUs
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-md border text-center">
                    <Ruler className="h-4 w-4 text-muted-foreground mb-1" />
                    <span className="text-sm font-bold">
                      {container.total_volume_m3}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase">
                      m³
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-md border text-center">
                    <Weight className="h-4 w-4 text-muted-foreground mb-1" />
                    <span className="text-sm font-bold">
                      {(container.total_weight_kg / 1000).toFixed(1)}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase">
                      Ton
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="bg-slate-50/50 p-3 pl-6 text-xs text-muted-foreground border-t flex justify-between">
              <span>Tipo: {container.tipo || container.capacidade}</span>
              <span>
                Entrada:{' '}
                {container.arrival_date
                  ? new Date(container.arrival_date).toLocaleDateString('pt-BR')
                  : '-'}
              </span>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Operational Documentation Section */}
      <section className="bg-slate-50 border rounded-lg p-6 space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            Monitorando pedidos por status de remessa
          </h3>
          <p className="text-xs text-muted-foreground">
            Atualizado pela última vez: 2026-01-20
          </p>
        </div>

        <div className="space-y-4 text-sm text-slate-700">
          <p>
            Depois que um pedido entra no processamento de remessa, o sistema de
            monitoramento de status de remessa começa a rastrear o status de
            remessa das linhas de pedido ou linhas de agendamento de remessa.
            Isso envolve verificar a entrega, a rota e a atribuição de carga. A
            Business Transaction Intelligence cria uma mensagem de status de
            remessa para cada status de remessa novo ou alterado que foi gerado
            pela transação de negócios externa.
          </p>
          <p>
            Essas mensagens são cruciais para manter a visibilidade operacional.
            Atrasos na atualização podem impactar diretamente o SLA de clientes
            sensíveis. Operadores devem verificar o painel de atividades
            diariamente para garantir que não haja discrepâncias entre o físico
            e o sistêmico.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <p className="text-xs font-medium text-slate-500">
            Tópico principal: Gestão de Visibilidade Logística
          </p>
        </div>
      </section>

      {/* Exit Dialog */}
      <Dialog open={isExitDialogOpen} onOpenChange={setIsExitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Saída (Evento de Retirada)</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Container: {selectedContainer?.codigo}
            </p>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Produto (SKU)</Label>
              <Input
                placeholder="Código do produto"
                value={exitData.sku}
                onChange={(e) =>
                  setExitData({ ...exitData, sku: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input
                type="number"
                placeholder="Qtd"
                value={exitData.qty}
                onChange={(e) =>
                  setExitData({ ...exitData, qty: Number(e.target.value) })
                }
              />
            </div>
            <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded-md border border-blue-100 flex items-start gap-2">
              <FileSpreadsheet className="h-4 w-4 shrink-0 mt-0.5" />
              <p>
                Ao confirmar, um documento PDF de separação será gerado e a
                equipe logística será notificada automaticamente.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsExitDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleExitEvent}>
              <Trash2 className="mr-2 h-4 w-4" /> Registrar Saída
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
