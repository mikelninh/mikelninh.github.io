# Don't Drop the Cake — tiny hidden hotel details (implementation brief)

**Status: design spec only.** The live game currently runs at https://dont-drop-the-cake-run.hyperspacekid.chatgpt.site/ and its source is not in this GitHub repository. Do not claim these secrets are deployed until they have been implemented in the game's own source and tested.

## Intent

Reward people who notice the world instead of staring only at the cake balance meter. Environmental storytelling and small moments of delight, never gameplay cheats.

## Seven floors, seven optional secrets

| Floor | Detail (not shown as a HUD objective) | Discovery behaviour |
| --- | --- | --- |
| 1 | A tiny lobby sign with increasingly implausible reasons why the lift is out of order | Read by looking/pausing near it; no interaction required |
| 2 | A mouse in a little chef hat behind a skirting board | Peeks out briefly when the courier passes slowly |
| 3 | A slightly odd portrait that seems to follow the cake | Its eyes move subtly if the player looks twice |
| 4 | A dusty room-number plate marked '404 — Cake Not Found' | Visible only on a side wall; quiet visual gag |
| 5 | A plant doing remarkably well in a room full of chaos | One almost imperceptible leaf follows the courier |
| 6 | A very serious 'No crumbs' notice left by the hotel's pigeons | Subtle animation at low speed, no effects on physics |
| 7 | A handwritten note by the penthouse door: 'Please do not feed the cake to the guests' | Revealed at the very end if the camera gets close |

**Possible future layer:** A very quiet optional journal icon after the first discovery, showing only a count (e.g., 1/7) and allowing replay. Don't put glowing collectible markers on the map. Do not reveal secret locations in the loading screen.

## Non-negotiable implementation rules

- Do not touch physics, cake wobble, carrying mechanics, speed, collision, lives, damage, saves, ranks, timer or leaderboard calculations.
- Nothing blocks player movement, forces a detour, pops up while balancing, or changes an online score.
- Respect keyboard, touch, accessibility and reduced-motion settings. Hidden details need no rapid tapping or precision interaction.
- Avoid new network requests, new permissions, analytics or collectible purchases.
- For multiplayer/viewer mode, easter eggs are cosmetic and local only, never voting rewards or manipulation.
- No visual effects that obscure the cake or stairs. Text legibility is secondary to gameplay visibility.
- Make secrets tiny and discoverable through attention, not highlighted by objective trackers.

## Release gate

1. Confirm all existing game modes still work: original seven-floor climb, Daily Delivery, Service Scramble, audience voting and ghost replay.
2. Confirm identical physics, timer and save/score results before/after.
3. Test all seven floors on desktop keyboard+mouse and mobile touch.
4. Test every optional discovery for double-triggering and reduced motion.
5. Ask two newcomers to play without mentioning secrets; check whether some discover one naturally and whether nobody is penalised for missing them.

When you have access to the game's project/source, implement them in world/background rendering only, then ship one floor at a time.
