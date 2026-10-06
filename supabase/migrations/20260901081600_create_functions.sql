-- Função para criar pedido
CREATE OR REPLACE FUNCTION indiepass.create_order(
  _cpf TEXT,
  _email TEXT,
  _event_id TEXT,
  _items JSONB,
  _name TEXT,
  _payment TEXT,
  _whatsapp TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = indiepass
AS $$
DECLARE
  order_id UUID;
  total_amount NUMERIC := 0;
  fee_amount NUMERIC := 0;
  item RECORD;
  ticket_type_id UUID;
  quantity INTEGER;
  price NUMERIC;
BEGIN
  -- Calcular total
  FOR item IN SELECT * FROM jsonb_to_recordset(_items) AS x(ticket_type_id TEXT, quantity INTEGER)
  LOOP
    SELECT price INTO price FROM indiepass.ticket_types WHERE id = item.ticket_type_id::UUID;
    total_amount := total_amount + (price * item.quantity);
  END LOOP;

  -- Calcular taxa (5%)
  fee_amount := total_amount * 0.05;

  -- Criar pedido
  INSERT INTO indiepass.orders (
    event_id, user_id, customer_name, customer_email, customer_cpf, 
    customer_whatsapp, payment_method, total_amount, fee_amount, status
  ) VALUES (
    _event_id::UUID, auth.uid(), _name, _email, _cpf, _whatsapp, 
    _payment, total_amount, fee_amount, 'pending'
  ) RETURNING id INTO order_id;

  -- Criar ingressos
  FOR item IN SELECT * FROM jsonb_to_recordset(_items) AS x(ticket_type_id TEXT, quantity INTEGER)
  LOOP
    FOR i IN 1..item.quantity LOOP
      INSERT INTO indiepass.tickets (
        order_id, event_id, ticket_type_id, attendee_name, attendee_cpf, qr_code_hash, status
      ) VALUES (
        order_id, _event_id::UUID, item.ticket_type_id::UUID, _name, _cpf, 
        encode(digest(order_id::TEXT || item.ticket_type_id || i::TEXT, 'sha256'), 'hex'),
        'valid'
      );
      
      -- Atualizar quantidade disponível
      UPDATE indiepass.ticket_types 
      SET available_quantity = available_quantity - 1
      WHERE id = item.ticket_type_id::UUID;
    END LOOP;
  END LOOP;

  RETURN order_id::TEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION indiepass.create_order TO authenticated;

-- Função para check-in de ingresso
CREATE OR REPLACE FUNCTION indiepass.check_in_ticket(_code TEXT)
RETURNS TABLE (
  attendee TEXT,
  event_title TEXT,
  message TEXT,
  ok BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = indiepass
AS $$
DECLARE
  ticket RECORD;
BEGIN
  -- Buscar ingresso pelo QR code
  SELECT t.*, e.title INTO ticket
  FROM indiepass.tickets t
  JOIN indiepass.events e ON e.id = t.event_id
  WHERE t.qr_code_hash = _code;

  IF NOT FOUND THEN
    RETURN QUERY SELECT ''::TEXT, ''::TEXT, 'Ingresso não encontrado'::TEXT, false;
    RETURN;
  END IF;

  IF ticket.checked_in_at IS NOT NULL THEN
    RETURN QUERY SELECT 
      ticket.attendee_name::TEXT, 
      ticket.event_title::TEXT, 
      'Ingresso já utilizado em ' || ticket.checked_in_at::TEXT::TEXT, 
      false;
    RETURN;
  END IF;

  -- Fazer check-in
  UPDATE indiepass.tickets 
  SET checked_in_at = now(), status = 'used'
  WHERE id = ticket.id;

  RETURN QUERY SELECT 
    ticket.attendee_name::TEXT, 
    ticket.event_title::TEXT, 
    'Check-in realizado com sucesso'::TEXT, 
    true;
END;
$$;

GRANT EXECUTE ON FUNCTION indiepass.check_in_ticket TO authenticated;

-- Função para obter ingressos de um pedido
CREATE OR REPLACE FUNCTION indiepass.get_order_tickets(_email TEXT, _order_id TEXT)
RETURNS TABLE (
  id TEXT,
  attendee_name TEXT,
  event_id TEXT,
  ticket_type TEXT,
  qr_code_hash TEXT,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = indiepass
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id::TEXT,
    t.attendee_name,
    t.event_id::TEXT,
    tt.name,
    t.qr_code_hash,
    t.status
  FROM indiepass.tickets t
  JOIN indiepass.ticket_types tt ON tt.id = t.ticket_type_id
  JOIN indiepass.orders o ON o.id = t.order_id
  WHERE o.id = _order_id::UUID
  AND o.customer_email = _email;
END;
$$;

GRANT EXECUTE ON FUNCTION indiepass.get_order_tickets TO authenticated;
