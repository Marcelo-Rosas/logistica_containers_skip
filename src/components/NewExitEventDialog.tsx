/* New Exit Event Dialog - A dialog to record item removal from containers */
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
} from '@/lib/mock-service'
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

  const generatePDF = (data: any) => {
    const content = `
DOCUMENTO DE SEPARAÇÃO - LOGÍSTICA
----------------------------------
DATA: ${new Date().toLocaleString()}
ID EVENTO: ${Date.now()}
DOCUMENTO NF: ${data.doc_number}

CONTAINER: ${data.container_code}
PRODUTO: ${data.sku}
QUANTIDADE: ${data.quantity}

DESTINO: ${data.destination}
RESPONSÁVEL: ${data.responsible}

----------------------------------
ESTE DOCUMENTO DEVE ACOMPANHAR A MERCADORIA.
ASSINATURA: __________________________
    `.trim()

    const blob = new Blob([content], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `separacao_${data.container_code}_${data.sku}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleSubmit = async () => {
    // Validation
    if (
      !selectedContainerId ||
      !selectedInventoryId ||
      !quantity ||
      Number(quantity) <= 0
    ) {
      toast.error('Preencha os campos obrigatórios corretamente')
      return
    }

    const selectedItem = inventory.find((i) => i.id === selectedInventoryId)
    if (!selectedItem) return

    if (Number(quantity) > selectedItem.quantity) {
      toast.error(`Quantidade indisponível. Máximo: ${selectedItem.quantity}`)
      return
    }

    setSubmitting(true)
    try {
      // 1. Update Inventory / Create Event
      const newEvent = await createExitEvent({
        container_id: selectedContainerId,
        inventory_id: selectedInventoryId,
        quantity: Number(quantity),
        doc_number: docNumber || 'N/A',
        destination: destination || 'Não informado',
        responsible: responsible || 'Sistema',
      })

      // 2. Success Feedback
      toast.success('Saída registrada com sucesso!')

      // 3. Trigger Visual Alert (Logistics Separation)
      toast('Alerta de Separação Logística', {
        description: `Ordem de separação gerada para ${newEvent.sku}. Baixando documento...`,
        icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
        duration: 5000,
      })

      // 4. Generate PDF Document
      generatePDF(newEvent)

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

  const selectedItem = inventory.find((i) => i.id === selectedInventoryId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Saída (Evento)</DialogTitle>
          <DialogDescription>
            Remova itens do inventário e gere documentação de saída.
          </DialogDescription>
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
                <SelectValue
                  placeholder={
                    !selectedContainerId
                      ? 'Selecione um container primeiro'
                      : inventory.length === 0
                        ? 'Nenhum item disponível'
                        : 'Selecione o SKU'
                  }
                />
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
                max={selectedItem?.quantity}
              />
              {selectedItem && (
                <p className="text-xs text-muted-foreground">
                  Máx: {selectedItem.quantity}
                </p>
              )}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Destino</Label>
              <Input
                placeholder="Ex: CD Cliente"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Responsável</Label>
              <Input
                placeholder="Nome do operador"
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
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
