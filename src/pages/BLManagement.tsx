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
import { Plus, Search, Eye, FileText } from 'lucide-react'
import { getBLs } from '@/lib/mock-service'
import { BillOfLading } from '@/lib/types'
import { useNavigate } from 'react-router-dom'

export default function BLManagement() {
  const navigate = useNavigate()
  const [bls, setBls] = useState<BillOfLading[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    getBLs().then(setBls)
  }, [])

  const filteredBLs = bls.filter(
    (bl) =>
      bl.number.toLowerCase().includes(search.toLowerCase()) ||
      bl.client_name.toLowerCase().includes(search.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Processed':
        return <Badge className="bg-emerald-500">Processado</Badge>
      case 'Divergent':
        return <Badge variant="destructive">Divergente</Badge>
      case 'Cleared':
        return (
          <Badge
            variant="outline"
            className="text-blue-600 border-blue-200 bg-blue-50"
          >
            Liberado
          </Badge>
        )
      default:
        return <Badge variant="secondary">Pendente</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestão de BLs</h2>
          <p className="text-muted-foreground">
            Bill of Lading como fonte primária de dados
          </p>
        </div>
        <Button onClick={() => navigate('/bl/cadastrar')}>
          <Plus className="mr-2 h-4 w-4" /> Novo BL
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Lista de Documentos</CardTitle>
          <div className="flex items-center py-4">
            <Search className="mr-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número ou cliente..."
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
                <TableHead>Número BL</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Navio / Viagem</TableHead>
                <TableHead>Containers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBLs.length > 0 ? (
                filteredBLs.map((bl) => (
                  <TableRow
                    key={bl.id}
                    className="hover:bg-slate-50 cursor-pointer"
                    onClick={() => navigate(`/bl/${bl.id}`)}
                  >
                    <TableCell className="font-mono font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {bl.number}
                    </TableCell>
                    <TableCell>{bl.client_name}</TableCell>
                    <TableCell>
                      {bl.vessel} - {bl.voyage}
                    </TableCell>
                    <TableCell>{bl.container_count}</TableCell>
                    <TableCell>{getStatusBadge(bl.status)}</TableCell>
                    <TableCell>
                      {new Date(bl.created_at).toLocaleDateString('pt-BR')}
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
                    Nenhum BL encontrado.
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
