/* Containers Grid View Page - Enhanced for Advanced Management */
import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getContainers,
  createContainer,
  getClients,
  getBLs,
} from '@/lib/mock-service'
import { Container, Client, ContainerTypeDef, BillOfLading } from '@/lib/types'
import { Plus, UserPlus, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { ContainerCard } from '@/components/ContainerCard'
import { NewExitEventDialog } from '@/components/NewExitEventDialog'

const containerTypes: ContainerTypeDef[] = [
  { id: '20ft', name: "Dry Box 20'", volume_m3: 33.2, price: 2500 },
  { id: '40ft', name: "Dry Box 40'", volume_m3: 67.7, price: 3000 },
  { id: '40hc', name: "Dry Box 40' HC", volume_m3: 76.4, price: 3200 },
]

export default function Containers() {
  const [containers, setContainers] = useState<Container[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [bls, setBls] = useState<BillOfLading[]>([])
  const [filter, setFilter] = useState('todos')
  const [search, setSearch] = useState('')
  const [isNewContainerOpen, setIsNewContainerOpen] = useState(false)

  // State for Exit Dialog triggered from Card
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false)
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(
    null,
  )

  // New Container Form State
  const [newContainerData, setNewContainerData] = useState({
    id: '',
    blId: '',
    type: '',
    clientId: '',
    arrivalDate: '',
    storageDate: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [cData, clientData, blData] = await Promise.all([
      getContainers(),
      getClients(),
      getBLs(),
    ])
    setContainers(cData)
    setClients(clientData)
    setBls(blData)
  }

  const handleCreateContainer = async () => {
    if (
      !newContainerData.id ||
      !newContainerData.blId || // Changed validation logic: BL is mandatory
      !newContainerData.type ||
      !newContainerData.arrivalDate
    ) {
      toast.error('Preencha todos os campos obrigatórios, incluindo o BL.')
      return
    }

    const selectedBL = bls.find((b) => b.id === newContainerData.blId)

    try {
      await createContainer({
        codigo: newContainerData.id,
        bl_id: selectedBL?.id,
        bl_number: selectedBL?.number,
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
        blId: '',
        type: '',
        clientId: '',
        arrivalDate: '',
        storageDate: '',
      })
    } catch (e) {
      toast.error('Erro ao criar container')
    }
  }

  // Card Action Handlers
  const handleExitTrigger = (container: Container) => {
    setSelectedContainerId(container.id)
    setIsExitDialogOpen(true)
  }

  const handleSimulate = (container: Container) => {
    toast.info(`Simulação de medição para ${container.codigo} iniciada...`)
  }

  const handleExport = (container: Container) => {
    toast.success(`Exportando dados de ${container.codigo}...`)
  }

  const filteredContainers = containers.filter((c) => {
    const matchesSearch = c.codigo.toLowerCase().includes(search.toLowerCase())
    const matchesFilter =
      filter === 'todos' ||
      c.status.toLowerCase().includes(filter.toLowerCase())
    return matchesSearch && matchesFilter
  })

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
                  Adicione um novo contêiner vinculado a um BL.
                </p>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Bill of Lading (Obrigatório)</Label>
                  <Select
                    value={newContainerData.blId}
                    onValueChange={(val) =>
                      setNewContainerData({
                        ...newContainerData,
                        blId: val,
                      })
                    }
                  >
                    <SelectTrigger className="border-l-4 border-l-primary">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <SelectValue placeholder="Selecione o BL de origem..." />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {bls.map((bl) => (
                        <SelectItem key={bl.id} value={bl.id}>
                          {bl.number} - {bl.client_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
                            {t.name} - {t.volume_m3} m³
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
          <ContainerCard
            key={container.id}
            container={container}
            onExit={handleExitTrigger}
            onSimulate={handleSimulate}
            onExport={handleExport}
          />
        ))}
      </div>

      {/* Exit Dialog triggered by cards */}
      <NewExitEventDialog
        open={isExitDialogOpen}
        onOpenChange={setIsExitDialogOpen}
        onSuccess={loadData}
        initialContainerId={selectedContainerId || undefined}
      />
    </div>
  )
}
