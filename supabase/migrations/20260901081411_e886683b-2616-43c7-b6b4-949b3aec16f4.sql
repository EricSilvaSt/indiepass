DROP TYPE IF EXISTS indiepass.account_role CASCADE;
CREATE TYPE indiepass.account_role AS ENUM ('buyer', 'producer');

DROP TABLE IF EXISTS indiepass.profiles CASCADE;
CREATE TABLE indiepass.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  whatsapp TEXT NOT NULL DEFAULT '',
  role indiepass.account_role NOT NULL DEFAULT 'buyer',
  cpf TEXT NOT NULL DEFAULT '',
  address_street TEXT NOT NULL DEFAULT '',
  address_number TEXT NOT NULL DEFAULT '',
  address_city TEXT NOT NULL DEFAULT '',
  address_state TEXT NOT NULL DEFAULT '',
  address_zip TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON indiepass.profiles TO authenticated;
GRANT ALL ON indiepass.profiles TO service_role;

ALTER TABLE indiepass.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON indiepass.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON indiepass.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON indiepass.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION indiepass.handle_new_user();

CREATE OR REPLACE FUNCTION indiepass.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = indiepass AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS profiles_set_updated_at ON indiepass.profiles;
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON indiepass.profiles
  FOR EACH ROW EXECUTE FUNCTION indiepass.set_updated_at();