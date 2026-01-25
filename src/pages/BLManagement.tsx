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
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Eye, FileText, Box } from 'lucide-react'
import { getContainers } from '@/services/container'
import { Container } from '@/lib/types'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export default function BLManagement() {
  const navigate = useNavigate()
  const [containers, setContainers] = useState<Container[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await getContainers()
      setContainers(data)
    } catch (e) {
      toast.error('Erro ao carregar dados.')
    } finally {
      setLoading(false)
    }
  }

  const filteredContainers = containers.filter(
    (c) =>
      (c.bl_number &&
        c.bl_number.toLowerCase().includes(search.toLowerCase())) ||
      (c.cliente_nome &&
        c.cliente_nome.toLowerCase().includes(search.toLowerCase())) ||
      c.codigo.toLowerCase().includes(search.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Ativo':
        return <Badge className="bg-emerald-500">Ativo</Badge>
      case 'Pendente':
        return <Badge variant="secondary">Pendente</Badge>
      case 'Vazio':
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Vazio
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Gestão de Containers & BLs
          </h2>
          <p className="text-muted-foreground">
            Monitoramento de cargas e documentação (Supabase Realtime)
          </p>
        </div>
        <Button onClick={() => navigate('/bl/cadastrar')}>
          <Plus className="mr-2 h-4 w-4" /> Novo BL
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Containers Registrados</CardTitle>
          <div className="flex items-center py-4">
            <Search className="mr-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por BL, container ou cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>BL Number</TableHead>
                <TableHead>Container</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Chegada</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredContainers.length > 0 ? (
                filteredContainers.map((c) => (
                  <TableRow
                    key={c.id}
                    className="hover:bg-slate-50 cursor-pointer"
                    onClick={() => navigate(`/containers/${c.id}`)}
                  >
                    <TableCell className="font-mono font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {c.bl_number || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Box className="h-4 w-4 text-blue-500" />
                        {c.codigo}
                      </div>
                    </TableCell>
                    <TableCell>{c.cliente_nome}</TableCell>
                    <TableCell>{c.total_volume_m3?.toFixed(2)} m³</TableCell>
                    <TableCell>{getStatusBadge(c.status)}</TableCell>
                    <TableCell>
                      {c.created_at
                        ? new Date(c.created_at).toLocaleDateString('pt-BR')
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhum container encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
