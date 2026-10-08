# IndiePass API

API REST para integração entre IndiePass e IndieBanca, permitindo que usuários do IndieBanca comprem ingressos de eventos cadastrados no IndiePass sem sair da plataforma.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Autenticação](#autenticação)
- [Base URL](#base-url)
- [Endpoints](#endpoints)
- [Exemplos de Uso](#exemplos-de-uso)
- [Swagger UI](#swagger-ui)
- [Erros](#erros)

## 🎯 Visão Geral

A API IndiePass expõe endpoints para:
- Listar eventos disponíveis
- Obter detalhes de eventos específicos
- Criar pedidos de ingressos
- Consultar pedidos
- Obter detalhes de ingressos
- Realizar check-in de ingressos
- Cancelar ingressos

## 🔐 Autenticação

Atualmente, a API usa a **Anon Key** do Supabase para autenticação. Em produção, isso deve ser substituído por um sistema de autenticação mais robusto (API Keys, OAuth, etc.).

**Headers:**
```
apikey: <SUPABASE_ANON_KEY>
Authorization: Bearer <SUPABASE_ANON_KEY>
Content-Type: application/json
```

## 🌐 Base URL

**Desenvolvimento:**
```
http://localhost:8787/api/v1
```

**Produção:**
```
https://indiepass.com/api/v1
```

## 📚 Endpoints

### 1. Health Check

Verifica se a API está funcionando.

```
GET /api/v1/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-10-08T04:17:23.251Z",
  "service": "IndiePass API",
  "version": "1.0.0"
}
```

---

### 2. Listar Eventos

Retorna todos os eventos publicados.

```
GET /api/v1/events
```

**Query Parameters:**
- `limit` (opcional): Número máximo de resultados (default: 50, max: 100)
- `offset` (opcional): Número de resultados para pular (default: 0)

**Example:**
```
GET /api/v1/events?limit=10&offset=0
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
    "fee_payer": "buyer",
    "ticket_types": [
      {
        "id": "uuid",
        "name": "Pista",
        "price": 50.00,
        "available_quantity": 100
      }
    ]
  }
]
```

---

### 3. Obter Detalhes do Evento

Retorna detalhes completos de um evento específico.

```
GET /api/v1/events/:id
```

**Path Parameters:**
- `id`: ID do evento (UUID)

**Response:**
```json
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
  "fee_payer": "buyer",
  "ticket_types": [
    {
      "id": "uuid",
      "name": "Pista",
      "description": "Acesso à pista",
      "price": 50.00,
      "total_quantity": 200,
      "available_quantity": 100,
      "batch_number": 1
    }
  ]
}
```

**Errors:**
- `404`: Evento não encontrado

---

### 4. Criar Pedido

Cria um novo pedido de ingressos.

```
POST /api/v1/orders
```

**Request Body:**
```json
{
  "customer_email": "cliente@email.com",
  "customer_name": "Nome Completo",
  "customer_cpf": "12345678901",
  "customer_whatsapp": "11999999999",
  "items": [
    {
      "ticket_type_id": "uuid",
      "quantity": 2
    }
  ]
}
```

**Response (201):**
```json
{
  "order_id": "uuid",
  "total_amount": 100.00,
  "fee_amount": 10.00,
  "status": "pending",
  "tickets_count": 2
}
```

**Errors:**
- `400`: Dados inválidos ou quantidade indisponível
- `500`: Erro interno do servidor

---

### 5. Obter Detalhes do Pedido

Retorna detalhes de um pedido específico.

```
GET /api/v1/orders/:id
```

**Path Parameters:**
- `id`: ID do pedido (UUID)

**Response:**
```json
{
  "id": "uuid",
  "customer_email": "cliente@email.com",
  "customer_name": "Nome Completo",
  "total_amount": 100.00,
  "fee_amount": 10.00,
  "payment_method": "pix",
  "status": "pending",
  "created_at": "2026-10-08T04:17:23.251Z",
  "tickets": [
    {
      "id": "uuid",
      "qr_code_hash": "hash...",
      "status": "valid",
      "ticket_types": {
        "name": "Pista",
        "event_id": "uuid"
      }
    }
  ]
}
```

**Errors:**
- `404`: Pedido não encontrado

---

### 6. Obter Detalhes do Ingresso

Retorna detalhes de um ingresso específico.

```
GET /api/v1/tickets/:id
```

**Path Parameters:**
- `id`: ID do ingresso (UUID)

**Response:**
```json
{
  "id": "uuid",
  "qr_code_hash": "hash...",
  "status": "valid",
  "checked_in_at": null,
  "order_id": "uuid",
  "ticket_types": {
    "name": "Pista",
    "price": 50.00,
    "events": {
      "title": "Festa Indie 2026",
      "date": "2026-11-15",
      "time": "20:00",
      "location": "São Paulo"
    }
  }
}
```

**Errors:**
- `404`: Ingresso não encontrado

---

### 7. Realizar Check-in

Realiza o check-in de um ingresso no evento.

```
POST /api/v1/tickets/:id/check-in
```

**Path Parameters:**
- `id`: ID do ingresso (UUID)

**Response:**
```json
{
  "success": true,
  "checked_in_at": "2026-11-15T20:00:00.000Z"
}
```

**Errors:**
- `400`: Ingresso já usado, cancelado ou inválido

---

### 8. Cancelar Ingresso

Cancela um ingresso seguindo as regras:
- Menos de 7 dias da compra
- Mais de 48 horas antes do evento

```
POST /api/v1/tickets/:id/cancel
```

**Path Parameters:**
- `id`: ID do ingresso (UUID)

**Response:**
```json
{
  "success": true,
  "status": "cancelled"
}
```

**Errors:**
- `400`: Regras de cancelamento não atendidas

---

## 💡 Exemplos de Uso

### Exemplo 1: Listar eventos e criar pedido

```javascript
// 1. Listar eventos
const response = await fetch('http://localhost:8787/api/v1/events?limit=10')
const events = await response.json()

// 2. Criar pedido
const orderResponse = await fetch('http://localhost:8787/api/v1/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    customer_email: 'cliente@email.com',
    customer_name: 'Nome Completo',
    customer_cpf: '12345678901',
    customer_whatsapp: '11999999999',
    items: [
      {
        ticket_type_id: events[0].ticket_types[0].id,
        quantity: 2
      }
    ]
  })
})

const order = await orderResponse.json()
console.log('Pedido criado:', order.order_id)
```

### Exemplo 2: Realizar check-in

```javascript
const response = await fetch(`http://localhost:8787/api/v1/tickets/${ticketId}/check-in`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
})

const result = await response.json()
console.log('Check-in realizado:', result.success)
```

---

## 📖 Swagger UI

A documentação interativa da API está disponível em:

**Desenvolvimento:**
```
http://localhost:8787/api-docs
```

**Produção:**
```
https://indiepass.com/api-docs
```

No Swagger UI, você pode:
- Ver todos os endpoints
- Testar as requisições diretamente
- Ver os schemas de request/response
- Baixar a especificação OpenAPI

---

## ❌ Erros

A API usa códigos de status HTTP padrão:

- `200 OK`: Requisição bem-sucedida
- `201 Created`: Recurso criado com sucesso
- `400 Bad Request`: Dados inválidos ou erro de validação
- `404 Not Found`: Recurso não encontrado
- `500 Internal Server Error`: Erro interno do servidor

**Formato de erro:**
```json
{
  "error": "Mensagem descritiva do erro"
}
```

---

## 🔧 Desenvolvimento

### Executar a API

```bash
npm run dev:api
```

A API estará disponível em `http://localhost:8787`

### Executar o Frontend

```bash
npm run dev
```

O frontend estará disponível em `http://localhost:8080`

---

## 📝 Notas

- A API está em desenvolvimento e pode sofrer alterações
- Em produção, implementar autenticação robusta (OAuth, API Keys)
- Adicionar rate limiting para prevenir abuso
- Implementar logs e monitoramento
- Adicionar testes automatizados

---

## 🤝 Integração com IndieBanca

Para integrar o IndieBanca com a API IndiePass:

1. Configure a URL base da API nas variáveis de ambiente do IndieBanca
2. Use os endpoints de eventos para listar e exibir eventos no IndieBanca
3. Use o endpoint de criação de pedidos para processar compras
4. Implemente webhooks para receber notificações de status de pedidos (futuro)

**Exemplo de configuração no IndieBanca:**
```env
INDIEPASS_API_URL=https://indiepass.com/api/v1
INDIEPASS_API_KEY=<chave_de_autenticação>
```
