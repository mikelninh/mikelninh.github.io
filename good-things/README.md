# ✳ GOOD THINGS — Mikel & Huong

**Build:** 1.3.0 (community beta)  
**Website:** https://mikelninh.github.io/good-things/  
**Source:** /good-things on the \`mikelninh.github.io\` GitHub Pages repository  
**Architecture:** GitHub Pages HTML/CSS/vanilla JS + Supabase email/password Auth and PostgreSQL/RLS in an isolated namespace in the existing EU Frankfurt project.

A home for things worth sharing. The personal *Our shelf* and the community *Your shelf* are both intentional first-class views.

## What is genuinely implemented

### 1.1 — Make it personal
- 102 catalogue **candidates**, across exactly 10 vegan categories. Each entry has a stable ID, source/store link, category, brand, name and explicit \`verified:false\`.
- Search, store filter, category chips, sort and rated-only filter.
- A private local **Mikel / Huong / You** co-rating playground, with independent S–D scores and tasting notes. No invented opinions.
- Public/private rating choice for authenticated account ratings.
- JSON export plus import for v1.0-compatible formats (matched by IDs or brand+name).
- A warm mobile-responsive editorial layout, accessible dialogs and reduced-motion consideration.
- User-triggered Open Food Facts photo search. Photos remain labelled as **unverified candidates** until a human compares the packaging / barcode.

### 1.2 — Open the doors
- Real Supabase email/password signup and sign-in with session persistence.
- Public profile, user handle, bio and accent colour. Protected creator handles cannot be claimed by strangers.
- Per-user ratings, unique per product, stored in PostgreSQL rather than a browser.
- Public/private user lists with shareable URLs (up to 40 products).
- Guest shelf frozen share links (only product IDs and scores, never private tasting notes). Public profile deep links.
- Guest rating import into account after explicit action.

### 1.3 — Make it social
- Community members list and profiles with public reviews.
- Follow/unfollow people with idempotent uniqueness constraints and ownership checks.
- Taste compatibility based on overlapping products only, explicitly called provisional.
- Community leaderboard based on **real public ratings**, not fabricated votes.
- Recent public reviews feed.
- A first-five-ratings challenge.
- Private feedback submissions, limited by SQL to one per account per UTC day.
- A safe default when disconnected: no fake "cloud sync success" messages.

## Important release gates

**This is an actual deployed beta, not yet a fully verified mass-market release.**

1. **Auth email redirect:** in Supabase project \`htffcvdopavknnylbowl\` → Authentication → URL Configuration, add \`https://mikelninh.github.io/good-things/\` to allowed Redirect URLs, and ensure the project email confirmation settings and SMTP fit a public site. This configuration is not exposed by the current connected management tools and therefore was **not automatically changed**. Signup email confirmation may fail until this is completed.
2. **Separate environment:** \`gt_*\` tables live in the already-active Supabase project \`company-01\` (EU central). No existing tables were modified. Before a broad launch move to a dedicated project with its own auth/SMTP domain and security quotas.
3. **Catalogue trust:** the original v1.0 102-product JSON was not accessible. We reconstructed 102 *candidates* with the stated category counts rather than claiming to have restored exact SKUs. Validate barcodes, precise vegan ingredients, images, retailers and availability before listing them as verified.
4. **Official curators:** Mikel and Huong each need an account. The operator then verifies each account owner and enters the corresponding UUIDs in `gt_curators` (see `curator-linking.sql`). Only after **both** are linked does Our Shelf switch to their real public ratings. The private demo can still be toggled; it **never** speaks for them publicly.
5. **Legal/release:** add a complete German Impressum and DSGVO privacy notice, account deletion request process, moderation/reporting and abuse protection before actively inviting a large public community.
6. **Scale:** the v1.3 client currently fetches at most 3,000 recent public ratings and 400 profiles; replace full-client aggregation with paginated aggregate RPCs/materialised views before meaningful traffic.
7. **Verification:** schema installed, 102 product count checked, JavaScript parser and simulated guest flow passed. A full external click-through browser test was unavailable because the connected browser automation account had insufficient funds. Do not count that test as passed.

## Database

- \`gt_products\`: read-only catalogue for public users; no public writes.
- \`gt_profiles\`: account-owned names and handles.
- \`gt_ratings\`: one S/A/B/C/D rating per user and product; private ratings visible only to owner.
- \`gt_lists\`: public/private collections per account.
- \`gt_follows\`: public, owner-only followed relationships.
- \`gt_feedback\`: owner-readable feedback, write limited to one per day.

Seven tables with row-level security enabled, 18 per-operation RLS policies, explicit Data API grants; the operator-verified curator mapping is read-only for regular users.
All are prefixed to avoid collisions with unrelated existing applications.

### Metric snapshots for weekly review (run in SQL editor, not in the browser)

\`\`\`sql
select count(*) as registered_profiles from public.gt_profiles;
select count(distinct user_id) as activated_raters from public.gt_ratings;
select count(*) as total_ratings from public.gt_ratings;
select count(*) as publicly_shared_ratings from public.gt_ratings where is_public;
select count(*) as follow_links from public.gt_follows;
select count(*) as collections from public.gt_lists;
select count(*) as feedback_submissions, round(avg(score)::numeric,2) as avg_feedback from public.gt_feedback;
select count(*) as first_five_completed from (select user_id from public.gt_ratings group by user_id having count(*)>=5) t;
\`\`\`

## How to try it

1. Visit the [live website](https://mikelninh.github.io/good-things/), then Discover.
2. Find a tofu, rate it S–D, add a note and press Save.
3. Under Our Shelf, use the **private** Mikel and Huong demo personas; ratings are stored on your device only until both curator identities are manually verified and linked.
4. Under Your Shelf, make five ratings, export/share a snapshot or create an account to persist across devices.
5. When Auth is configured, make two **separate** verified accounts; each can publish its own ratings, follow friends and build lists.
6. The Community feed and rankings show only real public opinions; when empty, they stay honest.

## Known privacy boundaries

- The publishable \`sb_publishable_\` key is designed to be public. **Never** put a Supabase \`service_role\` or secret key in client-side files.
- Ratings marked private have RLS checks: owner-only reads.
- Guest shelf data is saved locally and not synced until the user explicitly chooses to import into an account.
- Public comments and bios are HTML-escaped before display.
- There is no embedded third-party analytics tracker.
- Open Food Facts photo search contacts that service only when a visitor presses the photo-lookup button.

**Product philosophy:** the more good things are shared, the more delightful the shelf becomes. But 0 fake reviews, 0 invented verification and 0 paid ratings.
