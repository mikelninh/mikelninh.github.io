# OUT OF PANEL · 0.5 — Stay a little while

A coin, a sunset rooftop, and Mia the black cat. A playable creative experiment
by Michael Ninh / HYPERSPACE, made with AI-assisted development.

## Come in

Open https://mikelninh.github.io/beyond-cv/out-of-panel/ or open index.html directly.

1. Turn the engraved coin or choose **Give it a spin**.
2. Choose **Look inside**. The opening expands around a continuous camera move
   into a three-dimensional Saigon rooftop.
3. Drag gently to look around, or focus the canvas and use arrow keys.
   **Home** restores the view. The buttons let you meet Mia, inspect the tea,
   and read the folded note without aiming at a small object.
4. **Back to the coin** or **Escape** returns to the object.
5. **Please return to page 04** opens the reversible coin-for-paper-star moment.
   **Play** and **Read** still open Infinite Four and the eight-page comic.

## The 0.5 journey

- The exact First Light master mesh and its front/back engravings are retained.
  Three.js adds physically based brass, patina and sunset studio reflections.
- A real aperture shows the live 3D scene. Approaching it expands that same scene
  into the viewport, instead of opening an unrelated screen.
- The rooftop contains terracotta tiles, a stairwell door, a warm lamp, washing,
  plants, tea, a folded note and a black cat. Mia breathes, blinks and looks
  towards the visitor. Clothes share a quiet breeze.
- The scene is a deliberately stylised, procedurally authored digital miniature.
- Foliage, buildings, floor tiles and city windows use instancing. The pixel
  ratio and frame rate are capped for smaller devices. The tiny aperture uses
  a smaller render target refreshed at ten frames per second; the camera
  flight uses the full-resolution scene. Rendering pauses when
  the document is hidden and when the visitor leaves the object view.
- Reduced motion uses immediate entry and a still scene; discoveries remain
  available. Unchanged reduced-motion frames are not redrawn.
- If WebGL2 is unavailable or its context is lost, the original world, renderer,
  game and comic remain accessible.
- Saved v4/v3 progress migrates to the separate v5 storage key.

## Sharing and feedback

**Pass it on** produces a public invitation with ?gift=window#object and the
recipient greeting. The portable page can also save a self-contained HTML
invitation that opens without an internet connection.

**How did it feel?** prepares an email to mikel_ninh@yahoo.de. Visitors review
and send it in their own email app. Copy and TXT alternatives remain available;
browser/device details are excluded unless selected. The website sends no email.
Progress and game state stay on the visitor's device.

## Build and inspect

The source directory holds the modular HTML, styles and interaction code.
Run python3 source/build.py to reproduce index.html and the portable source copy.

Three.js r180 is pinned to the official mrdoob/three.js tag. The two unchanged
minified distributions and MIT licence are in source/vendor. The build combines
them into isolated lazy scopes. There is no runtime CDN, dynamic evaluation,
account, analytics or remote AI call.

source/qa05.mjs is the current browser gate. It exercises real browser input,
the portal transition, discoveries, game input/rules, the reader, keepsake
download, storage, invitations, reduced motion and fallback. The scoped GitHub
Actions job builds the release, runs Chromium with SwiftShader WebGL2, and saves
screenshots and its report.

The release report records the checks actually completed. Physical-phone,
Safari and native GPU performance are not established by viewport emulation.
Feedback email delivery is not tested or submitted.

## Story and game boundaries

The computer opponent is a local heuristic. Link sharing is a board snapshot,
not online multiplayer. The original comic remains a reading/design study.
Returning the coin is a reversible story interaction, not an asset transfer.
A physical edition is still a concept. The exported GLB is a visual model,
not production CAD. There is no wallet integration or purchase flow.
