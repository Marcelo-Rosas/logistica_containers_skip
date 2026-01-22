/* Allocations Management Page */
import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getAllocations,
  getClients,
  getContainers,
  registerEntry,
  registerExit,
  generateMeasurements,
} from '@/lib/mock-service'
import { Allocation, Client, Container } from '@/lib/types'
import { Plus, Download, LogOut, FileText, CalendarCheck } from 'lucide-react'
import { toast } from 'sonner'

export default function Alocacoes() {
  const [allocations, setAllocations] = useState<Allocation[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [containers, setContainers] = useState<Container[]>([])
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form State
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedContainer, setSelectedContainer] = useState('')

  useEffect(() => {
    const loadData = async () => {
      const [aData, cData, contData] = await Promise.all([
        getAllocations(),
        getClients(),
        getContainers(),
      ])
      setAllocations(aData)
      setClients(cData)
      setContainers(contData)
    }
    loadData()
  }, [])

  const handleRegisterEntry = async () => {
    if (!selectedClient || !selectedContainer) {
      toast.error('Preencha todos os campos!')
      return
    }

    setLoading(true)
    try {
      const result = await registerEntry({
        client: selectedClient,
        container: selectedContainer,
      })
      toast.success(result.message)
      setIsEntryModalOpen(false)
      // Refresh data would go here
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterExit = async (id: string) => {
    if (confirm('Confirmar saída e calcular custos finais?')) {
      const result = await registerExit(id)
      toast.success(result.message)
      // Optimistic update
      setAllocations((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                status: 'Finalizado' as const,
                data_saida: new Date().toISOString(),
              }
            : a,
        ),
      )
    }
  }

  const handleGenerateMeasurements = async () => {
    toast.info('Iniciando processamento mensal...')
    const result = await generateMeasurements()
    toast.success(result.message)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight">
          Controle de Alocações
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleGenerateMeasurements}>
            <CalendarCheck className="mr-2 h-4 w-4" /> Gerar Medições
          </Button>

          <Dialog open={isEntryModalOpen} onOpenChange={setIsEntryModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Registrar Entrada
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Alocação (Entrada)</DialogTitle>
                <DialogDescription>
                  Vincule um container a um cliente e anexe o Packing List.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Cliente</Label>
                  <Select
                    onValueChange={setSelectedClient}
                    value={selectedClient}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Container</Label>
                  <Select
                    onValueChange={setSelectedContainer}
                    value={selectedContainer}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o container" />
                    </SelectTrigger>
                    <SelectContent>
                      {containers
                        .filter((c) => c.status === 'Disponível')
                        .map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.codigo} ({c.capacidade})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Packing List (PDF/Imagem)</Label>
                  <Input type="file" />
                  <span className="text-xs text-muted-foreground">
                    O arquivo será enviado para o Make.
                  </span>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEntryModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleRegisterEntry} disabled={loading}>
                  {loading ? 'Processando...' : 'Registrar Entrada'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Container</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Entrada</TableHead>
                <TableHead>Saída</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Docs</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allocations.map((allocation) => (
                <TableRow key={allocation.id}>
                  <TableCell className="font-mono font-medium">
                    {allocation.container_code}
                  </TableCell>
                  <TableCell>{allocation.cliente_nome}</TableCell>
                  <TableCell>
                    {new Date(allocation.data_entrada).toLocaleDateString(
                      'pt-BR',
                    )}
                  </TableCell>
                  <TableCell>
                    {allocation.data_saida
                      ? new Date(allocation.data_saida).toLocaleDateString(
                          'pt-BR',
                        )
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        allocation.status === 'Ativo'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {allocation.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Ver Packing List"
                    >
                      <FileText className="h-4 w-4 text-blue-600" />
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    {allocation.status === 'Ativo' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRegisterExit(allocation.id)}
                      >
                        <LogOut className="h-4 w-4 mr-1" /> Saída
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
