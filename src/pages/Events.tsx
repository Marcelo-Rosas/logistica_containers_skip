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
  LogIn,
  Calendar,
} from 'lucide-react'
import { getEvents } from '@/services/container'
import { LogisticsEvent } from '@/lib/types'
import { NewExitEventDialog } from '@/components/NewExitEventDialog'
import { NewEntryEventDialog } from '@/components/NewEntryEventDialog'
import { cn } from '@/lib/utils'

export default function EventsPage() {
  const [events, setEvents] = useState<LogisticsEvent[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false)
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = () => {
    getEvents().then(setEvents)
  }

  const filteredEvents = events.filter((event) => {
    const term = (searchTerm || '').toLowerCase()
    const sku = (event.sku || '').toLowerCase()
    const docNumber = (event.doc_number || '').toLowerCase()
    const containerCode = (event.container_code || '').toLowerCase()

    return (
      sku.includes(term) ||
      docNumber.includes(term) ||
      containerCode.includes(term)
    )
  })

  // KPI Calculations
  const currentMonth = new Date().getMonth()
  const exitsThisMonth = events.filter(
    (e) =>
      e.type === 'exit' && new Date(e.timestamp).getMonth() === currentMonth,
  ).length

  const totalVolume = events.reduce(
    (acc, curr) => acc + (curr.volume_m3 || 0),
    0,
  )
  const totalValue = events.reduce(
    (acc, curr) => acc + (curr.weight_kg || 0),
    0,
  ) // Changed from value to weight as value is not reliable

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
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Movimentações Logísticas
          </h2>
          <p className="text-muted-foreground">
            Entradas, saídas e histórico completo
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" /> CSV
          </Button>
          <Button
            onClick={() => setIsEntryDialogOpen(true)}
            variant="secondary"
          >
            <LogIn className="mr-2 h-4 w-4" /> Entrada
          </Button>
          <Button onClick={() => setIsExitDialogOpen(true)}>
            <LogOut className="mr-2 h-4 w-4" /> Saída
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
            <CardTitle className="text-sm font-medium">
              Peso Movimentado
            </CardTitle>
            <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalValue.toLocaleString('pt-BR')} kg
            </div>
            <p className="text-xs text-muted-foreground">Peso acumulado</p>
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
                      {(event.volume_m3 || 0).toFixed(3)}
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

      <NewExitEventDialog
        open={isExitDialogOpen}
        onOpenChange={setIsExitDialogOpen}
        onSuccess={loadEvents}
      />

      <NewEntryEventDialog
        open={isEntryDialogOpen}
        onOpenChange={setIsEntryDialogOpen}
        onSuccess={loadEvents}
      />
    </div>
  )
}
