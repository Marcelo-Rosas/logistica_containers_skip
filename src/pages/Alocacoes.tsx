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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  getAllocations,
  getClients,
  getContainers,
  registerEntry,
  registerExit,
  generateMeasurements,
} from '@/lib/mock-service'
import { Allocation, Client, Container } from '@/lib/types'
import {
  Plus,
  FileText,
  CalendarCheck,
  Search,
  Calendar as CalendarIcon,
  Filter,
  LogOut,
} from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

// Zod Schemas
const entrySchema = z.object({
  client: z.string().min(1, 'Selecione um cliente'),
  container: z.string().min(1, 'Selecione um container'),
  data_entrada: z.date({ required_error: 'Data de entrada é obrigatória' }),
  file: z.instanceof(FileList).optional(),
})

const exitSchema = z.object({
  data_saida: z.date({ required_error: 'Data de saída é obrigatória' }),
})

export default function Alocacoes() {
  const [allocations, setAllocations] = useState<Allocation[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [containers, setContainers] = useState<Container[]>([])
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false)
  const [exitModalOpen, setExitModalOpen] = useState(false)
  const [selectedAllocationId, setSelectedAllocationId] = useState<
    string | null
  >(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const form = useForm<z.infer<typeof entrySchema>>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      data_entrada: new Date(),
    },
  })

  const exitForm = useForm<z.infer<typeof exitSchema>>({
    resolver: zodResolver(exitSchema),
    defaultValues: {
      data_saida: new Date(),
    },
  })

  // Load Data
  const loadData = async () => {
    try {
      const [aData, cData, contData] = await Promise.all([
        getAllocations(),
        getClients(),
        getContainers(),
      ])
      setAllocations(aData)
      setClients(cData)
      setContainers(contData)
    } catch (error) {
      toast.error('Erro ao carregar dados.')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Handlers
  const onSubmitEntry = async (values: z.infer<typeof entrySchema>) => {
    try {
      await registerEntry({
        client: values.client,
        container: values.container,
        data_entrada: values.data_entrada,
        file: values.file?.[0] || null,
      })
      toast.success('Alocação registrada com sucesso!')
      setIsEntryModalOpen(false)
      form.reset()
      loadData()
    } catch (error) {
      toast.error('Erro ao registrar alocação.')
    }
  }

  const handleOpenExitModal = (id: string) => {
    setSelectedAllocationId(id)
    exitForm.reset({ data_saida: new Date() })
    setExitModalOpen(true)
  }

  const onSubmitExit = async (values: z.infer<typeof exitSchema>) => {
    if (!selectedAllocationId) return
    try {
      await registerExit(selectedAllocationId, values.data_saida)
      toast.success('Saída registrada com sucesso!')
      setExitModalOpen(false)
      loadData()
    } catch (error) {
      toast.error('Erro ao registrar saída.')
    }
  }

  const handleGenerateMeasurements = async () => {
    toast.info('Iniciando processamento mensal...')
    const result = await generateMeasurements()
    toast.success(result.message)
  }

  // Filtering
  const filteredAllocations = allocations.filter((alloc) => {
    const matchesSearch =
      alloc.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alloc.container_code.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && alloc.status === 'Ativo') ||
      (statusFilter === 'completed' && alloc.status === 'Finalizado')

    return matchesSearch && matchesStatus
  })

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
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Nova Alocação (Entrada)</DialogTitle>
                <DialogDescription>
                  Vincule um container a um cliente e anexe o Packing List.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmitEntry)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="client"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliente</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o cliente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clients.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="container"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Container</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o container" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {containers.filter((c) => c.status === 'Disponível')
                              .length === 0 ? (
                              <SelectItem value="none" disabled>
                                Sem containers disponíveis
                              </SelectItem>
                            ) : (
                              containers
                                .filter((c) => c.status === 'Disponível')
                                .map((c) => (
                                  <SelectItem key={c.id} value={c.id}>
                                    {c.codigo} ({c.capacidade})
                                  </SelectItem>
                                ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="data_entrada"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data de Entrada</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground',
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Selecione uma data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date('1900-01-01')
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="file"
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem>
                        <FormLabel>Packing List (PDF/Imagem)</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept=".pdf,image/*"
                            onChange={(e) => onChange(e.target.files)}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter className="pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEntryModalOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">Registrar Entrada</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Histórico de Movimentações</CardTitle>
          <div className="flex flex-col sm:flex-row items-center gap-4 py-4">
            <div className="relative w-full sm:w-1/2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filtrar por cliente ou container..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="completed">Finalizados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
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
              {filteredAllocations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Nenhuma alocação encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAllocations.map((allocation) => (
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
                      <Badge
                        variant={
                          allocation.status === 'Ativo'
                            ? 'default'
                            : 'secondary'
                        }
                        className={
                          allocation.status === 'Ativo'
                            ? 'bg-emerald-500 hover:bg-emerald-600'
                            : 'bg-slate-500'
                        }
                      >
                        {allocation.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {allocation.packing_list_url ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Ver Packing List"
                          onClick={() =>
                            window.open(allocation.packing_list_url, '_blank')
                          }
                        >
                          <FileText className="h-4 w-4 text-blue-600" />
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {allocation.status === 'Ativo' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleOpenExitModal(allocation.id)}
                        >
                          <LogOut className="h-4 w-4 mr-1" /> Saída
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Exit Confirmation Dialog */}
      <Dialog open={exitModalOpen} onOpenChange={setExitModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Saída</DialogTitle>
            <DialogDescription>
              Confirme a data de saída para finalizar a alocação e calcular os
              custos.
            </DialogDescription>
          </DialogHeader>
          <Form {...exitForm}>
            <form
              onSubmit={exitForm.handleSubmit(onSubmitExit)}
              className="space-y-4"
            >
              <FormField
                control={exitForm.control}
                name="data_saida"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Saída</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={
                            (date) => date > new Date() // Allow future dates? usually not for "Exit", but maybe scheduled. Let's stick to past/today for logic safety
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setExitModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="destructive">
                  Confirmar Saída
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
