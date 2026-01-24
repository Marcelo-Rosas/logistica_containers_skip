import { useEffect, useState } from 'react'
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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  getInvoices,
  simulateBilling,
  generateMonthlyInvoices,
} from '@/lib/mock-service'
import { Invoice } from '@/lib/types'
import {
  Download,
  FileText,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Info,
  TrendingDown,
} from 'lucide-react'
import { toast } from 'sonner'
import { useSearchParams } from 'react-router-dom'
import { NextMeasurementCard } from '@/components/NextMeasurementCard'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export default function Faturamento() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()

  // Simulation State
  const [simulationOpen, setSimulationOpen] = useState(false)
  const [simulatedInvoices, setSimulatedInvoices] = useState<Invoice[]>([])
  const [simulating, setSimulating] = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    loadInvoices()
    if (searchParams.get('action') === 'simulate') {
      handleSimulate()
    }
  }, [searchParams])

  const loadInvoices = async () => {
    try {
      const data = await getInvoices()
      setInvoices(data)
    } catch (e) {
      toast.error('Erro ao carregar faturas')
    } finally {
      setLoading(false)
    }
  }

  const handleSimulate = async () => {
    setSimulationOpen(true)
    setSimulating(true)
    try {
      // Small delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 800))
      const data = await simulateBilling()
      setSimulatedInvoices(data)
    } catch (e) {
      toast.error('Erro ao simular faturamento')
    } finally {
      setSimulating(false)
    }
  }

  const handleGenerateInvoices = async () => {
    if (simulatedInvoices.length === 0) return

    setGenerating(true)
    try {
      await generateMonthlyInvoices(simulatedInvoices)
      toast.success('Faturas geradas com sucesso!')
      setSimulationOpen(false)
      loadInvoices()
    } catch (e) {
      toast.error('Erro ao gerar faturas')
    } finally {
      setGenerating(false)
    }
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Gestão Financeira
          </h2>
          <p className="text-muted-foreground">
            Controle de faturas, medições e custos operacionais.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSimulate}>
            <FileText className="mr-2 h-4 w-4" /> Simular Medição
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Next Measurement Card - Reused */}
        <div className="md:col-span-1">
          <NextMeasurementCard />
        </div>

        {/* Stats */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Resumo Financeiro (Mês Atual)</CardTitle>
            <CardDescription>
              Faturamento projetado vs realizado
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
              <span className="text-sm text-emerald-600 font-medium">
                Pago (Realizado)
              </span>
              <div className="text-2xl font-bold text-emerald-700 mt-1">
                {formatCurrency(
                  invoices
                    .filter((i) => i.status === 'Paid')
                    .reduce((acc, curr) => acc + curr.total_amount, 0),
                )}
              </div>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
              <span className="text-sm text-amber-600 font-medium">
                Pendente (Aberto)
              </span>
              <div className="text-2xl font-bold text-amber-700 mt-1">
                {formatCurrency(
                  invoices
                    .filter(
                      (i) => i.status === 'Sent' || i.status === 'Overdue',
                    )
                    .reduce((acc, curr) => acc + curr.total_amount, 0),
                )}
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <span className="text-sm text-blue-600 font-medium">
                Projetado (Simulação)
              </span>
              <div className="text-2xl font-bold text-blue-700 mt-1">
                {formatCurrency(
                  simulatedInvoices.reduce(
                    (acc, curr) => acc + curr.total_amount,
                    0,
                  ) || 0,
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Faturas</CardTitle>
          <CardDescription>
            Todas as faturas geradas pelo sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fatura #</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Competência</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhuma fatura encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono">{inv.id}</TableCell>
                    <TableCell>{inv.client_name}</TableCell>
                    <TableCell>
                      {inv.month}/{inv.year}
                    </TableCell>
                    <TableCell>
                      {new Date(inv.due_date).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(inv.total_amount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          inv.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : inv.status === 'Overdue'
                              ? 'bg-red-100 text-red-800 border-red-200'
                              : 'bg-blue-100 text-blue-800 border-blue-200'
                        }
                      >
                        {inv.status === 'Paid'
                          ? 'Pago'
                          : inv.status === 'Overdue'
                            ? 'Atrasado'
                            : inv.status === 'Sent'
                              ? 'Enviado'
                              : 'Rascunho'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4 mr-1" /> PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Simulation Dialog */}
      <Dialog open={simulationOpen} onOpenChange={setSimulationOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Simulação de Faturamento
            </DialogTitle>
            <DialogDescription>
              Prévia dos custos calculados (Pro-rata ou Volume) para o próximo
              dia 25.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {simulating ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Calculando snapshots de volume e pro-rata...
                </p>
              </div>
            ) : simulatedInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                <AlertTriangle className="h-8 w-8 text-amber-500" />
                <p className="font-medium">Nenhum custo pendente encontrado.</p>
                <p className="text-sm text-muted-foreground">
                  Não há alocações ativas ou eventos de saída não faturados.
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  {simulatedInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="border rounded-lg p-4 bg-slate-50"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-sm">
                          {inv.client_name}
                        </h4>
                        <div className="text-right">
                          <span className="block font-bold text-primary">
                            {formatCurrency(inv.total_amount)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Vencimento:{' '}
                            {new Date(inv.due_date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {inv.items.map((item) => (
                          <div
                            key={item.id}
                            className="text-xs border-b border-dashed pb-3 last:border-0 last:pb-0 bg-white p-3 rounded-md shadow-sm"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-medium text-slate-700">
                                {item.description}
                              </span>
                              <span className="font-semibold text-slate-900">
                                {formatCurrency(item.amount)}
                              </span>
                            </div>

                            {/* Details based on calculation method */}
                            <div className="grid grid-cols-2 gap-2 mt-2 text-slate-500">
                              {item.calculation_method === 'pro_rata' && (
                                <>
                                  <div className="flex items-center gap-1">
                                    <Info className="h-3 w-3" />
                                    <span>Método: Pro-rata Inicial</span>
                                  </div>
                                  <div>
                                    Dias Cobrados:{' '}
                                    <span className="text-slate-900 font-medium">
                                      {item.days_pro_rated}/30
                                    </span>
                                  </div>
                                </>
                              )}

                              {item.calculation_method ===
                                'volume_snapshot' && (
                                <>
                                  <div className="flex items-center gap-1">
                                    <Info className="h-3 w-3" />
                                    <span>Método: Volume (Snapshot)</span>
                                  </div>
                                  <div>
                                    Ref. Medição:{' '}
                                    <span className="text-slate-900 font-medium">
                                      {item.snapshot_date
                                        ? new Date(
                                            item.snapshot_date,
                                          ).toLocaleDateString('pt-BR')
                                        : '-'}
                                    </span>
                                  </div>
                                  <div>
                                    Volume Utilizado:{' '}
                                    <span className="text-slate-900 font-medium">
                                      {item.used_volume_m3} m³
                                    </span>
                                  </div>
                                  <div>
                                    Ocupação:{' '}
                                    <span className="text-slate-900 font-medium">
                                      {item.occupancy_percentage}%
                                    </span>
                                  </div>
                                  {item.savings && item.savings > 0 && (
                                    <div className="col-span-2 mt-1 text-emerald-600 bg-emerald-50 p-1.5 rounded flex items-center gap-1">
                                      <TrendingDown className="h-3 w-3" />
                                      <span>
                                        Economia gerada:{' '}
                                        {formatCurrency(item.savings)} vs Custo
                                        Base
                                      </span>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSimulationOpen(false)}
              disabled={generating}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGenerateInvoices}
              disabled={
                generating || simulating || simulatedInvoices.length === 0
              }
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" /> Gerar Faturas Reais
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
