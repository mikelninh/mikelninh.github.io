-- GOOD THINGS 1.4.1. Authenticated photo corrections, private to their reporter.
create table if not exists public.gt_photo_reports (
 id uuid primary key default gen_random_uuid(),
 reporter_id uuid not null references auth.users(id) on delete cascade,
 product_id text not null references public.gt_products(id) on delete cascade,
 issue text not null check(issue in ('wrong_image','old_packaging','missing_photo','wrong_variant')),
 suggested_url text not null default '' check(length(suggested_url)<=500 and (suggested_url='' or suggested_url ~ '^https://[^[:space:]]+$')),
 note text not null default '' check(length(note)<=400),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(reporter_id,product_id)
);
alter table public.gt_photo_reports enable row level security;
revoke all on public.gt_photo_reports from anon,authenticated;
grant select,insert,update on public.gt_photo_reports to authenticated;
create policy "gt_photo_reports_read_own" on public.gt_photo_reports for select to authenticated
 using((select auth.uid())=reporter_id);
create policy "gt_photo_reports_insert_own" on public.gt_photo_reports for insert to authenticated
 with check((select auth.uid())=reporter_id);
create policy "gt_photo_reports_update_own" on public.gt_photo_reports for update to authenticated
 using((select auth.uid())=reporter_id) with check((select auth.uid())=reporter_id);
create index if not exists gt_photo_reports_product_idx on public.gt_photo_reports(product_id);