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
import { getContainers } from '@/services/container'
import { Container, ContainerTypeDef } from '@/lib/types'
import { Plus, UserPlus, FileText, Loader2, AlertCircle } from 'lucide-react'
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
  const [filter, setFilter] = useState('todos')
  const [search, setSearch] = useState('')
  const [isNewContainerOpen, setIsNewContainerOpen] = useState(false)
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false)
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(
    null,
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getContainers()
      setContainers(data)
    } catch (e) {
      toast.error('Erro ao carregar containers')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateContainer = async () => {
    toast.error(
      'Funcionalidade de criação via Supabase ainda não implementada neste demo',
    )
  }

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Containers Físicos
          </h2>
          <p className="text-muted-foreground mt-1">
            Gerencie o estoque e status da frota (Supabase Conectado)
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={() => setIsNewContainerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Novo Contêiner
          </Button>
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

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
          <p>Carregando containers...</p>
        </div>
      ) : filteredContainers.length > 0 ? (
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
      ) : (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-lg bg-slate-50/50">
          <div className="p-4 rounded-full bg-muted/50 mb-3">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">Nenhum container encontrado</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Tente ajustar os filtros ou cadastre um novo container via BL.
          </p>
        </div>
      )}

      <NewExitEventDialog
        open={isExitDialogOpen}
        onOpenChange={setIsExitDialogOpen}
        onSuccess={loadData}
        initialContainerId={selectedContainerId || undefined}
      />
    </div>
  )
}
