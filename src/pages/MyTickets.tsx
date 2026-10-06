import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Link, useSearchParams } from 'react-router-dom'
import { CalendarDays, MapPin, CheckCircle2, XCircle } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/lib/auth'
import { toast } from 'sonner'
import { RequireAuth } from '@/components/RequireAuth'

interface Ticket {
  id: string
  order_id: string
  event_id: string
  ticket_type_id: string
  attendee_name: string
  attendee_cpf: string
  qr_code_hash: string
  status: string
  checked_in_at: string | null
  event: {
    title: string
    date: string
    time: string
    location: string
    city: string
  }
  ticket_type: {
    name: string
  }
  order: {
    created_at: string
  }
}

export default function MyTickets() {
  const { user } = useAuth()
  const [params] = useSearchParams()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const highlight = params.get('pedido')

  useEffect(() => {
    loadTickets()
  }, [user])

  async function loadTickets() {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          id,
          order_id,
          event_id,
          ticket_type_id,
          attendee_name,
          attendee_cpf,
          qr_code_hash,
          status,
          checked_in_at,
          event:events (
            title,
            date,
            time,
            location,
            city
          ),
          ticket_type:ticket_types (
            name
          ),
          order:orders (
            created_at
          )
        `)
        .eq('order.user_id', user.id)
        .order('order.created_at', { ascending: false })

      if (error) throw error
      setTickets(data || [])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar ingressos'
      const errorMap: Record<string, string> = {
        'Failed to fetch': 'Erro de conexão. Verifique sua internet.',
        'JWT expired': 'Sessão expirada. Faça login novamente.',
      }

      let errorMessage = errorMap[msg] || msg
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  async function handleCancelTicket(ticketId: string) {
    setCancelling(ticketId)
    try {
      const { data, error } = await supabase.rpc('cancel_ticket_with_validation', {
        _ticket_id: ticketId
      })

      if (error) throw error

      const result = data as { success: boolean; message: string }

      if (result.success) {
        toast.success(result.message)
        await loadTickets()
      } else {
        toast.error(result.message)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao cancelar ingresso'
      const errorMap: Record<string, string> = {
        'Failed to fetch': 'Erro de conexão. Verifique sua internet.',
        'Invalid request': 'Solicitação inválida.',
      }

      let errorMessage = errorMap[msg] || msg
      toast.error(errorMessage)
    } finally {
      setCancelling(null)
    }
  }

  function canCancelTicket(ticket: Ticket): boolean {
    if (ticket.status !== 'valid') return false

    const daysSincePurchase = (Date.now() - new Date(ticket.order.created_at).getTime()) / (1000 * 60 * 60 * 24)
    if (daysSincePurchase >= 7) return false

    const eventDateTime = new Date(`${ticket.event.date}T${ticket.event.time}`)
    const hoursUntilEvent = (eventDateTime.getTime() - Date.now()) / (1000 * 60 * 60)
    if (hoursUntilEvent <= 48) return false

    return true
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 pb-28 sm:px-6">
        <div className="text-center">Carregando...</div>
      </div>
    )
  }

  if (!tickets.length) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-2xl font-extrabold">Você ainda não tem ingressos</h1>
        <p className="mt-2 text-muted-foreground">Explore os eventos independentes perto de você.</p>
        <Link to="/" className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground">
          Ver eventos
        </Link>
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <RequireAuth>
      <div className="mx-auto max-w-3xl px-4 py-8 pb-28 sm:px-6">
        <h1 className="text-2xl font-extrabold">Meus ingressos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Apresente o QR Code na entrada do evento. Cada código só pode ser validado uma vez.
        </p>

        <div className="mt-6 space-y-4">
          {tickets.map((t) => {
            const isNew = highlight && t.order_id === highlight
            const canCancel = canCancelTicket(t)
            return (
              <article
                key={t.id}
                className={`card-surface overflow-hidden ${isNew ? 'ring-2 ring-primary' : ''}`}
              >
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-wide text-primary">{t.ticket_type.name}</p>
                    <h2 className="mt-1 text-lg font-bold">{t.event.title}</h2>
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <CalendarDays className="h-4 w-4" /> {formatDate(t.event.date)} às {t.event.time}
                    </p>
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" /> {t.event.location} — {t.event.city}
                    </p>
                    <p className="mt-3 text-sm">
                      Titular: <strong>{t.attendee_name}</strong>
                    </p>
                    <p className="font-mono text-sm tracking-widest">{t.qr_code_hash}</p>
                    {t.checked_in_at && (
                      <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Check-in feito às{' '}
                        {new Date(t.checked_in_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                    {t.status === 'cancelled' && (
                      <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive">
                        <XCircle className="h-3.5 w-3.5" /> Ingresso cancelado
                      </p>
                    )}
                    {canCancel && (
                      <button
                        onClick={() => handleCancelTicket(t.id)}
                        disabled={cancelling === t.id}
                        className="mt-3 text-sm text-destructive hover:underline disabled:opacity-50"
                      >
                        {cancelling === t.id ? 'Cancelando...' : 'Solicitar cancelamento'}
                      </button>
                    )}
                  </div>

                  <div className="grid shrink-0 place-items-center rounded-2xl bg-muted p-4">
                    <QRCodeSVG value={t.qr_code_hash} size={132} bgColor="transparent" fgColor="#101014" level="M" />
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </RequireAuth>
  )
}
