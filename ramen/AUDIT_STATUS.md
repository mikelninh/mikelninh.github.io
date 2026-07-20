# Ramen Passport audit status

Last deterministic release audit: **2026-07-20**

## Current verified snapshot

- Products in the tier list: **50**
- Deterministic product-specific packshots: **50 / 50**
- Germany/EU checked products: **20 / 50**
- Products currently labelled vegan verified: **8 / 50**
- Hard validation errors: **0**
- Open warnings: **24**

The open warnings are not hidden failures. They consist of:

- 21 products whose exact Germany/EU retail recipe still needs review
- 3 German retailer URLs that returned HTTP 403 to the automated bot while remaining valid browser-facing product pages

## Release-gate result

The latest GitHub Actions run completed successfully. It checked:

- exactly 50 products
- unique IDs and popularity seed ranks
- required market and evidence fields
- bilingual evidence
- vegan-status and verification-level enums
- source, buy-link and image URL formats
- link resolution
- image response content types
- review dates on verified claims
- Germany retailer records having a product/buy page

## AI reviewer

The independent source-grounded AI reviewer is implemented but did **not** run in this release because the repository secret `OPENAI_API_KEY` is not configured.

Until that reviewer is enabled, the green status means the deterministic checks passed. It does not mean every product has completed independent semantic review.

## Product-image rule

All 50 entries now have a deterministic product-specific packshot URL and a separate image-source URL. If a third-party image host later blocks hotlinking or removes an image, the live UI falls back safely and the weekly release gate should surface the broken image URL.

## Germany-first rule

A product is only counted as Germany/EU checked when its verification level is either:

- `germany-retailer`
- `official-eu`

A global or US vegan claim is not automatically transferred to the German pack. Exact pack, market, ingredient list and GTIN take precedence.
