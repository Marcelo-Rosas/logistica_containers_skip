import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getCustomers } from '@/services/master-data'
import { getContainers, registerEntry } from '@/services/container'
import { Client, ContainerStats } from '@/lib/types'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface NewEntryEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function NewEntryEventDialog({
  open,
  onOpenChange,
  onSuccess,
}: NewEntryEventDialogProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [containers, setContainers] = useState<ContainerStats[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form
  const [clientId, setClientId] = useState('')
  const [containerId, setContainerId] = useState('')
  const [entryDate, setEntryDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  useEffect(() => {
    if (open) {
      loadData()
    } else {
      setClientId('')
      setContainerId('')
    }
  }, [open])

  const loadData = async () => {
    setLoading(true)
    try {
      const [cData, contData] = await Promise.all([
        getCustomers(),
        getContainers({ status: 'todos' }),
      ])
      setClients(cData)
      setContainers(contData)
    } catch (e) {
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!clientId || !containerId || !entryDate) {
      toast.error('Preencha todos os campos')
      return
    }

    setSubmitting(true)
    try {
      await registerEntry({
        client: clientId,
        container: containerId,
        data_entrada: new Date(entryDate).toISOString(),
      })
      toast.success('Entrada registrada com sucesso!')
      onSuccess()
      onOpenChange(false)
    } catch (e) {
      console.error(e)
      toast.error('Erro ao registrar entrada')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Entrada</DialogTitle>
          <DialogDescription>
            Inicie a alocação de um container para um cliente.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Select
              value={clientId}
              onValueChange={setClientId}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Container Disponível</Label>
            <Select
              value={containerId}
              onValueChange={setContainerId}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o container" />
              </SelectTrigger>
              <SelectContent>
                {containers
                  .filter(
                    (c) =>
                      c.status === 'Pendente' ||
                      c.status === 'Disponível' ||
                      c.status === 'Vazio',
                  )
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.container_number} ({c.status})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Data de Entrada</Label>
            <Input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
