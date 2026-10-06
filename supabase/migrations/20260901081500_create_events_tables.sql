-- Tabela de eventos
CREATE TABLE indiepass.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  date DATE NOT NULL,
  time TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  organizer TEXT NOT NULL DEFAULT '',
  producer_id UUID REFERENCES indiepass.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  fee_payer TEXT NOT NULL DEFAULT 'organizer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON indiepass.events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON indiepass.events TO authenticated;
GRANT ALL ON indiepass.events TO service_role;

ALTER TABLE indiepass.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are viewable by everyone" ON indiepass.events FOR SELECT USING (true);
CREATE POLICY "Producers can manage their events" ON indiepass.events FOR ALL 
  USING (auth.uid() = producer_id) 
  WITH CHECK (auth.uid() = producer_id);

CREATE INDEX idx_events_producer ON indiepass.events(producer_id);
CREATE INDEX idx_events_date ON indiepass.events(date);
CREATE INDEX idx_events_status ON indiepass.events(status);

-- Tabela de tipos de ingresso
CREATE TABLE indiepass.ticket_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES indiepass.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_quantity INTEGER NOT NULL DEFAULT 0,
  available_quantity INTEGER NOT NULL DEFAULT 0,
  batch_number INTEGER NOT NULL DEFAULT 1
);

GRANT SELECT ON indiepass.ticket_types TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON indiepass.ticket_types TO authenticated;
GRANT ALL ON indiepass.ticket_types TO service_role;

ALTER TABLE indiepass.ticket_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ticket types are viewable by everyone" ON indiepass.ticket_types FOR SELECT USING (true);
CREATE POLICY "Producers can manage ticket types for their events" ON indiepass.ticket_types FOR ALL
  USING (EXISTS (
    SELECT 1 FROM indiepass.events 
    WHERE events.id = ticket_types.event_id AND events.producer_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM indiepass.events 
    WHERE events.id = ticket_types.event_id AND events.producer_id = auth.uid()
  ));

CREATE INDEX idx_ticket_types_event ON indiepass.ticket_types(event_id);

-- Tabela de pedidos
CREATE TABLE indiepass.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES indiepass.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_cpf TEXT NOT NULL,
  customer_whatsapp TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  fee_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON indiepass.orders TO authenticated;
GRANT ALL ON indiepass.orders TO service_role;

ALTER TABLE indiepass.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders" ON indiepass.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON indiepass.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Producers can view orders for their events" ON indiepass.orders FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM indiepass.events 
    WHERE events.id = orders.event_id AND events.producer_id = auth.uid()
  ));

CREATE INDEX idx_orders_user ON indiepass.orders(user_id);
CREATE INDEX idx_orders_event ON indiepass.orders(event_id);
CREATE INDEX idx_orders_status ON indiepass.orders(status);

-- Tabela de ingressos
CREATE TABLE indiepass.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES indiepass.orders(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES indiepass.events(id) ON DELETE CASCADE,
  ticket_type_id UUID NOT NULL REFERENCES indiepass.ticket_types(id) ON DELETE CASCADE,
  attendee_name TEXT NOT NULL,
  attendee_cpf TEXT NOT NULL,
  qr_code_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'valid',
  checked_in_at TIMESTAMPTZ
);

GRANT SELECT, UPDATE ON indiepass.tickets TO authenticated;
GRANT ALL ON indiepass.tickets TO service_role;

ALTER TABLE indiepass.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tickets" ON indiepass.tickets FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM indiepass.orders 
    WHERE orders.id = tickets.order_id AND orders.user_id = auth.uid()
  ));
CREATE POLICY "Producers can view tickets for their events" ON indiepass.tickets FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM indiepass.events 
    WHERE events.id = tickets.event_id AND events.producer_id = auth.uid()
  ));
CREATE POLICY "Producers can check in tickets" ON indiepass.tickets FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM indiepass.events 
    WHERE events.id = tickets.event_id AND events.producer_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM indiepass.events 
    WHERE events.id = tickets.event_id AND events.producer_id = auth.uid()
  ));

CREATE INDEX idx_tickets_order ON indiepass.tickets(order_id);
CREATE INDEX idx_tickets_event ON indiepass.tickets(event_id);
CREATE INDEX idx_tickets_qr ON indiepass.tickets(qr_code_hash);
CREATE INDEX idx_tickets_status ON indiepass.tickets(status);

-- Tabela de perfis de produtores
CREATE TABLE indiepass.producer_profiles (
  user_id UUID PRIMARY KEY REFERENCES indiepass.profiles(id) ON DELETE CASCADE,
  legal_name TEXT NOT NULL DEFAULT '',
  legal_type TEXT NOT NULL DEFAULT '',
  doc_number TEXT NOT NULL DEFAULT '',
  bank_code TEXT NOT NULL DEFAULT '',
  agency TEXT NOT NULL DEFAULT '',
  account_number TEXT NOT NULL DEFAULT '',
  pix_key TEXT NOT NULL DEFAULT '',
  pix_key_type TEXT NOT NULL DEFAULT '',
  instagram TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON indiepass.producer_profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON indiepass.producer_profiles TO authenticated;
GRANT ALL ON indiepass.producer_profiles TO service_role;

ALTER TABLE indiepass.producer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Producer profiles are viewable by everyone" ON indiepass.producer_profiles FOR SELECT USING (true);
CREATE POLICY "Users can manage own producer profile" ON indiepass.producer_profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_producer_profiles_user ON indiepass.producer_profiles(user_id);
