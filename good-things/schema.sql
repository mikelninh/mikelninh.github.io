-- GOOD THINGS v1.3. All objects are isolated under gt_*; existing project data is untouched.
create table if not exists public.gt_products (
  id text primary key, name text not null, brand text not null, store text not null,
  category_id text not null, category text not null, source_url text,
  verified boolean not null default false, image_url text,
  created_at timestamptz not null default now()
);
create table if not exists public.gt_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text not null unique,
  display_name text not null default 'Good human',
  bio text not null default '',
  accent text not null default 'lime',
  created_at timestamptz not null default now(),
  constraint gt_handle_format check(handle ~ '^[a-z0-9][a-z0-9_-]{2,23}$'),
  constraint gt_handle_reserved check(handle !~ '^(mikel|huong|admin|goodthings|good-things|support)$'),
  constraint gt_profile_lengths check(char_length(display_name) between 1 and 42 and char_length(bio)<=240),
  constraint gt_profile_accent check(accent in ('lime','peach','lilac','sky'))
);
create table if not exists public.gt_ratings (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null references public.gt_products(id) on delete cascade,
  tier text not null check(tier in ('S','A','B','C','D')),
  note text not null default '' check(char_length(note)<=200),
  is_public boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key(user_id,product_id)
);
create table if not exists public.gt_follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(follower_id,following_id),
  constraint gt_no_self_follow check(follower_id <> following_id)
);
create table if not exists public.gt_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text not null check(slug ~ '^[a-z0-9][a-z0-9-]{1,49}$'),
  title text not null check(char_length(title) between 2 and 70),
  description text not null default '' check(char_length(description)<=240),
  product_ids text[] not null default '{}',
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  unique(user_id,slug),
  constraint gt_list_size check(cardinality(product_ids)<=40)
);
create table if not exists public.gt_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  score smallint not null check(score between 1 and 5),
  message text not null check(char_length(message) between 5 and 1000),
  day date not null default (now() at time zone 'UTC')::date,
  created_at timestamptz not null default now(),
  unique(user_id,day)
);
create index if not exists gt_ratings_product_idx on public.gt_ratings(product_id) where is_public;
create index if not exists gt_ratings_updated_idx on public.gt_ratings(updated_at desc) where is_public;
create index if not exists gt_follows_following_idx on public.gt_follows(following_id);
create index if not exists gt_lists_user_idx on public.gt_lists(user_id);

alter table public.gt_products enable row level security;
alter table public.gt_profiles enable row level security;
alter table public.gt_ratings enable row level security;
alter table public.gt_follows enable row level security;
alter table public.gt_lists enable row level security;
alter table public.gt_feedback enable row level security;
revoke all on public.gt_products,public.gt_profiles,public.gt_ratings,public.gt_follows,public.gt_lists,public.gt_feedback from anon,authenticated;
grant select on public.gt_products,public.gt_profiles,public.gt_ratings,public.gt_follows,public.gt_lists to anon;
grant select on public.gt_products,public.gt_profiles,public.gt_ratings,public.gt_follows,public.gt_lists to authenticated;
grant insert,update,delete on public.gt_profiles,public.gt_ratings,public.gt_follows,public.gt_lists to authenticated;
grant insert,select on public.gt_feedback to authenticated;
create policy "gt_products_public_read" on public.gt_products for select to anon, authenticated using(true);
create policy "gt_profiles_public_read" on public.gt_profiles for select to anon,authenticated using(true);
create policy "gt_profiles_insert_own" on public.gt_profiles for insert to authenticated with check((select auth.uid()) = id);
create policy "gt_profiles_update_own" on public.gt_profiles for update to authenticated using((select auth.uid()) = id) with check((select auth.uid()) = id);
create policy "gt_ratings_read_public_or_own" on public.gt_ratings for select to anon,authenticated using(is_public or ((select auth.uid())=user_id));
create policy "gt_ratings_insert_own" on public.gt_ratings for insert to authenticated with check((select auth.uid())=user_id);
create policy "gt_ratings_update_own" on public.gt_ratings for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy "gt_ratings_delete_own" on public.gt_ratings for delete to authenticated using((select auth.uid())=user_id);
create policy "gt_follows_read" on public.gt_follows for select to anon,authenticated using(true);
create policy "gt_follows_insert_own" on public.gt_follows for insert to authenticated with check((select auth.uid())=follower_id);
create policy "gt_follows_delete_own" on public.gt_follows for delete to authenticated using((select auth.uid())=follower_id);
create policy "gt_lists_read_public_or_own" on public.gt_lists for select to anon,authenticated using(is_public or ((select auth.uid())=user_id));
create policy "gt_lists_insert_own" on public.gt_lists for insert to authenticated with check((select auth.uid())=user_id);
create policy "gt_lists_update_own" on public.gt_lists for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy "gt_lists_delete_own" on public.gt_lists for delete to authenticated using((select auth.uid())=user_id);
create policy "gt_feedback_read_own" on public.gt_feedback for select to authenticated using((select auth.uid())=user_id);
create policy "gt_feedback_insert_own_daily" on public.gt_feedback for insert to authenticated with check((select auth.uid())=user_id and day=(now() at time zone 'UTC')::date);
insert into public.gt_products (id,name,brand,store,category_id,category,source_url,verified) values
('tofu-01','Tofu Natur','REWE Bio','REWE','tofu','Tofu & Tempeh','https://www.rewe.de/suche/produkte?search=REWE%20Bio%20Tofu%20Natur',false),
('tofu-02','Tofu Geräuchert','REWE Bio','REWE','tofu','Tofu & Tempeh','https://www.rewe.de/suche/produkte?search=REWE%20Bio%20Tofu%20Ger%C3%A4uchert',false),
('tofu-03','Tofu Kräuter','REWE Bio','REWE','tofu','Tofu & Tempeh','https://www.rewe.de/suche/produkte?search=REWE%20Bio%20Tofu%20Kr%C3%A4uter',false),
('tofu-04','Naturtofu','Taifun','REWE','tofu','Tofu & Tempeh','https://www.rewe.de/suche/produkte?search=Taifun%20Naturtofu',false),
('tofu-05','Räuchertofu','Taifun','REWE','tofu','Tofu & Tempeh','https://www.rewe.de/suche/produkte?search=Taifun%20R%C3%A4uchertofu',false),
('tofu-06','Tofu Basilikum','Taifun','REWE','tofu','Tofu & Tempeh','https://www.rewe.de/suche/produkte?search=Taifun%20Tofu%20Basilikum',false),
('tofu-07','Tofu Rosso','Taifun','REWE','tofu','Tofu & Tempeh','https://www.rewe.de/suche/produkte?search=Taifun%20Tofu%20Rosso',false),
('tofu-08','Black Forest Tofu','Taifun','REWE','tofu','Tofu & Tempeh','https://www.rewe.de/suche/produkte?search=Taifun%20Black%20Forest%20Tofu',false),
('tofu-09','Bio Tofu Natur','Tukan','REWE','tofu','Tofu & Tempeh','https://www.rewe.de/suche/produkte?search=Tukan%20Bio%20Tofu%20Natur',false),
('tofu-10','Bio Räuchertofu','Tukan','REWE','tofu','Tofu & Tempeh','https://www.rewe.de/suche/produkte?search=Tukan%20Bio%20R%C3%A4uchertofu',false),
('tofu-11','Bio Tofu Natur','Berief','REWE','tofu','Tofu & Tempeh','https://www.rewe.de/suche/produkte?search=Berief%20Bio%20Tofu%20Natur',false),
('tofu-12','Bio Räuchertofu','Berief','REWE','tofu','Tofu & Tempeh','https://www.rewe.de/suche/produkte?search=Berief%20Bio%20R%C3%A4uchertofu',false),
('tofu-13','Tofu Rosso','Viana','REWE','tofu','Tofu & Tempeh','https://www.rewe.de/suche/produkte?search=Viana%20Tofu%20Rosso',false),
('tofu-14','Bio Tempeh Natur','Tempehmanufaktur','REWE','tofu','Tofu & Tempeh','https://www.rewe.de/suche/produkte?search=Tempehmanufaktur%20Bio%20Tempeh%20Natur',false),
('tofu-15','Tempeh Lupine','Tempehmanufaktur','REWE','tofu','Tofu & Tempeh','https://www.rewe.de/suche/produkte?search=Tempehmanufaktur%20Tempeh%20Lupine',false),
('tofu-16','Bio Tempeh Natur','REWE Bio','REWE','tofu','Tofu & Tempeh','https://www.rewe.de/suche/produkte?search=REWE%20Bio%20Bio%20Tempeh%20Natur',false),
('milks-01','Soja Original','Alpro','REWE','milks','Plant drinks','https://www.rewe.de/suche/produkte?search=Alpro%20Soja%20Original',false),
('milks-02','Soja Ohne Zucker','Alpro','REWE','milks','Plant drinks','https://www.rewe.de/suche/produkte?search=Alpro%20Soja%20Ohne%20Zucker',false),
('milks-03','Barista Hafer','Alpro','REWE','milks','Plant drinks','https://www.rewe.de/suche/produkte?search=Alpro%20Barista%20Hafer',false),
('milks-04','Haferdrink Barista','Oatly','REWE','milks','Plant drinks','https://www.rewe.de/suche/produkte?search=Oatly%20Haferdrink%20Barista',false),
('milks-05','Haferdrink Original','Oatly','REWE','milks','Plant drinks','https://www.rewe.de/suche/produkte?search=Oatly%20Haferdrink%20Original',false),
('milks-06','Haferdrink Deluxe','Oatly','REWE','milks','Plant drinks','https://www.rewe.de/suche/produkte?search=Oatly%20Haferdrink%20Deluxe',false),
('milks-07','Barista','vly','REWE','milks','Plant drinks','https://www.rewe.de/suche/produkte?search=vly%20Barista',false),
('milks-08','Ungesüßt','vly','REWE','milks','Plant drinks','https://www.rewe.de/suche/produkte?search=vly%20Unges%C3%BC%C3%9Ft',false),
('milks-09','Bio Haferdrink','REWE Bio','REWE','milks','Plant drinks','https://www.rewe.de/suche/produkte?search=REWE%20Bio%20Bio%20Haferdrink',false),
('milks-10','Bio Sojadrink','REWE Bio','REWE','milks','Plant drinks','https://www.rewe.de/suche/produkte?search=REWE%20Bio%20Bio%20Sojadrink',false),
('milks-11','Bio Mandeldrink','REWE Bio','REWE','milks','Plant drinks','https://www.rewe.de/suche/produkte?search=REWE%20Bio%20Bio%20Mandeldrink',false),
('milks-12','Bio Sojadrink','Berief','REWE','milks','Plant drinks','https://www.rewe.de/suche/produkte?search=Berief%20Bio%20Sojadrink',false),
('milks-13','Sojadrink Ungesüßt','Provamel','REWE','milks','Plant drinks','https://www.rewe.de/suche/produkte?search=Provamel%20Sojadrink%20Unges%C3%BC%C3%9Ft',false),
('milks-14','Haferdrink Natur','Natumi','REWE','milks','Plant drinks','https://www.rewe.de/suche/produkte?search=Natumi%20Haferdrink%20Natur',false),
('yogurts-01','Skyr Style Natur','Alpro','REWE','yogurts','Yoghurt & Skyr','https://www.rewe.de/suche/produkte?search=Alpro%20Skyr%20Style%20Natur',false),
('yogurts-02','Skyr Style Vanille','Alpro','REWE','yogurts','Yoghurt & Skyr','https://www.rewe.de/suche/produkte?search=Alpro%20Skyr%20Style%20Vanille',false),
('yogurts-03','Soja Natur Ohne Zucker','Alpro','REWE','yogurts','Yoghurt & Skyr','https://www.rewe.de/suche/produkte?search=Alpro%20Soja%20Natur%20Ohne%20Zucker',false),
('yogurts-04','Soja Natur','Alpro','REWE','yogurts','Yoghurt & Skyr','https://www.rewe.de/suche/produkte?search=Alpro%20Soja%20Natur',false),
('yogurts-05','Soja Heidelbeere','Alpro','REWE','yogurts','Yoghurt & Skyr','https://www.rewe.de/suche/produkte?search=Alpro%20Soja%20Heidelbeere',false),
('yogurts-06','Soja Mango','Alpro','REWE','yogurts','Yoghurt & Skyr','https://www.rewe.de/suche/produkte?search=Alpro%20Soja%20Mango',false),
('yogurts-07','Bio Soja Natur','Sojade','REWE','yogurts','Yoghurt & Skyr','https://www.rewe.de/suche/produkte?search=Sojade%20Bio%20Soja%20Natur',false),
('yogurts-08','Bio Soja Vanille','Sojade','REWE','yogurts','Yoghurt & Skyr','https://www.rewe.de/suche/produkte?search=Sojade%20Bio%20Soja%20Vanille',false),
('yogurts-09','Hafer Natur','Oatly','REWE','yogurts','Yoghurt & Skyr','https://www.rewe.de/suche/produkte?search=Oatly%20Hafer%20Natur',false),
('yogurts-10','Vegane Alternative Natur','REWE Beste Wahl','REWE','yogurts','Yoghurt & Skyr','https://www.rewe.de/suche/produkte?search=REWE%20Beste%20Wahl%20Vegane%20Alternative%20Natur',false),
('cheese-01','Genuss Scheiben Mild','Simply V','REWE','cheese','Cheese alternatives','https://www.rewe.de/suche/produkte?search=Simply%20V%20Genuss%20Scheiben%20Mild',false),
('cheese-02','Genuss Scheiben Würzig','Simply V','REWE','cheese','Cheese alternatives','https://www.rewe.de/suche/produkte?search=Simply%20V%20Genuss%20Scheiben%20W%C3%BCrzig',false),
('cheese-03','Streichgenuss Natur','Simply V','REWE','cheese','Cheese alternatives','https://www.rewe.de/suche/produkte?search=Simply%20V%20Streichgenuss%20Natur',false),
('cheese-04','Reibegenuss','Simply V','REWE','cheese','Cheese alternatives','https://www.rewe.de/suche/produkte?search=Simply%20V%20Reibegenuss',false),
('cheese-05','Scheiben Classic','bedda','REWE','cheese','Cheese alternatives','https://www.rewe.de/suche/produkte?search=bedda%20Scheiben%20Classic',false),
('cheese-06','Mozzarella Style','bedda','REWE','cheese','Cheese alternatives','https://www.rewe.de/suche/produkte?search=bedda%20Mozzarella%20Style',false),
('spreads-01','Bio Hummus Natur','REWE Bio','REWE','spreads','Spreads & dips','https://www.rewe.de/suche/produkte?search=REWE%20Bio%20Bio%20Hummus%20Natur',false),
('spreads-02','Bio Hummus Paprika','REWE Bio','REWE','spreads','Spreads & dips','https://www.rewe.de/suche/produkte?search=REWE%20Bio%20Bio%20Hummus%20Paprika',false),
('spreads-03','Hummus Natur','Obela','REWE','spreads','Spreads & dips','https://www.rewe.de/suche/produkte?search=Obela%20Hummus%20Natur',false),
('spreads-04','Hummus Tomate','Obela','REWE','spreads','Spreads & dips','https://www.rewe.de/suche/produkte?search=Obela%20Hummus%20Tomate',false),
('spreads-05','Aufstrich Tomate Basilikum','Zwergenwiese','REWE','spreads','Spreads & dips','https://www.rewe.de/suche/produkte?search=Zwergenwiese%20Aufstrich%20Tomate%20Basilikum',false),
('spreads-06','Aufstrich Paprika','Zwergenwiese','REWE','spreads','Spreads & dips','https://www.rewe.de/suche/produkte?search=Zwergenwiese%20Aufstrich%20Paprika',false),
('spreads-07','Streichgenuss Natur','Simply V','REWE','spreads','Spreads & dips','https://www.rewe.de/suche/produkte?search=Simply%20V%20Streichgenuss%20Natur',false),
('spreads-08','Pflanzlicher Brotaufstrich Kräuter','REWE Beste Wahl','REWE','spreads','Spreads & dips','https://www.rewe.de/suche/produkte?search=REWE%20Beste%20Wahl%20Pflanzlicher%20Brotaufstrich%20Kr%C3%A4uter',false),
('spreads-09','Bio Cashewcreme','KoRo','Online','spreads','Spreads & dips','https://www.koro.com/',false),
('deli-01','Veganer Schinken Spicker','Rügenwalder Mühle','REWE','deli','Deli slices & toppings','https://www.rewe.de/suche/produkte?search=R%C3%BCgenwalder%20M%C3%BChle%20Veganer%20Schinken%20Spicker',false),
('deli-02','Veganer Schinken Spicker Kräuter','Rügenwalder Mühle','REWE','deli','Deli slices & toppings','https://www.rewe.de/suche/produkte?search=R%C3%BCgenwalder%20M%C3%BChle%20Veganer%20Schinken%20Spicker%20Kr%C3%A4uter',false),
('deli-03','Veganer Hauchschnitt Klassisch','Rügenwalder Mühle','REWE','deli','Deli slices & toppings','https://www.rewe.de/suche/produkte?search=R%C3%BCgenwalder%20M%C3%BChle%20Veganer%20Hauchschnitt%20Klassisch',false),
('deli-04','Vegane Salami','Billie Green','REWE','deli','Deli slices & toppings','https://www.rewe.de/suche/produkte?search=Billie%20Green%20Vegane%20Salami',false),
('deli-05','Vegane Salami Pfeffer','Billie Green','REWE','deli','Deli slices & toppings','https://www.rewe.de/suche/produkte?search=Billie%20Green%20Vegane%20Salami%20Pfeffer',false),
('deli-06','Veganer Bacon','Billie Green','REWE','deli','Deli slices & toppings','https://www.rewe.de/suche/produkte?search=Billie%20Green%20Veganer%20Bacon',false),
('deli-07','Veganer Aufschnitt Mortadella','Greenforce','REWE','deli','Deli slices & toppings','https://www.rewe.de/suche/produkte?search=Greenforce%20Veganer%20Aufschnitt%20Mortadella',false),
('deli-08','Pflanzlicher Aufschnitt Kräuter','REWE Beste Wahl','REWE','deli','Deli slices & toppings','https://www.rewe.de/suche/produkte?search=REWE%20Beste%20Wahl%20Pflanzlicher%20Aufschnitt%20Kr%C3%A4uter',false),
('deli-09','Pflanzlicher Aufschnitt Paprika','REWE Beste Wahl','REWE','deli','Deli slices & toppings','https://www.rewe.de/suche/produkte?search=REWE%20Beste%20Wahl%20Pflanzlicher%20Aufschnitt%20Paprika',false),
('deli-10','Veganer Aufschnitt Natur','The Vegetarian Butcher','REWE','deli','Deli slices & toppings','https://www.rewe.de/suche/produkte?search=The%20Vegetarian%20Butcher%20Veganer%20Aufschnitt%20Natur',false),
('deli-11','Veganer Aufschnitt Mild','Wheaty','REWE','deli','Deli slices & toppings','https://www.rewe.de/suche/produkte?search=Wheaty%20Veganer%20Aufschnitt%20Mild',false),
('deli-12','Vegane Chorizo','Wheaty','REWE','deli','Deli slices & toppings','https://www.rewe.de/suche/produkte?search=Wheaty%20Vegane%20Chorizo',false),
('mains-01','Vegane Mühlen Schnitzel','Rügenwalder Mühle','REWE','mains','Meat alternatives','https://www.rewe.de/suche/produkte?search=R%C3%BCgenwalder%20M%C3%BChle%20Vegane%20M%C3%BChlen%20Schnitzel',false),
('mains-02','Vegane Mühlen Nuggets','Rügenwalder Mühle','REWE','mains','Meat alternatives','https://www.rewe.de/suche/produkte?search=R%C3%BCgenwalder%20M%C3%BChle%20Vegane%20M%C3%BChlen%20Nuggets',false),
('mains-03','Vegane Mühlen Bratwurst','Rügenwalder Mühle','REWE','mains','Meat alternatives','https://www.rewe.de/suche/produkte?search=R%C3%BCgenwalder%20M%C3%BChle%20Vegane%20M%C3%BChlen%20Bratwurst',false),
('mains-04','Like Chicken','LikeMeat','REWE','mains','Meat alternatives','https://www.rewe.de/suche/produkte?search=LikeMeat%20Like%20Chicken',false),
('mains-05','Like Gyros','LikeMeat','REWE','mains','Meat alternatives','https://www.rewe.de/suche/produkte?search=LikeMeat%20Like%20Gyros',false),
('mains-06','Veganes Hack','Greenforce','REWE','mains','Meat alternatives','https://www.rewe.de/suche/produkte?search=Greenforce%20Veganes%20Hack',false),
('mains-07','Beyond Burger','Beyond Meat','REWE','mains','Meat alternatives','https://www.rewe.de/suche/produkte?search=Beyond%20Meat%20Beyond%20Burger',false),
('mains-08','Vegane Fischstäbchen','Iglo Green Cuisine','REWE','mains','Meat alternatives','https://www.rewe.de/suche/produkte?search=Iglo%20Green%20Cuisine%20Vegane%20Fischst%C3%A4bchen',false),
('snacks-01','Original','Pringles','REWE','snacks','Chips & snacks','https://www.rewe.de/suche/produkte?search=Pringles%20Original',false),
('snacks-02','Sweet Paprika','Pringles','REWE','snacks','Chips & snacks','https://www.rewe.de/suche/produkte?search=Pringles%20Sweet%20Paprika',false),
('snacks-03','Bio Tortilla Chips Natur','REWE Bio','REWE','snacks','Chips & snacks','https://www.rewe.de/suche/produkte?search=REWE%20Bio%20Bio%20Tortilla%20Chips%20Natur',false),
('snacks-04','Bio Tortilla Chips Chili','REWE Bio','REWE','snacks','Chips & snacks','https://www.rewe.de/suche/produkte?search=REWE%20Bio%20Bio%20Tortilla%20Chips%20Chili',false),
('snacks-05','Sweet Chili Chips','Kettle','REWE','snacks','Chips & snacks','https://www.rewe.de/suche/produkte?search=Kettle%20Sweet%20Chili%20Chips',false),
('snacks-06','Sea Salt Chips','Kettle','REWE','snacks','Chips & snacks','https://www.rewe.de/suche/produkte?search=Kettle%20Sea%20Salt%20Chips',false),
('snacks-07','Erdnussflips','Funny-frisch','REWE','snacks','Chips & snacks','https://www.rewe.de/suche/produkte?search=Funny-frisch%20Erdnussflips',false),
('snacks-08','Linsen Chips Paprika','funny-frisch','REWE','snacks','Chips & snacks','https://www.rewe.de/suche/produkte?search=funny-frisch%20Linsen%20Chips%20Paprika',false),
('chocolate-01','Vegan Classic','Ritter Sport','REWE','chocolate','Chocolate','https://www.rewe.de/suche/produkte?search=Ritter%20Sport%20Vegan%20Classic',false),
('chocolate-02','Vegan Crunchy','Ritter Sport','REWE','chocolate','Chocolate','https://www.rewe.de/suche/produkte?search=Ritter%20Sport%20Vegan%20Crunchy',false),
('chocolate-03','Vegan Salted Caramel','Ritter Sport','REWE','chocolate','Chocolate','https://www.rewe.de/suche/produkte?search=Ritter%20Sport%20Vegan%20Salted%20Caramel',false),
('chocolate-04','Haferdrink Schokolade','iChoc','REWE','chocolate','Chocolate','https://www.rewe.de/suche/produkte?search=iChoc%20Haferdrink%20Schokolade',false),
('chocolate-05','White Vanilla','iChoc','REWE','chocolate','Chocolate','https://www.rewe.de/suche/produkte?search=iChoc%20White%20Vanilla',false),
('chocolate-06','Vegan Dark 70%','Lindt','REWE','chocolate','Chocolate','https://www.rewe.de/suche/produkte?search=Lindt%20Vegan%20Dark%2070%25',false),
('chocolate-07','Bio Zartbitter 70%','REWE Bio','REWE','chocolate','Chocolate','https://www.rewe.de/suche/produkte?search=REWE%20Bio%20Bio%20Zartbitter%2070%25',false),
('vemondo-01','Tofu Natur','Vemondo','Lidl','vemondo','Lidl / Vemondo','https://www.lidl.de/',false),
('vemondo-02','Räuchertofu','Vemondo','Lidl','vemondo','Lidl / Vemondo','https://www.lidl.de/',false),
('vemondo-03','Bio Sojadrink','Vemondo','Lidl','vemondo','Lidl / Vemondo','https://www.lidl.de/',false),
('vemondo-04','Haferdrink Barista','Vemondo','Lidl','vemondo','Lidl / Vemondo','https://www.lidl.de/',false),
('vemondo-05','Haferdrink Natur','Vemondo','Lidl','vemondo','Lidl / Vemondo','https://www.lidl.de/',false),
('vemondo-06','Sojajoghurt Natur','Vemondo','Lidl','vemondo','Lidl / Vemondo','https://www.lidl.de/',false),
('vemondo-07','Haferjoghurt Vanille','Vemondo','Lidl','vemondo','Lidl / Vemondo','https://www.lidl.de/',false),
('vemondo-08','Vegane Scheiben','Vemondo','Lidl','vemondo','Lidl / Vemondo','https://www.lidl.de/',false),
('vemondo-09','Veganer Reibekäse','Vemondo','Lidl','vemondo','Lidl / Vemondo','https://www.lidl.de/',false),
('vemondo-10','Veganer Aufschnitt','Vemondo','Lidl','vemondo','Lidl / Vemondo','https://www.lidl.de/',false),
('vemondo-11','Vegane Nuggets','Vemondo','Lidl','vemondo','Lidl / Vemondo','https://www.lidl.de/',false),
('vemondo-12','Veganes Eis Vanille','Vemondo','Lidl','vemondo','Lidl / Vemondo','https://www.lidl.de/',false)
on conflict(id) do nothing;
