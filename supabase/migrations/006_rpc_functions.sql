-- ============================================
-- Missing RPC functions for variant tracking
-- ============================================

create or replace function public.increment_variant_views(variant_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.variants set views = views + 1 where id = variant_id;
end;
$$;

create or replace function public.increment_variant_conversions(variant_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.variants set conversions = conversions + 1 where id = variant_id;
end;
$$;
