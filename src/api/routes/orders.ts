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

async function supabaseInsert<T>(table: string, data: any): Promise<T> {
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Insert failed')
  }

  return response.json()
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

export const ordersRouter = new Hono()

// Schema para criar pedido
const createOrderSchema = z.object({
  customer_email: z.string().email(),
  customer_name: z.string().min(3),
  customer_cpf: z.string().length(11),
  customer_whatsapp: z.string().min(10),
  items: z.array(
    z.object({
      ticket_type_id: z.string().uuid(),
      quantity: z.number().int().min(1),
    })
  ),
})

// POST /api/v1/orders - Criar pedido
ordersRouter.post('/', zValidator('json', createOrderSchema), async (c) => {
  const orderData = c.req.valid('json')

  // Calcular total
  let totalAmount = 0
  const itemsWithDetails = []

  for (const item of orderData.items) {
    try {
      const ticketType = await supabaseQuery<any>('ticket_types', {
        select: 'id,price,available_quantity,event_id',
        eq: { id: item.ticket_type_id },
        single: true,
      })

      if (!ticketType) {
        return c.json({ error: 'Tipo de ingresso não encontrado' }, 404)
      }

      if (ticketType.available_quantity < item.quantity) {
        return c.json({ error: 'Quantidade indisponível' }, 400)
      }

      totalAmount += ticketType.price * item.quantity
      itemsWithDetails.push({
        ticket_type_id: item.ticket_type_id,
        quantity: item.quantity,
        price: ticketType.price,
        event_id: ticketType.event_id,
      })
    } catch (error: any) {
      return c.json({ error: error.message }, 500)
    }
  }

  // Calcular taxa (10%)
  const feeAmount = totalAmount * 0.1

  // Criar pedido
  try {
    const order = await supabaseInsert<any>('orders', {
      customer_email: orderData.customer_email,
      customer_name: orderData.customer_name,
      customer_cpf: orderData.customer_cpf,
      customer_whatsapp: orderData.customer_whatsapp,
      total_amount: totalAmount,
      fee_amount: feeAmount,
      payment_method: 'pix',
      status: 'pending',
    })

    // Criar ingressos
    const tickets = []
    for (const item of itemsWithDetails) {
      for (let i = 0; i < item.quantity; i++) {
        tickets.push({
          order_id: order.id,
          ticket_type_id: item.ticket_type_id,
          event_id: item.event_id,
          attendee_name: orderData.customer_name,
          attendee_cpf: orderData.customer_cpf,
          status: 'valid',
        })
      }
    }

    await supabaseInsert('tickets', tickets)

    // Atualizar quantidade disponível (simplificado - em produção usar RPC)
    for (const item of itemsWithDetails) {
      // Aqui precisaria usar a função RPC update_available_quantity
      // Por enquanto, vamos usar um update direto (não ideal)
      const current = await supabaseQuery<any>('ticket_types', {
        select: 'available_quantity',
        eq: { id: item.ticket_type_id },
        single: true,
      })
      await fetch(`${supabaseUrl}/rest/v1/ticket_types?id=eq.${item.ticket_type_id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ available_quantity: current.available_quantity - item.quantity }),
      })
    }

    return c.json(
      {
        order_id: order.id,
        total_amount: totalAmount,
        fee_amount: feeAmount,
        status: order.status,
        tickets_count: tickets.length,
      },
      201
    )
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// GET /api/v1/orders/:id - Obter detalhes do pedido
ordersRouter.get('/:id', async (c) => {
  const id = c.req.param('id')

  try {
    const order = await supabaseQuery<any>('orders', {
      select: 'id,customer_email,customer_name,total_amount,fee_amount,payment_method,status,created_at,tickets(id,qr_code_hash,status,ticket_types(name,event_id))',
      eq: { id },
      single: true,
    })

    return c.json(order)
  } catch (error: any) {
    if (error.message.includes('PGRST116')) {
      return c.json({ error: 'Pedido não encontrado' }, 404)
    }
    return c.json({ error: error.message }, 500)
  }
})
