import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Container } from '@/lib/types'
import {
  Box,
  CheckCircle2,
  AlertCircle,
  Clock,
  Package,
  Ruler,
  Weight,
  MoreVertical,
  Ship,
  Eye,
  LogOut,
  Activity,
  Download,
  Scale,
  Cuboid,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'

interface ContainerCardProps {
  container: Container
  onExit: (container: Container) => void
  onSimulate: (container: Container) => void
  onExport: (container: Container) => void
}

export function ContainerCard({
  container,
  onExit,
  onSimulate,
  onExport,
}: ContainerCardProps) {
  const navigate = useNavigate()

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

  const handleCardClick = () => {
    navigate(`/containers/${container.id}`)
  }

  // Use active strategy if available, otherwise guess based on fields
  const strategy = container.active_strategy || 'VOLUME'

  // Note: active_strategy is computed in getContainer detail,
  // but might be missing in list view if not populated.
  // However, occupancy_rate is main visual indicator.

  return (
    <Card
      className="hover:border-primary/50 transition-colors group relative overflow-hidden cursor-pointer"
      onClick={handleCardClick}
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
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 z-10" // Ensure visibility on mobile
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/containers/${container.id}`)
              }}
            >
              <Eye className="mr-2 h-4 w-4" /> Ver detalhes
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onExit(container)
              }}
            >
              <LogOut className="mr-2 h-4 w-4" /> Registrar saída
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onSimulate(container)
              }}
            >
              <Activity className="mr-2 h-4 w-4" /> Simular medição
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onExport(container)
              }}
            >
              <Download className="mr-2 h-4 w-4" /> Exportar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="pl-6 pb-2">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">
                Ocupação ({strategy})
              </span>
              <span className="font-medium">{container.occupancy_rate}%</span>
            </div>
            <Progress
              value={container.occupancy_rate}
              className="h-2"
              indicatorClassName={getOccupancyColor(container.occupancy_rate)}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 py-2">
            <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-md border text-center">
              <Package className="h-4 w-4 text-muted-foreground mb-1" />
              <span className="text-sm font-bold">{container.sku_count}</span>
              <span className="text-[10px] text-muted-foreground uppercase">
                SKUs
              </span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-md border text-center">
              <Cuboid className="h-4 w-4 text-muted-foreground mb-1" />
              <span className="text-sm font-bold">
                {Number(container.total_volume_m3).toFixed(1)}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase">
                m³
              </span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-md border text-center">
              <Scale className="h-4 w-4 text-muted-foreground mb-1" />
              <span className="text-sm font-bold">
                {(container.total_weight_kg / 1000).toFixed(1)}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase">
                Ton (B)
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
  )
}
