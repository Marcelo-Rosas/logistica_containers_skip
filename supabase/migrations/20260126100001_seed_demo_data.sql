-- Seed Data for Rodrigues & Marinho Scenario
DO $$
DECLARE
  v_org_id UUID;
  v_client_id UUID;
  v_container_id UUID;
  v_product_id UUID;
BEGIN
  -- Create Organization
  INSERT INTO organizations (name, cnpj, trade_name) 
  VALUES ('Logística Demo', '00000000000191', 'Logística Demo') 
  RETURNING id INTO v_org_id;

  -- Create Client
  INSERT INTO customers (organization_id, name, trade_name, email)
  VALUES (v_org_id, 'Rodrigues & Marinho Fitness Ltda', 'Rodrigues & Marinho', 'logistica@rodriguesmarinho.com.br')
  RETURNING id INTO v_client_id;

  -- Create Product
  INSERT INTO products (organization_id, name, code, default_net_weight)
  VALUES (v_org_id, 'Functional Trainer', 'LGLF-D61', 140)
  RETURNING id INTO v_product_id;

  -- Create Container
  INSERT INTO containers (
    organization_id, 
    container_number, 
    consignee_id, 
    status, 
    container_type,
    total_cbm,
    total_net_weight,
    total_volumes,
    initial_capacity_cbm,
    initial_total_net_weight,
    initial_total_volumes,
    arrival_date,
    storage_start_date,
    base_monthly_cost
  ) VALUES (
    v_org_id,
    'CMAU6623595',
    v_client_id,
    'Ativo',
    '40HC',
    55.0,
    5350.0,
    55,
    76.4,
    5350.0,
    55,
    '2026-01-25',
    '2026-01-26',
    3200.00
  ) RETURNING id INTO v_container_id;

  -- Add Items
  INSERT INTO container_items (
    container_id,
    product_name,
    product_code,
    item_number,
    original_quantity,
    available_quantity,
    unit_net_weight,
    total_net_weight,
    cbm
  ) VALUES 
  (v_container_id, 'Functional Trainer', 'LGLF-D61', 1, 15, 15, 140, 2100, 18.0),
  (v_container_id, 'New Treadmill', 'LG-T24 Max', 2, 10, 10, 160, 1600, 15.0),
  (v_container_id, 'Spinning Bike', 'PWHO-254', 3, 30, 30, 55, 1650, 22.0);

END $$;
