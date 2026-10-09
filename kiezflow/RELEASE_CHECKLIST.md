# KIEZFLOW · Public release checklist

Date: 2026-10-09  
Release: RC 1.0  
Source: `kiezflow/index.html` and original downloadable release archive.

| Gate | Result | Evidence |
|---|---|---|
| Independent explanation + synthetic data disclosure | PASS | Visible in footer and methodology dialog |
| Safety/authority boundaries | PASS for prototype | Protected transition tests; human approval required |
| Core simulation | PASS locally | 22 Node tests |
| Main journey desktop | PASS locally | Browser workflow at 1512px |
| Main journey mobile | PASS locally | Browser workflow at 390px and 320px |
| Security keyword scan | PASS for scanned patterns | No secrets/key literals found; not a full audit |
| GitHub persistence | PASS | Source committed under `mikelninh.github.io/kiezflow/` |
| GitHub Pages publication | MUST VERIFY | Check https://mikelninh.github.io/kiezflow/ independently |
| Public live smoke | MUST VERIFY | Compare mode, street view, export, mobile, console |
| Real user feedback | NOT YET | Recruiter or tester session with recorded signal |
| Standalone dedicated source repo | OPTIONAL FOLLOW-UP | Publish original modular code + test suite in separate repo |

### Smoke test
1. Open URL with a clean browser session.
2. Run the "Doppelschock" scenario and place a reserve team in Neukölln.
3. Use map comparison via mouse and keyboard.
4. Open Street Lens; move the comparison slider.
5. Export PNG and JSON (verify the files are produced).
6. Enter case workflow: review → approve → dispatch → mobile completion → audit.
7. Open on a 320px mobile viewport; confirm no horizontal overflow.
8. Verify claims and notes do not suggest an official BSR integration.

Do **not** call this release fully shipped until remote publication and live smoke have been confirmed.
