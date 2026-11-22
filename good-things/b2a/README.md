# GOOD THINGS · Agent Lab v0.1

**Isolated pilot branch; not production release.**

## What is built
- catalog.json: inspectable, source-linked read-only product snapshot covering six existing source arrays (currently 616 records).
- index.html: visual ten-task test bench for humans.
- agent-lab.js: deterministic scenario responses that expose missing information rather than fabricate it.
- contract-tests.mjs: ten reproducible Node safety checks.
- generate-catalog.mjs: offline regeneration from checked-in catalogue source arrays.

## Rebuild and test
From repository root:
- node good-things/b2a/generate-catalog.mjs
- node good-things/b2a/contract-tests.mjs

Then serve the existing static GitHub Pages root and visit /good-things/b2a/.
The pilot page has noindex,nofollow and is deliberately not linked from the production site.

## Do not overclaim
This is **not** a live shopping assistant and **not** a real-model evaluation.
The six source arrays are a snapshot, not the entire live merged catalogue (other brand and macro overrides create additional records). Source-reported product listings and nutrition may be out of date and are not independent verification of ingredients, vegan status or nutrition. Prices and store inventory are null by design. Meal plans cannot claim a €35 cap without sourced prices and recipe yields. No Netto records appear in this snapshot, which does not mean Netto has no vegan products. Open Food Facts content requires ODbL attribution, with original product sources retained. No third-party images are copied.

## Next release gates
Human review of ingredients, recipe costs and allergens; a verified price/availability provider; independently driven model/browser tasks; opt-in analytics; and explicit approval before shipping live.
