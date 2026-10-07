# OUT OF PANEL · 0.4 — A world on the inside

A playable, self-contained creative experiment by Michael Ninh / HYPERSPACE.
AI-assisted development and illustration. This is a preview, not a manufactured
product, NFT sale, ownership verifier or physical redemption system.

## Try it

Open `index.html` in a browser. Start with the coin. Drag or tap to rotate it,
then choose **Look inside**. **Please return to page 04** opens an interactive
after-panel moment. Return the coin by dragging or by pressing **Give it back**.
The paper star is a free SVG keepsake. **Play** opens Infinite Four;
**Read** opens the existing eight-page reading edition.

## What's new

- The original First Light mesh and turn/flip interaction remain intact.
- A live, vector-drawn rooftop appears in the actual aperture, projected with
  the same model rotation in the WebGL and software rendering paths.
- The window expands into a tiny sunset world: black cat, plants, laundry,
  skyline, a warm lamp and tea. Reduced motion holds the scene still.
- A reversible page-04 exchange adds a thank-you star; it does not burn or
  transfer an asset. This is a new after-panel scene, not a replacement of
  the original comic's artwork.
- Shared links use `?gift=window#object` to greet the recipient. Offline
  invitations save a self-contained HTML with the same greeting.
- Feedback prepares an email to `mikel_ninh@yahoo.de`. Visitors must review
  the draft and send it in their email app. Copy and TXT alternatives exist.
  Browser/device details are excluded unless explicitly selected.
- Local v3 progress can be migrated to a separate v4 storage key. No analytics,
  remote AI calls, account prompts or third-party runtime assets are added.

## Game and reading boundaries

The computer opponent is a local heuristic, not a proven optimal solver.
Solo and local pass-and-play are supported; link sharing is a board snapshot,
not online multiplayer. Casual games end at 120 moves if neither player wins.
Clocks pause away from the game and when dialogs are open. The interior comic
art remains the earlier design/reading study, not approved HYPERSPACE canon.

## Validation

`QA-results.json`: 61 checks passed in Chromium using Software 3D.
Coverage includes spin intermediates, mouse drag, keyboard controls, cancelled
pointers, cancelled return transitions, drop and button return, SVG keepsake,
all win directions, heuristic replies, eight comic pages, reader zoom, draft
feedback, offline invitations, reduced motion and 320–1440px widths.

Limits: no Safari, physical-phone or GPU-path validation. Storage testing used
an explicitly simulated Storage object because the local browser disallowed
storage at `about:blank`. Email delivery was not tested or submitted. Public
origin checks are recorded separately when the deployment is verified.

## Source

`source/` contains the modular HTML, JS and CSS. Build the portable page with
`python source/build.py`. Run QA with an installed Python Playwright package
and Chromium, or serve the modular source with an ordinary static server.

No external package or build dependency is needed to run the app itself.
