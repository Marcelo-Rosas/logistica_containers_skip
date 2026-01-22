/* Settings Page */
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export default function Configuracoes() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integrações do Sistema</CardTitle>
          <CardDescription>
            Status das conexões com serviços externos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Supabase Database</Label>
              <p className="text-sm text-muted-foreground">
                Conexão com banco de dados em tempo real.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-sm font-medium text-emerald-600">
                Online
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Make (Integromat) Webhooks</Label>
              <p className="text-sm text-muted-foreground">
                Automação de entradas, saídas e notificações.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-sm font-medium text-emerald-600">
                Ativo
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferências de Notificação</CardTitle>
          <CardDescription>
            Configure como você deseja ser alertado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Alertas de Email</Label>
              <p className="text-sm text-muted-foreground">
                Receber resumo diário das operações.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificações no Navegador</Label>
              <p className="text-sm text-muted-foreground">
                Alertas pop-up para novas entradas.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
        <div className="p-6 pt-0">
          <Button>Salvar Preferências</Button>
        </div>
      </Card>
    </div>
  )
}
