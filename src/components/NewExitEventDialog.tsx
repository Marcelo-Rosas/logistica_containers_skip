/* New Exit Event Dialog - Uses Supabase Service */
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
import {
  getContainers,
  getInventory,
  createExitEvent,
} from '@/services/container'
import { Container, InventoryItem } from '@/lib/types'
import { Loader2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface NewExitEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  initialContainerId?: string
}

export function NewExitEventDialog({
  open,
  onOpenChange,
  onSuccess,
  initialContainerId,
}: NewExitEventDialogProps) {
  const [containers, setContainers] = useState<Container[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form State
  const [selectedContainerId, setSelectedContainerId] = useState('')
  const [selectedInventoryId, setSelectedInventoryId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [docNumber, setDocNumber] = useState('')
  const [destination, setDestination] = useState('')
  const [responsible, setResponsible] = useState('')

  useEffect(() => {
    if (open) {
      loadContainers()
      if (initialContainerId) {
        setSelectedContainerId(initialContainerId)
      }
    } else {
      resetForm()
    }
  }, [open, initialContainerId])

  useEffect(() => {
    if (selectedContainerId) {
      loadInventory(selectedContainerId)
    } else {
      setInventory([])
      setSelectedInventoryId('')
    }
  }, [selectedContainerId])

  const loadContainers = async () => {
    setLoading(true)
    try {
      const data = await getContainers()
      setContainers(data.filter((c) => c.status !== 'Vazio'))
    } catch (error) {
      toast.error('Erro ao carregar containers')
    } finally {
      setLoading(false)
    }
  }

  const loadInventory = async (containerId: string) => {
    try {
      const data = await getInventory(containerId)
      setInventory(data)
    } catch (error) {
      toast.error('Erro ao carregar inventário')
    }
  }

  const handleSubmit = async () => {
    if (
      !selectedContainerId ||
      !selectedInventoryId ||
      !quantity ||
      Number(quantity) <= 0
    ) {
      toast.error('Preencha os campos obrigatórios corretamente')
      return
    }

    setSubmitting(true)
    try {
      await createExitEvent({
        container_id: selectedContainerId,
        inventory_id: selectedInventoryId,
        quantity: Number(quantity),
        doc_number: docNumber || 'N/A',
        destination: destination || 'Não informado',
        responsible: responsible || 'Sistema',
      })

      toast.success('Saída registrada com sucesso!')
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error(error)
      toast.error('Erro ao registrar saída')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    if (!initialContainerId) setSelectedContainerId('')
    setSelectedInventoryId('')
    setQuantity('')
    setDocNumber('')
    setDestination('')
    setResponsible('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Saída (Evento)</DialogTitle>
          <DialogDescription>Remova itens do inventário.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Container *</Label>
            <Select
              value={selectedContainerId}
              onValueChange={setSelectedContainerId}
              disabled={loading || !!initialContainerId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um container" />
              </SelectTrigger>
              <SelectContent>
                {containers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.codigo} ({c.sku_count} SKUs)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Produto / SKU *</Label>
            <Select
              value={selectedInventoryId}
              onValueChange={setSelectedInventoryId}
              disabled={!selectedContainerId || inventory.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o SKU" />
              </SelectTrigger>
              <SelectContent>
                {inventory.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.sku} - {item.name} (Disp: {item.quantity})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantidade *</Label>
              <Input
                type="number"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min={1}
              />
            </div>
            <div className="space-y-2">
              <Label>Documento (NF)</Label>
              <Input
                placeholder="Ex: 12345"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar Saída
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
