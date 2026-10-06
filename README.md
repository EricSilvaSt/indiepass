# IndieBanca

Plataforma de venda de ingressos para eventos com duas interfaces:
- **Para compradores**: Visualizar eventos, comprar ingressos, gerenciar meus ingressos
- **Para produtores**: Dashboard, criar eventos, fazer check-in de participantes

## Development

Requirements: Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-upgrade).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Database

Este projeto usa Supabase (self-hosted) com PostgreSQL. As migrations estão em `supabase/migrations/` e usam o schema `indiepass`.

Configure as variáveis de ambiente no arquivo `.env`:
```
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica
VITE_SUPABASE_URL=https://seu-supabase-url
DATABASE_URL=postgresql://postgres:senha@host:5432/postgres
```
