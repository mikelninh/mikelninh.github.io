# The Ways of Life — open playtest v0.5

**Status: WORK IN PROGRESS / ORIGINAL INTERACTIVE FICTION.** Not a scientifically predictive model, not affiliated with Kurzgesagt. Its central question: *what if there were many meaningful ways for a civilisation to flourish?*

## Play
Visit [the playable world](./). Four chapters, 81 authored decision combinations, an original illustrated Canvas 2D valley, changing day/night light, timewalking and an Atlas of possible worlds.

**Touch the Valley (v0.5):** after the first choice, grow a grove, build a shelter or create a gathering place. Tap land directly or use the "place by village" button. Placed marks are saved locally, age through history and can be undone. No scoring people or cultures.

## Feedback
Opt-in feedback is enabled by **Shape the Next Version** or **Give honest feedback** at the ending. The browser sends only an explicitly consented feeling, favourite/least-interesting area, optional free-text note (<=700 characters), current phase, decision code (if complete), and number of marks. No account or email; no automatic gameplay tracking. The game saves its Atlas on the visitor's own device. Service providers may process routine infrastructure logs.

Public endpoint (no secret keys in front end): `https://htffcvdopavknnylbowl.supabase.co/functions/v1/civilization-lab-feedback`
- GET obtains a time-limited signed challenge.
- POST can submit one consented response; it will not show success unless the server confirms persistence.
- The private `civilization_lab_feedback` table has RLS enabled, with no anonymous direct read/insert grants.
- HMAC challenge, origin checking, a honeypot and unique token mitigate only basic abuse; do not market this as fully bot-proof. Rate limits needed before scaling.

### Owner-only review query
```sql
select feeling,highlight,count(*) as n
from public.civilization_lab_feedback
group by feeling,highlight
order by n desc;
```

## Quality gate before R1
- First test with ~20 honest participants. Ask whether they noticed the new touch interaction; which moment they remember; what felt underwhelming; and whether they would return.
- Larger artistic upgrade: lively villagers and differentiated settlements, natural rivers and more cinematic transitions; fewer overlays.
- Test public feedback delivery, accessibility, keyboard operation, responsive widths and performance on slower devices. No false claims about real usage metrics.
- Evidence of actual delight and comprehension, not self-awarded quality scores.

## Developer QA
A scripted local Playwright smoke run passed at desktop and mobile for the complete story, makers, the Atlas, timeline, simulated server-ACK feedback, and network-failure behaviour, with no uncaught JS exceptions. **The ACK was mocked for browser UI checks; real production feedback end-to-end is not yet verified.**

Built as one static file so public hosting is ordinary GitHub Pages; no build step or remote game assets.
