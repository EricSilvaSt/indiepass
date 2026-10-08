import { Hono } from 'hono'

export const healthRouter = new Hono()

healthRouter.get('/', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'IndiePass API',
    version: '1.0.0',
  })
})
