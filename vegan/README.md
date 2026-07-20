# Vegan Product Lab · Global Ramen 50

This directory contains the English-first, bilingual vegan product lab at:

- https://mikelninh.github.io/vegan/

## Files

- `index.html` — page structure and English/German copy
- `app.css` — layout, tier-list cards, responsive UI and sharing states
- `app.js` — ranking, filters, language switch, local persistence, random picks and sharing
- `ramen-data.js` — the 50-item ramen dataset, popularity order, vegan status, sources and image lookup data

## Global Ramen 50 methodology

There is no single audited public dataset that ranks individual instant-noodle products by worldwide sales. The candidate order is therefore explicitly **popularity-weighted**, not presented as an exact universal sales chart.

Signals used:

1. official manufacturer scale and flagship-product claims
2. worldwide instant-noodle consumption markets
3. availability across major retailers and Asian supermarkets
4. cultural impact and recognisability
5. recent expert and enthusiast recommendations
6. diversity across major markets and styles

The website’s main purpose is the visitor’s personal tier list, not the seed order.

## Vegan status

Every ramen uses one of four labels:

- `verified` — an official product page or manufacturer FAQ explicitly describes the referenced version as vegan, plant-based, or containing no animal-origin ingredients
- `not` — the referenced version explicitly contains animal ingredients or is an animal-flavour product without a plant-based claim
- `vegetarian` — explicitly vegetarian, but not sufficiently verified as vegan
- `check` — formulations vary, the evidence is incomplete, or the exact imported pack must be checked

Because formulations change by region and production date, the concrete package always takes precedence.

## Product images

The UI uses this order:

1. a fixed official packshot URL when a stable one is available
2. a product search against Open Food Facts, cached locally in the browser
3. a generated labelled illustration as a safe fallback

This means every card has a visual, while missing or blocked external images do not break the layout.

## Privacy and persistence

Rankings, tasted-product progress, language choice, and resolved image URLs are stored only in the browser with `localStorage`. No account is required and no personal ranking data is sent to the repository.
