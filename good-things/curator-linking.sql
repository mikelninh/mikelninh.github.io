-- Curator identities are verified by the operator, never self-claimed by a visitor.
create table if not exists public.gt_curators (
  role text primary key check (role in ('mikel','huong')),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  verified_at timestamptz not null default now()
);
alter table public.gt_curators enable row level security;
revoke all on public.gt_curators from anon, authenticated;
grant select on public.gt_curators to anon, authenticated;
create policy "gt_curators_public_read" on public.gt_curators for select to anon,authenticated using (true);

-- After separately verifying both owners' login identities, an administrator
-- can assign verified auth user ids (never use a browser-supplied name):
-- insert into public.gt_curators(role,user_id) values ('mikel','<verified-uuid>');
-- insert into public.gt_curators(role,user_id) values ('huong','<verified-uuid>');
-- No user-facing INSERT/UPDATE/DELETE grants exist for this table.