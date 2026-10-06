-- Criar schema indiepass
CREATE SCHEMA IF NOT EXISTS indiepass;

-- Configurar permissões do schema
GRANT USAGE ON SCHEMA indiepass TO authenticated;
GRANT USAGE ON SCHEMA indiepass TO service_role;
GRANT ALL ON SCHEMA indiepass TO service_role;
