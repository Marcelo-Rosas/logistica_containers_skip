/* Reports Page Placeholder */
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export default function Relatorios() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">
          Relatórios e Análises
        </h2>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" /> Baixar PDF Consolidado
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Análise Financeira</CardTitle>
            <CardDescription>
              Receita vs Custos Operacionais (Ano Atual)
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] flex items-center justify-center bg-slate-50 rounded-md border border-dashed m-6">
            <p className="text-muted-foreground">
              Gráfico detalhado será renderizado aqui via Integração
              Make/Supabase
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
