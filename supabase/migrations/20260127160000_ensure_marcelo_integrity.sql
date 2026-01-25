-- Migration: Ensure Marcelo Integrity
-- Description: Ensures the user marcelo.rosas@vectracargo.com.br exists and has a valid password hash and organization link.

-- Ensure pgcrypto is available for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_org_id UUID;
  v_user_id UUID;
  v_email TEXT := 'marcelo.rosas@vectracargo.com.br';
  -- Clean email just in case
  v_clean_email TEXT := 'marcelo.rosas@vectracargo.com.br';
  -- Default password '123456' hashed with bcrypt
  v_encrypted_pw TEXT;
BEGIN
  -- 1. Get or Create Organization "Vectra Cargo"
  SELECT id INTO v_org_id FROM public.organizations WHERE name = 'Vectra Cargo' LIMIT 1;
  
  IF v_org_id IS NULL THEN
    INSERT INTO public.organizations (name, cnpj, trade_name, is_active)
    VALUES ('Vectra Cargo', '00000000000000', 'Vectra Cargo', true)
    RETURNING id INTO v_org_id;
  END IF;

  -- 2. Cleanup potential blocked email entries or spaces
  UPDATE auth.users 
  SET email = v_clean_email 
  WHERE email ILIKE '%marcelo.rosas@vectracargo.com.br%' 
  AND email != v_clean_email;

  -- 3. Resolve User ID
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_clean_email;

  -- Generate Hash for '123456'
  v_encrypted_pw := crypt('123456', gen_salt('bf'));

  -- 4. Create or Update auth.users
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, 
      instance_id, 
      email, 
      encrypted_password, 
      email_confirmed_at, 
      raw_app_meta_data, 
      raw_user_meta_data, 
      created_at, 
      updated_at, 
      role, 
      aud, 
      is_super_admin
    ) VALUES (
      v_user_id, 
      '00000000-0000-0000-0000-000000000000', 
      v_clean_email, 
      v_encrypted_pw, 
      now(), 
      jsonb_build_object('provider', 'email', 'providers', ARRAY['email'], 'organization_id', v_org_id), 
      jsonb_build_object('full_name', 'Marcelo Rosas'), 
      now(), 
      now(), 
      'authenticated', 
      'authenticated',
      false
    );
  ELSE
    -- Ensure password and confirmed status are set
    UPDATE auth.users
    SET encrypted_password = v_encrypted_pw,
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        raw_app_meta_data = jsonb_build_object('provider', 'email', 'providers', ARRAY['email'], 'organization_id', v_org_id),
        updated_at = now()
    WHERE id = v_user_id;
  END IF;

  -- 5. Sync to public.users (Idempotent)
  INSERT INTO public.users (id, email, full_name, organization_id, role, is_active)
  VALUES (v_user_id, v_clean_email, 'Marcelo Rosas', v_org_id, 'admin', true)
  ON CONFLICT (id) DO UPDATE
  SET 
    organization_id = EXCLUDED.organization_id,
    email = EXCLUDED.email,
    is_active = true;

END $$;
