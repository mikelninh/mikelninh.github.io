# Ramen Passport

Germany-first, source-visible instant-ramen ranking.

**Live:** https://mikelninh.github.io/ramen/

## What it does

- one-product-at-a-time **Quick Rank** with S/A/B/C/F keyboard controls
- full drag-and-drop board for review and rearrangement
- Germany/EU-first, vegan-verified, all-product and not-tasted queues
- product-specific packshots for all 50 entries
- visible market, vegan status, evidence, source, GTIN and buying route
- local tasting notes for taste, texture, value, rebuy and free text
- downloadable ranking cards and challenge links
- vegan full-meal generator and sourced ramen hacks
- English by default with optional German

Rankings and tasting notes remain in the visitor’s browser.

## Trust model

Market availability, vegan status, packshot identity and buying route are separate claims.

Verification levels:

- `germany-retailer` — an exact German retailer/product record supports the claim
- `official-eu` — an official European product record relevant to Germany supports it
- `official-global` — an official manufacturer record supports the cited version, but not necessarily a German pack
- `needs-germany-review` — the German/EU recipe still needs review

Vegan labels:

- `verified` — explicit vegan, plant-based or no-animal-origin evidence for the cited version
- `not` — animal ingredients are documented
- `vegetarian` — explicitly vegetarian but not sufficiently vegan-verified
- `check` — exact package or market formulation still needs checking

The physical package remains authoritative because recipes can change by market, importer, GTIN and production date.

## Project structure

- `index.html` — product interface
- `styles.css`, `upgrades.css`, `quick-rank.css` — visual system
- `app.js` — core board, filters, language, product details and meal generator
- `ux-v2.js` — progress and sharing
- `quick-rank.js` — one-at-a-time ranking, notes, undo and challenge links
- `ramen-data.js` — local 50-product seed dataset
- `germany-overrides.js`, `germany-round*.js` — reviewed market-specific layers
- `image-round4.js` — reviewed deterministic packshots
- `scripts/check-ui.mjs` — syntax, local-asset and interaction smoke checks
- `scripts/validate-data.mjs` — schema, sources, URLs and image validation
- `scripts/resolve-images.mjs` — packshot research report
- `scripts/agent-fact-check.mjs` — optional independent source-grounded reviewer

The website repository temporarily retains a mirrored copy at `../vegan/ramen-data.js` for compatibility. CI rejects a release when the mirror and `ramen-data.js` differ. The local ramen copy is ready to become canonical in the standalone repository.

## Run locally

From the `ramen` directory:

```bash
npm run serve
```

Then open:

```text
http://localhost:8000/ramen/
```

Run the release checks with Node 22+:

```bash
npm run check
```

## Automated release loop

GitHub Actions checks relevant pushes and pull requests, plus a weekly scheduled run:

1. JavaScript syntax and local assets
2. duplicate HTML IDs and required Quick Rank interactions
3. dataset synchronization during migration
4. exactly 50 unique records and ranks
5. bilingual evidence and popularity rationale
6. supported market and vegan states
7. source, buy and image URLs
8. deterministic packshots and image content types
9. optional AI contradiction review when `OPENAI_API_KEY` is configured

Missing evidence or ambiguous market recipes must remain visibly unverified rather than being upgraded through inference.

## Standalone repository migration

The standalone repository should contain:

```text
ramen/
.github/workflows/ramen-data-check.yml
.github/workflows/ramen-data-quality.yml
```

After moving the contents of `ramen/` to the new repository root:

1. change the first script in `index.html` from `../vegan/ramen-data.js` to `ramen-data.js`;
2. update workflow paths from `ramen/**` to root-relative paths;
3. update public URLs from `/ramen/` to the new deployment URL;
4. run `npm run check` before enabling deployment.

The current implementation has no framework or build dependency, so it can deploy directly through GitHub Pages, Vercel, Netlify or any static host.
