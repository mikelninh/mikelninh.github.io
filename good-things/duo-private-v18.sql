-- GOOD THINGS Duo: rounds must never leak live votes through public ratings.
-- Votes are copied into the voter's shelf as PRIVATE until explicitly republished.
create or replace function gt_internal.finish_duo_vote() returns trigger
language plpgsql security definer set search_path='' as $$
declare room_row public.gt_duo_rooms%rowtype;
host_answer text;
partner_answer text;
begin
  select * into room_row from public.gt_duo_rooms where id=new.room_id;
  if not found or new.round_no<>room_row.round_no
     or (new.user_id<>room_row.host_id and new.user_id<>room_row.partner_id) then
    raise exception 'Invalid duo round member';
  end if;
  insert into public.gt_ratings(user_id,product_id,status,tier,note,is_public,position,updated_at)
  values(new.user_id,room_row.current_product_id,
    case when new.choice='not_tried' then 'not_tried' else 'rated' end,
    case when new.choice='not_tried' then null else new.choice end,
    '',false,0,now())
  on conflict(user_id,product_id) do update
   set status=excluded.status,tier=excluded.tier,
   note=case when excluded.status='not_tried' then '' else public.gt_ratings.note end,
   is_public=false,
   position=case when excluded.status='not_tried' then 0 else public.gt_ratings.position end,
   updated_at=excluded.updated_at;
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
end; $$;