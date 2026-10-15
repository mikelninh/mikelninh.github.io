-- GOOD THINGS: post-reveal discussion, each participant owns their own note.
create table if not exists public.gt_duo_comments (
 room_id uuid not null references public.gt_duo_rooms(id) on delete cascade,
 round_no integer not null check(round_no>=1),
 user_id uuid not null references auth.users(id) on delete cascade,
 comment text not null check(char_length(comment) between 1 and 600),
 updated_at timestamptz not null default now(),
 primary key(room_id,round_no,user_id)
);
alter table public.gt_duo_comments enable row level security;
revoke all on public.gt_duo_comments from anon,authenticated;
grant select,insert,update,delete on public.gt_duo_comments to authenticated;
create policy "duo_comments_read_only_after_reveal" on public.gt_duo_comments
 for select to authenticated using (
 exists(select 1 from public.gt_duo_rooms r
  join public.gt_duo_reveals rv on rv.room_id=r.id and rv.round_no=gt_duo_comments.round_no
  where r.id=gt_duo_comments.room_id and (select auth.uid()) in (r.host_id,r.partner_id))
);
create policy "duo_comments_author_can_insert_after_reveal" on public.gt_duo_comments
 for insert to authenticated with check (
 user_id=(select auth.uid()) and
 exists(select 1 from public.gt_duo_rooms r
  join public.gt_duo_reveals rv on rv.room_id=r.id and rv.round_no=gt_duo_comments.round_no
  where r.id=gt_duo_comments.room_id and (select auth.uid()) in (r.host_id,r.partner_id))
);
create policy "duo_comments_author_can_edit" on public.gt_duo_comments
 for update to authenticated
 using(user_id=(select auth.uid()) and exists(
 select 1 from public.gt_duo_rooms r join public.gt_duo_reveals rv on rv.room_id=r.id and rv.round_no=gt_duo_comments.round_no
 where r.id=gt_duo_comments.room_id and (select auth.uid()) in(r.host_id,r.partner_id)))
 with check(user_id=(select auth.uid()) and exists(
 select 1 from public.gt_duo_rooms r join public.gt_duo_reveals rv on rv.room_id=r.id and rv.round_no=gt_duo_comments.round_no
 where r.id=gt_duo_comments.room_id and (select auth.uid()) in(r.host_id,r.partner_id)));
create policy "duo_comments_author_delete" on public.gt_duo_comments
 for delete to authenticated using(user_id=(select auth.uid()));
create index if not exists gt_duo_comments_room_updated on public.gt_duo_comments(room_id,updated_at desc);
