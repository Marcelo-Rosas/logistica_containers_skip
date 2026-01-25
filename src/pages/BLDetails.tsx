import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getContainers } from '@/services/container'
import { Container } from '@/lib/types'
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
import { ArrowLeft, FileText, DollarSign } from 'lucide-react'

export default function BLDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [containers, setContainers] = useState<Container[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadData(id)
    }
  }, [id])

  const loadData = async (blId: string) => {
    try {
      setLoading(true)
      // Fetch all containers and filter by BL ID/Number
      // In a real optimized scenario we would have a specific endpoint or filtered query
      const all = await getContainers()
      const filtered = all.filter(
        (c) => c.bl_number === blId || c.bl_id === blId || c.id === blId,
      )
      setContainers(filtered)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8">Carregando...</div>
  if (containers.length === 0)
    return <div className="p-8">BL não encontrado ou sem containers.</div>

  const blNumber = containers[0].bl_number
  const clientName = containers[0].cliente_nome

  // Aggregate data
  const totalVolume = containers.reduce(
    (acc, c) => acc + (c.total_volume_m3 || 0),
    0,
  )
  const totalWeight = containers.reduce(
    (acc, c) => acc + (c.total_weight_kg || 0),
    0,
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/bl')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            BL {blNumber}
            <Badge className="bg-emerald-500">Ativo</Badge>
          </h2>
          <p className="text-muted-foreground">{clientName}</p>
        </div>
      </div>

      <Tabs defaultValue="data" className="w-full">
        <TabsList>
          <TabsTrigger value="data">Dados Gerais</TabsTrigger>
          <TabsTrigger value="containers">
            Containers ({containers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="data" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Totais Calculados</CardTitle>
              <CardDescription>
                Baseado nos containers registrados.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Containers</p>
                <p className="font-medium">{containers.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Peso Total Estimado
                </p>
                <p className="font-medium">{totalWeight.toLocaleString()} kg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Volume Total</p>
                <p className="font-medium">{totalVolume.toLocaleString()} m³</p>
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
                      <TableCell>{c.tipo}</TableCell>
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
      </Tabs>
    </div>
  )
}
