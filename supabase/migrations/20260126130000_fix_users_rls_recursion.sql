-- Migration to fix infinite recursion in users table RLS policies (Error 42P17)
-- This error occurs when a policy on the users table queries the users table itself recursively.

-- 1. Create a helper function to get the current user's organization_id securely.
-- This function is marked as SECURITY DEFINER, which means it executes with the privileges of the function creator (usually postgres).
-- This bypasses RLS on the users table within the function, preventing the infinite recursion loop.
CREATE OR REPLACE FUNCTION get_auth_user_organization_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT organization_id FROM users WHERE id = auth.uid() LIMIT 1;
$$;

-- Grant execution permissions to authenticated users and service role
GRANT EXECUTE ON FUNCTION get_auth_user_organization_id() TO authenticated, service_role;

-- 2. Drop all existing policies on the users table to ensure the recursive policy is removed.
-- We use a dynamic SQL block to drop policies by name since the exact names are unknown.
DO $$ 
DECLARE 
  r RECORD; 
BEGIN 
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users') LOOP 
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON users'; 
  END LOOP; 
END $$;

-- 3. Re-create essential policies using the non-recursive approach.

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to view their own profile.
-- Uses direct ID comparison, which is efficient and non-recursive.
CREATE POLICY "users_view_own_profile" ON users
FOR SELECT
USING (auth.uid() = id);

-- Policy: Allow users to view profiles of other users within the same organization.
-- Uses the SECURITY DEFINER helper function to safely fetch the current user's organization ID
-- without triggering RLS recursion on the users table.
CREATE POLICY "users_view_org_members" ON users
FOR SELECT
USING (organization_id = get_auth_user_organization_id());

-- Policy: Allow users to update their own profile.
CREATE POLICY "users_update_own_profile" ON users
FOR UPDATE
USING (auth.uid() = id);

-- Policy: Allow users to insert their own profile (if applicable)
CREATE POLICY "users_insert_own_profile" ON users
FOR INSERT
WITH CHECK (auth.uid() = id);
