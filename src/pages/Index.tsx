import { useMemo, useState, useEffect } from 'react'
import { Search, MapPin, Sparkles, TrendingUp, Clock, ChevronRight, HelpCircle } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { EventCard } from '@/components/EventCard'
import { CATEGORIES } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

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
  min_price?: number
  sold_out?: boolean
}

export default function Index() {
  const [events, setEvents] = useState<Event[]>([])
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([])
  const [recentlyViewed, setRecentlyViewed] = useState<Event[]>([])
  const [topEvents, setTopEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [city, setCity] = useState('')
  const [cat, setCat] = useState<string>('')
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    loadEvents()
    loadFeaturedEvents()
    loadRecentlyViewed()
    loadTopEvents()
  }, [])

  // Auto-advance slider
  useEffect(() => {
    if (featuredEvents.length <= 1) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredEvents.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [featuredEvents.length])

  async function loadEvents() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          ticket_types (
            id,
            price,
            available_quantity,
            total_quantity
          )
        `)
        .eq('status', 'published')
        .order('date', { ascending: true })

      if (error) throw error

      const eventsWithDetails = (data || []).map((event: any) => {
        const ticketTypes = event.ticket_types || []
        const minPrice = ticketTypes.length > 0
          ? Math.min(...ticketTypes.map((t: any) => t.price))
          : 0
        const soldOut = ticketTypes.length > 0 &&
          ticketTypes.every((t: any) => t.available_quantity <= 0)

        return {
          ...event,
          min_price: minPrice,
          sold_out: soldOut
        }
      })

      setEvents(eventsWithDetails)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar eventos'
      const errorMap: Record<string, string> = {
        'Failed to fetch': 'Erro de conexão. Verifique sua internet.',
        'JWT expired': 'Sessão expirada. Faça login novamente.',
      }

      let errorMessage = errorMap[msg] || msg
      console.error('Error loading events:', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  async function loadFeaturedEvents() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .order('date', { ascending: true })
        .limit(5)

      if (error) throw error
      setFeaturedEvents(data || [])
    } catch (err) {
      console.error('Error loading featured events:', err)
    }
  }

  async function loadRecentlyViewed() {
    // Buscar eventos vistos recentemente do localStorage
    const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
    if (viewed.length === 0) return

    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .in('id', viewed)
        .limit(4)

      if (error) throw error
      setRecentlyViewed(data || [])
    } catch (err) {
      console.error('Error loading recently viewed:', err)
    }
  }

  async function loadTopEvents() {
    // Simulação - na prática seria baseado em vendas reais
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .order('date', { ascending: true })
        .limit(4)

      if (error) throw error
      setTopEvents(data || [])
    } catch (err) {
      console.error('Error loading top events:', err)
    }
  }

  const cities = useMemo(() => Array.from(new Set(events.map((e) => e.city))).sort(), [events])

  const filtered = useMemo(
    () =>
      events.filter(
        (e) =>
          (!q || e.title.toLowerCase().includes(q.toLowerCase()) || e.organizer.toLowerCase().includes(q.toLowerCase())) &&
          (!city || e.city === city) &&
          (!cat || e.category === cat),
      ),
    [events, q, city, cat],
  )

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const faqItems = [
    {
      question: 'Como comprar ingressos?',
      answer: 'Selecione o evento desejado, escolha a quantidade de ingressos e finalize o pagamento com Pix ou cartão de crédito. Você receberá o ingresso digital por e-mail.'
    },
    {
      question: 'Posso cancelar meu ingresso?',
      answer: 'Sim, você pode solicitar cancelamento até 7 dias após a compra e desde que faltem mais de 48 horas para o início do evento.'
    },
    {
      question: 'Como faço para criar um evento?',
      answer: 'Crie uma conta no IndiePass, acesse o painel do produtor e clique em "Criar evento". Preencha as informações e publique!'
    },
    {
      question: 'Quais formas de pagamento aceitas?',
      answer: 'Aceitamos Pix e cartões de crédito (Visa, Mastercard, Elo, American Express).'
    }
  ]

  return (
    <div className="pb-16 md:pb-8">
      {/* Hero Slider */}
      {featuredEvents.length > 0 && (
        <section className="ink-surface">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 to-purple-500/20">
              <div className="relative z-10 p-8 sm:p-12">
                <div className="grid gap-8 sm:grid-cols-2">
                  <div>
                    <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                      <Sparkles className="h-3.5 w-3.5" /> Destaques
                    </p>
                    <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.05] text-white sm:text-5xl md:text-6xl">
                      {featuredEvents[currentSlide]?.title || 'Eventos incríveis te esperam'}
                    </h1>
                    <p className="mt-4 max-w-xl text-white/70">
                      {featuredEvents[currentSlide]?.description || 'Cena independente, do bairro para o mundo'}
                    </p>
                    <Link
                      to={`/evento/${featuredEvents[currentSlide]?.id}`}
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-primary transition hover:bg-white/90"
                    >
                      Ver evento <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="hidden sm:block">
                    <img
                      src={featuredEvents[currentSlide]?.image_url}
                      alt={featuredEvents[currentSlide]?.title}
                      className="h-64 w-full rounded-xl object-cover shadow-2xl"
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Slider indicators */}
            <div className="mt-4 flex justify-center gap-2">
              {featuredEvents.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={cn(
                    'h-2 w-2 rounded-full transition',
                    index === currentSlide ? 'bg-primary w-8' : 'bg-white/30'
                  )}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Busca */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-3 rounded-2xl bg-background p-3 text-foreground sm:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar evento ou produtor"
              aria-label="Buscar evento"
              className="field pl-9"
            />
          </div>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              aria-label="Filtrar por cidade"
              className="field pl-9 sm:w-52"
            >
              <option value="">Todas as cidades</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => { setQ(''); setCity(''); setCat('') }}
            className="rounded-xl bg-secondary px-5 py-3 text-sm font-semibold text-secondary-foreground"
          >
            Limpar
          </button>
        </div>
      </section>

      {/* Categorias */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setCat('')} className={cn('chip', !cat && 'chip-active')}>Tudo</button>
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={cn('chip', cat === c && 'chip-active')}>
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Lista de eventos */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h2 className="mb-5 text-xl font-bold">
          {loading ? 'Carregando...' : `${filtered.length} ${filtered.length === 1 ? 'evento encontrado' : 'eventos encontrados'}`}
        </h2>
        {loading ? (
          <div className="text-center py-10">Carregando eventos...</div>
        ) : filtered.length === 0 ? (
          <p className="card-surface p-10 text-center text-muted-foreground">
            Nenhum evento com esses filtros. Tente outra busca.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        )}
      </section>

      {/* Vistos recentemente */}
      {recentlyViewed.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <h2 className="mb-5 text-xl font-bold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" /> Vistos recentemente
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {recentlyViewed.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}

      {/* Eventos mais comprados */}
      {topEvents.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <h2 className="mb-5 text-xl font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> Eventos mais comprados das últimas 24 horas
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {topEvents.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}

      {/* Banner para produtores */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="card-surface overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-purple-600 p-8 text-white">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h2 className="text-2xl font-extrabold">IndiePass para produtores</h2>
              <p className="mt-2 text-white/80">
                Crie eventos, venda ingressos e gerencie tudo em um só lugar. Sem taxas abusivas, sem complicação.
              </p>
              <Link
                to="/produtor"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-primary transition hover:bg-white/90"
              >
                Começar agora <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="hidden sm:flex items-center justify-center">
              <div className="text-6xl">🎪</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h2 className="mb-6 text-2xl font-bold flex items-center gap-2">
          <HelpCircle className="h-6 w-6 text-primary" /> Perguntas Frequentes
        </h2>
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div key={index} className="card-surface p-5">
              <h3 className="font-bold text-lg">{item.question}</h3>
              <p className="mt-2 text-muted-foreground">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
