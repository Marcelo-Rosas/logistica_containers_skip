-- Add columns to support hierarchical calculation and initial states
ALTER TABLE public.containers 
ADD COLUMN IF NOT EXISTS container_type TEXT DEFAULT '40HC',
ADD COLUMN IF NOT EXISTS initial_capacity_cbm NUMERIC DEFAULT 76.4,
ADD COLUMN IF NOT EXISTS initial_total_net_weight NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS initial_total_volumes NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS base_monthly_cost NUMERIC DEFAULT 3000.00;

-- Function to handle exit events and update metrics automatically
CREATE OR REPLACE FUNCTION register_exit_event(
  p_container_id UUID,
  p_item_id UUID,
  p_quantity NUMERIC,
  p_doc_number TEXT,
  p_destination TEXT,
  p_responsible TEXT,
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_item RECORD;
  v_container RECORD;
  v_movement_id UUID;
  v_vol_to_remove NUMERIC;
  v_weight_to_remove NUMERIC;
BEGIN
  -- Get Item
  SELECT * INTO v_item FROM container_items WHERE id = p_item_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Item not found'; END IF;

  -- Get Container
  SELECT * INTO v_container FROM containers WHERE id = p_container_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Container not found'; END IF;

  -- Calculate removals
  v_vol_to_remove := (v_item.cbm / NULLIF(v_item.original_quantity, 0)) * p_quantity;
  v_weight_to_remove := (v_item.unit_net_weight) * p_quantity;

  -- Insert Movement
  INSERT INTO container_movements (
    container_id,
    movement_type,
    description,
    from_status,
    to_status,
    performed_by_user_id,
    organization_id,
    metadata
  ) VALUES (
    p_container_id,
    'exit',
    'Saída de item: ' || v_item.product_name,
    v_container.status,
    CASE WHEN (v_container.total_volumes - p_quantity) <= 0 THEN 'Vazio' ELSE 'Parcial' END,
    p_user_id,
    v_container.organization_id,
    jsonb_build_object(
      'sku', v_item.product_code,
      'quantity', p_quantity,
      'doc_number', p_doc_number,
      'destination', p_destination,
      'responsible', p_responsible,
      'volume_removed', v_vol_to_remove,
      'weight_removed', v_weight_to_remove
    )
  ) RETURNING id INTO v_movement_id;

  -- Update Item
  UPDATE container_items 
  SET 
    available_quantity = available_quantity - p_quantity,
    released_quantity = COALESCE(released_quantity, 0) + p_quantity
  WHERE id = p_item_id;

  -- Update Container Metrics
  UPDATE containers
  SET 
    total_volumes = GREATEST(0, total_volumes - p_quantity),
    total_cbm = GREATEST(0, total_cbm - COALESCE(v_vol_to_remove, 0)),
    total_net_weight = GREATEST(0, total_net_weight - COALESCE(v_weight_to_remove, 0)),
    status = CASE WHEN (total_volumes - p_quantity) <= 0 THEN 'Vazio' ELSE 'Parcial' END,
    updated_at = NOW()
  WHERE id = p_container_id;

  RETURN jsonb_build_object('success', true, 'movement_id', v_movement_id);
END;
$$ LANGUAGE plpgsql;
