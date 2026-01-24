/* Dashboard Index Page - Cleaned and Dynamic */
import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  getDashboardStats,
  getRecentActivity,
  getInvoices,
} from '@/lib/mock-service'
import { ActivityLog, DashboardStats, Invoice } from '@/lib/types'
import {
  Container as ContainerIcon,
  Users,
  DollarSign,
  Activity,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from '@/components/ui/chart'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { NextMeasurementCard } from '@/components/NextMeasurementCard'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export default function Index() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [chartData, setChartData] = useState<{ name: string; total: number }[]>(
    [],
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, activityData, invoicesData] = await Promise.all([
          getDashboardStats(),
          getRecentActivity(),
          getInvoices(),
        ])
        setStats(statsData)
        setActivities(activityData)

        // Calculate chart data from invoices or empty
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun']
        const data = months.map((m) => ({ name: m, total: 0 }))

        // If we had invoice dates we could map them, for now keep empty if no invoices
        // Simple mock mapping if there were invoices
        if (invoicesData.length > 0) {
          // mock distribution for demo if data exists
        }
        setChartData(data)
      } catch (error) {
        console.error('Failed to load dashboard data', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    )
  }

  const pieChartConfig = {
    status: {
      label: 'Status',
    },
    ativo: {
      label: 'Ativo',
      color: 'hsl(var(--chart-1))',
    },
    parcial: {
      label: 'Parcial',
      color: 'hsl(var(--chart-2))',
    },
    vazio: {
      label: 'Vazio',
      color: 'hsl(var(--muted))',
    },
    pendente: {
      label: 'Pendente',
      color: 'hsl(var(--chart-4))',
    },
  }

  const pieData = stats?.statusDistribution.map((item) => ({
    ...item,
    fill:
      item.status === 'Ativo'
        ? 'hsl(var(--chart-1))'
        : item.status === 'Parcial'
          ? 'hsl(var(--chart-2))'
          : item.status === 'Vazio'
            ? 'hsl(var(--muted))'
            : 'hsl(var(--chart-4))',
  }))

  const hasData =
    (stats?.activeAllocations || 0) > 0 ||
    (stats?.activeClients || 0) > 0 ||
    activities.length > 0

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        {!hasData && (
          <Button asChild>
            <Link to="/bl/cadastrar">Iniciar Operação</Link>
          </Button>
        )}
      </div>

      {/* KPI Section with Next Measurement Card */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <NextMeasurementCard />

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ocupação Média
            </CardTitle>
            <ContainerIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.occupancyRate}%</div>
            <div className="w-full bg-secondary h-2 rounded-full mt-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-1000"
                style={{ width: `${stats?.occupancyRate}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clientes Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeClients}</div>
            <p className="text-xs text-muted-foreground">Em operação</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Custos Pendentes
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              R${' '}
              {stats?.pendingExitCosts.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Saídas não faturadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Revenue Chart */}
        <Card className="col-span-4 lg:col-span-3 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Status dos Containers</CardTitle>
            <CardDescription>Distribuição atual da frota</CardDescription>
          </CardHeader>
          <CardContent>
            {pieData && pieData.length > 0 ? (
              <ChartContainer
                config={pieChartConfig}
                className="mx-auto aspect-square max-h-[300px]"
              >
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="count"
                    nameKey="status"
                    innerRadius={60}
                    strokeWidth={5}
                  >
                    {pieData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground text-sm">
                Nenhum container cadastrado
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-4 lg:col-span-4 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Receita Mensal</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer
              config={{
                total: {
                  label: 'Receita',
                  color: 'hsl(var(--primary))',
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `R$${value}`}
                  />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="total"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-full hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Atividade Recente
            </CardTitle>
            <CardDescription>Últimas movimentações do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px] pr-4">
              <div className="space-y-6">
                {activities.length > 0 ? (
                  activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4">
                      <span
                        className={`relative flex h-2 w-2 translate-y-2 rounded-full 
                        ${
                          activity.type === 'success'
                            ? 'bg-emerald-500'
                            : activity.type === 'warning'
                              ? 'bg-amber-500'
                              : 'bg-blue-500'
                        }`}
                      >
                        <span
                          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75
                          ${
                            activity.type === 'success'
                              ? 'bg-emerald-400'
                              : activity.type === 'warning'
                                ? 'bg-amber-400'
                                : 'bg-blue-400'
                          }`}
                        ></span>
                      </span>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none text-foreground">
                          {activity.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.timestamp}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <p className="text-sm">Nenhuma atividade recente.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
