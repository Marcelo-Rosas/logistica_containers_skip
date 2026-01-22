import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getBL,
  getContainers,
  getEDILogs,
  getDivergences,
} from '@/lib/mock-service'
import { BillOfLading, Container, EDILog, Divergence } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowLeft,
  Box,
  AlertTriangle,
  FileJson,
  FileText,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function BLDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [bl, setBL] = useState<BillOfLading | null>(null)
  const [containers, setContainers] = useState<Container[]>([])
  const [ediLogs, setEdiLogs] = useState<EDILog[]>([])
  const [divergences, setDivergences] = useState<Divergence[]>([])

  useEffect(() => {
    if (id) {
      getBL(id).then(setBL)
      getContainers().then((data) =>
        setContainers(data.filter((c) => c.bl_id === id)),
      )
      getEDILogs(id).then(setEdiLogs)
      getDivergences().then((data) =>
        setDivergences(data.filter((d) => d.bl_id === id)),
      )
    }
  }, [id])

  if (!bl) return <div className="p-8">Carregando...</div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/bl')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            BL {bl.number}
            {bl.status === 'Divergent' && (
              <Badge variant="destructive">Divergente</Badge>
            )}
            {bl.status === 'Processed' && (
              <Badge className="bg-emerald-500">Processado</Badge>
            )}
          </h2>
          <p className="text-muted-foreground">{bl.client_name}</p>
        </div>
      </div>

      <Tabs defaultValue="data" className="w-full">
        <TabsList>
          <TabsTrigger value="data">Dados da BL</TabsTrigger>
          <TabsTrigger value="containers">
            Containers ({containers.length})
          </TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="edi">EDI Logs</TabsTrigger>
          <TabsTrigger
            value="divergences"
            className={cn(divergences.length > 0 && 'text-red-500')}
          >
            Divergências ({divergences.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="data" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Exportador</p>
                  <p className="font-medium">{bl.shipper}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Importador</p>
                  <p className="font-medium">{bl.consignee}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Navio</p>
                  <p className="font-medium">{bl.vessel}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Viagem</p>
                  <p className="font-medium">{bl.voyage}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Origem</p>
                  <p className="font-medium">{bl.port_of_loading}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Destino</p>
                  <p className="font-medium">{bl.port_of_discharge}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Peso Total</p>
                  <p className="font-medium">
                    {bl.total_weight_kg.toLocaleString()} kg
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Volume Total</p>
                  <p className="font-medium">
                    {bl.total_volume_m3.toLocaleString()} m³
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="containers" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Containers Associados</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {containers.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono">{c.codigo}</TableCell>
                      <TableCell>{c.capacidade}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{c.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/containers/${c.id}`)}
                        >
                          Ver Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="mt-4">
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              NCMs e produtos serão extraídos do Packing List.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edi" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico EDI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ediLogs.map((log) => (
                  <div
                    key={log.id}
                    className="border p-4 rounded-md flex justify-between items-start"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileJson className="h-4 w-4 text-blue-500" />
                        <span className="font-mono text-sm">{log.id}</span>
                        <Badge variant="outline">{log.status}</Badge>
                      </div>
                      <pre className="text-xs bg-slate-100 p-2 rounded text-muted-foreground overflow-x-auto max-w-xl">
                        {log.payload_snippet}
                      </pre>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.received_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="divergences" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Central de Divergências
              </CardTitle>
              <CardDescription>
                Inconsistências encontradas entre BL físico e EDI.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {divergences.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-emerald-600">
                  <CheckCircle2 className="h-12 w-12 mb-2" />
                  <p className="font-medium">Nenhuma divergência encontrada.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor BL</TableHead>
                      <TableHead>Valor EDI</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {divergences.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell>
                          <Badge
                            variant={
                              d.severity === 'Critical'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {d.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{d.description}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {d.bl_value || '-'}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {d.edi_value || '-'}
                        </TableCell>
                        <TableCell>{d.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
