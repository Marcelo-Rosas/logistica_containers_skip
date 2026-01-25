-- Migration: Harden RLS Policies and Permissions
-- Description: Revoke public execute on helper function and update RLS policies to target 'authenticated' role explicitly.

-- 1. Secure the helper function
-- Revoke execution from public (anonymous users)
REVOKE EXECUTE ON FUNCTION get_auth_user_organization_id() FROM public;

-- Grant execution to authenticated users and service role only
GRANT EXECUTE ON FUNCTION get_auth_user_organization_id() TO authenticated, service_role;

-- 2. Update RLS Policies for specific tables
-- We will drop existing policies (to ensure no duplicates or "public" leftovers) and recreate them TO authenticated.

-- ==========================================
-- USERS TABLE
-- ==========================================
-- Note: users table policies were partly handled in previous migration, we enforce TO authenticated here.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_view_own_profile" ON users;
DROP POLICY IF EXISTS "users_view_org_members" ON users;
DROP POLICY IF EXISTS "users_update_own_profile" ON users;
DROP POLICY IF EXISTS "users_insert_own_profile" ON users;

CREATE POLICY "users_view_own_profile" ON users
FOR SELECT TO authenticated
USING (auth.uid() = id);

-- Securely fetch org members using the helper function (which uses SECURITY DEFINER)
CREATE POLICY "users_view_org_members" ON users
FOR SELECT TO authenticated
USING (organization_id = get_auth_user_organization_id());

CREATE POLICY "users_update_own_profile" ON users
FOR UPDATE TO authenticated
USING (auth.uid() = id);

CREATE POLICY "users_insert_own_profile" ON users
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

-- ==========================================
-- CONTAINERS TABLE
-- ==========================================
ALTER TABLE containers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "containers_select_policy" ON containers;
DROP POLICY IF EXISTS "containers_insert_policy" ON containers;
DROP POLICY IF EXISTS "containers_update_policy" ON containers;
DROP POLICY IF EXISTS "containers_delete_policy" ON containers;

CREATE POLICY "containers_select_policy" ON containers
FOR SELECT TO authenticated
USING (organization_id = get_auth_user_organization_id());

CREATE POLICY "containers_insert_policy" ON containers
FOR INSERT TO authenticated
WITH CHECK (organization_id = get_auth_user_organization_id());

CREATE POLICY "containers_update_policy" ON containers
FOR UPDATE TO authenticated
USING (organization_id = get_auth_user_organization_id());

CREATE POLICY "containers_delete_policy" ON containers
FOR DELETE TO authenticated
USING (organization_id = get_auth_user_organization_id());

-- ==========================================
-- CONTAINER_ITEMS TABLE
-- ==========================================
ALTER TABLE container_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "container_items_select_policy" ON container_items;
DROP POLICY IF EXISTS "container_items_insert_policy" ON container_items;
DROP POLICY IF EXISTS "container_items_update_policy" ON container_items;
DROP POLICY IF EXISTS "container_items_delete_policy" ON container_items;

CREATE POLICY "container_items_select_policy" ON container_items
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM containers c
    WHERE c.id = container_items.container_id
    AND c.organization_id = get_auth_user_organization_id()
  )
);

CREATE POLICY "container_items_insert_policy" ON container_items
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM containers c
    WHERE c.id = container_items.container_id
    AND c.organization_id = get_auth_user_organization_id()
  )
);

CREATE POLICY "container_items_update_policy" ON container_items
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM containers c
    WHERE c.id = container_items.container_id
    AND c.organization_id = get_auth_user_organization_id()
  )
);

CREATE POLICY "container_items_delete_policy" ON container_items
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM containers c
    WHERE c.id = container_items.container_id
    AND c.organization_id = get_auth_user_organization_id()
  )
);

-- ==========================================
-- CUSTOMERS TABLE
-- ==========================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "customers_select_policy" ON customers;
DROP POLICY IF EXISTS "customers_insert_policy" ON customers;
DROP POLICY IF EXISTS "customers_update_policy" ON customers;
DROP POLICY IF EXISTS "customers_delete_policy" ON customers;

CREATE POLICY "customers_select_policy" ON customers
FOR SELECT TO authenticated
USING (organization_id = get_auth_user_organization_id());

CREATE POLICY "customers_insert_policy" ON customers
FOR INSERT TO authenticated
WITH CHECK (organization_id = get_auth_user_organization_id());

CREATE POLICY "customers_update_policy" ON customers
FOR UPDATE TO authenticated
USING (organization_id = get_auth_user_organization_id());

CREATE POLICY "customers_delete_policy" ON customers
FOR DELETE TO authenticated
USING (organization_id = get_auth_user_organization_id());

-- ==========================================
-- SUPPLIERS TABLE
-- ==========================================
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "suppliers_select_policy" ON suppliers;
DROP POLICY IF EXISTS "suppliers_insert_policy" ON suppliers;
DROP POLICY IF EXISTS "suppliers_update_policy" ON suppliers;
DROP POLICY IF EXISTS "suppliers_delete_policy" ON suppliers;

CREATE POLICY "suppliers_select_policy" ON suppliers
FOR SELECT TO authenticated
USING (organization_id = get_auth_user_organization_id());

CREATE POLICY "suppliers_insert_policy" ON suppliers
FOR INSERT TO authenticated
WITH CHECK (organization_id = get_auth_user_organization_id());

CREATE POLICY "suppliers_update_policy" ON suppliers
FOR UPDATE TO authenticated
USING (organization_id = get_auth_user_organization_id());

CREATE POLICY "suppliers_delete_policy" ON suppliers
FOR DELETE TO authenticated
USING (organization_id = get_auth_user_organization_id());

-- ==========================================
-- PRODUCTS TABLE
-- ==========================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_select_policy" ON products;
DROP POLICY IF EXISTS "products_insert_policy" ON products;
DROP POLICY IF EXISTS "products_update_policy" ON products;
DROP POLICY IF EXISTS "products_delete_policy" ON products;

CREATE POLICY "products_select_policy" ON products
FOR SELECT TO authenticated
USING (organization_id = get_auth_user_organization_id());

CREATE POLICY "products_insert_policy" ON products
FOR INSERT TO authenticated
WITH CHECK (organization_id = get_auth_user_organization_id());

CREATE POLICY "products_update_policy" ON products
FOR UPDATE TO authenticated
USING (organization_id = get_auth_user_organization_id());

CREATE POLICY "products_delete_policy" ON products
FOR DELETE TO authenticated
USING (organization_id = get_auth_user_organization_id());

-- ==========================================
-- WAREHOUSES TABLE
-- ==========================================
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "warehouses_select_policy" ON warehouses;
DROP POLICY IF EXISTS "warehouses_insert_policy" ON warehouses;
DROP POLICY IF EXISTS "warehouses_update_policy" ON warehouses;
DROP POLICY IF EXISTS "warehouses_delete_policy" ON warehouses;

CREATE POLICY "warehouses_select_policy" ON warehouses
FOR SELECT TO authenticated
USING (organization_id = get_auth_user_organization_id());

CREATE POLICY "warehouses_insert_policy" ON warehouses
FOR INSERT TO authenticated
WITH CHECK (organization_id = get_auth_user_organization_id());

CREATE POLICY "warehouses_update_policy" ON warehouses
FOR UPDATE TO authenticated
USING (organization_id = get_auth_user_organization_id());

CREATE POLICY "warehouses_delete_policy" ON warehouses
FOR DELETE TO authenticated
USING (organization_id = get_auth_user_organization_id());

-- ==========================================
-- CONTAINER_MOVEMENTS TABLE
-- ==========================================
ALTER TABLE container_movements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "container_movements_select_policy" ON container_movements;
DROP POLICY IF EXISTS "container_movements_insert_policy" ON container_movements;
DROP POLICY IF EXISTS "container_movements_update_policy" ON container_movements;
DROP POLICY IF EXISTS "container_movements_delete_policy" ON container_movements;

CREATE POLICY "container_movements_select_policy" ON container_movements
FOR SELECT TO authenticated
USING (organization_id = get_auth_user_organization_id());

CREATE POLICY "container_movements_insert_policy" ON container_movements
FOR INSERT TO authenticated
WITH CHECK (organization_id = get_auth_user_organization_id());

CREATE POLICY "container_movements_update_policy" ON container_movements
FOR UPDATE TO authenticated
USING (organization_id = get_auth_user_organization_id());

CREATE POLICY "container_movements_delete_policy" ON container_movements
FOR DELETE TO authenticated
USING (organization_id = get_auth_user_organization_id());

-- ==========================================
-- RELEASE_REQUESTS TABLE
-- ==========================================
ALTER TABLE release_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "release_requests_select_policy" ON release_requests;
DROP POLICY IF EXISTS "release_requests_insert_policy" ON release_requests;
DROP POLICY IF EXISTS "release_requests_update_policy" ON release_requests;
DROP POLICY IF EXISTS "release_requests_delete_policy" ON release_requests;

CREATE POLICY "release_requests_select_policy" ON release_requests
FOR SELECT TO authenticated
USING (organization_id = get_auth_user_organization_id());

CREATE POLICY "release_requests_insert_policy" ON release_requests
FOR INSERT TO authenticated
WITH CHECK (organization_id = get_auth_user_organization_id());

CREATE POLICY "release_requests_update_policy" ON release_requests
FOR UPDATE TO authenticated
USING (organization_id = get_auth_user_organization_id());

CREATE POLICY "release_requests_delete_policy" ON release_requests
FOR DELETE TO authenticated
USING (organization_id = get_auth_user_organization_id());

-- ==========================================
-- RELEASE_REQUEST_ITEMS TABLE
-- ==========================================
ALTER TABLE release_request_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "release_request_items_select_policy" ON release_request_items;
DROP POLICY IF EXISTS "release_request_items_insert_policy" ON release_request_items;
DROP POLICY IF EXISTS "release_request_items_update_policy" ON release_request_items;
DROP POLICY IF EXISTS "release_request_items_delete_policy" ON release_request_items;

CREATE POLICY "release_request_items_select_policy" ON release_request_items
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM release_requests r
    WHERE r.id = release_request_items.release_request_id
    AND r.organization_id = get_auth_user_organization_id()
  )
);

CREATE POLICY "release_request_items_insert_policy" ON release_request_items
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM release_requests r
    WHERE r.id = release_request_items.release_request_id
    AND r.organization_id = get_auth_user_organization_id()
  )
);

CREATE POLICY "release_request_items_update_policy" ON release_request_items
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM release_requests r
    WHERE r.id = release_request_items.release_request_id
    AND r.organization_id = get_auth_user_organization_id()
  )
);

CREATE POLICY "release_request_items_delete_policy" ON release_request_items
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM release_requests r
    WHERE r.id = release_request_items.release_request_id
    AND r.organization_id = get_auth_user_organization_id()
  )
);

-- ==========================================
-- STORAGE_LOCATIONS TABLE
-- ==========================================
ALTER TABLE storage_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "storage_locations_select_policy" ON storage_locations;
DROP POLICY IF EXISTS "storage_locations_insert_policy" ON storage_locations;
DROP POLICY IF EXISTS "storage_locations_update_policy" ON storage_locations;
DROP POLICY IF EXISTS "storage_locations_delete_policy" ON storage_locations;

CREATE POLICY "storage_locations_select_policy" ON storage_locations
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM warehouses w
    WHERE w.id = storage_locations.warehouse_id
    AND w.organization_id = get_auth_user_organization_id()
  )
);

CREATE POLICY "storage_locations_insert_policy" ON storage_locations
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM warehouses w
    WHERE w.id = storage_locations.warehouse_id
    AND w.organization_id = get_auth_user_organization_id()
  )
);

CREATE POLICY "storage_locations_update_policy" ON storage_locations
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM warehouses w
    WHERE w.id = storage_locations.warehouse_id
    AND w.organization_id = get_auth_user_organization_id()
  )
);

CREATE POLICY "storage_locations_delete_policy" ON storage_locations
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM warehouses w
    WHERE w.id = storage_locations.warehouse_id
    AND w.organization_id = get_auth_user_organization_id()
  )
);

-- ==========================================
-- ORGANIZATIONS TABLE
-- ==========================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "organizations_select_policy" ON organizations;
DROP POLICY IF EXISTS "organizations_update_policy" ON organizations;

CREATE POLICY "organizations_select_policy" ON organizations
FOR SELECT TO authenticated
USING (id = get_auth_user_organization_id());

CREATE POLICY "organizations_update_policy" ON organizations
FOR UPDATE TO authenticated
USING (id = get_auth_user_organization_id());
