import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { swaggerUI } from '@hono/swagger-ui'
import { handle } from '@hono/vercel'
import { eventsRouter } from '../src/api/routes/events'
import { ordersRouter } from '../src/api/routes/orders'
import { ticketsRouter } from '../src/api/routes/tickets'
import { healthRouter } from '../src/api/routes/health'

const app = new Hono()

// CORS para permitir requisições do IndieBanca
app.use('/*', cors({
  origin: ['http://localhost:3000', 'https://indiebanca.com', 'https://www.indiebanca.com'],
  credentials: true,
}))

// Rotas da API
app.route('/api/v1/health', healthRouter)
app.route('/api/v1/events', eventsRouter)
app.route('/api/v1/orders', ordersRouter)
app.route('/api/v1/tickets', ticketsRouter)

// Swagger UI
app.get('/api-docs', swaggerUI({ url: '/api-docs/openapi.json' }))

// OpenAPI specification
app.get('/api-docs/openapi.json', (c) => {
  return c.json({
    openapi: '3.0.0',
    info: {
      title: 'IndiePass API',
      version: '1.0.0',
      description: 'API para integração de eventos entre IndiePass e IndieBanca',
    },
    servers: [
      {
        url: 'https://indiepass.vercel.app',
        description: 'Servidor de produção',
      },
    ],
    paths: {
      '/api/v1/health': {
        get: {
          summary: 'Health check',
          description: 'Verifica se a API está funcionando',
          responses: {
            '200': {
              description: 'API funcionando',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string' },
                      timestamp: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/v1/events': {
        get: {
          summary: 'Listar eventos',
          description: 'Retorna todos os eventos publicados',
          parameters: [
            {
              name: 'limit',
              in: 'query',
              description: 'Número máximo de resultados',
              schema: { type: 'integer', default: 50 },
            },
            {
              name: 'offset',
              in: 'query',
              description: 'Número de resultados para pular',
              schema: { type: 'integer', default: 0 },
            },
          ],
          responses: {
            '200': {
              description: 'Lista de eventos',
            },
          },
        },
      },
      '/api/v1/events/:id': {
        get: {
          summary: 'Obter detalhes do evento',
          description: 'Retorna detalhes completos de um evento específico',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'ID do evento',
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'Detalhes do evento',
            },
            '404': {
              description: 'Evento não encontrado',
            },
          },
        },
      },
      '/api/v1/orders': {
        post: {
          summary: 'Criar pedido',
          description: 'Cria um novo pedido de ingressos',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['customer_email', 'items'],
                  properties: {
                    customer_email: { type: 'string', format: 'email' },
                    customer_name: { type: 'string' },
                    customer_cpf: { type: 'string' },
                    customer_whatsapp: { type: 'string' },
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        required: ['ticket_type_id', 'quantity'],
                        properties: {
                          ticket_type_id: { type: 'string' },
                          quantity: { type: 'integer' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Pedido criado com sucesso',
            },
            '400': {
              description: 'Dados inválidos',
            },
          },
        },
      },
    },
  })
})

export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)
export const PATCH = handle(app)
