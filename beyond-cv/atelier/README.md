# Beyond CV — Open Atelier, review release

Two usable, additive entry experiences implement the agreed design brief:

- `/beyond-cv/atelier/`: personal editorial introduction, existing Rift Seed concept/artwork, original conversation questions and an instant one-answer reflection draft.
- `/beyond-cv/dksr/atelier/`: an evidence-withdrawal experiment with three questions, nine claims and explicit, testable dependency rules.

The original Beyond CV, its reflection tool, the DKSR v1 route, the main hiring portfolio and its build scripts are not replaced or rewritten. Compare both experiences before deciding on a complete rollout. Nothing here sends a recruiter email, application or social post.

## Content permission / provenance

Only previously public material is reused: the original Beyond CV motto/questions/future-facing ideas and the existing `hyperspace-kids/assets/v036/rift-seed-art-v3.webp` with its published concept note in `v036.js`. This is clearly an AI-assisted collectible study, not a photograph of Michael's life. No private writing, protected draft, family story, unapproved photograph, fake personal memory or font file is added.

The public artwork stays at its existing same-origin URL. The original free prompt is retained verbatim. The additional question fields are optional.

## Evidence model

`evidence.js` is a small deterministic dependency evaluator, not the COMMONS backend. Its read-only reference projection is traceable to `source-receipt.json`, which preserves source feature IDs and the hash of the supplied archived source file. There is no live feed. Structural model year and retrieval date are different.

Each claim declares required facts and, when applicable, explicitly missing operational prerequisites. Toggling a source withholds only its dependent facts. Two-input claims need both source families. Missing operational capacity, route, cooling and warning information cannot be filled by unrelated sources. Unknown, missing and corrupt data fail closed. Strict reference-value checks prevent a changed numeric value from supporting a fixed-number statement. The result labels are scoped to this stored example, not independent proof of factual truth or municipality-wide applicability.

The old backend's template recommendation is not rewritten or represented as a dynamic ranking. Geometric distance is not walking distance. There is no operational decision or automatic allocation path. Nine claim statuses are evidence states, never confidence scores or ratings of people.

Selected scenario and excluded sources have canonical, bounded query parameters. Browser Back/Forward works. Share links include no personal answers. No-JavaScript mode explicitly presents the unmodified baseline and disables source controls.

## Reflection tool

One optional answer instantly appears in an editable draft; four more questions are optional. The tool arranges visitors' literal words, not AI-generated text. Manual draft edits survive further answer changes. Rebuilding edited content requires explicit action. Clear offers an in-memory undo. Copy has a visible selectable fallback; download matches the edited text. No cookies, localStorage, analytics, model calls, accounts or form service. Reload discards the draft.

## Tests

- `node beyond-cv/atelier/test-engine.cjs` — 24 developer-authored checks including every one of the 16 source masks, exact changed-claim sets, two-input dependencies, invalid inputs, query round trips, immutable records and source-receipt correspondence.
- `python beyond-cv/atelier/verify.py` — actual HTTP/browser journeys, clipboard, download, XSS literal input, edit preservation, undo, history, deep links, source changes, responsive widths 320–1440, reduced motion, no-JS, network boundary and optional axe audit.
- `AXE_PATH` supplies the pinned axe source in CI. CI uploads screenshots and actual JSON reports. Local constrained-browser DOM rendering is not claimed to test HTTP navigation or a secure clipboard.

## Release interpretation

Passing code/browser checks is not a 12/10 quality score. Independent five-person comprehension/recall/usefulness tests, manual screen-reader review and field Core Web Vitals are **not yet performed**. No test-user reactions or performance numbers are invented. Public pages call the design a new chapter for review, not a validated optimum.

Useful next observation: can a visitor explain why reported beds do not imply available care, then disable the hospital source without losing unrelated climate evidence? Does one personal artifact or question remain memorable? Ask what could be removed, not whether it looks impressive.

## Technical references

- https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/
- https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html
- https://web.dev/articles/defining-core-web-vitals-thresholds

WCAG 2.2 AA and good field Web Vitals remain targets, not certifications. No analytics is installed to manufacture those numbers.
