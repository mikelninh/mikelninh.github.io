# GOOD THINGS — Mikel & Huong's Rating Studio

**Website after publishing:** https://mikelninh.github.io/good-question/ratings/
**Public JSON dataset:** https://mikelninh.github.io/good-question/ratings/products.json

## Product data and evidence
- 123 named product candidates in 12 groups: tofu and tempeh, plant milks, yoghurt, cheese, main dishes, snacks, chocolate, ramen, spreads and deli toppings. Six Lidl/Vemondo options are scouting categories, not confirmed exact product variants.
- 101 source-linked product photo URLs, mainly matching REWE article IDs and original product-page links. The first six loaded in Chromium checks. Third-party image availability and reproduction permissions are not guaranteed; broken links fall back to name and source. Prefer original images taken by the founders or licensed packshots for commercial use.
- 12 selected nutrition records with sourced protein and sugar values (per 100 g or 100 ml). Remaining unknown fields are JSON null, NEVER zero. Self-entered package numbers remain visibly unverified local notes.
- Origins deliberately separate the legal company address, agricultural/ingredient origin and actual place of manufacture. A company address does not prove manufacturing location. Ingredients, allergens, vitamins, fibre and salt are displayed where sourced; missing fields say "Nicht geprüft."
- All products carry a source URL and review status. No prices or affiliate links are invented; no founding couple's ratings are prefilled. Retailer product categorisation is not a blanket certification that all market variants are vegan.

## How Mikel and Huong use it
1. Select whose local column to edit: MIKEL or HUONG.
2. Search, filter or open any product and mark it tried. Grade S/A/B/C/D independently; record buy-again, shop and tasting notes.
3. Enter protein/sugar and origin based on the actual package when available. These stay local and marked as self-entered, not as new editorial facts.
4. "Meine Ratings teilen" shares only selected profile's product IDs, tier/tried flags and buy-again selections. **Never includes free-text notes, shops or health data.** Links are unverified claims of authorship — no account or identity verification.
5. On the other device, accept an incoming link either using merge-empty-only (protects existing scores) or a separately confirmed explicit override (retains any personal text notes). Back up every full session with exported JSON and import into empty slots later.
6. Add personal products or current Lidl packages with photo and cited nutrients; they remain local until deliberately exported and verified for inclusion.

## Architecture
- products.json: public canonical names, images, sources, label-proven nutrition, independent production fields.
- index.html and style.css: original responsive independent-magazine layout.
- app.js: filterable catalogue, dialogs, localStorage and two-person import/export workflows. No paid API, database, cloud sync, newsletter registration or hidden affiliate redirects.
- qa_catalog.py: static source/metadata and credibility checks.
- qa_browser.mjs: real Chromium 360/390/768/1440px, source-photo loading, nutrition, independent Mikel/Huong grades, cross-device link round trips, conflict handling, custom products and JSON export.
- GitHub workflow good-things-ratings.yml: repeat both test suites on pull request and release.

## Next editorial priorities
- Verify more exact individual products: photographs, ingredients/allergens, protein/sugar and the actual manufacturing origin where disclosed. Do not fill unknowns using similar products.
- Replace externally hosted package images with originals or explicitly licensed assets.
- Publish only genuinely tasted Mikel/Huong favourites with both contributors' permission; disclose any affiliate relationship before a product link.
- Observe whether local two-person sharing meets their needs before building optional secure accounts.

**It will not and cannot be perfect. Keep the claims honest, the experience lovely, and the backlog small enough to finish.**
