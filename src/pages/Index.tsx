import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Container as ContainerIcon, Users, DollarSign } from 'lucide-react'
import { NextMeasurementCard } from '@/components/NextMeasurementCard'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { getContainers } from '@/services/container'

export default function Index() {
  const [stats, setStats] = useState({
    occupancyRate: 0,
    activeClients: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const containers = await getContainers()
        const activeContainers = containers.filter((c) => c.status === 'Ativo')
        const occupancy =
          activeContainers.length > 0
            ? activeContainers.reduce(
                (acc, c) => acc + (c.occupancy_rate || 0),
                0,
              ) / activeContainers.length
            : 0

        setStats({
          occupancyRate: Math.round(occupancy),
          activeClients: new Set(activeContainers.map((c) => c.cliente_id))
            .size,
        })
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Button asChild>
          <Link to="/containers">Gerenciar Containers</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <NextMeasurementCard />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ocupação Média
            </CardTitle>
            <ContainerIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.occupancyRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clientes Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeClients}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
