-- Função para cancelar ingresso com validação de regras de negócio
CREATE OR REPLACE FUNCTION indiepass.cancel_ticket_with_validation(_ticket_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = indiepass
AS $$
DECLARE
  ticket_info RECORD;
  order_created_at TIMESTAMPTZ;
  event_date DATE;
  event_time TEXT;
  days_since_purchase NUMERIC;
  hours_until_event NUMERIC;
  result JSONB;
BEGIN
  -- Buscar informações do ingresso, pedido e evento
  SELECT 
    t.id, t.status, t.order_id, t.event_id, t.ticket_type_id,
    o.created_at, o.customer_email, o.customer_cpf,
    e.date, e.time
  INTO ticket_info
  FROM indiepass.tickets t
  JOIN indiepass.orders o ON o.id = t.order_id
  JOIN indiepass.events e ON e.id = t.event_id
  WHERE t.id = _ticket_id::UUID;

  IF NOT FOUND THEN
    result := jsonb_build_object('success', false, 'message', 'Ingresso não encontrado');
    RETURN result;
  END IF;

  IF ticket_info.status = 'cancelled' THEN
    result := jsonb_build_object('success', false, 'message', 'Ingresso já cancelado');
    RETURN result;
  END IF;

  IF ticket_info.status = 'used' THEN
    result := jsonb_build_object('success', false, 'message', 'Ingresso já utilizado');
    RETURN result;
  END IF;

  -- Calcular dias desde a compra
  days_since_purchase := EXTRACT(EPOCH FROM (now() - ticket_info.created_at)) / 86400;

  -- Calcular horas até o evento
  hours_until_event := EXTRACT(EPOCH FROM (ticket_info.date::timestamp + ticket_info.time::time - now())) / 3600;

  -- Validar regras de cancelamento
  -- Regra 1: Menos de 7 dias da compra
  IF days_since_purchase >= 7 THEN
    result := jsonb_build_object('success', false, 'message', 'Cancelamento permitido apenas até 7 dias após a compra');
    RETURN result;
  END IF;

  -- Regra 2: Mais de 48 horas antes do evento
  IF hours_until_event <= 48 THEN
    result := jsonb_build_object('success', false, 'message', 'Cancelamento permitido apenas até 48 horas antes do evento');
    RETURN result;
  END IF;

  -- Cancelar o ingresso
  UPDATE indiepass.tickets
  SET status = 'cancelled'
  WHERE id = _ticket_id::UUID;

  -- Liberar quantidade no lote
  UPDATE indiepass.ticket_types
  SET available_quantity = available_quantity + 1
  WHERE id = ticket_info.ticket_type_id;

  result := jsonb_build_object('success', true, 'message', 'Ingresso cancelado com sucesso');
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION indiepass.cancel_ticket_with_validation(TEXT) TO authenticated;

-- Função para vincular ingressos históricos quando usuário criar conta
CREATE OR REPLACE FUNCTION indiepass.link_historical_tickets(_user_id UUID, _email TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = indiepass
AS $$
DECLARE
  linked_count INTEGER := 0;
BEGIN
  -- Vincular pedidos sem user_id ao usuário
  UPDATE indiepass.orders 
  SET user_id = _user_id
  WHERE customer_email = _email AND user_id IS NULL;

  GET DIAGNOSTICS linked_count = ROW_COUNT;
  
  RETURN linked_count;
END;
$$;

GRANT EXECUTE ON FUNCTION indiepass.link_historical_tickets(UUID, TEXT) TO authenticated;
