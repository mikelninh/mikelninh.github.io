# Ramen Passport · Germany-first

Live page: `https://mikelninh.github.io/ramen/`

This directory contains the Germany-first ramen ranking experience. The product list is fun and shareable, but the data model is intentionally strict: market version, vegan status, evidence, product image and buying link are separate claims and must be checked separately.

## Files

- `index.html` — English-first interface with optional German
- `styles.css` — tier list, audit dashboard and random-pick modal
- `app.js` — ranking, filters, image handling, language, local persistence and random-pick ranking
- `germany-overrides.js` — Germany/EU-specific corrections layered over the broader 50-product seed list
- `scripts/validate-data.mjs` — deterministic schema, duplicate, URL and image-response checks
- `scripts/agent-fact-check.mjs` — optional independent source-grounded AI reviewer

The broader popularity seed currently lives in `../vegan/ramen-data.js`. Germany-specific truth overrides the broad seed on this page.

## Verification levels

- `germany-retailer` — a German product or retailer page supports the cited pack; record GTIN when available
- `official-eu` — an official European product catalogue supports the claim and is relevant to Germany/EU
- `official-global` — a current official manufacturer page supports the product claim, but the German retail pack is not yet verified
- `needs-germany-review` — do not present the product as Germany-verified

## Vegan labels

- `verified` — the cited version is explicitly described as vegan, plant-based or free of animal-origin ingredients
- `not` — the cited version contains animal ingredients or is explicitly not vegan
- `vegetarian` — explicitly vegetarian, but not sufficiently verified as vegan
- `check` — insufficient evidence, market-specific variation or an exact-pack check is required

The exact physical package always wins over this database. Recipes can change by country, importer, GTIN and production date.

## Required data

Every product must include:

- unique `id`
- unique seed `rank`
- `brand` and `name`
- `country` and `style`
- `spice`
- `market`
- `vegan`
- bilingual `evidence`
- working `source`
- `verificationLevel`

Germany-checked entries should additionally include:

- `gtin`, when available
- `verifiedAt`
- German product or buying URL
- deterministic packshot and image source, when legally and technically usable

## Release gate

The GitHub Actions workflow `.github/workflows/ramen-data-check.yml` runs on relevant pushes, pull requests, manual dispatches and every Monday.

The deterministic audit checks:

1. exactly 50 products
2. required fields
3. unique IDs and ranks
4. supported verification states
5. bilingual evidence
6. valid source, buy and image URLs
7. explicit review date for vegan-verified claims
8. URL resolution and image content types

Hard contradictions, missing required fields, DNS failures and 404/410 links fail the release gate. Bot-blocking responses such as 403 are reported as warnings because they do not necessarily mean the public browser link is broken.

## Independent AI reviewer

When the repository secret `OPENAI_API_KEY` is configured, the workflow also runs `scripts/agent-fact-check.mjs`.

The reviewer re-opens the supplied sources and checks:

- whether the source supports the displayed claim
- whether the cited market matches Germany/EU
- whether vegan status is justified
- whether the image matches the named product
- whether the Germany buying link offers the same version

It returns `PASS`, `REVIEW` or `FAIL`. Contradictions fail the workflow. Missing or ambiguous evidence should become `REVIEW`, never an invented confident claim.

## Images

The UI clearly labels the image state:

- `packshot` — deterministic product image supplied in the dataset
- `database image` — matched through Open Food Facts and cached locally in the browser
- `illustration` — safe fallback; not a real product image

A fallback keeps the interface usable, but it does **not** count as image-complete. The data-health dashboard shows the actual real-image count.

## Local preview

Serve the repository root through a local HTTP server, for example:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/ramen/
```

Run the deterministic gate with Node 22+:

```bash
node ramen/scripts/validate-data.mjs
```
