# MIA · SKYLOOP v0.7 — Dive · Release · Soar

**Public game:** https://mikelninh.github.io/beyond-cv/mia-little-lights/  
**Portfolio:** https://mikelninh.github.io/beyond-cv/  
**Archived previous version:** [PAWPRINTS v0.6](./archive/pawprints-v0.6.html)

## New playable interaction

Hold Down / S (or **DIVE** on touch) while airborne to build momentum, then **release** to convert that dive into genuine upward flight momentum. Brief taps do not trigger the bonus. One lift per flight; it recharges on landing. An interrupted/cancelled touch aborts without triggering an unintended boost.

The stage still offers its sleeping lantern, flower bridge, moonwind, air kick, Paw-Spring, three musical rings, hidden wind chime, window finale, postcard and replay.

## Technical release gate (tested locally in Chromium)

- [x] Unlock lantern through normal platform movement and jumps
- [x] Charge dive and verify actual negative Y-velocity on release
- [x] No free boost for an insufficiently charged tap
- [x] No repeated lift before landing; proper recharge after touchdown
- [x] Mobile DIVE control, pressed state and pointer-cancellation behavior
- [x] Full physics-driven quest through all 3 beats and finale
- [x] Musical rings preserved; postcard exported; replay restarts
- [x] No uncaught JavaScript errors in tested routes
- [x] Public GitHub Pages URL returns SKYLOOP; production build READY
- [ ] Human delight rating: **not yet measured for v0.7** (target 7+/10)

**Asset note:** The game uses procedural Canvas art, synthesised sound and the existing in-project AI-assisted skyline. No external asset packs were introduced. No login or analytics are required.

**Known portfolio visual limitation:** The Beyond the CV card currently uses an accurately labelled screenshot from the earlier SkyDance version; the game behind its play links is v0.7. A fresh v0.7 gameplay thumbnail remains a follow-up.
