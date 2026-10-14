
create or replace function gt_internal.validate_duo_advance() returns trigger
language plpgsql security definer set search_path='' as $$
declare eligible boolean;
begin
 if new.host_id is distinct from old.host_id or new.partner_id is distinct from old.partner_id then
 raise exception 'Duo members cannot be changed';end if;
 select (p.vegan_status is distinct from 'non_vegan' and p.image_url like 'https://%'
  and p.image_status in ('retailer','brand','barcode')) into eligible
 from public.gt_products p where p.id=new.current_product_id;
 if coalesce(eligible,false)=false then
 raise exception 'Duo product requires traceable real packaging photo';
 end if;
 if new.round_no=old.round_no and new.current_product_id<>old.current_product_id then
  if exists(select 1 from public.gt_duo_votes where room_id=old.id and round_no=old.round_no) then
   raise exception 'Cannot skip after a participant has submitted';
  end if;
  return new;
 end if;
 if new.round_no<>old.round_no+1 or new.current_product_id=old.current_product_id
 or not exists(select 1 from public.gt_duo_reveals where room_id=old.id and round_no=old.round_no) then
 raise exception 'Finish both ratings before next duo round';end if;
 return new;
end; $$;
create or replace function gt_internal.check_duo_photo_on_create() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.gt_products p
 where p.id=new.current_product_id and p.vegan_status is distinct from 'non_vegan'
 and p.image_url like 'https://%' and p.image_status in ('retailer','brand','barcode')) then
 raise exception 'Choose a product with a real, traceable packshot';
 end if;
 return new;
end; $$;
revoke all on function gt_internal.check_duo_photo_on_create() from public,anon,authenticated;
drop trigger if exists gt_duo_create_photo_checked on public.gt_duo_rooms;
create trigger gt_duo_create_photo_checked before insert on public.gt_duo_rooms
for each row execute function gt_internal.check_duo_photo_on_create();
