-- Tornar campos bancários opcionais no perfil de produtor
ALTER TABLE indiepass.producer_profiles 
  ALTER COLUMN bank_code DROP NOT NULL,
  ALTER COLUMN agency DROP NOT NULL,
  ALTER COLUMN account_number DROP NOT NULL,
  ALTER COLUMN pix_key DROP NOT NULL,
  ALTER COLUMN pix_key_type DROP NOT NULL;
