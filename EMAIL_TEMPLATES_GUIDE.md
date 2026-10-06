# Configuração de Templates de Email - IndiePass

## Status
✅ Campos bancários do produtor agora são opcionais
✅ Migration criada para tornar campos opcionais no banco
✅ Templates de email HTML bonitos criados (aguardando configuração no Supabase)

## Passos para Configurar Templates de Email no Supabase Self-Hosted

### 1. Aplicar Migration
Execute a migration `20260901082100_make_bank_fields_optional.sql` no SQL Editor do Supabase para tornar os campos bancários opcionais.

### 2. Configurar Templates de Email

No Supabase self-hosted, os templates de email são configurados via:

#### Opção A: Via Dashboard (Recomendado)
1. Acesse o Supabase Studio em `https://supabase.eria.tec.br/studio`
2. Vá em **Settings** → **Email Templates**
3. Configure os templates para:
   - **Confirm Signup** (Confirmação de cadastro)
   - **Reset Password** (Recuperação de senha)
   - **Magic Link** (Login mágico, se usar)

#### Opção B: Via API
Use a API do Supabase para configurar os templates. Exemplo:

```bash
curl -X POST https://supabase.eria.tec.br/auth/v1/admin/config/templates/confirm-signup \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d @confirm-signup-template.json
```

### 3. Atualizar URLs das Imagens nos Templates

Nos templates HTML criados, substitua:
- `https://seu-dominio.com/indiepass.jpg` → `https://supabase.eria.tec.br/indiepass.jpg`
- `https://seu-dominio.com/logo-eria.png` → `https://supabase.eria.tec.br/logo-eria.png`

### 4. Configurar SMTP (se ainda não configurado)

No arquivo `docker-compose.yml` do Supabase, configure as variáveis de email:

```yaml
SMTP_HOST: smtp.gmail.com
SMTP_PORT: 587
SMTP_USER: seu-email@gmail.com
SMTP_PASSWORD: sua-senha-de-app
SMTP_SENDER_NAME: IndiePass
SMTP_SENDER_EMAIL: contato@indiepass.com
```

## Templates Disponíveis

### 1. Confirm Signup (Confirmação de Cadastro)
- **ID**: `confirm-signup`
- **Subject**: "Confirme sua conta no IndiePass"
- **Features**:
  - Logo IndiePass no header
  - Gradiente roxo/azul
  - Logo ER.IA no footer
  - Botão de confirmação destacado
  - Layout responsivo

### 2. Reset Password (Recuperação de Senha)
- **ID**: `reset-password`
- **Subject**: "Redefina sua senha do IndiePass"
- **Features**:
  - Mesmo design do template de confirmação
  - Mensagem de segurança
  - Aviso de expiração (1 hora)

### 3. Purchase Confirmation (Confirmação de Compra)
- **ID**: `purchase-confirmation`
- **Subject**: "Confirmação de compra no IndiePass"
- **Features**:
  - Detalhes do evento
  - Informações do pedido
  - Card de ingresso estilizado
  - Total pago

## Logos Disponíveis

- `/indiepass.jpg` - Logo do IndiePass
- `/logo-eria.png` - Logo da ER.IA (copiada de `logo-eria (1024x1024).png`)

## Próximos Passos

1. Aplicar migration no banco
2. Configurar templates via Dashboard do Supabase
3. Testar envio de email de confirmação
4. Implementar envio de email de compra (precisa de trigger ou função)

## Observações

- Os templates HTML estão no arquivo `supabase/migrations/20260901082200_email_templates.sql`
- Este arquivo serve como documentação, mas os templates precisam ser configurados via Dashboard ou API
- Para envio de emails de compra, será necessário criar uma trigger ou função que chame um serviço de email externo
