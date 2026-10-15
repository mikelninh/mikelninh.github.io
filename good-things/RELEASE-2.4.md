# GOOD THINGS 2.4 — CHAOS REVEAL & PACKSHOT QUALITY GATE

**Release date:** 15 October 2026 · **Stage:** GitHub source updated; visual two-device/browser QA outstanding.

## What this release is
A small, deeply playful vegan product discovery experience. The suspense is entirely fictional: no money, prizes, pay-to-spin mechanics, invented probabilities, loot-box purchases, or engagement traps. One randomly eligible product is selected from the user's catalogue, then the person can review manufacturer, nutrition, ingredients, allergies, Nutri-Score and pricing before giving an S–F taste rating or marking Not Tried.

## Four optional reveal styles

- **✨ Booster** (existing, refined): holographic foil collectible pack rises; shakes, glints and tears; front packshot (if present) and full product title appear. No mention of reward rarity.
- **🎰 Slots** (existing, refined): three rapid emoji reels, fake slot-machine anticipation and comic congratulation; real product identity determined by the catalogue, **not** the animated reel symbols.
- **🚀 Overdrive** (**new**): exaggerated, intentionally ridiculous slot simulation with brighter palette, kinetic lettering, fast reels and comic "CRITICAL TOFU EVENT" status. All effects are clearly parody; no bets, points, odds, free spins or monetary prizes.
- **◌ Aus**: perform the product fetch/selection without animated overlay.

UI in both Solo and Together exposes a four-option segmented control. Selection persists via `goodthings_shuffle_motion_v22`; existing `arcade`/`quick` preferences migrate to Slots. Private browsing with blocked storage retains the in-session choice. The browser's "prefers-reduced-motion" disables all overlay motion regardless of the selected option. "Überspringen" and Escape end the presentation while the product fetch completes, and the UI avoids a false reveal when no eligible item is available.

## Random draw quality requirements

1. Source-backed exact packshot from barcode, manufacturer or retailer and no broken-photo flag.
2. Preload resolution, then show card only after selection.
3. Do not reroll to improve perceived tier, boost manufacturer popularity or modify outcome based on a probability claim.
4. Distinguish product `id` from display name to avoid false duplicate-name reveal.
5. Keep Duo's first private vote concealed until both have answered; retain account and guest storage semantics.
6. Product information is accessible **before rating**: verifiable ingredients, manufacturer, allergen uncertainty, nutrition, transparent Pro/Contra signals, factual Nutri-Score A–E or unknown, price provenance.

## Image integrity: objective and status

- **Total rankable catalogue: 354.**
- **Source-linked packshots: 323.**
- **Without sourced packshots: 31.**
- Linked is not the same as full-resolution checked or manually variant-verified.
- The 31 remaining unknown/ambiguous products are recorded in [PHOTOS-NEEDED.md](PHOTOS-NEEDED.md), grouped by category with ID and source-research links.
- Sources added in this sprint retain original product IDs and include a retailer SKU or GTIN and a source URL.
- In ambiguous cases (e.g. Greenforce fresh vs. dry hack, obsolete variant names), **leave missing** rather than falsely marking a matching-looking package as exact.
- Photo Rescue Lab supports product candidate discovery, EAN/GTIN validation, native image dimensions, explicit human attestation, local application and export. It does not silently publish global catalogue changes.
- Images must respect their source's permitted re-use, including Open Food Facts image CC BY-SA/attribution and appropriate permissions for retailer/manufacturer packshots.

## Release acceptance gates

| Gate | Criterion | Current evidence | Status |
|---|---|---|---|
| JS syntax | All touched JavaScript compiles | Connector-fetched source checked with `new Function` | Pass |
| Reveal behaviour | Booster, Slots, Overdrive, Off each run the task once and show/skip appropriately | Isolated mocked DOM tests; zero-stakes overlay | To retest for 2.4 |
| Preferences | Persist and switch without altering stored ratings | Source implementation, can verify in browser | To retest |
| Reduced motion | System preference or Off skips animated overlay | Source and isolated tests | To retest |
| Packshots | No false/invented photos for 354 distinct products | 323 linked; 31 unresolved | **Not passed** |
| Photo network QA | All 323 URLs load in actual modern browsers with native size and exact variant | Photo Lab supports manual batch audit | **Not passed** |
| Duo real devices | Two separate authenticated phones, independent voting, reveal and saving | Not tested here | **Not passed** |
| Mobile UX | Animation/Photo Rescue accessible on small phones | Responsive CSS, needs visual audit | To verify |
| Friends invite | Snapshot sharing and separate account creation | Earlier implementation | Regression test pending |

## Smoke-test script

1. Open `/?view=solo` as guest; select **Overdrive** and press spin. Confirm suspense runs while catalogue photo loads, then product facts are visible and the first vote is still unanswered.
2. Repeat with **Slots** and **Booster**. Test **Aus** and full keyboard support. Refresh to confirm preference sticks.
3. Emulate reduced motion; no overlay should animate, even with Overdrive preference stored.
4. Open Together, start local, vote Mikel, ensure no premature reveal, vote Huong, then verify side-by-side grades and discussion save. Repeat on two logged-in devices when available.
5. Open Photo Lab; audit all sourced images for dimensions, export CSV, check failed URLs and manually inspect variant/product identity.
6. For missing examples, try Photo Rescue auto-candidate search. Never approve a different flavour, size, barcode or brand. Export locally approved fixes for reviewer merge.
7. Share tier-list challenge link; verify the recipient can open snapshot and start their own board.

## Next gate: complete trustworthy photos

Resolve the 31 entries by source-backed EAN/SKU or official maker imagery. If an item no longer exists as named, mark it as legacy/archived using a backwards-compatible migration rather than silently assigning a different flavour to its historic product ID. Do not claim 354/354 until every remaining record is resolved and all URL/visual checks are complete.
