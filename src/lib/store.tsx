import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react'
import {
  Buyer, EventItem, Order, PaymentMethod, Reservation, Ticket, TicketType, SERVICE_FEE_RATE,
} from './types'
import showImg from '@/assets/event-show.jpg'
import feiraImg from '@/assets/event-feira.jpg'
import teatroImg from '@/assets/event-teatro.jpg'
import festaImg from '@/assets/event-festa.jpg'

const KEY = 'indiepass-db-v1'
export const HOLD_MINUTES = 10

const uid = () => Math.random().toString(36).slice(2, 10)
const code = () => Math.random().toString(36).slice(2, 8).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase()

const inDays = (d: number, h = 21) => {
  const date = new Date()
  date.setDate(date.getDate() + d)
  date.setHours(h, 0, 0, 0)
  return date.toISOString()
}

function seedEvents(): EventItem[] {
  const mk = (
    id: string, title: string, description: string, category: EventItem['category'], image: string,
    date: string, venue: string, address: string, city: string, organizer: string,
    lotes: [string, number, number, number][],
  ): EventItem => ({
    id, title, description, category, image, date, venue, address, city, organizer,
    ticketTypes: lotes.map(([name, price, quantity, sold], i) => ({
      id: `${id}-t${i}`, eventId: id, name, price, quantity, sold,
    })),
  })

  return [
    mk('ev1', 'Sarau Elétrico — Vol. 7',
      'Uma noite com três bandas autorais da cena independente, discotecagem até as 4h e feira de vinis no mezanino.',
      'Show', showImg, inDays(6, 21), 'Galpão Aurora', 'Rua dos Trilhos, 420 — Mooca', 'São Paulo', 'Coletivo Aurora',
      [['1º Lote', 40, 120, 118], ['2º Lote', 60, 150, 42], ['Meia-entrada', 30, 60, 12]]),
    mk('ev2', 'Feira Quintal Criativo',
      'Feira de artesanato, comida de rua e música ao vivo no quintal mais bonito do bairro. Entrada com contribuição consciente.',
      'Feira', feiraImg, inDays(3, 16), 'Quintal da Vila', 'Av. das Acácias, 88 — Vila Nova', 'Belo Horizonte', 'Quintal Produções',
      [['Entrada Solidária', 15, 300, 96], ['Apoio + Copo', 35, 100, 21]]),
    mk('ev3', 'Peça: O Último Ensaio',
      'Monólogo premiado sobre memória e reinvenção. Temporada curta, apenas quatro sessões, com bate-papo após o espetáculo.',
      'Teatro', teatroImg, inDays(12, 20), 'Teatro Pequeno Ato', 'Rua Coração de Maria, 15 — Centro', 'Porto Alegre', 'Cia. Pequeno Ato',
      [['Inteira', 70, 90, 33], ['Meia-entrada', 35, 90, 55]]),
    mk('ev4', 'Subsolo — Noite Techno',
      'Line-up local de techno e house com sistema de som analógico. 18+, documento obrigatório na entrada.',
      'Festa', festaImg, inDays(9, 23), 'Clube Subsolo', 'Rua da Praia, 700 — Comércio', 'Recife', 'Subsolo Records',
      [['Lote Promo', 25, 100, 100], ['1º Lote', 45, 200, 87], ['Lista Amigos', 35, 50, 9]]),
  ]
}

interface DB {
  events: EventItem[]
  orders: Order[]
  tickets: Ticket[]
  reservations: Reservation[]
}

const emptyDB = (): DB => ({ events: seedEvents(), orders: [], tickets: [], reservations: [] })

function load(): DB {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyDB()
    const parsed = JSON.parse(raw) as DB
    if (!parsed.events?.length) return emptyDB()
    return parsed
  } catch {
    return emptyDB()
  }
}

interface StoreCtx {
  db: DB
  events: EventItem[]
  getEvent: (id: string) => EventItem | undefined
  available: (t: TicketType) => number
  createEvent: (data: Omit<EventItem, 'id' | 'ticketTypes'>, lotes: Omit<TicketType, 'id' | 'eventId' | 'sold'>[]) => string
  createReservation: (eventId: string, items: { ticketTypeId: string; qty: number }[]) => string
  getReservation: (id: string) => Reservation | undefined
  releaseReservation: (id: string) => void
  confirmOrder: (reservationId: string, buyer: Buyer, payment: PaymentMethod) => Order
  checkIn: (ticketCode: string) => { ok: boolean; message: string; ticket?: Ticket }
  resetDemo: () => void
}

const Ctx = createContext<StoreCtx | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(() => load())

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(db))
  }, [db])

  // limpa reservas expiradas
  useEffect(() => {
    const t = setInterval(() => {
      setDb((prev) => {
        const active = prev.reservations.filter((r) => r.expiresAt > Date.now())
        return active.length === prev.reservations.length ? prev : { ...prev, reservations: active }
      })
    }, 5000)
    return () => clearInterval(t)
  }, [])

  const value = useMemo<StoreCtx>(() => {
    const reservedFor = (ticketTypeId: string) =>
      db.reservations
        .filter((r) => r.expiresAt > Date.now())
        .flatMap((r) => r.items)
        .filter((i) => i.ticketTypeId === ticketTypeId)
        .reduce((s, i) => s + i.qty, 0)

    return {
      db,
      events: [...db.events].sort((a, b) => +new Date(a.date) - +new Date(b.date)),
      getEvent: (id) => db.events.find((e) => e.id === id),
      available: (t) => Math.max(0, t.quantity - t.sold - reservedFor(t.id)),

      createEvent: (data, lotes) => {
        const id = 'ev-' + uid()
        const event: EventItem = {
          ...data,
          id,
          ticketTypes: lotes.map((l, i) => ({ ...l, id: `${id}-t${i}`, eventId: id, sold: 0 })),
        }
        setDb((p) => ({ ...p, events: [...p.events, event] }))
        return id
      },

      createReservation: (eventId, items) => {
        const id = 'res-' + uid()
        const reservation: Reservation = {
          id, eventId, items,
          expiresAt: Date.now() + HOLD_MINUTES * 60_000,
        }
        setDb((p) => ({ ...p, reservations: [...p.reservations, reservation] }))
        return id
      },

      getReservation: (id) => db.reservations.find((r) => r.id === id),

      releaseReservation: (id) =>
        setDb((p) => ({ ...p, reservations: p.reservations.filter((r) => r.id !== id) })),

      confirmOrder: (reservationId, buyer, payment) => {
        const res = db.reservations.find((r) => r.id === reservationId)!
        const event = db.events.find((e) => e.id === res.eventId)!
        const subtotal = res.items.reduce((s, i) => {
          const tt = event.ticketTypes.find((t) => t.id === i.ticketTypeId)!
          return s + tt.price * i.qty
        }, 0)
        const fee = Math.round(subtotal * SERVICE_FEE_RATE * 100) / 100
        const orderId = 'ord-' + uid()

        const tickets: Ticket[] = res.items.flatMap((i) =>
          Array.from({ length: i.qty }, () => ({
            id: 'tk-' + uid(),
            code: code(),
            orderId,
            eventId: event.id,
            ticketTypeId: i.ticketTypeId,
            holder: buyer.name,
            checkedInAt: null,
          })),
        )

        const order: Order = {
          id: orderId,
          eventId: event.id,
          buyer,
          items: res.items,
          subtotal,
          fee,
          total: subtotal + fee,
          payment,
          status: 'paid',
          createdAt: Date.now(),
          ticketIds: tickets.map((t) => t.id),
        }

        setDb((p) => ({
          ...p,
          orders: [order, ...p.orders],
          tickets: [...tickets, ...p.tickets],
          reservations: p.reservations.filter((r) => r.id !== reservationId),
          events: p.events.map((e) =>
            e.id !== event.id
              ? e
              : {
                  ...e,
                  ticketTypes: e.ticketTypes.map((t) => {
                    const item = res.items.find((i) => i.ticketTypeId === t.id)
                    return item ? { ...t, sold: t.sold + item.qty } : t
                  }),
                },
          ),
        }))

        return order
      },

      checkIn: (ticketCode) => {
        const clean = ticketCode.trim().toUpperCase()
        const ticket = db.tickets.find((t) => t.code === clean || t.id === clean)
        if (!ticket) return { ok: false, message: 'Ingresso não encontrado.' }
        if (ticket.checkedInAt) return { ok: false, message: 'Ingresso já utilizado.', ticket }
        setDb((p) => ({
          ...p,
          tickets: p.tickets.map((t) => (t.id === ticket.id ? { ...t, checkedInAt: Date.now() } : t)),
        }))
        return { ok: true, message: 'Check-in realizado!', ticket }
      },

      resetDemo: () => setDb(emptyDB()),
    }
  }, [db])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore deve ser usado dentro de StoreProvider')
  return ctx
}
