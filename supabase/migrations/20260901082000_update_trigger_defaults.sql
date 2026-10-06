-- Atualizar trigger para usar valores padrão vazios para campos de endereço
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS indiepass.handle_new_user();

CREATE OR REPLACE FUNCTION indiepass.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = indiepass
AS $$
BEGIN
  INSERT INTO indiepass.profiles (id, full_name, whatsapp, role, cpf, address_street, address_number, address_city, address_state, address_zip)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'whatsapp', ''),
    CASE WHEN NEW.raw_user_meta_data ->> 'role' = 'producer' THEN 'producer'::indiepass.account_role
         ELSE 'buyer'::indiepass.account_role END,
    COALESCE(NEW.raw_user_meta_data ->> 'cpf', ''),
    '',
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION indiepass.handle_new_user();
