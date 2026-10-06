import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { QrCode, CreditCard, Clock, Lock } from 'lucide-react'
import { z } from 'zod'
import { toast } from 'sonner'
import { useStore } from '@/lib/store'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/integrations/supabase/client'
import { brl, Buyer, PaymentMethod, SERVICE_FEE_RATE } from '@/lib/types'
import { cn } from '@/lib/utils'

const schema = z.object({
  name: z.string().trim().min(3, 'Informe seu nome completo').max(100),
  email: z.string().trim().email('E-mail inválido').max(255),
  cpf: z.string().trim().regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, 'CPF inválido'),
  whatsapp: z.string().trim().regex(/^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/, 'WhatsApp inválido'),
})

export default function Checkout() {
  const { reservationId = '' } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', cpf: '', whatsapp: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [payment, setPayment] = useState<PaymentMethod>('pix')
  const [loading, setLoading] = useState(false)
  const [left, setLeft] = useState(0)
  const [reservation, setReservation] = useState<any>(null)
  const [event, setEvent] = useState<any>(null)

  // Load reservation from localStorage
  useEffect(() => {
    const reservationData = localStorage.getItem(`reservation_${reservationId}`)
    if (reservationData) {
      const parsed = JSON.parse(reservationData)
      setReservation(parsed)
      loadEvent(parsed.eventId)
    }
  }, [reservationId])

  async function loadEvent(eventId: string) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          ticket_types (*)
        `)
        .eq('id', eventId)
        .single()

      if (error) throw error
      setEvent(data)
    } catch (err) {
      console.error('Error loading event:', err)
    }
  }

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (user && profile) {
      setForm({
        name: profile.full_name || '',
        email: user.email || '',
        cpf: profile.cpf || '',
        whatsapp: profile.whatsapp || '',
      })
    }
  }, [user, profile])

  useEffect(() => {
    if (!reservation) return
    const tick = () => setLeft(Math.max(0, reservation.expiresAt - Date.now()))
    tick()
    const i = setInterval(tick, 1000)
    return () => clearInterval(i)
  }, [reservation])

  const totals = useMemo(() => {
    if (!reservation || !event) return { subtotal: 0, fee: 0, total: 0 }
    const subtotal = reservation.items.reduce((s: number, i: any) => {
      const tt = event.ticket_types.find((t: any) => t.id === i.ticketTypeId)
      return s + (tt?.price || 0) * i.qty
    }, 0)
    const fee = Math.round(subtotal * SERVICE_FEE_RATE * 100) / 100
    return { subtotal, fee, total: subtotal + fee }
  }, [reservation, event])

  if (!reservation || !event) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Reserva expirada</h1>
        <p className="mt-2 text-muted-foreground">Sua reserva de 10 minutos acabou. Selecione os ingressos novamente.</p>
        <Link to="/" className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground">
          Ver eventos
        </Link>
      </div>
    )
  }

  const mm = String(Math.floor(left / 60000)).padStart(2, '0')
  const ss = String(Math.floor((left % 60000) / 1000)).padStart(2, '0')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = schema.safeParse(form)
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      Object.entries(parsed.error.flatten().fieldErrors).forEach(([k, v]) => (fieldErrors[k] = v?.[0] ?? ''))
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    setLoading(true)

    try {
      // Preparar itens para a função do Supabase
      const items = reservation?.items.map(item => ({
        ticket_type_id: item.ticketTypeId,
        quantity: item.qty
      })) || []

      // Chamar função do Supabase para criar pedido
      const { data, error } = await supabase.rpc('create_order', {
        _cpf: parsed.data.cpf,
        _email: parsed.data.email,
        _event_id: reservation?.eventId,
        _items: items,
        _name: parsed.data.name,
        _payment: payment,
        _whatsapp: parsed.data.whatsapp
      })

      if (error) throw error

      toast.success(payment === 'pix' ? 'Pix confirmado! Ingressos liberados.' : 'Pagamento aprovado!')

      // Se usuário estiver logado, vai para meus ingressos, senão mostra mensagem
      if (user) {
        navigate(`/meus-ingressos?pedido=${data}`)
      } else {
        // Para usuários não logados, mostrar opção de criar conta
        toast.success('Compra realizada! Crie uma conta para acessar seus ingressos futuros.')
        navigate(`/entrar?next=/meus-ingressos&email=${encodeURIComponent(parsed.data.email)}`)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao processar pagamento'
      const errorMap: Record<string, string> = {
        'Failed to fetch': 'Erro de conexão. Verifique sua internet.',
        'Insufficient funds': 'Saldo insuficiente.',
        'Payment declined': 'Pagamento recusado.',
        'Card expired': 'Cartão expirado.',
        'Invalid card': 'Cartão inválido.',
      }

      let errorMessage = errorMap[msg] || msg
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-28 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold">Finalizar compra</h1>
        <span className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold',
          left < 120000 ? 'bg-destructive/10 text-destructive' : 'bg-muted text-foreground',
        )}>
          <Clock className="h-4 w-4" /> {mm}:{ss}
        </span>
      </div>

      <div className="card-surface mb-6 p-4">
        <p className="text-sm text-muted-foreground">Você está comprando</p>
        <p className="font-bold">{event.title}</p>
        <ul className="mt-3 space-y-1 text-sm">
          {reservation.items.map((i: any) => {
            const tt = event.ticket_types.find((t: any) => t.id === i.ticketTypeId)
            return (
              <li key={i.ticketTypeId} className="flex justify-between">
                <span>{i.qty}× {tt?.name || 'Ingresso'}</span>
                <span>{brl((tt?.price || 0) * i.qty)}</span>
              </li>
            )
          })}
          <li className="flex justify-between text-muted-foreground">
            <span>Taxa de serviço (10%)</span><span>{brl(totals.fee)}</span>
          </li>
          <li className="flex justify-between border-t border-border pt-2 text-base font-bold">
            <span>Total</span><span>{brl(totals.total)}</span>
          </li>
        </ul>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <fieldset className="card-surface space-y-3 p-5">
          <legend className="px-1 text-sm font-bold">Seus dados</legend>
          {([
            ['name', 'Nome completo', 'Maria Silva', 'text'],
            ['email', 'E-mail', 'maria@email.com', 'email'],
            ['cpf', 'CPF', '000.000.000-00', 'text'],
            ['whatsapp', 'WhatsApp', '(11) 90000-0000', 'tel'],
          ] as const).map(([key, label, ph, type]) => (
            <div key={key}>
              <label htmlFor={key} className="mb-1 block text-xs font-semibold text-muted-foreground">{label}</label>
              <input
                id={key}
                type={type}
                maxLength={255}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={ph}
                className="field"
              />
              {errors[key] && <p className="mt-1 text-xs text-destructive">{errors[key]}</p>}
            </div>
          ))}
        </fieldset>

        <fieldset className="card-surface space-y-3 p-5">
          <legend className="px-1 text-sm font-bold">Pagamento</legend>
          {([
            ['pix', 'Pix', 'Aprovação imediata', QrCode],
            ['card', 'Cartão de crédito', 'Em até 12×', CreditCard],
          ] as const).map(([value, title, sub, Icon]) => (
            <button
              type="button"
              key={value}
              onClick={() => setPayment(value)}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl border p-4 text-left transition',
                payment === value ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-border',
              )}
            >
              <Icon className="h-5 w-5 text-primary" />
              <span className="flex-1">
                <span className="block font-semibold">{title}</span>
                <span className="block text-xs text-muted-foreground">{sub}</span>
              </span>
              <span className={cn('h-4 w-4 rounded-full border-2', payment === value ? 'border-primary bg-primary' : 'border-border')} />
            </button>
          ))}

          {payment === 'card' && (
            <div className="grid gap-3 pt-1 sm:grid-cols-2">
              <input className="field sm:col-span-2" placeholder="Número do cartão" inputMode="numeric" maxLength={19} />
              <input className="field" placeholder="Validade (MM/AA)" maxLength={5} />
              <input className="field" placeholder="CVV" inputMode="numeric" maxLength={4} />
            </div>
          )}
        </fieldset>

        <button
          type="submit"
          disabled={loading || left === 0}
          className="w-full rounded-xl bg-primary py-4 font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Processando...' : `Pagar ${brl(totals.total)}`}
        </button>
        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" /> Ambiente de demonstração — nenhum pagamento real é processado
        </p>
      </form>
    </div>
  )
}
