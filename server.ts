import 'dotenv/config'
import { serve } from '@hono/node-server'
import api from './src/api'

const port = 8787

console.log(`🚀 API Server running on http://localhost:${port}`)

serve({
  fetch: api.fetch,
  port,
})
