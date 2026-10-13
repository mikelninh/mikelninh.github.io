-- Applied to Supabase project htffcvdopavknnylbowl as good_things_explicit_not_tried_v15.
-- An answered product is one row, either a scored verdict or an explicit no-grade response.
alter table public.gt_ratings
 add column if not exists status text not null default 'rated';
alter table public.gt_ratings alter column tier drop not null;
alter table public.gt_ratings drop constraint if exists gt_ratings_experience_check;
alter table public.gt_ratings add constraint gt_ratings_experience_check check (
 (status = 'rated' and tier in ('S','A','B','C','D'))
 or
 (status = 'not_tried' and tier is null and is_public = false and position = 0)
);
create index if not exists gt_ratings_not_tried_owner_idx
 on public.gt_ratings(user_id,updated_at desc) where status='not_tried';