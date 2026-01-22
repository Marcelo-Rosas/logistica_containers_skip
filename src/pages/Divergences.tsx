import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDivergences } from '@/lib/mock-service'
import { Divergence } from '@/lib/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export default function Divergences() {
  const navigate = useNavigate()
  const [divergences, setDivergences] = useState<Divergence[]>([])

  useEffect(() => {
    getDivergences().then(setDivergences)
  }, [])

  const criticalCount = divergences.filter(
    (d) => d.severity === 'Critical',
  ).length
  const warningCount = divergences.filter(
    (d) => d.severity === 'Warning',
  ).length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Central de Divergências
        </h2>
        <p className="text-muted-foreground">
          Monitoramento de integridade de dados (BL vs EDI)
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Críticas</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalCount}</div>
            <p className="text-xs text-muted-foreground">
              Requer atenção imediata
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warningCount}</div>
            <p className="text-xs text-muted-foreground">
              Discrepâncias menores
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Resolvidos Hoje
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Correções aplicadas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Discrepâncias</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>BL</TableHead>
                <TableHead>Gravidade</TableHead>
                <TableHead>Problema</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {divergences.length > 0 ? (
                divergences.map((d) => (
                  <TableRow key={d.id} className="hover:bg-slate-50">
                    <TableCell className="font-mono">{d.bl_number}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          d.severity === 'Critical'
                            ? 'destructive'
                            : 'secondary'
                        }
                        className={
                          d.severity === 'Warning'
                            ? 'bg-amber-100 text-amber-800'
                            : ''
                        }
                      >
                        {d.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>{d.type}</TableCell>
                    <TableCell>{d.description}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/bl/${d.bl_id}`)}
                      >
                        Investigar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Tudo certo! Nenhuma divergência pendente.
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
