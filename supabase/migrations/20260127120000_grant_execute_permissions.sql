-- Migration: Ensure Execute Permissions for Authenticated Users
-- Description: Explicitly grant EXECUTE permission on get_auth_user_organization_id to authenticated role
-- to satisfy acceptance criteria and ensure no permission errors occur during data access.

GRANT EXECUTE ON FUNCTION public.get_auth_user_organization_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_auth_user_organization_id() TO service_role;

