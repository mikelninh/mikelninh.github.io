# ✳ GOOD THINGS — Mikel & Huong

**Build:** 1.7.0 (354 products · 303 barcode/retailer packshots · nutrition & price evidence)  
**Website:** https://mikelninh.github.io/good-things/  
**Source:** /good-things on the \`mikelninh.github.io\` GitHub Pages repository  
**Architecture:** GitHub Pages HTML/CSS/vanilla JS + Supabase email/password Auth and PostgreSQL/RLS in an isolated namespace in the existing EU Frankfurt project.

A home for things worth sharing. The S–F interactive tier board, personal *Our shelf*, and community *Your shelf* are all first-class views.

## What is genuinely implemented

### 1.1 — Make it personal
- 102 rankable catalogue **candidates**, across 10 categories, plus 2 rejected dairy-containing candidates retained for the audit (104 records total). Each entry has a stable ID, source/store link, category, brand, name and explicit \`verified:false\`.
- Search, store filter, category chips, sort and rated-only filter.
- A private local **Mikel / Huong / You** co-rating playground, with independent S–F scores and tasting notes. No invented opinions.
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

### 1.4 — Tier Board & sourced product photography

- TierMaker-style **full-width S–F board first**, product tray underneath, fast searchable filters, source-photo filter, pointer dragging, deliberate touch long-press, quick tap-to-rank, keyboard arrows, and accurate wrapped-row reorder.
- Independent local demo Mikel/Huong/You boards; signed-in users persist each rating and numerical position to Supabase. **Undo** restores notes, score, privacy and position; **Reset** requires explicit confirmation. Sharing exports a snapshot with product scores/order only, and **Save PNG** creates a branded image (packshots where cross-origin permissions allow; text/emoji fallback otherwise).
- **51 / 102 source-matched product photos** from retailer SKU, official brand pages, or one exact barcode. These are image-to-product matches, not independent vegan certification. The other 51 use neutral illustrations until an exact packet photo can be confirmed.
- Excluded two confirmed dairy-containing entries: Pringles Sweet Paprika (whey) and funny-frisch Linsen Chips Paprika (sour-cream powder). Two ingredient-checked plant-based products were added to keep 102 eligible products. The public catalogue retains the rejected records only for a transparent audit.
- Product images show their source. Fuzzy Open Food Facts guesses are **never automatically shown in public catalogue/board cards**; they can only be previewed unverified in the detail drawer. Exact source claims are based on a matching retailer SKU, maker listing or barcode, not on image similarity alone.
- Logged-in users can privately report wrong, outdated, missing or incorrect-variant photos. The reports enter `gt_photo_reports` (row-level permissions, no public read), **not** an unmoderated public image swap. Images must be reviewed by a human before updating the catalogue.
- Before a broad commercial launch, check image copyrights, CDN hotlink policies and packaging changes. Host licensed images under our control where allowed.

### 1.5 — Not tried yet is an answer, not an S–F grade

- **Three exclusive states per product and person:** no row = unanswered, `status='rated'` with S/A/B/C/D/F tier = tried and graded, or `status='not_tried'` with `tier=NULL` = explicitly answered without a grade.
- **New separate "Not tried yet" shelf** below S–F and the unanswered product tray. The user can drop a product into it or tap an item and choose **Not tried yet**. It never enters a tier row or image export of the tier list.
- Not-tried answers persist locally for all three preview personas and in an authenticated user’s Supabase ratings row. They are **always private**, with a database constraint enforcing `is_public=false`, `tier IS NULL` and `position=0`.
- Users can change the answer later to S–F, clear their answer back to unanswered, undo a state transition, or reset their own whole board (including no-grade answers).
- Your Shelf lists the two groups separately. Discover can filter **All / Rated / Not tried yet / Unanswered**. Public statistics, shared rankings, taste compatibility, first-five tasting progress and share links only use actual S–F grades.
- JSON import/export and explicit guest-to-account transfer preserve these statuses.
- Migration source: `not-tried-v15.sql`. A data migration was applied to the existing project with a backwards-compatible default (`status='rated'`) so older ratings retain their grades. No other tables are modified.
- Regression tests: no-grade privacy, unanswered-tray transitions, cross-state undo, public ranking exclusions and import semantics.

### 1.6 — F means Durchgefallen · packshot trust expansion

- Sixth grade **F – Durchgefallen**, distinct from **D – Disappointing**. The ranking is S, A, B, C, D, F, and `not_tried` remains an explicit null-grade answer stored privately outside all tiers.
- F is available through mouse/touch dragging, six-button quick rank, edit drawer, keyboard controls, account persistence, snapshot share links and branded PNG exports. Tier colours now distinguish D and F.
- Relative taste similarity is now calculated on a **six-point** scale (maximal difference divided by 5), and community average display uses /6 rather than /5. Existing S–D assignments remain valid.
- Supabase constraint migration: `f-tier-v16.sql` permits F and preserves `not_tried` with a null grade; baseline `schema.sql` also updated.
- Sourced **6 additional exact product images**, making **51/102** traceable manufacturer/retailer/barcode linked images. Some original catalogue variants were renamed to exactly match the product source. **51 remain unresolved**.
- Exact missing-photo acceptance criteria and the item-by-item backlog are maintained in [PHOTOS-NEEDED.md](./PHOTOS-NEEDED.md). Do not replace the unresolved half with guessed similar images.
- F compatibility and packshot coverage have regression tests. Browser click-through, CDN rights and authenticated signup remain release gates.

### 1.7 — Barcode products, nutrition, shopping and honest historical prices

**Verified in the Supabase database (14 October 2026): 356 records total, 354 rankable, 303 with source-linked packshots, and 252 with community-submitted nutrition.**

- Added **252 unique barcode-linked, vegan-tagged community grocery records** from Open Food Facts (OdBL), without changing any pre-existing product ID or existing rating.
- Catalogue now supports **18 categories**, with barcodes and source-linked images, from stores reported to include REWE, Rossmann, dm, EDEKA, Kaufland and Alnatura. These are **crowdsourced buying hints**, not proof of today's stock.
- Product drawer shows energy, **protein**, carbohydrates, sugar, fat, saturated fat, fibre, salt, reported quantity, source link, reported retailer and separate price evidence. Nutrient quantities are per 100g/100ml according to the original dataset, and may be incomplete/out of date. No placeholders are presented as nutrition facts.
- Store links open official retailer sites; source/product evidence remains Open Food Facts for third-party records. Do not claim they are always in stock.
- **Price lookup** is on demand per barcode via Open Prices API. It only displays observations with EUR currency, German location, source ID, date and amount. Old prices are explicitly labelled **observed, not live**, and missing price records are clearly described as unknown. Never invent a price.
- Existing 51 older catalogue candidates without exact photos still show illustrations. Adding 252 barcode-backed images brings source-linked photo coverage from 51/102 to **303/354 = 85.6%**. The old 51 are listed in [PHOTOS-NEEDED.md](./PHOTOS-NEEDED.md).
- Supply quality: automated filters reject some non-grocery entries, but Open Food Facts remains crowdsourced; verify actual package, ingredients and use rights before treating any listing as fully approved. Reconcile duplicate named products before a wider public rollout.
- The three extra batches are checked into \`catalog-extra-{1,2,3}.js\` and merged by \`catalog-merge.js\`. The Supabase database has corresponding \`gt_products\` records and the \`nutrition-v17.sql\` schema additions.
- Attribution/licensing: Open Food Facts / ODbL, plus attribution to Open Prices for price observations, is available in the page footer and privacy notice.
- Tests cover all 354 products, unique IDs, 303 photo records, 252 nutrition profiles, high-protein sorting and independent F/no-grade state transitions.
- Missing product suggestions: verified users can submit a barcode, brand, product name and store hint. The `gt_product_requests` table is private, owner-readable and cannot be used to insert or modify the public catalogue. Additions require manual review and an explicit catalogue import. Schema: `product-requests-v17.sql`.
- Real browser touch/drag, price CORS and signup confirmation are still unverified release gates; simulated script tests do not replace actual device testing.

## Important release gates

**This is an actual deployed beta, not yet a fully verified mass-market release.**

1. **Auth email redirect:** in Supabase project \`htffcvdopavknnylbowl\` → Authentication → URL Configuration, add \`https://mikelninh.github.io/good-things/\` to allowed Redirect URLs, and ensure the project email confirmation settings and SMTP fit a public site. This configuration is not exposed by the current connected management tools and therefore was **not automatically changed**. Signup email confirmation may fail until this is completed.
2. **Separate environment:** \`gt_*\` tables live in the already-active Supabase project \`company-01\` (EU central). No existing tables were modified. Before a broad launch move to a dedicated project with its own auth/SMTP domain and security quotas.
3. **Catalogue trust:** the original v1.0 file was not available. We reconstructed candidates. 51 / 102 rankable items now have source-linked retailer/brand/barcode packshots; the other 51 deliberately display illustrations. Two confirmed dairy-containing products are rejected from ranking. Verify each remaining recipe, barcode, variant, availability and image rights before commercial launch.
4. **Official curators:** Mikel and Huong each need an account. The operator then verifies each account owner and enters the corresponding UUIDs in `gt_curators` (see `curator-linking.sql`). Only after **both** are linked does Our Shelf switch to their real public ratings. The private demo can still be toggled; it **never** speaks for them publicly.
5. **Legal/release:** add a complete German Impressum and DSGVO privacy notice, account deletion request process, moderation/reporting and abuse protection before actively inviting a large public community.
6. **Scale:** the v1.4 client currently fetches at most 3,000 recent public ratings and 400 profiles; replace full-client aggregation with paginated aggregate RPCs/materialised views before meaningful traffic.
7. **Verification:** database migrated and audited (104 records, 102 rankable, two rejected, 51 source-matched photos, photo-report RLS). Simulated JavaScript tests verified tier placement, wrapped-row reorder, undo/reset, image filtering, quick-tap menus, PNG-export path, private curator separation, explicit not-tried transitions and HTML escaping. Full external browser drag/signup testing remains unverified because the browser-automation wallet lacks credit.

## Database

- \`gt_products\`: read-only catalogue with barcode/SKU image provenance and ingredient flags; no public writes.
- \`gt_profiles\`: account-owned names and handles.
- \`gt_ratings\`: one S/A/B/C/D rating per user and product, with an explicit numeric tier-order position; private ratings visible only to owner.
- \`gt_lists\`: public/private collections per account.
- \`gt_follows\`: public, owner-only followed relationships.
- \`gt_feedback\`: owner-readable feedback, write limited to one per day.

Eight tables with row-level security enabled, 21 per-operation RLS policies, explicit Data API grants; the operator-verified curator mapping is read-only for regular users.
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

1. Visit the [live website](https://mikelninh.github.io/good-things/), which opens the **Tier Board** first. **354 rankable products** across 18 categories are loaded from source-linked static catalogues.
2. Drag a tofu from the **unanswered tray** to an S–F row if you tasted it; otherwise drag into **Not tried yet** or tap once and choose that no-grade answer. Reorder graded items, undo, clear an answer, or reset. Save a PNG or share a snapshot of graded items only.
3. Under Our Shelf, use the **private** Mikel and Huong demo personas; ratings are stored on your device only until both curator identities are manually verified and linked.
4. Under Your Shelf, make five ratings, export/share a snapshot or create an account to persist across devices.
5. When Auth is configured, make two **separate** verified accounts; each can publish its own ratings, follow friends and build lists.
6. Open product details to see per-100g **protein, calories and other nutrients**, source links, reported stores and the last eligible evidence-backed Open Prices EUR observation (if available). Tap any packshot in the product details to check its source or report an issue (account required). The Community feed and rankings show only real public opinions; when empty, they stay honest.

## Known privacy boundaries

- The publishable \`sb_publishable_\` key is designed to be public. **Never** put a Supabase \`service_role\` or secret key in client-side files.
- Ratings marked private have RLS checks: owner-only reads.
- Guest shelf data is saved locally and not synced until the user explicitly chooses to import into an account.
- Public comments and bios are HTML-escaped before display.
- There is no embedded third-party analytics tracker.
- Open Food Facts photo search contacts that service only when a visitor presses the photo-lookup button.

**Product philosophy:** the more good things are shared, the more delightful the shelf becomes. But 0 fake reviews, 0 invented verification and 0 paid ratings.
