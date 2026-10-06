-- Revogar acesso público às funções para segurança
REVOKE EXECUTE ON FUNCTION indiepass.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION indiepass.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION indiepass.create_order(TEXT, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION indiepass.check_in_ticket(TEXT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION indiepass.cancel_ticket_with_validation(TEXT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION indiepass.get_order_tickets(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION indiepass.link_historical_tickets(UUID, TEXT) FROM PUBLIC, anon, authenticated;
