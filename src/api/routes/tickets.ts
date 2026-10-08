import { Hono } from 'hono'

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

async function supabaseRpc(functionName: string, params: any): Promise<any> {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/${functionName}`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'RPC failed')
  }

  return response.json()
}

export const ticketsRouter = new Hono()

// GET /api/v1/tickets/:id - Obter detalhes do ingresso
ticketsRouter.get('/:id', async (c) => {
  const id = c.req.param('id')

  try {
    const ticket = await supabaseQuery<any>('tickets', {
      select: 'id,qr_code_hash,status,checked_in_at,order_id,ticket_types(name,price,events(title,date,time,location))',
      eq: { id },
      single: true,
    })

    return c.json(ticket)
  } catch (error: any) {
    if (error.message.includes('PGRST116')) {
      return c.json({ error: 'Ingresso não encontrado' }, 404)
    }
    return c.json({ error: error.message }, 500)
  }
})

// POST /api/v1/tickets/:id/check-in - Realizar check-in
ticketsRouter.post('/:id/check-in', async (c) => {
  const id = c.req.param('id')

  try {
    const data = await supabaseRpc('check_in_ticket', { ticket_id: id })
    return c.json({ success: true, checked_in_at: data })
  } catch (error: any) {
    return c.json({ error: error.message }, 400)
  }
})

// POST /api/v1/tickets/:id/cancel - Cancelar ingresso
ticketsRouter.post('/:id/cancel', async (c) => {
  const id = c.req.param('id')

  try {
    await supabaseRpc('cancel_ticket_with_validation', { ticket_id: id })
    return c.json({ success: true, status: 'cancelled' })
  } catch (error: any) {
    return c.json({ error: error.message }, 400)
  }
})
