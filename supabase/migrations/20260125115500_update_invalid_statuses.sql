-- Migration to fix invalid status values before applying the check constraint in 20260125120000
-- This ensures that the subsequent migration does not fail due to constraint violations

UPDATE public.containers 
SET status = 'Pendente' 
WHERE status NOT IN (
  'Ativo', 
  'Parcial', 
  'Vazio', 
  'Pendente', 
  'Cheio', 
  'Fechado', 
  'Disponível', 
  'Ocupado', 
  'Manutenção'
);
