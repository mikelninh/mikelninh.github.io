-- Good Things v1.6: F = Durchgefallen, distinct from D (disappointing).
-- Existing ratings and private not_tried answers stay unchanged.
alter table public.gt_ratings drop constraint if exists gt_ratings_tier_check;
alter table public.gt_ratings drop constraint if exists gt_ratings_experience_check;
alter table public.gt_ratings add constraint gt_ratings_tier_check
 check(tier is null or tier in ('S','A','B','C','D','F'));
alter table public.gt_ratings add constraint gt_ratings_experience_check check(
 (status='rated' and tier in ('S','A','B','C','D','F'))
 or (status='not_tried' and tier is null and is_public=false and position=0)
);