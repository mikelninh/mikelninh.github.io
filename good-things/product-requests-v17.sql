-- GOOD THINGS 1.7: private, authenticated product discovery suggestions.
-- This is a moderation queue. A suggestion never grants catalogue write access.
create table if not exists public.gt_product_requests (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 barcode text not null check(barcode ~ '^[0-9]{8,14}$'),
 product_name text not null check(char_length(product_name) between 2 and 120),
 brand text not null check(char_length(brand) between 2 and 80),
 store_hint text not null default '' check(char_length(store_hint)<=100),
 notes text not null default '' check(char_length(notes)<=350),
 status text not null default 'pending' check(status in ('pending','approved','rejected')),
 created_at timestamptz not null default now(),
 unique(user_id,barcode)
);
alter table public.gt_product_requests enable row level security;
revoke all on public.gt_product_requests from anon,authenticated;
grant select,insert on public.gt_product_requests to authenticated;
create policy "gt_requests_owner_read" on public.gt_product_requests
 for select to authenticated using ((select auth.uid())=user_id);
create policy "gt_requests_owner_submit" on public.gt_product_requests
 for insert to authenticated
 with check ((select auth.uid())=user_id and status='pending');
create index if not exists gt_requests_status_idx on public.gt_product_requests(status,created_at desc);
comment on table public.gt_product_requests is 'Moderated product requests. No user client can approve or insert into the public catalogue.';