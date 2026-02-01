import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createContainer, updateContainer } from '@/services/container'
import {
  getContainerTypes,
  getWarehouses,
  getStorageLocations,
  getCustomers,
  getSuppliers,
} from '@/services/master-data'
import {
  ContainerType,
  Warehouse,
  StorageLocation,
  Client,
  Supplier,
  Container,
} from '@/lib/types'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const containerSchema = z.object({
  container_number: z
    .string()
    .min(4, 'O código é obrigatório (ex: ABCD1234567)'),
  bl_number: z.string().optional(),
  container_type: z.string().min(1, 'Selecione o tipo'),
  consignee_id: z.string().optional(),
  supplier_id: z.string().optional(),
  warehouse_id: z.string().optional(),
  storage_location_id: z.string().optional(),
  status: z.string().min(1, 'Selecione o status'),
  total_cbm: z.coerce.number().min(0).optional(),
  total_gross_weight: z.coerce.number().min(0).optional(),
})

type ContainerFormValues = z.infer<typeof containerSchema>

interface ContainerFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  containerToEdit?: Container | null
}

export function ContainerFormDialog({
  open,
  onOpenChange,
  onSuccess,
  containerToEdit,
}: ContainerFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Master Data State
  const [types, setTypes] = useState<ContainerType[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [locations, setLocations] = useState<StorageLocation[]>([])
  const [filteredLocations, setFilteredLocations] = useState<StorageLocation[]>(
    [],
  )
  const [customers, setCustomers] = useState<Client[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])

  const form = useForm<ContainerFormValues>({
    resolver: zodResolver(containerSchema),
    defaultValues: {
      container_number: '',
      bl_number: '',
      container_type: '',
      consignee_id: 'none',
      supplier_id: 'none',
      warehouse_id: 'none',
      storage_location_id: 'none',
      status: 'Pendente',
      total_cbm: 0,
      total_gross_weight: 0,
    },
  })

  // Watch warehouse to filter locations
  const selectedWarehouse = form.watch('warehouse_id')

  useEffect(() => {
    if (open) {
      loadMasterData()
    } else {
      form.reset()
    }
  }, [open])

  useEffect(() => {
    if (containerToEdit) {
      form.reset({
        container_number: containerToEdit.container_number,
        bl_number: containerToEdit.bl_number || '',
        container_type: containerToEdit.container_type || '',
        consignee_id: containerToEdit.consignee_id || 'none',
        supplier_id: containerToEdit.supplier_id || 'none',
        warehouse_id: containerToEdit.warehouse_id || 'none',
        storage_location_id: containerToEdit.storage_location_id || 'none',
        status: containerToEdit.status,
        total_cbm: containerToEdit.total_cbm || 0,
        total_gross_weight: containerToEdit.total_gross_weight || 0,
      })
    }
  }, [containerToEdit, open])

  useEffect(() => {
    if (selectedWarehouse && selectedWarehouse !== 'none') {
      setFilteredLocations(
        locations.filter((l) => l.warehouse_id === selectedWarehouse),
      )
    } else {
      setFilteredLocations([])
    }
  }, [selectedWarehouse, locations])

  const loadMasterData = async () => {
    setLoading(true)
    try {
      const [t, w, l, c, s] = await Promise.all([
        getContainerTypes(),
        getWarehouses(),
        getStorageLocations(),
        getCustomers(),
        getSuppliers(),
      ])
      setTypes(t)
      setWarehouses(w)
      setLocations(l)
      setCustomers(c)
      setSuppliers(s)
    } catch (e) {
      toast.error('Erro ao carregar dados auxiliares')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (values: ContainerFormValues) => {
    setSubmitting(true)
    try {
      // Clean up "none" values to null
      const payload: any = { ...values }
      if (payload.consignee_id === 'none') payload.consignee_id = null
      if (payload.supplier_id === 'none') payload.supplier_id = null
      if (payload.warehouse_id === 'none') payload.warehouse_id = null
      if (payload.storage_location_id === 'none')
        payload.storage_location_id = null

      // Set initial values if creating
      if (!containerToEdit) {
        // Find capacity based on type
        const type = types.find((t) => t.code === values.container_type)
        payload.initial_capacity_cbm = type?.nominal_volume_m3 || 33.2
        payload.initial_total_net_weight = 0 // Default
        payload.initial_total_volumes = 0 // Default
      }

      if (containerToEdit) {
        await updateContainer(containerToEdit.id, payload)
        toast.success('Container atualizado com sucesso!')
      } else {
        await createContainer(payload)
        toast.success('Container criado com sucesso!')
      }
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error(error)
      toast.error('Erro ao salvar container')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {containerToEdit ? 'Editar Container' : 'Novo Container'}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do container físico.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="container_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número do Container *</FormLabel>
                    <FormControl>
                      <Input placeholder="ABCD1234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="container_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {types.map((type) => (
                          <SelectItem key={type.code} value={type.code}>
                            {type.name} ({type.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bl_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>BL Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Opcional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Status atual" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[
                          'Ativo',
                          'Pendente',
                          'Cheio',
                          'Vazio',
                          'Manutenção',
                        ].map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="consignee_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente (Consignee)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || 'none'}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">-- Nenhum --</SelectItem>
                        {customers.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supplier_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fornecedor (Supplier)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || 'none'}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">-- Nenhum --</SelectItem>
                        {suppliers.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="warehouse_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Armazém</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val)
                        form.setValue('storage_location_id', 'none')
                      }}
                      value={field.value || 'none'}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">-- Nenhum --</SelectItem>
                        {warehouses.map((w) => (
                          <SelectItem key={w.id} value={w.id}>
                            {w.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="storage_location_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localização</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || 'none'}
                      disabled={
                        !selectedWarehouse ||
                        selectedWarehouse === 'none' ||
                        filteredLocations.length === 0
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">-- Nenhum --</SelectItem>
                        {filteredLocations.map((l) => (
                          <SelectItem key={l.id} value={l.id}>
                            {l.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="total_cbm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volume Total (m³)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="total_gross_weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso Bruto (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
