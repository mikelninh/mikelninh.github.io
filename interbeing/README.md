# Interbeing — Friends edition 1.0

From interconnected suffering to shared solutions.

A static, dependency-free interactive atlas. Published at https://mikelninh.github.io/interbeing/ by the repository's existing GitHub Pages workflow.

## Explore

- Your web: five perspectives, optional display name, no inferred profile.
- Three five-step journeys: food systems, wildlife coexistence, malaria protection.
- 29 typed nodes and 37 qualitative relationships. Select a connection to inspect its claim type, source and boundary.
- Organisation nodes identify activities, not independently proven effectiveness.
- Compare benefits, costs and unknowns; save chosen or completed next steps on this device.
- Share a stateful link or export a PNG card; names are excluded unless explicitly included.
- Reflections are copied/shared back to the inviter, not submitted to a central inbox.

## Run

No build or package installation is required for the website. Serve this folder using `python -m http.server 8000`, or open index.html locally. Production Web Share and Clipboard features depend on browser support and HTTPS; manual-copy fallbacks are provided.

## Structure

index.html: page and illustrative SVG artwork.
styles.css: responsive design and motion rules.
atlas.js: curated data, evidence, stories, comparisons and action prompts.
app.js: SVG explorer, local state, sharing, export and accessibility controls.
og.png: compact static social preview; in-app cards are generated at 1200 by 1200 pixels.

## Boundaries

This is an early curated atlas, not a complete ontology, validated simulation, personal footprint calculator, charity ranking or medical advice. Ecosystems are not presumed sentient. Ethical lenses, conceptual relationships and design proposals are labelled separately from evidence-informed claims. Distance, node size and line width do not measure impact or moral worth. Source descriptions were reviewed on 16 October 2026, not independently peer reviewed.

## Privacy

No app analytics, account, location access, contact import or external AI calls. The host may retain ordinary technical logs. Names stay in the tab unless deliberately added to a share link/card. Chosen/completed steps use localStorage only; there is no cross-device persistence. Shared links are readable and forwardable, not encrypted.

## Release checks

77 automated Chromium checks passed on the exact source, including six viewport widths, all three story journeys, five perspectives, URL-state round trips, exported PNG/JSON, keyboard node selection, filters and privacy defaults. Tests ran with HTML/CSS/JS inlined into about:blank because this container blocks normal browser navigation. Storage and clipboard persistence tests used explicit fixtures. This is not a Safari/Firefox audit, physical-device test, accessibility certification or proof of user benefit.
