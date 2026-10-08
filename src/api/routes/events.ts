import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!

async function supabaseQuery<T>(table: string, options: {
  select?: string
  eq?: Record<string, any>
  order?: { column: string; ascending: boolean }
  range?: { from: number; to: number }
  single?: boolean
}): Promise<T> {
  const params = new URLSearchParams()
  params.set('select', options.select || '*')

  if (options.eq) {
    Object.entries(options.eq).forEach(([key, value]) => {
      params.append(key, `eq.${value}`)
    })
  }

  if (options.order) {
    params.set('order', `${options.order.column}.${options.order.ascending ? 'asc' : 'desc'}`)
  }

  if (options.range) {
    params.set('offset', options.range.from.toString())
    params.set('limit', (options.range.to - options.range.from + 1).toString())
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${params}`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': options.single ? 'return=representation' : '',
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Query failed')
  }

  return options.single ? response.json() : response.json()
}

export const eventsRouter = new Hono()

// Schema para validação de parâmetros
const listEventsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})

// GET /api/v1/events - Listar eventos
eventsRouter.get('/', zValidator('query', listEventsSchema), async (c) => {
  const { limit, offset } = c.req.valid('query')

  try {
    const events = await supabaseQuery<any[]>('events', {
      select: 'id,title,description,date,time,location,city,state,image_url,status,category,fee_payer,ticket_types(id,name,price,available_quantity)',
      eq: { status: 'published' },
      order: { column: 'date', ascending: true },
      range: { from: offset, to: offset + limit - 1 },
    })

    return c.json(events)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// GET /api/v1/events/:id - Obter detalhes do evento
eventsRouter.get('/:id', async (c) => {
  const id = c.req.param('id')

  try {
    const event = await supabaseQuery<any>('events', {
      select: 'id,title,description,date,time,location,city,state,image_url,status,category,fee_payer,ticket_types(id,name,description,price,total_quantity,available_quantity,batch_number)',
      eq: { id },
      single: true,
    })

    return c.json(event)
  } catch (error: any) {
    if (error.message.includes('PGRST116')) {
      return c.json({ error: 'Evento não encontrado' }, 404)
    }
    return c.json({ error: error.message }, 500)
  }
})
