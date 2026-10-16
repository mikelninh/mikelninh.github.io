# Interbeing 2.0 — The Root Atlas

From interconnected suffering to shared solutions.

## Published routes

The root `interbeing/index.html` is now the problem-first atlas. The exact previous homepage is preserved as `friends-v1.html`; its assets, `design-02/` and `space/` remain unchanged.

## Release scope

62 nodes and 109 typed relationships: eight working root-driver families, ten problem domains, fourteen responses, nine mapped organisations, fourteen specific mechanisms and seven response navigation groups. Sixteen source records. Three worked pathways: food and animals; poverty and access to care; coexistence.

Visitors can trace roots, inspect each relationship, compare responses and their trade-offs, examine a four-link care/poverty loop, switch between map, list and spatial projection, explore programme activities, save a local research step and share a selected pathway. The optional role and saved step are excluded from share URLs and cards. PNG cards are generated in the browser.

This is a qualitative, editorial atlas. Driver families organise inquiry, not eight scientifically established causes of everything. Organising links, evidence-informed claims, ethical lenses, hypotheses and proposed responses retain separate labels. No causal weights, moral scores, calibrated future forecasts or independent expert review are claimed. Ecosystems are represented as life-support systems without assuming they are sentient. Scope includes all potentially sentient beings and future beings, but current coverage is not exhaustive.

## Files and operation

- `index.html`: the responsive interface.
- `root-atlas.css`: visual language and layouts.
- `root-data.js`: self-contained readable dataset builder; exposes `window.ROOT_ATLAS`.
- `root-atlas.js`: navigation, graph views, inspector, comparison, sharing and local storage; exposes `window.InterbeingRoot` for tests.
- `qa/test_v2_public.py`: actual-origin publication and browser verification.

No libraries, external application API, analytics or account are required. Run from any ordinary static server. The two local storage keys are `interbeing.step.v2` and `interbeing.role.v2`; privacy controls clear both. Reflections are copied or downloaded, not submitted to a central inbox. Clipboard failure has a manual-selection fallback; blocked storage is reported rather than silently claiming success.

## Release evidence

245 local Chromium checks passed during development: inline document rendering, semantic endpoint checks, every node/edge detail, pathways, loops, filters, 3D controls, exports, share-state reconstruction and seven widths. Local navigation was unavailable in that environment, so those checks are not hosted-origin, physical-device or scientific validation.

The CI workflow separately waits for five published files to match repository bytes, then navigates the real public HTTPS origin in Chromium. It tests paths, the loop, programmes, local-storage reload, a shared-link roundtrip, PNG download, responsive layouts and the archived Friends Edition. The actual run result and screenshots—not this README—determine whether hosted verification passed.

No five-friend comprehension study or independent scientific review has yet been conducted. Those remain separate release-learning activities.
