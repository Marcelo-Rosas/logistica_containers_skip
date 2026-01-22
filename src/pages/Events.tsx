/* Events History Page - Dashboard for monitoring logistics entries and exits */
import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowDownRight,
  ArrowUpRight,
  Search,
  Download,
  LogOut,
  Calendar,
} from 'lucide-react'
import { getEvents } from '@/lib/mock-service'
import { LogisticsEvent } from '@/lib/types'
import { NewExitEventDialog } from '@/components/NewExitEventDialog'
import { cn } from '@/lib/utils'

export default function EventsPage() {
  const [events, setEvents] = useState<LogisticsEvent[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = () => {
    getEvents().then(setEvents)
  }

  const filteredEvents = events.filter(
    (event) =>
      event.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.doc_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.container_code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // KPI Calculations
  const currentMonth = new Date().getMonth()
  const exitsThisMonth = events.filter(
    (e) =>
      e.type === 'exit' && new Date(e.timestamp).getMonth() === currentMonth,
  ).length

  const totalVolume = events.reduce((acc, curr) => acc + curr.volume_m3, 0)
  const totalValue = events.reduce((acc, curr) => acc + curr.value, 0)

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Tipo',
      'Container',
      'SKU',
      'Qtd',
      'Vol (m3)',
      'Doc',
      'Data',
    ]
    const rows = filteredEvents.map((e) =>
      [
        e.id,
        e.type,
        e.container_code,
        e.sku,
        e.quantity,
        e.volume_m3,
        e.doc_number,
        e.timestamp,
      ].join(','),
    )
    const csvContent = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `eventos_logistica_${new Date().toISOString()}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight">
          Movimentações Logísticas
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>
          <Button onClick={() => setIsExitDialogOpen(true)}>
            <LogOut className="mr-2 h-4 w-4" /> Registrar Saída
          </Button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Saídas este mês
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exitsThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              Eventos de retirada registrados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Volume Movimentado
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalVolume.toFixed(2)} m³
            </div>
            <p className="text-xs text-muted-foreground">
              Total acumulado (Entradas + Saídas)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Alocado</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalValue.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor total das mercadorias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Events Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Histórico de Eventos</CardTitle>
          <div className="flex items-center py-4">
            <Search className="mr-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filtrar por SKU, Container ou Documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data / Hora</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Container</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Qtd</TableHead>
                <TableHead className="text-right">Volume (m³)</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Responsável</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event, index) => (
                  <TableRow
                    key={event.id}
                    className="hover:bg-slate-50 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(event.timestamp).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          event.type === 'entry'
                            ? 'text-blue-600 border-blue-200 bg-blue-50'
                            : 'text-amber-600 border-amber-200 bg-amber-50',
                        )}
                      >
                        {event.type === 'entry' ? 'Entrada' : 'Saída'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {event.container_code}
                    </TableCell>
                    <TableCell className="font-medium">{event.sku}</TableCell>
                    <TableCell className="text-right">
                      {event.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {event.volume_m3.toFixed(3)}
                    </TableCell>
                    <TableCell>{event.doc_number}</TableCell>
                    <TableCell>{event.destination}</TableCell>
                    <TableCell className="text-xs">
                      {event.responsible}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    Nenhum evento encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
            Isso envolve verificar a entrega, a rota e a atribuição de carga.
          </p>
          <p>
            Depois que o pedido sai do depósito do fabricante, a Business
            Transaction Intelligence registra todas as mensagens de status de
            remessa ao longo do caminho, determinando o status geral do pedido
            com base nessas atualizações contínuas.
          </p>
          <p>
            Mensagens de status de remessa são eventos que afetam o andamento de
            uma remessa, como atrasos, provas de entrega ou chegadas
            antecipadas. Essas informações são cruciais para medidas preventivas
            e para evitar a perda de pedidos, especialmente para clientes com
            planejamento sensível a prazos.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <p className="text-xs font-medium text-slate-500">
            Tópico principal: Gestão de Eventos e Rastreabilidade
          </p>
        </div>
      </section>

      <NewExitEventDialog
        open={isExitDialogOpen}
        onOpenChange={setIsExitDialogOpen}
        onSuccess={loadEvents}
      />
    </div>
  )
}
