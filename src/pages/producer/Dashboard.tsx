import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ScanLine, Ticket, Wallet, TrendingUp, Settings } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/lib/auth'
import { RequireAuth } from '@/components/RequireAuth'
import { brl, SERVICE_FEE_RATE } from '@/lib/types'

interface Event {
  id: string
  title: string
  date: string
  city: string
  image_url: string
  ticket_types: Array<{
    total_quantity: number
    available_quantity: number
  }>
}

export default function Dashboard() {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [stats, setStats] = useState({
    ticketsSold: 0,
    gross: 0,
    fees: 0,
    balance: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [user])

  async function loadData() {
    if (!user) return

    setLoading(true)
    try {
      // Load events for this producer
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          *,
          ticket_types (*)
        `)
        .eq('producer_id', user.id)
        .order('date', { ascending: true })

      if (eventsError) throw eventsError

      // Load tickets sold for this producer's events
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select(`
          *,
          orders (total_amount, fee_amount)
        `)
        .in('event_id', eventsData?.map((e: any) => e.id) || [])

      if (ticketsError) throw ticketsError

      const ticketsSold = ticketsData?.length || 0
      const gross = ticketsData?.reduce((sum: number, t: any) => {
        return sum + (t.orders?.total_amount || 0)
      }, 0) || 0
      const fees = ticketsData?.reduce((sum: number, t: any) => {
        return sum + (t.orders?.fee_amount || 0)
      }, 0) || 0
      const balance = gross - fees

      setEvents(eventsData || [])
      setStats({
        ticketsSold,
        gross,
        fees,
        balance
      })
    } catch (err) {
      console.error('Error loading dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const cards = [
    { label: 'Ingressos vendidos', value: String(stats.ticketsSold), icon: Ticket },
    { label: 'Faturamento total', value: brl(stats.gross), icon: TrendingUp },
    { label: 'Saldo disponível', value: brl(stats.balance), icon: Wallet, hint: `já descontada a taxa de ${brl(stats.fees)}` },
  ]

  if (loading) {
    return (
      <RequireAuth>
        <div className="mx-auto max-w-6xl px-4 py-8 pb-28 sm:px-6">
          <div className="text-center">Carregando...</div>
        </div>
      </RequireAuth>
    )
  }

  return (
    <RequireAuth>
      <div className="mx-auto max-w-6xl px-4 py-8 pb-28 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold">Painel do produtor</h1>
            <p className="text-sm text-muted-foreground">Acompanhe vendas e gerencie seus eventos.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/produtor/perfil" className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold">
              <Settings className="h-4 w-4" /> Perfil
            </Link>
            <Link to="/produtor/check-in" className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold">
              <ScanLine className="h-4 w-4" /> Validar entrada
            </Link>
            <Link to="/produtor/novo-evento" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">
              <Plus className="h-4 w-4" /> Criar evento
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {cards.map((c) => (
            <div key={c.label} className="card-surface p-5">
              <c.icon className="h-5 w-5 text-primary" />
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{c.label}</p>
              <p className="text-2xl font-extrabold">{c.value}</p>
              {c.hint && <p className="mt-1 text-xs text-muted-foreground">{c.hint}</p>}
            </div>
          ))}
        </div>

        <h2 className="mb-3 mt-10 text-lg font-bold">Seus eventos</h2>
        <div className="space-y-3">
          {events.map((e) => {
            const total = e.ticket_types.reduce((s, t) => s + t.total_quantity, 0)
            const sold = e.ticket_types.reduce((s, t) => s + (t.total_quantity - t.available_quantity), 0)
            const pct = total ? Math.round((sold / total) * 100) : 0
            return (
              <div key={e.id} className="card-surface flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <img src={e.image_url} alt="" loading="lazy" className="h-20 w-full rounded-xl object-cover sm:w-28" />
                <div className="flex-1">
                  <Link to={`/evento/${e.id}`} className="font-bold hover:text-primary">{e.title}</Link>
                  <p className="text-sm text-muted-foreground">{formatDate(e.date)} · {e.city}</p>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{sold}/{total}</p>
                  <p className="text-xs text-muted-foreground">ingressos</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </RequireAuth>
  )
}
