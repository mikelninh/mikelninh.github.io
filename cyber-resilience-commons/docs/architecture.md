# Architecture

Static, browser-only application.

## Modules
- `data.js` — synthetic organization templates, controls and incident scenarios.
- `simulator.js` — deterministic blast-radius, recommendation and recovery logic.
- `app.js` — UI state/rendering.
- `index.html` + `styles.css` — public interface.
- `test.mjs` — simulator invariants.

## Data flow
`template + scenario + controls → simulate() → step statuses + impact metrics → recommendations / compare / recovery → UI`

## Security boundary
No backend, credentials, target URLs or arbitrary code execution. The browser simulation only reads bundled synthetic data. The model cannot probe a real organization because no such capability exists in V1.
