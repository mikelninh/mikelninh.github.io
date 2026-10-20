# GOOD THINGS — Mikel & Huong's 70-item testing shelf

**Issue:** 001. **Release:** editorial candidate, 12 Oct 2026.
**Published link (after merge):** https://mikelninh.github.io/good-question/slow/first-letter/staples-atlas/

## Product scope
70 separately rateable source-labelled physical-product candidates across 9 categories: plant milks, tofu/tempeh, yogurt, cheese alternatives, meat alternatives, sandwich toppings/spreads, crisps, chocolate and ramen. One additional specific 113g Nongshim Toomba German retailer cup is kept under **Ingredient Watch**, excluded from vegan reviews because the referenced ingredients contain milk/fish derived items.

Products sourced from brand and retailer pages, including REWE, Lidl, dm, Taifun, Alpro, Simply V, Violife, Beyond Meat, Ritter Sport, Oatly, Kettle, Nongshim and others. Some listed product versions or example packshots are imported from other markets. **This is a tasting queue, not 70 products we personally used, tested or conclusively certified vegan.** No prices, paid rankings, affiliate links or fictional S grades.

## Real package photos and caveats

`catalog.js` stores real source-URL image links (71 total), plus product URLs. The image has a visible publisher-domain credit; when a remote image does not load, the fallback is an explicit **photo unavailable** label plus a source link, **not a fictional generated package picture**.

External packshots are not licensed by merely linking them. **Clear rehosting or commercial editorial rights**, take own photos and audit each actual ingredient pack and market before promotion/affiliate activation. Some CDNs may reject hotlinks, some old/current-country photos may change. Regional caveat is marked in product cards.

## Rating semantics

Mikel and Huong columns begin **blank**. Each user's locally editable grade is an unauthenticated browser draft, not proof either human authored a review. A share URL contains compact grades for valid product IDs and the chosen language; visitors may enter both columns themselves and copy their own drafts. Never call this an authentic published Mikel/Huong tier list until each person approves the exact products and their personally authored scores.

Saved shopping candidates are kept in the browser, not synced to accounts, analytics or emails.

## Release checks

```sh
python3 good-question/slow/first-letter/staples-atlas/qa_catalog.py
python3 good-question/newsroom/check_content.py
node --check good-question/slow/first-letter/staples-atlas/app.js
# Browser checks on GH Actions via .github/workflows/good-things-atlas-qa.yml
```

QA checks software, not independent dietetic fact-checking or every product's legal/licensing eligibility. Audit browser-visible imagery separately and replace failing URLs with grounded replacements or licensed local photographs. Date any manual image review. No discount or affiliate offer is active.

## Growing responsibly

A true public product tier should use an exact German/EU pack identifier or EAN, front and back photos, ingredients/allergens checked with date and country, actual personal taste notes, price and where purchased, repeat-buy decision, any sponsoring and affiliate disclosure, and approval by the named rater. Collect first small authentic taste sets before monetising.
