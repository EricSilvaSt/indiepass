import { Link } from 'react-router-dom'
import { MapPin, CalendarDays } from 'lucide-react'
import { brl, formatDate } from '@/lib/types'

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

export function EventCard({ event }: { event: Event }) {
  const from = event.min_price || 0
  const soldOut = event.sold_out || false

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <Link to={`/evento/${event.id}`} className="group card-surface overflow-hidden transition hover:-translate-y-1">
      <div className="relative aspect-[3/2] overflow-hidden bg-muted">
        <img
          src={event.image_url}
          alt={`Imagem do evento ${event.title}`}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide">
          {event.category}
        </span>
        {soldOut && (
          <span className="absolute right-3 top-3 rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-secondary-foreground">
            Esgotado
          </span>
        )}
      </div>
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-2 text-base font-bold leading-snug">{event.title}</h3>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4 shrink-0" /> {formatDate(event.date)}
        </p>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" /> {event.location} · {event.city}
        </p>
        <p className="pt-1 text-sm font-bold text-primary">a partir de {brl(from)}</p>
      </div>
    </Link>
  )
}
