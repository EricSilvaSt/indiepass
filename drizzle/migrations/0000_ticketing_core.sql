ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cpf text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS address_street text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS address_number text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS address_city text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS address_state text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS address_zip text NOT NULL DEFAULT '';

CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Show',
  date timestamptz NOT NULL,
  time text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  organizer text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  fee_payer text NOT NULL DEFAULT 'buyer' CHECK (fee_payer IN ('buyer','producer')),
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published','draft','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads published events" ON public.events FOR SELECT TO anon, authenticated USING (status = 'published' OR producer_id = auth.uid());
CREATE POLICY "Producer inserts own events" ON public.events FOR INSERT TO authenticated WITH CHECK (producer_id = auth.uid());
CREATE POLICY "Producer updates own events" ON public.events FOR UPDATE TO authenticated USING (producer_id = auth.uid()) WITH CHECK (producer_id = auth.uid());
CREATE POLICY "Producer deletes own events" ON public.events FOR DELETE TO authenticated USING (producer_id = auth.uid());

CREATE TABLE public.ticket_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  total_quantity int NOT NULL CHECK (total_quantity > 0),
  available_quantity int NOT NULL CHECK (available_quantity >= 0),
  batch_number int NOT NULL DEFAULT 1
);
GRANT SELECT ON public.ticket_types TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ticket_types TO authenticated;
GRANT ALL ON public.ticket_types TO service_role;
ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read ticket types of visible events" ON public.ticket_types FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND (e.status = 'published' OR e.producer_id = auth.uid())));
CREATE POLICY "Producer manages ticket types" ON public.ticket_types FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.producer_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.producer_id = auth.uid()));

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_cpf text NOT NULL,
  customer_whatsapp text NOT NULL,
  total_amount numeric(10,2) NOT NULL,
  fee_amount numeric(10,2) NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('pix','card')),
  status text NOT NULL DEFAULT 'approved' CHECK (status IN ('pending','approved','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Buyer reads own orders" ON public.orders FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR lower(customer_email) = lower(coalesce(auth.jwt() ->> 'email','')));
CREATE POLICY "Producer reads event orders" ON public.orders FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.producer_id = auth.uid()));

CREATE TABLE public.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  ticket_type_id uuid NOT NULL REFERENCES public.ticket_types(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  attendee_name text NOT NULL,
  attendee_cpf text NOT NULL,
  qr_code_hash text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'valid' CHECK (status IN ('valid','used','cancelled')),
  checked_in_at timestamptz
);
GRANT SELECT ON public.tickets TO authenticated;
GRANT ALL ON public.tickets TO service_role;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Buyer reads own tickets" ON public.tickets FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR lower(o.customer_email) = lower(coalesce(auth.jwt() ->> 'email','')))));
CREATE POLICY "Producer reads event tickets" ON public.tickets FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.producer_id = auth.uid()));

CREATE TABLE public.producer_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  legal_type text NOT NULL DEFAULT 'cpf' CHECK (legal_type IN ('cpf','cnpj')),
  doc_number text NOT NULL DEFAULT '',
  legal_name text NOT NULL DEFAULT '',
  pix_key_type text NOT NULL DEFAULT '',
  pix_key text NOT NULL DEFAULT '',
  bank_code text NOT NULL DEFAULT '',
  agency text NOT NULL DEFAULT '',
  account_number text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  instagram text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.producer_profiles TO authenticated;
GRANT ALL ON public.producer_profiles TO service_role;
ALTER TABLE public.producer_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own producer profile select" ON public.producer_profiles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Own producer profile insert" ON public.producer_profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Own producer profile update" ON public.producer_profiles FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.create_order(
  _event_id uuid, _items jsonb, _name text, _email text, _cpf text, _whatsapp text, _payment text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _order uuid; _item jsonb; _tt public.ticket_types; _qty int; _subtotal numeric := 0; _fee numeric; _payer text; i int;
BEGIN
  IF length(trim(_name)) < 3 OR _email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' OR length(regexp_replace(_cpf,'\D','','g')) <> 11 THEN
    RAISE EXCEPTION 'Dados do comprador inválidos';
  END IF;
  IF _payment NOT IN ('pix','card') THEN RAISE EXCEPTION 'Pagamento inválido'; END IF;
  SELECT fee_payer INTO _payer FROM events WHERE id = _event_id AND status = 'published' AND date > now();
  IF NOT FOUND THEN RAISE EXCEPTION 'Evento indisponível'; END IF;

  FOR _item IN SELECT * FROM jsonb_array_elements(_items) LOOP
    _qty := (_item->>'qty')::int;
    IF _qty < 1 OR _qty > 6 THEN RAISE EXCEPTION 'Quantidade inválida'; END IF;
    SELECT * INTO _tt FROM ticket_types WHERE id = (_item->>'ticket_type_id')::uuid AND event_id = _event_id FOR UPDATE;
    IF NOT FOUND OR _tt.available_quantity < _qty THEN RAISE EXCEPTION 'Ingressos esgotados para %', coalesce(_tt.name,'lote'); END IF;
    _subtotal := _subtotal + _tt.price * _qty;
  END LOOP;

  _fee := round(_subtotal * 0.10, 2);
  INSERT INTO orders (user_id, event_id, customer_name, customer_email, customer_cpf, customer_whatsapp, total_amount, fee_amount, payment_method, status)
  VALUES (auth.uid(), _event_id, trim(_name), lower(trim(_email)), _cpf, _whatsapp,
          CASE WHEN _payer = 'buyer' THEN _subtotal + _fee ELSE _subtotal END, _fee, _payment, 'approved')
  RETURNING id INTO _order;

  FOR _item IN SELECT * FROM jsonb_array_elements(_items) LOOP
    _qty := (_item->>'qty')::int;
    UPDATE ticket_types SET available_quantity = available_quantity - _qty WHERE id = (_item->>'ticket_type_id')::uuid;
    FOR i IN 1.._qty LOOP
      INSERT INTO tickets (order_id, ticket_type_id, event_id, attendee_name, attendee_cpf, qr_code_hash)
      VALUES (_order, (_item->>'ticket_type_id')::uuid, _event_id, trim(_name), _cpf,
              upper(substr(md5(gen_random_uuid()::text),1,6) || '-' || substr(md5(gen_random_uuid()::text),1,4)));
    END LOOP;
  END LOOP;
  RETURN _order;
END $$;

CREATE OR REPLACE FUNCTION public.get_order_tickets(_order_id uuid, _email text)
RETURNS TABLE (id uuid, qr_code_hash text, attendee_name text, status text, ticket_type text, event_id uuid)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT t.id, t.qr_code_hash, t.attendee_name, t.status, tt.name, t.event_id
  FROM tickets t JOIN orders o ON o.id = t.order_id JOIN ticket_types tt ON tt.id = t.ticket_type_id
  WHERE o.id = _order_id AND o.customer_email = lower(trim(_email));
$$;

CREATE OR REPLACE FUNCTION public.cancel_ticket(_ticket_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _t tickets; _o orders; _e events;
BEGIN
  SELECT * INTO _t FROM tickets WHERE id = _ticket_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Ingresso não encontrado'; END IF;
  SELECT * INTO _o FROM orders WHERE id = _t.order_id;
  SELECT * INTO _e FROM events WHERE id = _t.event_id;
  IF auth.uid() IS NULL OR NOT (_o.user_id = auth.uid() OR _o.customer_email = lower(coalesce(auth.jwt()->>'email',''))) THEN
    RAISE EXCEPTION 'Sem permissão';
  END IF;
  IF _t.status <> 'valid' THEN RAISE EXCEPTION 'Ingresso não pode ser cancelado'; END IF;
  IF _o.created_at < now() - interval '7 days' THEN RAISE EXCEPTION 'Prazo de 7 dias após a compra expirado'; END IF;
  IF _e.date < now() + interval '48 hours' THEN RAISE EXCEPTION 'Cancelamento só até 48h antes do evento'; END IF;
  UPDATE tickets SET status = 'cancelled' WHERE id = _ticket_id;
  UPDATE ticket_types SET available_quantity = available_quantity + 1 WHERE id = _t.ticket_type_id;
  IF NOT EXISTS (SELECT 1 FROM tickets WHERE order_id = _o.id AND status <> 'cancelled') THEN
    UPDATE orders SET status = 'cancelled' WHERE id = _o.id;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.check_in_ticket(_code text)
RETURNS TABLE (ok boolean, message text, attendee text, event_title text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _t tickets; _e events;
BEGIN
  SELECT * INTO _t FROM tickets WHERE qr_code_hash = upper(trim(_code)) FOR UPDATE;
  IF NOT FOUND THEN RETURN QUERY SELECT false, 'Ingresso não encontrado.'::text, NULL::text, NULL::text; RETURN; END IF;
  SELECT * INTO _e FROM events WHERE id = _t.event_id;
  IF _e.producer_id IS DISTINCT FROM auth.uid() THEN
    RETURN QUERY SELECT false, 'Este ingresso não é de um evento seu.'::text, NULL::text, NULL::text; RETURN;
  END IF;
  IF _t.status = 'used' THEN RETURN QUERY SELECT false, 'Ingresso já utilizado.'::text, _t.attendee_name, _e.title; RETURN; END IF;
  IF _t.status = 'cancelled' THEN RETURN QUERY SELECT false, 'Ingresso cancelado.'::text, _t.attendee_name, _e.title; RETURN; END IF;
  UPDATE tickets SET status = 'used', checked_in_at = now() WHERE id = _t.id;
  RETURN QUERY SELECT true, 'Check-in realizado!'::text, _t.attendee_name, _e.title;
END $$;

REVOKE EXECUTE ON FUNCTION public.create_order(uuid, jsonb, text, text, text, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_order_tickets(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cancel_ticket(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_in_ticket(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_order(uuid, jsonb, text, text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_order_tickets(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_ticket(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_in_ticket(text) TO authenticated;