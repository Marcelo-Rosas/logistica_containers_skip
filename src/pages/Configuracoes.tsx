import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Settings,
  DollarSign,
  Calendar,
  Bell,
  Database,
  Activity,
  Plug,
  Globe,
  Server,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

export default function Configuracoes() {
  const [loading, setLoading] = useState(false)

  // Tariffs State - Reset to empty/defaults
  const [tariffs, setTariffs] = useState({
    dry20: '0.00',
    dry40: '0.00',
    dry40hc: '0.00',
    rounding: true,
  })

  // Measurement State - Reset to defaults
  const [measurement, setMeasurement] = useState({
    day: 25,
    time: '18:00',
    auto: false,
    notify: false,
  })

  // Notifications State - Reset
  const [notifications, setNotifications] = useState({
    scheduled: false,
    exit: false,
    divergence: false,
    invoice: false,
    export: false,
  })

  // Integrations Mock Data
  const integrations = [
    {
      id: 'wms',
      name: 'WMS Integration',
      type: 'Warehouse',
      status: 'disconnected',
      icon: Server,
      description: 'Sincronização de estoque e movimentações físicas.',
      lastSync: 'Nunca',
    },
    {
      id: 'erp',
      name: 'ERP Totvs Protheus',
      type: 'Financeiro',
      status: 'disconnected',
      icon: Database,
      description: 'Emissão automática de notas e faturamento.',
      lastSync: 'Nunca',
    },
    {
      id: 'api',
      name: 'API REST Public',
      type: 'External',
      status: 'disconnected',
      icon: Globe,
      description: 'Gateway para consulta de status por clientes.',
      lastSync: 'Offline',
    },
  ]

  const handleSave = () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      toast.success('Configurações salvas com sucesso!')
    }, 1000)
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8 text-primary" />
          Configurações
        </h2>
        <p className="text-muted-foreground">
          Gerencie tarifas, regras de medição e integrações do sistema.
        </p>
      </div>

      <Tabs defaultValue="tariffs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="tariffs" className="gap-2">
            <DollarSign className="h-4 w-4" /> Tarifas
          </TabsTrigger>
          <TabsTrigger value="measurement" className="gap-2">
            <Calendar className="h-4 w-4" /> Medição
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" /> Notificações
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Plug className="h-4 w-4" /> Integrações
          </TabsTrigger>
        </TabsList>

        {/* Tariffs Tab */}
        <TabsContent value="tariffs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tabela de Preços</CardTitle>
              <CardDescription>
                Defina os valores mensais de armazenagem por tipo de container.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price-20">Dry Box 20'</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">
                      R$
                    </span>
                    <Input
                      id="price-20"
                      className="pl-9"
                      value={tariffs.dry20}
                      onChange={(e) =>
                        setTariffs({ ...tariffs, dry20: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price-40">Dry Box 40'</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">
                      R$
                    </span>
                    <Input
                      id="price-40"
                      className="pl-9"
                      value={tariffs.dry40}
                      onChange={(e) =>
                        setTariffs({ ...tariffs, dry40: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price-40hc">Dry Box 40' HC</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">
                      R$
                    </span>
                    <Input
                      id="price-40hc"
                      className="pl-9"
                      value={tariffs.dry40hc}
                      onChange={(e) =>
                        setTariffs({ ...tariffs, dry40hc: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Arredondamento Financeiro</Label>
                  <p className="text-sm text-muted-foreground">
                    Arredondar valores finais para 2 casas decimais.
                  </p>
                </div>
                <Switch
                  checked={tariffs.rounding}
                  onCheckedChange={(checked) =>
                    setTariffs({ ...tariffs, rounding: checked })
                  }
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={loading}>
                {loading && <Activity className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Measurement Tab */}
        <TabsContent value="measurement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Regras de Medição</CardTitle>
              <CardDescription>
                Configure o ciclo de faturamento e snapshots automáticos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="measurement-day">Dia da Medição</Label>
                  <Input
                    id="measurement-day"
                    type="number"
                    min={1}
                    max={28}
                    value={measurement.day}
                    onChange={(e) =>
                      setMeasurement({
                        ...measurement,
                        day: parseInt(e.target.value),
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Dia do mês para corte do faturamento (1-28).
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="measurement-time">Horário de Corte</Label>
                  <Input
                    id="measurement-time"
                    type="time"
                    value={measurement.time}
                    onChange={(e) =>
                      setMeasurement({ ...measurement, time: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Medição Automática</Label>
                    <p className="text-sm text-muted-foreground">
                      Executar script de medição automaticamente na data
                      agendada.
                    </p>
                  </div>
                  <Switch
                    checked={measurement.auto}
                    onCheckedChange={(c) =>
                      setMeasurement({ ...measurement, auto: c })
                    }
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">
                      Notificar Antes da Medição
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar alerta para administradores 24h antes do corte.
                    </p>
                  </div>
                  <Switch
                    checked={measurement.notify}
                    onCheckedChange={(c) =>
                      setMeasurement({ ...measurement, notify: c })
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={loading}>
                {loading && <Activity className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Alerta</CardTitle>
              <CardDescription>
                Escolha quais eventos devem gerar notificações no sistema e
                e-mail.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="notif-scheduled" className="flex flex-col">
                  <span>Medição Agendada</span>
                  <span className="font-normal text-xs text-muted-foreground">
                    Alertas sobre proximidade da data de corte.
                  </span>
                </Label>
                <Switch
                  id="notif-scheduled"
                  checked={notifications.scheduled}
                  onCheckedChange={(c) =>
                    setNotifications({ ...notifications, scheduled: c })
                  }
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="notif-exit" className="flex flex-col">
                  <span>Saída Registrada</span>
                  <span className="font-normal text-xs text-muted-foreground">
                    Quando um container é retirado do pátio.
                  </span>
                </Label>
                <Switch
                  id="notif-exit"
                  checked={notifications.exit}
                  onCheckedChange={(c) =>
                    setNotifications({ ...notifications, exit: c })
                  }
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="notif-divergence" className="flex flex-col">
                  <span>Discrepância Detectada</span>
                  <span className="font-normal text-xs text-muted-foreground">
                    Diferenças entre BL físico e dados EDI.
                  </span>
                </Label>
                <Switch
                  id="notif-divergence"
                  checked={notifications.divergence}
                  onCheckedChange={(c) =>
                    setNotifications({ ...notifications, divergence: c })
                  }
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="notif-invoice" className="flex flex-col">
                  <span>Fatura Gerada</span>
                  <span className="font-normal text-xs text-muted-foreground">
                    Confirmação de fechamento mensal.
                  </span>
                </Label>
                <Switch
                  id="notif-invoice"
                  checked={notifications.invoice}
                  onCheckedChange={(c) =>
                    setNotifications({ ...notifications, invoice: c })
                  }
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="notif-export" className="flex flex-col">
                  <span>Exportação Concluída</span>
                  <span className="font-normal text-xs text-muted-foreground">
                    Sucesso no envio de dados para ERP/WMS.
                  </span>
                </Label>
                <Switch
                  id="notif-export"
                  checked={notifications.export}
                  onCheckedChange={(c) =>
                    setNotifications({ ...notifications, export: c })
                  }
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={loading}>
                {loading && <Activity className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration) => (
              <Card key={integration.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <integration.icon className="h-6 w-6 text-primary" />
                    </div>
                    {integration.status === 'active' ? (
                      <Badge className="bg-emerald-500 hover:bg-emerald-600">
                        Conectado
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Desconectado</Badge>
                    )}
                  </div>
                  <CardTitle className="mt-4 text-lg">
                    {integration.name}
                  </CardTitle>
                  <CardDescription>{integration.type}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    {integration.description}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <Activity className="h-3 w-3" />
                    Última sinc: {integration.lastSync}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant={
                      integration.status === 'active' ? 'outline' : 'default'
                    }
                    className="w-full"
                    onClick={() =>
                      toast.info(
                        `Configuração de ${integration.name} indisponível na demo.`,
                      )
                    }
                  >
                    {integration.status === 'active'
                      ? 'Configurar'
                      : 'Conectar'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
