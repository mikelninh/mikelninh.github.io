# GOOD THINGS 2.6 — Vemondo × Food for Future Taste Lab

**Release date:** 2026-10-16  
**Goal:** Discover as much of the vegan discount-brand ranges as we can trace, rate every product independently, invite friends/Huong, and turn honest product reviews into concrete, voluntary product-development feedback.

## Catalogue snapshot

| Measure | Source-backed records |
|---|---:|
| All GT product IDs in app and Supabase `public.gt_products` | **617** |
| Eligible for vegan tier rating | **615** |
| All PENNY FOOD FOR FUTURE brand entries | **70** |
| PENNY entries with retailer-product-specific linked packshot | **70** |
| Vemondo entries, including existing, newly EAN-imported and announced | **203** |
| Vemondo entries with linked image | **190** |
| Product records with linked image (all GT categories) | **580** |
| Missing a sourced image (all eligible) | **35** |

Sources:
- PENNY Food for Future category and 70 individually-linked product pages: https://www.penny.de/sortiment/food-for-future
- Vemondo Open Food Facts barcode subset: https://search.openfoodfacts.org/search?q=brands%3AVemondo
- Lidl official burger launch (Chicken Style, Fish Style, Vegetable, Spicy Bean), 2025-10-15: https://unternehmen.lidl.de/pressemitteilungen/2025/251015_vegane-burger
- Lidl global plant-based commitments and country variation: https://info.lidl/unsere-verantwortung/gesundheit-foerdern

**NOT an exhaustive or live inventory.** Lidl reports over 650 plant-based Vemondo alternatives across multiple national markets; over 1,000 vegan-labelled items is the overall Lidl assortment, not the count of Vemondo products available in one German store. Vemondo's 203 are a strict sourced subset: pre-existing items + additional German-market OFF records tagged vegan with EAN and front-pack image + 4 historically announced Lidl burger products. Community data are not manufacturer-certified, and current recipes/sizes/availability should always be checked on physical packs.

PENNY's 70 correspond to currently published assortment-page listings, which may include duplicate display names or varieties and may not all be available in every branch. Each imported entry has the exact URL of the linked product detail page and the first-party packshot used on that page; original retailer images are linked, not copied into this repo. Rights for commercial redistribution must be secured before using downloaded assets in an independent branded product.

## What is actually built

1. Brand view `?view=brands&brand=vemondo` and `?view=brands&brand=penny`, with full-text product search, category filters, 30-per-page lazy display, Rated / Not tried / Unrated / Own Feedback filters, source/size labels and honest image fallbacks.
2. Existing S–F rating flow plus explicit Not tried answer; personal tier ratings for a guest remain in browser, while logged-in ratings sync to Supabase. All **261 new product records** were inserted into `public.gt_products` so foreign-key constraints cannot reject their IDs as unknown.
3. Local persona switch (You / Mikel / Huong) for honest demo ratings. No person can publicly post as a different user.
4. Duo Shuffle can select Vemondo-only, PENNY-only or all products, including for future remote-room rounds; existing vote secrecy and reveal mechanism retained. Brand focus persists in the browser.
5. Invite link via the Web Share API or clipboard; independent friends can open the brand page and start their own shelves. Duo on two separate authenticated phones still requires a real-world acceptance test.
6. Structured product-development feedback: taste (1–5), texture (1–5), value (1–5), buy-again answer, what's working and what could improve. Only someone who gave a real S–F grade can save this additional feedback.
7. Consent is initially **off** for every new feedback note. Feedback is stored locally under `goodthings_sensory_v26`, never automatically posted to a brand or community. Only explicitly opted-in feedback appears in the human-copy/exportable Markdown summary.
8. Tier board performance: initial 80 unranked cards, full search across all 615 products, additional batches on demand; search resets pagination.
9. Photo Lab and Product Detective read the same expanded catalogue. No invented images for source-unresolved products.

## Feedback methodology

Specific, actionable observations are more useful than scores alone. Taste, umami, texture, dryness/juiciness, aftertaste, value, availability and packaging can help brands spot product-improvement opportunities. Report counts and metric results are individual opinions until enough independently collected, consented evaluations exist. Never invent engagement numbers, brand relationships, sample sizes, prices or results.

## QA performed

- All touched client JavaScript files parse successfully.
- Source merge yields 617 IDs and 615 rankable products with no duplicate product IDs.
- PENNY brand view includes 70 source-backed items; Vemondo includes 203 entries; four burger descriptions are transparently photo-pending.
- Mocked feedback flow: valid rated products can save sensory notes; unrated entries cannot; opt-out notes are excluded from manufacturer reports; consented notes appear in generated Markdown.
- Supabase database verified with read-only query after inserts: 617 total products, 70 PENNY import IDs, 203 brand-Vemondo rows.
- Supabase ownership-based ratings RLS policies inspected: account-owner inserts/updates, own/private or public reads; duo room host/participant policies also present.
- Tier-board pagination code and brand-filtered Duo selection compile; full end-to-end browser and two-device acceptance tests still needed.

## Important unfinished gates

- 35 catalogued products do not yet have source-linked packshots, including four officially announced Lidl burger lines lacking precise GTIN/photo.
- The 580 linked images have not all been checked visually in a full browser for current SKU/variant, pixel quality or hotlink availability.
- The additional sensory notes **do not sync across devices** yet; only existing tier ratings use Supabase.
- Real two-device login, invitation and hidden Duo vote reveal has not been fully acceptance-tested.
- Before inviting commercial partners or automatically aggregating user-submitted feedback, add a secure, consented server-side data model, moderation, abuse prevention and manufacturer's permission for the use of owned imagery.
- Never equate 203 Vemondo products in this snapshot with the complete worldwide range of 650+.

## Three first-week experiments

- **Mikel × Huong:** each rates 10 products independently; test subjective compatibility and record 3 concrete improvement notes.
- **Five Friends Challenge:** ask five friends to rate a small PENNY or Vemondo set; count genuinely completed tasting sessions rather than clicks.
- **Manufacturer report pilot:** only with explicit opt-in, compile 10 specific feedback observations, share voluntarily with the relevant company, and monitor whether a product team actually replies or requests more data.
