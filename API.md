# IndiePass API - Integração via Supabase PostGREST

API REST nativa do Supabase para integração entre IndiePass e IndieBanca.

## 🌐 Base URL

```
https://zobbjjccwfsvwxqyasps.supabase.co/rest/v1
```

## 🔐 Autenticação

Use a anon key do Supabase nos headers:

```http
apikey: sb_publishable_YCLzrImiOaT0CpmSP1jqyg_pbCmhzLm
Authorization: Bearer sb_publishable_YCLzrImiOaT0CpmSP1jqyg_pbCmhzLm
Content-Type: application/json
```

## 📚 Endpoints

### 1. Listar Eventos

Retorna todos os eventos publicados.

```
GET /rest/v1/events?status=eq.published&select=*
```

**Exemplo:**
```bash
curl "https://zobbjjccwfsvwxqyasps.supabase.co/rest/v1/events?status=eq.published&select=*" \
  -H "apikey: sb_publishable_YCLzrImiOaT0CpmSP1jqyg_pbCmhzLm" \
  -H "Authorization: Bearer sb_publishable_YCLzrImiOaT0CpmSP1jqyg_pbCmhzLm"
```

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Festa Indie 2026",
    "description": "A maior festa do cenário independente",
    "date": "2026-11-15",
    "time": "20:00",
    "location": "São Paulo",
    "city": "São Paulo",
    "state": "SP",
    "image_url": "https://...",
    "status": "published",
    "category": "festa",
    "fee_payer": "buyer"
  }
]
```

---

### 2. Obter Detalhes do Evento

Retorna detalhes completos de um evento com tipos de ingresso.

```
GET /rest/v1/events?id=eq.{id}&select=*,ticket_types(*)
```

**Exemplo:**
```bash
curl "https://zobbjjccwfsvwxqyasps.supabase.co/rest/v1/events?id=eq.{EVENT_ID}&select=*,ticket_types(*)" \
  -H "apikey: sb_publishable_YCLzrImiOaT0CpmSP1jqyg_pbCmhzLm" \
  -H "Authorization: Bearer sb_publishable_YCLzrImiOaT0CpmSP1jqyg_pbCmhzLm"
```

---

### 3. Criar Pedido

Cria um novo pedido de ingressos (via RPC function).

```
POST /rest/v1/rpc/create_order
```

**Request Body:**
```json
{
  "p_customer_email": "cliente@email.com",
  "p_customer_name": "Nome Completo",
  "p_customer_cpf": "12345678901",
  "p_customer_whatsapp": "11999999999",
  "p_items": [
    {
      "ticket_type_id": "uuid",
      "quantity": 2
    }
  ]
}
```

**Exemplo:**
```bash
curl -X POST "https://zobbjjccwfsvwxqyasps.supabase.co/rest/v1/rpc/create_order" \
  -H "apikey: sb_publishable_YCLzrImiOaT0CpmSP1jqyg_pbCmhzLm" \
  -H "Authorization: Bearer sb_publishable_YCLzrImiOaT0CpmSP1jqyg_pbCmhzLm" \
  -H "Content-Type: application/json" \
  -d '{
    "p_customer_email": "cliente@email.com",
    "p_customer_name": "Nome Completo",
    "p_customer_cpf": "12345678901",
    "p_customer_whatsapp": "11999999999",
    "p_items": [
      {
        "ticket_type_id": "uuid",
        "quantity": 2
      }
    ]
  }'
```

---

### 4. Listar Ingressos

Retorna ingressos de um usuário.

```
GET /rest/v1/tickets?select=*
```

---

### 5. Check-in Ingresso

Realiza check-in de um ingresso (via RPC function).

```
POST /rest/v1/rpc/check_in_ticket
```

**Request Body:**
```json
{
  "ticket_id": "uuid"
}
```

---

### 6. Cancelar Ingresso

Cancela um ingresso com validação (via RPC function).

```
POST /rest/v1/rpc/cancel_ticket_with_validation
```

**Request Body:**
```json
{
  "ticket_id": "uuid"
}
```

---

## 💡 Exemplos de Uso

### JavaScript/TypeScript

```javascript
const SUPABASE_URL = 'https://zobbjjccwfsvwxqyasps.supabase.co'
const SUPABASE_KEY = 'sb_publishable_YCLzrImiOaT0CpmSP1jqyg_pbCmhzLm'

// Listar eventos
const response = await fetch(`${SUPABASE_URL}/rest/v1/events?status=eq.published&select=*`, {
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
  }
})
const events = await response.json()

// Criar pedido
const orderResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/create_order`, {
  method: 'POST',
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    p_customer_email: 'cliente@email.com',
    p_customer_name: 'Nome Completo',
    p_customer_cpf: '12345678901',
    p_customer_whatsapp: '11999999999',
    p_items: [
      {
        ticket_type_id: 'uuid',
        quantity: 2
      }
    ]
  })
})
const order = await orderResponse.json()
```

---

## 📝 Notas

- Esta API usa o PostGREST nativo do Supabase
- RLS (Row Level Security) controla o acesso aos dados
- Não há servidor adicional - usa a infraestrutura do Supabase
- Para operações complexas, use as RPC functions do Supabase

---

## 🔧 Integração com IndieBanca

Configure no IndieBanca:

```env
INDIEPASS_SUPABASE_URL=https://zobbjjccwfsvwxqyasps.supabase.co
INDIEPASS_SUPABASE_KEY=sb_publishable_YCLzrImiOaT0CpmSP1jqyg_pbCmhzLm
```

Use estes endpoints para listar eventos e criar pedidos diretamente no Supabase.
