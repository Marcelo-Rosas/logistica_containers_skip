import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CalendarClock, ArrowRight, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getContainers } from '@/services/container'

export function NextMeasurementCard() {
  const navigate = useNavigate()
  const [daysRemaining, setDaysRemaining] = useState(0)
  const [activeCount, setActiveCount] = useState(0)
  const [measurementDate, setMeasurementDate] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth()
    let nextDate = new Date(currentYear, currentMonth, 25)
    if (today > nextDate) {
      nextDate = new Date(currentYear, currentMonth + 1, 25)
    }
    setMeasurementDate(nextDate)
    const diffTime = Math.abs(nextDate.getTime() - today.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    setDaysRemaining(diffDays)

    getContainers()
      .then((data) => {
        const active = data.filter((a) => a.status === 'Ativo').length
        setActiveCount(active)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSimulate = () => {
    navigate('/faturamento?action=simulate')
  }

  if (loading) {
    return (
      <Card className="bg-gradient-hero text-white h-full min-h-[160px] animate-pulse">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin opacity-50" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-hero pattern-container relative overflow-hidden text-white border-0 shadow-elevation">
      <CardContent className="p-6 relative z-10 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-white/80 flex items-center gap-2">
              <CalendarClock className="h-4 w-4" />
              Próxima Medição
            </h3>
            <div className="text-3xl font-bold tracking-tight">
              {daysRemaining} dias
            </div>
            <p className="text-xs text-white/60">
              Agendado para {measurementDate?.toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-white/60">Containers Ativos</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center backdrop-blur-sm rounded-lg">
          <Button
            variant="secondary"
            size="sm"
            className="text-xs h-8 bg-white/10 hover:bg-white/20 text-white border-0"
            onClick={handleSimulate}
          >
            Simular Fatura
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
