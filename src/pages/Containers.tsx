/* Containers Grid View Page */
import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getContainers } from '@/lib/mock-service'
import { Container } from '@/lib/types'
import { Box, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function Containers() {
  const [containers, setContainers] = useState<Container[]>([])
  const [filter, setFilter] = useState('todos')
  const [search, setSearch] = useState('')

  useEffect(() => {
    getContainers().then(setContainers)
  }, [])

  const filteredContainers = containers.filter((c) => {
    const matchesSearch = c.codigo.toLowerCase().includes(search.toLowerCase())
    const matchesFilter =
      filter === 'todos' ||
      (filter === 'disponivel' && c.status === 'Disponível') ||
      (filter === 'ocupado' && c.status === 'Ocupado') ||
      (filter === 'manutencao' && c.status === 'Manutenção')
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Disponível':
        return 'bg-emerald-500 hover:bg-emerald-600'
      case 'Ocupado':
        return 'bg-blue-600 hover:bg-blue-700'
      case 'Manutenção':
        return 'bg-amber-500 hover:bg-amber-600'
      default:
        return 'bg-slate-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Disponível':
        return <CheckCircle2 className="h-4 w-4" />
      case 'Ocupado':
        return <Box className="h-4 w-4" />
      case 'Manutenção':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight">
          Containers Físicos
        </h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <Input
            placeholder="Buscar código..."
            className="w-full sm:w-48"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="disponivel">Disponíveis</SelectItem>
              <SelectItem value="ocupado">Ocupados</SelectItem>
              <SelectItem value="manutencao">Em Manutenção</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredContainers.map((container) => (
          <Card
            key={container.id}
            className="hover:border-primary/50 transition-colors"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-bold font-mono">
                {container.codigo}
              </CardTitle>
              <Box className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Capacidade:</span>
                  <span className="font-medium">{container.capacidade}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge className={getStatusColor(container.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(container.status)}
                      {container.status}
                    </span>
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50/50 p-3 text-xs text-muted-foreground border-t">
              Atualizado em: {new Date().toLocaleDateString('pt-BR')}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
