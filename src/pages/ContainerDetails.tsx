import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getContainer, getInventory, getEvents } from '@/lib/mock-service'
import {
  Container,
  InventoryItem,
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
} from 'lucide-react'
import { NewExitEventDialog } from '@/components/NewExitEventDialog'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

export default function ContainerDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [container, setContainer] = useState<Container | null>(null)
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [events, setEvents] = useState<LogisticsEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false)

  const loadData = async () => {
    if (!id) return
    try {
      setLoading(true)
      const containerData = await getContainer(id)
      setContainer({ ...containerData }) // Force new reference

      const [inventoryData, eventsData] = await Promise.all([
        getInventory(containerData.id),
        getEvents(),
      ])

      setInventory(inventoryData)
      setEvents(
        eventsData.filter((e) => e.container_code === containerData.codigo),
      )
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  if (loading) return <div className="p-8">Carregando detalhes...</div>
  if (!container) return <div className="p-8">Container não encontrado.</div>

  // Metrics Logic based on Active Strategy
  const strategy = container.active_strategy || 'VOLUME'

  let currentMetric = 0
  let totalMetric = 1
  let metricLabel = ''
  let metricUnit = ''
  let metricIcon = <Cuboid className="h-4 w-4" />
  let originalLabel = ''

  if (strategy === 'VOLUME') {
    currentMetric = container.total_volume_m3
    totalMetric = container.initial_capacity_m3 || 67.7
    metricLabel = 'Volume Ocupado'
    metricUnit = 'm³'
    metricIcon = <Cuboid className="h-4 w-4" />
    originalLabel = 'Capacidade Total'
  } else if (strategy === 'WEIGHT') {
    currentMetric = container.total_net_weight_kg || 0
    totalMetric =
      container.initial_total_net_weight_kg ||
      container.max_weight_capacity ||
      28500
    metricLabel = 'Peso Líquido Atual'
    metricUnit = 'kg'
    metricIcon = <Scale className="h-4 w-4" />
    originalLabel = 'Peso Original (Packing List)'
  } else {
    currentMetric = container.total_quantity || 0
    totalMetric = container.initial_quantity || 1
    metricLabel = 'Itens Restantes'
    metricUnit = 'und'
    metricIcon = <Package className="h-4 w-4" />
    originalLabel = 'Quantidade Original'
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

  const occupancyPercentage = Math.min(
    100,
    Math.round((currentMetric / totalMetric) * 100),
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">
              {container.codigo}
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
            {container.tipo} • {container.cliente_nome || 'Sem Cliente'}
          </p>
        </div>
        <Button onClick={() => setIsExitDialogOpen(true)}>
          <LogOut className="mr-2 h-4 w-4" /> Registrar Saída
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* BL Association Card */}
        {container.bl_id && (
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
                    {container.bl_number || 'N/A'}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/bl/${container.bl_id}`)}
              >
                Ver Documento <ExternalLink className="ml-2 h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Seal Info Card */}
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-slate-200 rounded-lg">
              <ShieldCheck className="h-5 w-5 text-slate-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                Lacre de Segurança (Seal)
              </p>
              <p className="text-lg font-bold text-slate-900">
                {container.seal || 'Não informado'}
              </p>
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
              <PackageCheck className="h-4 w-4" /> {originalLabel}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalMetric.toLocaleString('pt-BR', {
                maximumFractionDigits: 2,
              })}{' '}
              {metricUnit}
            </div>
            <p className="text-xs text-muted-foreground">
              Estado Inicial / Referência
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ocupação Real ({strategy})
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
                    <TableHead className="text-right">Qtd (Pcs)</TableHead>
                    <TableHead className="text-right">Unit Vol (m³)</TableHead>
                    <TableHead className="text-right">Peso Líq (kg)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.length > 0 ? (
                    inventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono font-medium">
                          {item.sku}
                        </TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-xs uppercase text-muted-foreground">
                          {item.packaging_type || '-'}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.unit_volume_m3
                            ? item.unit_volume_m3.toFixed(3)
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.net_weight_kg?.toLocaleString() || '-'}
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
                    <TableHead>Peso (kg)</TableHead>
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
                        <TableCell>
                          {event.weight_kg?.toLocaleString()}
                        </TableCell>
                        <TableCell>{event.doc_number}</TableCell>
                        <TableCell>{event.responsible}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={8}
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
    </div>
  )
}
