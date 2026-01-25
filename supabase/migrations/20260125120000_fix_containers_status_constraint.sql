-- Fix constraint for container status to match application values (Portuguese) and allow 'Ativo'
ALTER TABLE public.containers DROP CONSTRAINT IF EXISTS containers_status_check;

ALTER TABLE public.containers 
ADD CONSTRAINT containers_status_check 
CHECK (status IN (
  'Ativo', 
  'Parcial', 
  'Vazio', 
  'Pendente', 
  'Cheio', 
  'Fechado', 
  'Disponível', 
  'Ocupado', 
  'Manutenção'
));
