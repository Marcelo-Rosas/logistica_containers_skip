import { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getContainers } from '@/services/container'
import { ContainerStats } from '@/lib/types'
import { Plus, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { ContainerCard } from '@/components/ContainerCard'
import { ContainerFormDialog } from '@/components/ContainerFormDialog'

export default function Containers() {
  const [containers, setContainers] = useState<ContainerStats[]>([])
  const [filter, setFilter] = useState('todos')
  const [search, setSearch] = useState('')
  const [isNewContainerOpen, setIsNewContainerOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [filter])

  // Simple debounce for search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData()
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getContainers({ status: filter, search })
      setContainers(data)
    } catch (e) {
      toast.error('Erro ao carregar containers')
    } finally {
      setLoading(false)
    }
  }

  const handleSimulate = (container: ContainerStats) => {
    toast.info(`Simulação para ${container.container_number} iniciada...`)
  }

  const handleExport = (container: ContainerStats) => {
    toast.success(`Exportando dados de ${container.container_number}...`)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Containers Físicos
          </h2>
          <p className="text-muted-foreground mt-1">
            Gerencie o estoque e status da frota (Supabase Integrado)
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={() => setIsNewContainerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Novo Contêiner
          </Button>
        </div>
      </div>

      <div className="flex gap-2 items-center bg-card p-4 rounded-lg border shadow-sm flex-wrap">
        <Input
          placeholder="Buscar (Nº Container, BL ou Cliente)..."
          className="max-w-xs min-w-[200px]"
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
            <SelectItem value="cheio">Cheios</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
          <p>Carregando containers...</p>
        </div>
      ) : containers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {containers.map((container) => (
            <ContainerCard
              key={container.id}
              container={container}
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
            Tente ajustar os filtros ou cadastre um novo container.
          </p>
        </div>
      )}

      <ContainerFormDialog
        open={isNewContainerOpen}
        onOpenChange={setIsNewContainerOpen}
        onSuccess={loadData}
      />
    </div>
  )
}
