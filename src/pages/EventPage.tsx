import { useMemo, useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { CalendarDays, MapPin, Minus, Plus, ShieldCheck, Clock } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { brl, SERVICE_FEE_RATE } from '@/lib/types'
import { toast } from 'sonner'

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  address: string
  city: string
  category: string
  image_url: string
  organizer: string
  status: string
  ticket_types: Array<{
    id: string
    name: string
    description: string
    price: number
    total_quantity: number
    available_quantity: number
  }>
}

export default function EventPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState<Record<string, number>>({})

  useEffect(() => {
    loadEvent()
  }, [id])

  async function loadEvent() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          ticket_types (*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      setEvent(data)

      // Salvar em "vistos recentemente"
      const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
      if (!viewed.includes(id)) {
        viewed.unshift(id)
        if (viewed.length > 10) viewed.pop() // Manter apenas os 10 mais recentes
        localStorage.setItem('recentlyViewed', JSON.stringify(viewed))
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar evento'
      const errorMap: Record<string, string> = {
        'Failed to fetch': 'Erro de conexão. Verifique sua internet.',
        'JWT expired': 'Sessão expirada. Faça login novamente.',
        'not found': 'Evento não encontrado.',
      }

      let errorMessage = errorMap[msg] || msg
      console.error('Error loading event:', errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const subtotal = useMemo(() => {
    if (!event) return 0
    return event.ticket_types.reduce((s, t) => s + (qty[t.id] || 0) * t.price, 0)
  }, [qty, event])

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="text-center">Carregando evento...</div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Evento não encontrado</h1>
        <Link to="/" className="mt-4 inline-block font-semibold text-primary">Voltar para os eventos</Link>
      </div>
    )
  }

  const fee = Math.round(subtotal * SERVICE_FEE_RATE * 100) / 100
  const totalQty = Object.values(qty).reduce((a, b) => a + b, 0)

  const change = (ticketTypeId: string, delta: number, max: number) => {
    setQty((p) => {
      const next = Math.min(Math.max((p[ticketTypeId] || 0) + delta, 0), Math.min(max, 6))
      return { ...p, [ticketTypeId]: next }
    })
  }

  const goCheckout = () => {
    const items = Object.entries(qty)
      .filter(([, v]) => v > 0)
      .map(([ticketTypeId, q]) => ({ ticketTypeId, qty: q }))
    if (!items.length) return

    // Criar reservation ID simples usando timestamp
    const resId = `${event.id}-${Date.now()}`
    // Salvar no localStorage temporariamente
    localStorage.setItem(`reservation_${resId}`, JSON.stringify({
      eventId: event.id,
      items,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutos
    }))

    toast.success('Ingressos reservados por 10 minutos')
    navigate(`/checkout/${resId}`)
  }

  const formatDateTime = (dateStr: string, timeStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }) + ` às ${timeStr}`
  }

  const mapQuery = encodeURIComponent(`${event.location}, ${event.address}, ${event.city}`)

  return (
    <div className="pb-40 md:pb-16">
      <div className="relative h-56 w-full overflow-hidden bg-muted sm:h-80">
        <img src={event.image_url} alt={`Imagem do evento ${event.title}`} className="h-full w-full object-cover" width={1280} height={854} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <div>
            <span className="chip">{event.category}</span>
            <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">{event.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">por {event.organizer}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="card-surface flex items-start gap-3 p-4">
              <CalendarDays className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Data e horário</p>
                <p className="text-sm font-semibold first-letter:uppercase">{formatDateTime(event.date, event.time)}</p>
              </div>
            </div>
            <div className="card-surface flex items-start gap-3 p-4">
              <MapPin className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Local</p>
                <p className="text-sm font-semibold">{event.location}</p>
                <p className="text-sm text-muted-foreground">{event.address} — {event.city}</p>
              </div>
            </div>
          </div>

          <section>
            <h2 className="mb-2 text-lg font-bold">Sobre o evento</h2>
            <p className="leading-relaxed text-muted-foreground">{event.description}</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold">Como chegar</h2>
            <div className="card-surface overflow-hidden">
              <iframe
                title={`Mapa de ${event.location}`}
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                className="h-64 w-full border-0"
                loading="lazy"
              />
            </div>
          </section>
        </div>

        {/* Seletor de ingressos */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="card-surface p-5">
            <h2 className="text-lg font-bold">Ingressos</h2>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> Reserva garantida por 10 minutos no checkout
            </p>

            <div className="mt-4 space-y-3">
              {event.ticket_types.map((t) => {
                const left = t.available_quantity
                return (
                  <div key={t.id} className="rounded-xl border border-border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{t.name}</p>
                        <p className="text-sm text-primary font-bold">{brl(t.price)}</p>
                        <p className="text-xs text-muted-foreground">
                          {left > 0 ? `${left} disponíveis` : 'Esgotado'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          aria-label={`Remover ${t.name}`}
                          onClick={() => change(t.id, -1, left)}
                          disabled={!qty[t.id]}
                          className="grid h-8 w-8 place-items-center rounded-full border border-border disabled:opacity-40"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-5 text-center font-bold">{qty[t.id] || 0}</span>
                        <button
                          aria-label={`Adicionar ${t.name}`}
                          onClick={() => change(t.id, 1, left)}
                          disabled={left === 0 || (qty[t.id] || 0) >= Math.min(left, 6)}
                          className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-secondary-foreground disabled:opacity-40"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span><span>{brl(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Taxa de serviço (10%)</span><span>{brl(fee)}</span>
              </div>
              <div className="flex justify-between text-base font-bold">
                <span>Total</span><span>{brl(subtotal + fee)}</span>
              </div>
            </div>

            <button
              onClick={goCheckout}
              disabled={totalQty === 0}
              className="mt-4 hidden w-full rounded-xl bg-primary py-3.5 font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-40 lg:block"
            >
              Comprar ingressos
            </button>
            <p className="mt-3 hidden items-center justify-center gap-1.5 text-xs text-muted-foreground lg:flex">
              <ShieldCheck className="h-3.5 w-3.5" /> Pagamento seguro via Pix ou cartão
            </p>
          </div>
        </aside>
      </div>

      {/* Barra fixa mobile */}
      <div className="fixed bottom-[58px] left-0 right-0 z-30 border-t border-border bg-background p-3 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">{totalQty} ingresso(s)</p>
            <p className="text-lg font-bold">{brl(subtotal + fee)}</p>
          </div>
          <button
            onClick={goCheckout}
            disabled={totalQty === 0}
            className="rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground disabled:opacity-40"
          >
            Comprar
          </button>
        </div>
      </div>
    </div>
  )
}
