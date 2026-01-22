import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getContainer, getInventory, getEvents } from '@/lib/mock-service'
import { Container, InventoryItem, LogisticsEvent } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { ArrowLeft, FileText, LogOut, ExternalLink } from 'lucide-react'
import { NewExitEventDialog } from '@/components/NewExitEventDialog'
import { Separator } from '@/components/ui/separator'

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
      setContainer(containerData)

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            {container.codigo}
            <Badge variant="outline" className="text-lg px-2">
              {container.status}
            </Badge>
          </h2>
          <p className="text-muted-foreground">
            {container.tipo} • {container.cliente_nome || 'Sem Cliente'}
          </p>
        </div>
        <Button onClick={() => setIsExitDialogOpen(true)}>
          <LogOut className="mr-2 h-4 w-4" /> Registrar Saída
        </Button>
      </div>

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Capacidade Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {container.total_volume_m3} m³
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Peso Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(container.total_weight_kg / 1000).toFixed(1)} Ton
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ocupação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {container.occupancy_rate}%
            </div>
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
          <TabsTrigger value="history">Histórico de Eventos</TabsTrigger>
        </TabsList>
        <TabsContent value="inventory" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Itens Armazenados</CardTitle>
              <CardDescription>
                Lista de produtos atualmente no container.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                    <TableHead className="text-right">Vol. Unit (m³)</TableHead>
                    <TableHead className="text-right">Total (m³)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.length > 0 ? (
                    inventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono">{item.sku}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.unit_volume_m3}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {(item.quantity * item.unit_volume_m3).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
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
              <CardDescription>
                Histórico completo de entradas e saídas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Qtd</TableHead>
                    <TableHead>Doc</TableHead>
                    <TableHead>Resp.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.length > 0 ? (
                    events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          {new Date(event.timestamp).toLocaleDateString(
                            'pt-BR',
                          )}{' '}
                          {new Date(event.timestamp).toLocaleTimeString(
                            'pt-BR',
                          )}
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
                        <TableCell>{event.doc_number}</TableCell>
                        <TableCell>{event.responsible}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
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
