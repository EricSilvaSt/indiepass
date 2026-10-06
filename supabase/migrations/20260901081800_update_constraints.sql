-- Atualizar constraints para status e payment_method conforme especificações

-- Adicionar CHECK constraints para eventos
ALTER TABLE indiepass.events ADD CONSTRAINT chk_events_status 
  CHECK (status IN ('published', 'draft', 'cancelled'));

ALTER TABLE indiepass.events ADD CONSTRAINT chk_events_fee_payer 
  CHECK (fee_payer IN ('buyer', 'producer'));

-- Adicionar CHECK constraints para pedidos
ALTER TABLE indiepass.orders ADD CONSTRAINT chk_orders_status 
  CHECK (status IN ('pending', 'approved', 'cancelled'));

ALTER TABLE indiepass.orders ADD CONSTRAINT chk_orders_payment_method 
  CHECK (payment_method IN ('pix', 'card'));

-- Adicionar CHECK constraints para ingressos
ALTER TABLE indiepass.tickets ADD CONSTRAINT chk_tickets_status 
  CHECK (status IN ('valid', 'used', 'cancelled'));

-- Adicionar CHECK constraints para producer_profiles
ALTER TABLE indiepass.producer_profiles ADD CONSTRAINT chk_producer_legal_type 
  CHECK (legal_type IN ('cpf', 'cnpj'));

-- Atualizar policy de orders para permitir compras sem login (usuários anônimos)
DROP POLICY IF EXISTS "Users can create own orders" ON indiepass.orders;
CREATE POLICY "Users can create own orders" ON indiepass.orders FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Atualizar policy de tickets para permitir visualização por email/CPF (para usuários não logados)
DROP POLICY IF EXISTS "Users can view own tickets" ON indiepass.tickets;
CREATE POLICY "Users can view own tickets" ON indiepass.tickets FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM indiepass.orders 
      WHERE orders.id = tickets.order_id AND orders.user_id = auth.uid()
    )
    OR
    auth.uid() IS NULL AND EXISTS (
      SELECT 1 FROM indiepass.orders 
      WHERE orders.id = tickets.order_id 
      AND orders.customer_email = (current_setting('request.jwt.claim.email', true))
    )
  );

-- Atualizar policy de orders para permitir visualização por email/CPF
DROP POLICY IF EXISTS "Users can view own orders" ON indiepass.orders;
CREATE POLICY "Users can view own orders" ON indiepass.orders FOR SELECT
  USING (
    auth.uid() = user_id
    OR
    (auth.uid() IS NULL AND customer_email = (current_setting('request.jwt.claim.email', true)))
  );
