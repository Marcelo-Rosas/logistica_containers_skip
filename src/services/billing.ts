/* Billing Service using Supabase Data */
import { supabase } from '@/lib/supabase/client'
import { Invoice, InvoiceItem, BillingStrategy } from '@/lib/types'
import { getContainer } from './container'
import { differenceInDays, addDays } from 'date-fns'

export const simulateBilling = async (): Promise<Invoice[]> => {
  // Fetch active containers
  const { data: containersData, error } = await supabase
    .from('containers')
    .select('id')
    .neq('status', 'Vazio')

  if (error) throw error

  const simulated: Invoice[] = []

  // Settings (Mocked for now as not in DB)
  const measurementDay = 25
  const today = new Date()
  let nextDate = new Date(today.getFullYear(), today.getMonth(), measurementDay)
  if (today.getDate() > measurementDay) {
    nextDate = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      measurementDay,
    )
  }
  const prevDate = new Date(nextDate)
  prevDate.setMonth(prevDate.getMonth() - 1)

  // Process each container
  for (const c of containersData) {
    try {
      const container = await getContainer(c.id)
      if (!container.cliente_id) continue

      const strategy = container.active_strategy || 'VOLUME'
      const basePrice = container.base_monthly_cost || 3000

      let amount = 0
      let description = ''
      let method: 'pro_rata' | 'volume_snapshot'
      let meta: Partial<InvoiceItem> = {}

      const entryDate = container.storage_start_date
        ? new Date(container.storage_start_date)
        : new Date()

      // Pro-rata Logic (First month)
      if (entryDate > prevDate) {
        const daysActive = differenceInDays(nextDate, entryDate)
        const daysToBill = Math.max(1, daysActive)
        amount = (daysToBill / 30) * basePrice
        description = `Armazenagem (${strategy}) - Pro-rata - ${container.codigo}`
        method = 'pro_rata'
        meta = {
          days_pro_rated: daysToBill,
          base_cost: basePrice,
        }
      } else {
        // Snapshot Logic
        let current = 0
        let total = 1
        let unit = ''

        if (strategy === 'VOLUME') {
          current = container.total_volume_m3
          total = container.initial_capacity_m3
          unit = 'm³'
        } else if (strategy === 'WEIGHT') {
          current = container.total_net_weight_kg
          total = container.initial_total_net_weight_kg
          unit = 'kg'
        } else {
          current = container.total_quantity
          total = container.initial_quantity
          unit = 'und'
        }

        const ratio = Math.min(1, current / total)
        amount = ratio * basePrice
        description = `Armazenagem (${strategy}) - Mensal - ${container.codigo}`
        method = 'volume_snapshot'
        meta = {
          snapshot_date: nextDate.toISOString(),
          metric_used: current,
          metric_total: total,
          metric_unit: unit,
          occupancy_percentage: Math.round(ratio * 100),
          billing_strategy: strategy,
          savings: basePrice - amount,
        }
      }

      // Aggregate into Invoice
      let invoice = simulated.find((i) => i.client_id === container.cliente_id)
      if (!invoice) {
        invoice = {
          id: 'draft',
          client_id: container.cliente_id,
          client_name: container.cliente_nome || 'Cliente',
          month: nextDate.getMonth() + 1,
          year: nextDate.getFullYear(),
          total_amount: 0,
          status: 'Draft',
          due_date: addDays(nextDate, 10).toISOString(),
          created_at: new Date().toISOString(),
          items: [],
        }
        simulated.push(invoice)
      }

      invoice.items.push({
        id: `item-${Date.now()}-${Math.random()}`,
        description,
        amount,
        type: 'storage',
        calculation_method: method,
        ...meta,
      })
      invoice.total_amount += amount
    } catch (e) {
      console.error(e)
    }
  }

  return simulated
}

export const getInvoices = async (): Promise<Invoice[]> => {
  // Mock fetching previously generated invoices
  return []
}

export const generateMonthlyInvoices = async (invoices: Invoice[]) => {
  // Logic to save to DB would go here
  // For now just resolve
  return true
}
