-- Migration: Fix User-Organization Association
-- Description: Ensures the user 'marcelo.rosas@vectracargo.com.br' exists in public.users 
-- and is correctly linked to an organization ('Vectra Cargo' or fallback).
-- This allows the application to resolve the organization_id even if it's missing from auth.users metadata.

DO $$
DECLARE
  v_org_id UUID;
  v_user_id UUID := '9ea4305a-b55f-4e7b-85b9-7c9aca8c37d7';
  v_email TEXT := 'marcelo.rosas@vectracargo.com.br';
  v_full_name TEXT := 'Marcelo Rosas';
BEGIN
  -- 1. Resolve Organization ID
  -- First, try to find the specific organization "Vectra Cargo"
  SELECT id INTO v_org_id FROM organizations WHERE name = 'Vectra Cargo' LIMIT 1;
  
  -- If not found, try to find the demo organization "Logística Demo" to use as fallback
  IF v_org_id IS NULL THEN
     SELECT id INTO v_org_id FROM organizations WHERE name = 'Logística Demo' LIMIT 1;
  END IF;

  -- If still not found (clean slate), create "Vectra Cargo" organization
  IF v_org_id IS NULL THEN
    INSERT INTO organizations (name, cnpj, trade_name, is_active)
    VALUES ('Vectra Cargo', '00000000000000', 'Vectra Cargo', true)
    RETURNING id INTO v_org_id;
  END IF;

  -- 2. Upsert User into public.users
  -- This ensures the user record exists and is linked to the resolved organization_id
  -- The ON CONFLICT clause ensures this is idempotent
  INSERT INTO public.users (id, email, full_name, organization_id, role, is_active)
  VALUES (v_user_id, v_email, v_full_name, v_org_id, 'admin', true)
  ON CONFLICT (id) DO UPDATE
  SET 
    organization_id = EXCLUDED.organization_id,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email;

END $$;
