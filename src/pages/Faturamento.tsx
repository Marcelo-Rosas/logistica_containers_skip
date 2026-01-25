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
} from '@/services/billing'
import { Invoice } from '@/lib/types'
import {
  Download,
  FileText,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Info,
  TrendingDown,
  Scale,
  Cuboid,
  Package,
} from 'lucide-react'
import { toast } from 'sonner'
import { useSearchParams } from 'react-router-dom'
import { NextMeasurementCard } from '@/components/NextMeasurementCard'

export default function Faturamento() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()

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
        <div className="md:col-span-1">
          <NextMeasurementCard />
        </div>
      </div>

      <Dialog open={simulationOpen} onOpenChange={setSimulationOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Simulação de Faturamento
            </DialogTitle>
            <DialogDescription>
              Prévia dos custos calculados (Pro-rata ou Snapshot).
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {simulating ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Identificando estratégia de cobrança (Vol/Peso/Qtd)...
                </p>
              </div>
            ) : simulatedInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                <AlertTriangle className="h-8 w-8 text-amber-500" />
                <p className="font-medium">Nenhum custo pendente encontrado.</p>
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
                        </div>
                      </div>
                      <div className="space-y-3">
                        {inv.items.map((item) => (
                          <div
                            key={item.id}
                            className="text-xs border-b border-dashed pb-3 last:border-0 last:pb-0 bg-white p-3 rounded-md shadow-sm"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex flex-col gap-1">
                                <span className="font-medium text-slate-700 text-sm">
                                  {item.description}
                                </span>
                                {item.billing_strategy && (
                                  <Badge
                                    variant="outline"
                                    className="w-fit text-[10px] h-5 px-1.5"
                                  >
                                    {item.billing_strategy === 'VOLUME' && (
                                      <Cuboid className="h-3 w-3 mr-1" />
                                    )}
                                    {item.billing_strategy === 'WEIGHT' && (
                                      <Scale className="h-3 w-3 mr-1" />
                                    )}
                                    {item.billing_strategy === 'QUANTITY' && (
                                      <Package className="h-3 w-3 mr-1" />
                                    )}
                                    {item.billing_strategy}
                                  </Badge>
                                )}
                              </div>
                              <span className="font-semibold text-slate-900 text-sm">
                                {formatCurrency(item.amount)}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-2 text-slate-500 bg-slate-50 p-2 rounded">
                              {item.calculation_method ===
                                'volume_snapshot' && (
                                <>
                                  <div className="flex items-center gap-1 col-span-2">
                                    <Info className="h-3 w-3" />
                                    <span>Snapshot (Mensal):</span>
                                  </div>
                                  <div>
                                    Base Cálculo:{' '}
                                    <span className="text-slate-900 font-medium">
                                      {item.metric_used} / {item.metric_total}{' '}
                                      {item.metric_unit}
                                    </span>
                                  </div>
                                  <div>
                                    Ocupação:{' '}
                                    <span className="text-slate-900 font-medium">
                                      {item.occupancy_percentage}%
                                    </span>
                                  </div>
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
            <Button variant="outline" onClick={() => setSimulationOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleGenerateInvoices}
              disabled={generating || simulatedInvoices.length === 0}
            >
              {generating ? 'Gerando...' : 'Gerar Faturas'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
