import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getContainer,
  getContainerItems,
  getEvents,
} from '@/services/container'
import {
  Container,
  ContainerItem,
  LogisticsEvent,
  BillingStrategy,
} from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  FileText,
  LogOut,
  ExternalLink,
  ShieldCheck,
  PackageCheck,
  Cuboid,
  Scale,
  Package,
  Edit,
  MapPin,
  Warehouse,
} from 'lucide-react'
import { NewExitEventDialog } from '@/components/NewExitEventDialog'
import { ContainerFormDialog } from '@/components/ContainerFormDialog'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

export default function ContainerDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [container, setContainer] = useState<Container | null>(null)
  const [items, setItems] = useState<ContainerItem[]>([])
  const [events, setEvents] = useState<LogisticsEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const loadData = async () => {
    if (!id) return
    try {
      setLoading(true)
      const containerData = await getContainer(id)
      setContainer(containerData)

      const [itemsData, eventsData] = await Promise.all([
        getContainerItems(containerData.id),
        getEvents(),
      ])

      setItems(itemsData)
      setEvents(eventsData.filter((e) => e.container_id === containerData.id))
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-4 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  if (!container) return <div className="p-8">Container não encontrado.</div>

  const strategy = container.active_strategy || 'VOLUME'
  const occupancyPercentage = container.occupancy_rate || 0

  let currentMetric = 0
  let totalMetric = 1
  let metricLabel = ''
  let metricUnit = ''
  let metricIcon = <Cuboid className="h-4 w-4" />

  if (strategy === 'VOLUME') {
    currentMetric = container.total_cbm || 0
    totalMetric = container.initial_capacity_cbm || 1
    metricLabel = 'Volume Ocupado'
    metricUnit = 'm³'
  } else if (strategy === 'WEIGHT') {
    currentMetric = container.total_net_weight || 0
    totalMetric = container.initial_total_net_weight || 1
    metricLabel = 'Peso Líquido Atual'
    metricUnit = 'kg'
    metricIcon = <Scale className="h-4 w-4" />
  } else {
    currentMetric = container.total_volumes || 0
    totalMetric = container.initial_total_volumes || 1
    metricLabel = 'Itens Restantes'
    metricUnit = 'und'
    metricIcon = <Package className="h-4 w-4" />
  }

  const getStrategyBadgeColor = (strat: BillingStrategy) => {
    switch (strat) {
      case 'VOLUME':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      case 'WEIGHT':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200'
      case 'QUANTITY':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">
              {container.container_number}
            </h2>
            <Badge variant="outline" className="text-lg px-2">
              {container.status}
            </Badge>
            {container.active_strategy && (
              <Badge
                className={cn(
                  'ml-2',
                  getStrategyBadgeColor(container.active_strategy),
                )}
              >
                {strategy === 'VOLUME'
                  ? '📦 Estratégia: Volume'
                  : strategy === 'WEIGHT'
                    ? '⚖️ Estratégia: Peso'
                    : '🔢 Estratégia: Qtd'}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            {container.type_details?.name ||
              container.container_type ||
              'Tipo N/A'}{' '}
            • {container.consignee?.name || 'Sem Cliente'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" /> Editar
          </Button>
          <Button onClick={() => setIsExitDialogOpen(true)}>
            <LogOut className="mr-2 h-4 w-4" /> Registrar Saída
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {container.bl_number && (
          <Card className="bg-slate-50 border-blue-100">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Documento de Origem (BL)
                  </p>
                  <p className="text-lg font-bold text-slate-900">
                    {container.bl_number}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="p-4 flex flex-col justify-center gap-2">
            <div className="flex items-center gap-2">
              <Warehouse className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-500">
                Armazém:
              </span>
              <span className="font-semibold text-slate-900">
                {container.warehouse?.name || 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-500">
                Localização:
              </span>
              <span className="font-semibold text-slate-900">
                {container.storage_location?.code || 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              {metricIcon} {metricLabel}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentMetric.toLocaleString('pt-BR', {
                maximumFractionDigits: 3,
              })}{' '}
              {metricUnit}
            </div>
            <p className="text-xs text-muted-foreground">
              Métrica Base para Fatura
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <PackageCheck className="h-4 w-4" /> Capacidade Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalMetric.toLocaleString('pt-BR', {
                maximumFractionDigits: 2,
              })}{' '}
              {metricUnit}
            </div>
            <p className="text-xs text-muted-foreground">Referência Inicial</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ocupação Real
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyPercentage}%</div>
            <Progress value={occupancyPercentage} className="mt-2 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              SKUs Distintos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{container.sku_count}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="w-full">
        <TabsList>
          <TabsTrigger value="inventory">Inventário Atual</TabsTrigger>
          <TabsTrigger value="history">Histórico de Movimentações</TabsTrigger>
        </TabsList>
        <TabsContent value="inventory" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Packing List Detalhado</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU / Model</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Embalagem</TableHead>
                    <TableHead className="text-right">Disponível</TableHead>
                    <TableHead className="text-right">Reservado</TableHead>
                    <TableHead className="text-right">Unit Vol (m³)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length > 0 ? (
                    items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono font-medium">
                          {item.product_code}
                        </TableCell>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell className="text-xs uppercase text-muted-foreground">
                          {item.packaging_type || '-'}
                        </TableCell>
                        <TableCell className="text-right font-bold text-emerald-600">
                          {item.available_quantity}
                        </TableCell>
                        <TableCell className="text-right font-medium text-amber-600">
                          {item.reserved_quantity || 0}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.cbm
                            ? (item.cbm / item.original_quantity).toFixed(3)
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center h-24 text-muted-foreground"
                      >
                        Nenhum item no inventário.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Log de Movimentações</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Qtd</TableHead>
                    <TableHead>Vol. (m³)</TableHead>
                    <TableHead>Doc</TableHead>
                    <TableHead>Resp.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.length > 0 ? (
                    events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          {new Date(event.timestamp).toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              event.type === 'entry' ? 'default' : 'secondary'
                            }
                            className={
                              event.type === 'exit'
                                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            }
                          >
                            {event.type === 'entry' ? 'Entrada' : 'Saída'}
                          </Badge>
                        </TableCell>
                        <TableCell>{event.sku}</TableCell>
                        <TableCell>{event.quantity}</TableCell>
                        <TableCell>{event.volume_m3?.toFixed(3)}</TableCell>
                        <TableCell>{event.doc_number}</TableCell>
                        <TableCell>{event.responsible}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center h-24 text-muted-foreground"
                      >
                        Nenhum evento registrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <NewExitEventDialog
        open={isExitDialogOpen}
        onOpenChange={setIsExitDialogOpen}
        onSuccess={loadData}
        initialContainerId={container.id}
      />

      <ContainerFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={loadData}
        containerToEdit={container}
      />
    </div>
  )
}
