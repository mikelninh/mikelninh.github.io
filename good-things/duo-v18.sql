-- GOOD THINGS v1.8: independent two-person product-ranking rounds.
-- Only a room's two named participants can see the room. Votes stay secret until both submit.
create table if not exists public.gt_duo_rooms(
 id uuid primary key default gen_random_uuid(),
 host_id uuid not null references auth.users(id) on delete cascade,
 partner_id uuid not null references auth.users(id) on delete cascade,
 current_product_id text not null references public.gt_products(id),
 round_no integer not null default 1 check(round_no between 1 and 100000),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint gt_duo_two_people check(host_id<>partner_id)
);
create index if not exists gt_duo_rooms_host_idx on public.gt_duo_rooms(host_id,updated_at desc);
create index if not exists gt_duo_rooms_partner_idx on public.gt_duo_rooms(partner_id,updated_at desc);
create table if not exists public.gt_duo_votes(
 room_id uuid not null references public.gt_duo_rooms(id) on delete cascade,
 round_no integer not null,
 user_id uuid not null references auth.users(id) on delete cascade,
 choice text not null check(choice in ('S','A','B','C','D','F','not_tried')),
 created_at timestamptz not null default now(),
 primary key(room_id,round_no,user_id)
);
create table if not exists public.gt_duo_reveals(
 room_id uuid not null references public.gt_duo_rooms(id) on delete cascade,
 round_no integer not null,
 product_id text not null references public.gt_products(id),
 host_choice text not null check(host_choice in ('S','A','B','C','D','F','not_tried')),
 partner_choice text not null check(partner_choice in ('S','A','B','C','D','F','not_tried')),
 created_at timestamptz not null default now(),
 primary key(room_id,round_no)
);
alter table public.gt_duo_rooms enable row level security;
alter table public.gt_duo_votes enable row level security;
alter table public.gt_duo_reveals enable row level security;
revoke all on public.gt_duo_rooms,public.gt_duo_votes,public.gt_duo_reveals from anon,authenticated;
grant select,insert on public.gt_duo_rooms to authenticated;
grant update(current_product_id,round_no,updated_at) on public.gt_duo_rooms to authenticated;
grant select,insert on public.gt_duo_votes to authenticated;
grant select on public.gt_duo_reveals to authenticated;
create policy "duo_participants_view_rooms" on public.gt_duo_rooms for select to authenticated
 using((select auth.uid()) in(host_id,partner_id));
create policy "duo_host_create" on public.gt_duo_rooms for insert to authenticated
 with check(host_id=(select auth.uid()) and host_id<>partner_id);
create policy "duo_host_advance" on public.gt_duo_rooms for update to authenticated
 using(host_id=(select auth.uid())) with check(host_id=(select auth.uid()));
create policy "duo_vote_read_own" on public.gt_duo_votes for select to authenticated
 using(user_id=(select auth.uid()));
create policy "duo_vote_submit_own_active_round" on public.gt_duo_votes for insert to authenticated
 with check(user_id=(select auth.uid()) and exists(
  select 1 from public.gt_duo_rooms room
  where room.id=room_id and room.round_no=gt_duo_votes.round_no
  and (user_id=room.host_id or user_id=room.partner_id)
 ));
create policy "duo_reveal_read_participants" on public.gt_duo_reveals for select to authenticated
 using(exists(
  select 1 from public.gt_duo_rooms room where room.id=room_id
  and ((select auth.uid()) in (room.host_id,room.partner_id))
 ));
-- Keep privileged trigger functions outside exposed public Data API schema.
create schema if not exists gt_internal;
revoke all on schema gt_internal from public,anon,authenticated;
create or replace function gt_internal.finish_duo_vote() returns trigger
language plpgsql security definer set search_path='' as $$
declare
 room_row public.gt_duo_rooms%rowtype;
 host_answer text; partner_answer text;
begin
 select * into room_row from public.gt_duo_rooms where id=new.room_id;
 if not found or new.round_no<>room_row.round_no or
   (new.user_id<>room_row.host_id and new.user_id<>room_row.partner_id) then
   raise exception 'Invalid duo round member';
 end if;
 -- Each vote is a real private answer on the submitting account's regular shelf.
 insert into public.gt_ratings(user_id,product_id,status,tier,note,is_public,position,updated_at)
 values(new.user_id,room_row.current_product_id,
  case when new.choice='not_tried' then 'not_tried' else 'rated' end,
  case when new.choice='not_tried' then null else new.choice end,
  '',false,0,now())
 on conflict(user_id,product_id) do update
 set status=excluded.status,tier=excluded.tier,is_public=false,
 position=0,updated_at=excluded.updated_at;
 select choice into host_answer from public.gt_duo_votes
  where room_id=new.room_id and round_no=new.round_no and user_id=room_row.host_id;
 select choice into partner_answer from public.gt_duo_votes
  where room_id=new.room_id and round_no=new.round_no and user_id=room_row.partner_id;
 if host_answer is not null and partner_answer is not null then
  insert into public.gt_duo_reveals(room_id,round_no,product_id,host_choice,partner_choice)
  values(new.room_id,new.round_no,room_row.current_product_id,host_answer,partner_answer)
  on conflict(room_id,round_no) do nothing;
 end if;
 return new;
end;
$$;
revoke all on function gt_internal.finish_duo_vote() from public,anon,authenticated;
drop trigger if exists gt_duo_vote_finish on public.gt_duo_votes;
create trigger gt_duo_vote_finish after insert on public.gt_duo_votes
for each row execute function gt_internal.finish_duo_vote();
create or replace function gt_internal.validate_duo_advance() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if new.host_id is distinct from old.host_id or new.partner_id is distinct from old.partner_id then
  raise exception 'Duo members cannot be changed';
 end if;
 if new.round_no<>old.round_no+1
    or new.current_product_id=old.current_product_id
    or not exists(select 1 from public.gt_duo_reveals
      where room_id=old.id and round_no=old.round_no) then
  raise exception 'Finish both ratings before next duo round';
 end if;
 return new;
end;
$$;
revoke all on function gt_internal.validate_duo_advance() from public,anon,authenticated;
drop trigger if exists gt_duo_advance_checked on public.gt_duo_rooms;
create trigger gt_duo_advance_checked before update on public.gt_duo_rooms
for each row execute function gt_internal.validate_duo_advance();
