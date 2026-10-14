-- GOOD THINGS v1.7: sourced barcode groceries with structured per-100g nutrition and crowdsourced store reports.
-- Existing 102 catalogue rows and their user ratings remain untouched.
alter table public.gt_products add column if not exists source_type text;
alter table public.gt_products add column if not exists quantity text;
alter table public.gt_products add column if not exists stores_reported text;
alter table public.gt_products add column if not exists nutrition jsonb;
alter table public.gt_products add column if not exists nutrition_source_url text;
alter table public.gt_products add column if not exists nutrition_updated_at bigint;
comment on column public.gt_products.nutrition is 'Community-contributed per-100g/100ml nutrition, source referenced by nutrition_source_url; not validated laboratory data.';
comment on column public.gt_products.stores_reported is 'Crowdsourced merchant hints, not current verified retail stock.';