# KIEZFLOW / Simulation Model Card (v1.0)

## Intended use
A limited educational work sample demonstrating spatial prioritization, workflow design and human-in-the-loop decisions in a fictional municipal setting. **Not** for operational dispatch, workforce planning, public-safety decision-making or estimating BSR performance.

## What the model does
- Generates a deterministic eight-hour work shift over five-minute increments from fixed synthetic case fixtures.
- Estimates travel time using simplified straight-line distance, speed and fixed overhead; service durations are scenario assumptions.
- Prioritizes ordinary cases using a transparent heuristic and capacity limits.
- Tests the consequence of placing one reserve team in a selected district, and computes the resulting differences in plan and outstanding workload.
- Suggests possible duplicate reports using character n-grams, category and spatial proximity. Scores are **similarity indicators, not calibrated probabilities**.

## What the model does not do
- Train or call an LLM, vision or route optimization service.
- Reflect true vehicle positions, road network, Berlin waste-disposal logistics or staffing levels.
- Validate real-world benefits, financial savings or impact.
- Make final operational approvals. The independent demo workflow requires an explicit human interaction and restricts hazardous case transitions.

## Controls
- Hazardous case flags remain blocked from ordinary scheduling and approval.
- Separate simulated planning from human-mediated demo status changes.
- Browser-local audit is illustrative; it lacks server controls, identity verification, access policies or immutable storage.

## Data and geography
Synthetic operational fixtures, no personal reports. Simplified district boundaries from funkeinteraktiv/Berlin-Geodaten (CC BY 3.0 DE, originally Amt für Statistik Berlin-Brandenburg). Simulated dots and lines are not geolocated real incidents.

## Validation and gaps
Local model: 22 tests passed on 2026-10-09. Desktop/mobile and representative interaction flows tested. No genuine BSR validation, real field usability study, production security review, regulatory audit, or calibrated prediction study. Keep all those limitations visible.
