import { useState, useEffect } from 'react'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Settings,
  DollarSign,
  Calendar,
  Bell,
  Plug,
  Activity,
  Server,
  Database,
  Globe,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import {
  getSettings,
  updateSettings,
  resetSystemData,
} from '@/lib/mock-service'
import { SystemSettings } from '@/lib/types'
import { useNavigate } from 'react-router-dom'

export default function Configuracoes() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [tariffs, setTariffs] = useState<SystemSettings['tariffs']>({
    dry20: 0,
    dry40: 0,
    dry40hc: 0,
    rounding: true,
  })
  const [measurement, setMeasurement] = useState<SystemSettings['measurement']>(
    {
      day: 25,
      time: '18:00',
      auto: false,
      notify: false,
    },
  )

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    const settings = await getSettings()
    setTariffs(settings.tariffs)
    setMeasurement(settings.measurement)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await updateSettings({
        tariffs,
        measurement,
      })
      toast.success('Configurações salvas com sucesso!')
    } catch (e) {
      toast.error('Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    setLoading(true)
    try {
      await resetSystemData()
      toast.success('Dados do sistema resetados com sucesso!')
      navigate('/')
    } catch (e) {
      toast.error('Erro ao resetar dados')
    } finally {
      setLoading(false)
    }
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
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:w-[750px]">
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
          <TabsTrigger
            value="system"
            className="gap-2 text-destructive data-[state=active]:text-destructive"
          >
            <Database className="h-4 w-4" /> Sistema
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tariffs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Base Container Value (Mensal)</CardTitle>
              <CardDescription>
                Defina os valores base de armazenagem. O faturamento será
                calculado proporcionalmente ao volume ocupado.
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
                      type="number"
                      value={tariffs.dry20}
                      onChange={(e) =>
                        setTariffs({
                          ...tariffs,
                          dry20: Number(e.target.value),
                        })
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
                      type="number"
                      value={tariffs.dry40}
                      onChange={(e) =>
                        setTariffs({
                          ...tariffs,
                          dry40: Number(e.target.value),
                        })
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
                      type="number"
                      value={tariffs.dry40hc}
                      onChange={(e) =>
                        setTariffs({
                          ...tariffs,
                          dry40hc: Number(e.target.value),
                        })
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

        <TabsContent value="measurement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Regras de Medição</CardTitle>
              <CardDescription>
                Configure o ciclo de faturamento. Faturas vencem 10 dias após o
                corte.
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

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
            </CardHeader>
            <CardContent>Configurações de notificação (Mock)</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integrações</CardTitle>
            </CardHeader>
            <CardContent>Configurações de integração (Mock)</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Zona de Perigo
              </CardTitle>
              <CardDescription>
                Ações críticas que afetam todos os dados do sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-background border border-destructive/20 rounded-lg">
                <div className="space-y-1">
                  <h4 className="text-base font-semibold text-foreground">
                    Limpar Dados de Teste
                  </h4>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Esta ação excluirá permanentemente todos os containers,
                    clientes, BLs, histórico de eventos e faturas. Use com
                    cautela para preparar o ambiente para produção.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Limpar Tudo
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Você tem certeza absoluta?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso excluirá
                        permanentemente todos os registros de teste e redefinirá
                        o sistema para o estado inicial vazio.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleReset}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Sim, limpar tudo
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
