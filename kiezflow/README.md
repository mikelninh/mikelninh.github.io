# KIEZFLOW · Berlin in Motion — Release 1.0

**Eine Stadt. Deine Entscheidung. Zwei mögliche Ausgänge.**

An independent, playable City Twin / AI Solution Engineering work sample by Michael Ninh.

**Play:** https://mikelninh.github.io/kiezflow/  
**Source:** [index.html](./index.html) — self-contained HTML, CSS, synthetic fixtures and JavaScript engine; runs without external services.

## Experience
1. Start a fictional Berlin shift and watch activity on the map.
2. Apply a surge + vehicle-breakdown scenario.
3. Place a reserve team in a district.
4. Drag the map split to compare the baseline and the newly calculated alternative.
5. Open a case in Street Lens, inspect the assumptions, and optionally run the separate human-approval → dispatch → mobile completion → audit demo workflow.

## Proof and limitations
- All reports, team positions, times and outcomes are **synthetic**. The Berlin district outlines are publicly sourced and simplified.
- The model is a **deterministic heuristic**, not a trained AI model or real BSR forecast.
- Hypothetical planning is deliberately separate from operational human approval.
- Browser state and audit events are local to the visitor's browser, **not tamper-proof** or multi-user.
- Reserve routes are illustrative straight-line approximations; there is no real-world vehicle positioning or routing.
- The app has no backend, login, tracking, analytics, paid service or government integration.

**Independent portfolio demonstration. Not commissioned by, affiliated with or endorsed by Berliner Stadtreinigung (BSR).**

## Release quality evidence
The original modular release was tested locally on 2026-10-09:
- Node.js model tests: **22 passed, 0 failed**.
- Playwright desktop (1512px), mobile (390px, 320px) workflows passed, including comparison, Street Lens, result export and status/audit flow.
- No hardcoded secrets found in a source keyword scan.
- Hosting-specific availability and remote smoke are verified separately and should not be inferred from local tests.

## Architecture
The standalone HTML bundles the original modular `index.html`, `styles.css`, `app.js`, `engine.js`, `assets/fixtures.js`, `assets/berlin-map.js` and `assets/street.js`. To modify modular files, use the original release source package and regenerate the standalone build.

See [MODEL_CARD.md](./MODEL_CARD.md) and [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md).

### Geographic attribution
District shapes derived, simplified, and adapted from [Berlin-Geodaten by funkeinteraktiv](https://github.com/funkeinteraktiv/Berlin-Geodaten), **CC BY 3.0 DE**, originally sourced from Amt für Statistik Berlin-Brandenburg. All operational reports and case illustrations are fictional.

© Michael Ninh, 2026. Attribution for third-party geographic data above.
