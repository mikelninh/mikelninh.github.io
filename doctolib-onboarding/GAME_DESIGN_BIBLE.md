# Technical Onboarding Simulator — Game & Art Direction Bible

**Status:** Vertical-slice direction  
**Flagship mission:** Broken Calls  
**Purpose:** Interview preparation + shareable technical-onboarding work sample  
**Design target:** joyful, tactile, immediately readable, deceptively deep.

> **Core promise:** A cozy miniature clinic mystery game where operational reasoning feels joyful.

---

## 1. Product fantasy

The player is **the calm operator on shift**.

A clinic has a problem. People are waiting. The symptom is incomplete. The player talks to staff, inspects systems, runs tests, contains risk, forms a diagnosis, chooses a fix and explains the call.

The fantasy is not “use an admin dashboard.”  
The fantasy is:

> **Keep a tiny clinic running while figuring out what is actually wrong.**

The professional skill underneath the toy-like surface is technical onboarding:

- scope an incident,
- reason across people / process / data / systems,
- use evidence before confidence,
- make a proportionate go-live or incident decision,
- preserve patient and clinic safety,
- communicate clearly under uncertainty.

---

## 2. Design pillars

### 2.1 Easy to enter
Within 10 seconds, the player understands:

1. people are waiting,
2. something is wrong,
3. I can **TALK / LOOK / TRY**,
4. my choices change the clinic.

No tutorial wall.

### 2.2 Joyful surface, serious systems underneath
The world is warm, tactile and slightly whimsical. The simulation logic remains rigorous.

A routing failure may look like a broken toy cable, but the evidence still distinguishes:

- affected scope,
- assistant ingress,
- routing configuration,
- network path,
- fallback behavior.

### 2.3 Every action changes something
No dead clicks.

An action should change at least one of:

- evidence,
- time,
- queue,
- clinic trust,
- operational risk,
- NPC dialogue,
- world animation,
- action availability.

### 2.4 Information has value
The player should ask:

> “What action gives me the most useful information next?”

—not—

> “Which unchecked button is left?”

### 2.5 Failure is instructive, not punishing
Bad calls should be gently funny and legible.

Example:

> “The perfectly healthy AI restarts. Location B is still broken. The AI would like to return to work now.”

The player loses time and perhaps trust, but learns *why* the move was weak.

### 2.6 Replay teaches judgement
Same symptom does not always mean same root cause.

Future Broken Calls variants:

- stale forwarding destination,
- PBX rule mismatch after carrier change,
- firewall / NAT issue on one location,
- credentials / integration edge case.

The opening complaint can remain similar while the evidence graph changes.

---

# 3. Player verbs

The entire game is built around three primary verbs.

## TALK
Human context.

Examples:
- ask who is affected,
- ask what changed,
- ask for one failed example,
- clarify operational constraints.

## LOOK
System evidence.

Examples:
- logs,
- configuration,
- migration report,
- API health,
- network path.

## TRY
Active validation.

Examples:
- targeted test call,
- patient lookup,
- fallback route,
- boundary-condition test.

The fourth verb is implicit:

## CALL IT
Contain → diagnose → fix.

This should feel like the player is putting their reputation behind a decision.

---

# 4. Core game loop

1. **Incident arrives**
2. **Read the room**
3. **Choose one move**
4. **Time advances**
5. **World reacts**
6. **Collect a clue**
7. **Update your hypothesis**
8. **Contain risk when appropriate**
9. **Find an evidence combo / AHA**
10. **Commit root cause + fix**
11. **Mission clear / debrief**
12. **Replay or next shift**

Target first-run mission length: **4–8 minutes** in casual mode.

Interview mode preserves the conceptual 120-minute case budget, but the demo compresses actions into a short playable experience.

---

# 5. Information economy

Every action has a time cost.

The player also manages two soft resources:

## Clinic Trust
Affected by:
- clear communication,
- asking useful questions,
- avoiding random destructive actions,
- proportionate containment.

## Operational Risk
Affected by:
- leaving a known exposed path running,
- testing risky paths without fallback,
- containing the affected scope,
- unnecessarily disabling healthy service.

A third visible world state is:

## Patient Queue
The queue is the emotional translation of operational pressure.

It grows when:
- time is wasted,
- the wrong area is investigated repeatedly,
- no containment exists during an active problem.

It shrinks when:
- a good fallback is activated,
- the issue is resolved.

---

# 6. Art direction

## 6.1 Visual thesis

**Premium playful clinic diorama.**

Not realistic.  
Not pixel art.  
Not generic SaaS illustration.

The world should feel like a beautifully designed physical toy set photographed in soft daylight.

### Shape language
- chunky,
- rounded,
- strong silhouettes,
- 2–3 visual details per object,
- no tiny UI noise.

### Materials
Suggested visual cues:
- painted wood,
- matte plastic,
- paper cards,
- soft fabric-like grass,
- frosted glass.

### Detail philosophy
Detail exists to communicate state.

If a cable breaks, make the break obvious.
If a room is healthy, let it look calm.
If a queue grows, make it physically visible.

---

## 6.2 Camera

Default:

- 3/4 overhead miniature-diorama view,
- fixed readable composition,
- very slight parallax / push-in on interaction.

Avoid:
- free camera,
- realistic first person,
- dramatic cinematic motion that interferes with decision-making.

### Interaction camera language
- TALK → tiny push toward reception / character,
- LOOK → small focus on selected system room,
- TRY → camera holds wide so player can watch signal travel end-to-end,
- AHA → world dims 5–10%, clue relationship lights up,
- MISSION CLEAR → gentle pull-back + celebration.

---

## 6.3 Palette

### World
- Sky blue: #DFF4FF
- Warm cream: #FFF8E8
- Grass green: #B9DD93
- Structural deep green: #315941

### System states
- Healthy: #3F7C57
- Selected / informational: #6FA9C5
- Warning: #EFC75E
- Fault: #EF8D6F
- Severe: #D76459

### Rule
Red is rare.  
Most problems are amber/coral until evidence proves severity.

---

## 6.4 Lighting

- soft morning daylight,
- short, diffuse shadows,
- no dark cyberpunk “operations centre,”
- slightly brighter after successful containment,
- subtly warmer after mission clear.

The clinic should feel worth protecting.

---

# 7. Characters

Characters are simple, readable, recurring.

## Mina — Practice Manager
Role:
- business pressure,
- urgency,
- launch expectations.

Personality:
- capable,
- slightly stressed,
- wants a clear recommendation.

Visual:
- coral cardigan / clipboard,
- round silhouette,
- expressive eyebrows.

## Alex — Reception
Role:
- real operational truth,
- tells you what patients and staff are experiencing.

Personality:
- practical,
- dry humour,
- notices patterns before systems do.

Visual:
- blue top,
- headset,
- tiny stack of callback cards.

## Jo — Clinic IT
Role:
- technical changes,
- telecom / network / local configuration.

Personality:
- concise,
- helpful if asked precise questions.

Visual:
- green overshirt,
- little toolkit / tablet.

## Pip — Training-mode helper
Optional original mascot.

A tiny paper-like bird / star-shaped helper that lives near the clue notebook.

Purpose:
- one short hint,
- never gives the answer,
- disappears entirely in Interview mode.

Rule:
Pip is not comic relief every 20 seconds. One useful nudge is enough.

---

# 8. Character animation

Keep animation economical.

### Idle
- tiny breathing / bob,
- glance toward queue,
- receptionist taps desk,
- IT character checks tablet.

### Stress
- faster head turn,
- small exclamation bubble,
- queue movement accelerates.

### Relief
- shoulders drop,
- reception returns to idle,
- one patient walks through the door.

Avoid exaggerated slapstick.

---

# 9. System-world translation

Every technical abstraction gets a physical metaphor.

| Technical concept | World representation |
|---|---|
| phone ingress | phone booth / ringing phone |
| routing | switchboard / cables / signpost |
| AI assistant | little assistant room / glowing star |
| reception handoff | front desk |
| patient data | archive drawers / record cards |
| API | connector bridge |
| VPN / network | signal tower / cable tunnel |
| fallback | side path / emergency line |
| duplicate records | twin folders |
| expired credential | faded access badge |
| opening hours | wall clock / schedule board |

The metaphor must never obscure the underlying label.

We can be playful **and** explicit.

---

# 10. Game feel

The difference between “cute interface” and “nice game” is response quality.

## Tap / click
- 80–120ms squash,
- 120–180ms rebound.

## Clue acquired
- card flies / pops into notebook,
- 2-note plink,
- notebook counter bumps once.

## System checked
- room hops 2–4px,
- outline pulse,
- state icon changes.

## Failed test
- signal travels,
- sputters at exact failure boundary,
- affected room wobbles once,
- short descending tone.

## Correct containment
- fallback path lights,
- queue visibly shortens,
- receptionist smile / relief bubble,
- trust bumps.

## AHA
- 350–550ms pause in ordinary motion,
- connected clue cards lift,
- thin lines connect,
- insight card lands,
- 3-note rising sound.

## Mission clear
- stars stamp in one at a time,
- small paper confetti,
- patients begin moving again,
- no giant casino explosion.

---

# 11. Sound direction

Mood: **cozy competence**.

### UI
- soft wood / paper taps,
- plucky marimba or kalimba-like confirmation,
- subtle cable / switch sounds.

### Clue
Two-note bright plink.

### AHA
Three rising notes.

### Risk rises
Small low tick; never an alarm siren.

### Failed test
Soft sputter + downward interval.

### Mission clear
Warm 4-note chord.

### Music
Optional, later:
- pizzicato,
- marimba,
- soft synth,
- light percussion,
- 90–110 BPM,
- no dramatic hospital tension music.

---

# 12. UI rules

## 12.1 One dominant question per screen
> **What do you do next?**

Everything else supports that.

## 12.2 Three verbs only
TALK / LOOK / TRY.

No giant tool matrix.

## 12.3 World first, UI second
The clinic should occupy the largest visual area.

## 12.4 Evidence feels collectible
Use cards / notebook, not logs.

## 12.5 Decision language is concrete
Not:
- “approve,”
- “reject.”

Instead:
- “Route Location B directly to staff,”
- “Correct forwarding and test one call,”
- “Keep Location A live.”

---

# 13. Broken Calls vertical slice

## Opening beat
08:47.

Mina:
> “Some calls are disappearing. The team thinks your AI is down again. Can you fix this?”

Visible:
- four patients waiting,
- phone → routing → AI → reception,
- everything *looks* normal.

Player has:
- TALK,
- LOOK,
- TRY.

---

## Intended strong path

### Turn 1 — TALK
Ask:
> “Which calls are affected?”

Clue:
> **Location B only. Location A is healthy.**

Effect:
- scope clue,
- clinic trust +,
- Location A visually turns green.

### Turn 2 — TALK
Ask:
> “What changed?”

Clue:
> **Location B changed telecom provider yesterday.**

Effect:
- provider-change sticker,
- routing room gets a subtle question mark.

### Turn 3 — LOOK
Inspect assistant ingress logs.

Clue:
> **Failed B calls never reach assistant ingress.**

AHA #1:
> **The failure is upstream of the assistant.**

Effect:
- AI room turns healthy green,
- routing segment stays unknown,
- restarting AI now clearly looks silly.

### Turn 4 — CONTAIN
Route Location B directly to staff.

Effect:
- side route opens,
- queue drops,
- risk drops,
- trust rises.

### Turn 5 — LOOK
Inspect Location B forwarding config.

Clue:
> **Location B still points to the old provider destination.**

AHA #2:
> **Stale forwarding route.**

Effect:
- routing room wobbles,
- broken cable is revealed.

### Turn 6 — TRY
Targeted A/B test call.

Animation:
- A signal completes.
- B signal reaches routing, then stops.

After fix:
- B signal completes end-to-end.

### Resolution
Containment:
- B direct-to-staff fallback until validation.

Root cause:
- stale Location B forwarding destination.

Fix:
- correct forwarding + targeted re-test.

Mission clear.

---

# 14. Fun wrong paths

## Restart the AI
Animation:
- AI room turns off,
- tiny reboot spinner,
- returns happy and healthy.

Result:
> “The perfectly healthy assistant restarts. Location B is still broken.”

Cost:
- time,
- clinic trust,
- queue.

Lesson:
- don't change a healthy layer without evidence.

## Inspect patient migration first
Result:
> migration looks clean.

Not catastrophic, just low-information.

Lesson:
- choose actions based on symptom boundary.

## Disable everything
Risk falls.

But:
- Location A stops unnecessarily,
- clinic trust drops,
- queue does not improve as much as a targeted fallback.

Lesson:
- “safe” can still be disproportionate.

---

# 15. Clue-combination system

Clues have tags:

- LOCATION,
- CHANGE,
- INGRESS,
- CONFIG,
- TEST,
- FALLBACK.

### Combo 1
LOCATION + CHANGE + INGRESS

Insight:
> **Likely upstream / routing problem.**

### Combo 2
CONFIG + TEST

Insight:
> **Root cause verified: stale forwarding destination.**

Future missions use the same mechanic with different combos.

---

# 16. Scoring

Do not score “number of clues.”

Score behaviour.

## Diagnosis
Did the final explanation match the evidence?

## Patient / operational safety
Did the player contain the actual blast radius?

## Efficiency
How much irrelevant work did they perform?

## Communication
Did their actions maintain clinic trust and reduce ambiguity?

### Stars
- ★ — completed but unsafe / weak
- ★★ — broadly safe
- ★★★ — strong operator
- ★★★★ — excellent, efficient, proportionate

No five-star casino psychology.

---

# 17. Mission-clear language

Good:

> **Mission Clear! ★★★☆**  
> You protected Location A, gave Location B a safe fallback and verified the fault before changing the healthy assistant.

Needs improvement:

> **Shift Complete ★★☆☆**  
> You found the issue, but disabled healthy service along the way. Try again and contain the blast radius more precisely.

---

# 18. Progression

## Chapter 1 — First week
1. New Clinic Go-Live
2. Broken Calls
3. Dirty Migration

## Chapter 2 — Under pressure
4. Go-Live Tomorrow
5. Post-Launch Incident

## Expert remixes
Same opening symptom; hidden cause changes.

## Daily drill
One 3–5 minute generated mission.

## Interview run
- no mascot,
- no hints,
- timer,
- final oral-style challenge prompts.

---

# 19. Accessibility

- sound off by default or clearly toggleable,
- all information available without sound,
- reduced-motion mode,
- no color-only state communication,
- touch targets >= 44px on mobile,
- keyboard-focusable world hotspots,
- readable text outside illustrated world,
- animations never block the next action.

---

# 20. Technical implementation

Vertical slice can remain static / client-side.

Recommended architecture:

- `index.html` — structure
- `game.css` — diorama + animation language
- `game.js` — state machine / cases / scoring / sound
- later: JSON mission definitions
- later: SVG / WebGL / sprite assets if the art direction warrants it

State machine:

```
BRIEF
  ↓
INVESTIGATE
  ↔ TALK / LOOK / TRY
  ↓
CONTAIN
  ↓
DIAGNOSE
  ↓
VERIFY
  ↓
DEBRIEF
```

The world should render from the same state used for scoring.

No decorative animation that disagrees with simulation state.

---

# 21. Asset backlog

For a true polished version:

### Environment
- clinic shell
- reception
- phone station
- routing switchboard
- AI station
- server/network object
- archive room
- waiting area
- fallback path

### Characters
- Mina
- Alex
- Jo
- 6–8 patient silhouettes
- Pip helper

### FX
- signal orb
- routing spark
- healthy check burst
- clue pop
- AHA lines
- star stamp
- subtle confetti

### Audio
- tap
- clue
- AHA
- warning
- failed test
- fallback active
- mission clear

---

# 22. Originality guardrail

The target is **console-grade clarity, tactile joy and approachable system design**.

Do not copy:
- Nintendo characters,
- recognizable UI layouts,
- specific game art styles,
- sound motifs,
- logos,
- proprietary visual assets.

Our identity is:

> **miniature healthcare operations + detective notebook + warm technical systems.**

That combination should become recognizably ours.

---

# 23. Quality bar

Before expanding to more missions, Broken Calls should pass:

- a new player understands the goal in < 15 sec,
- first useful action feels obvious but not forced,
- one bad action is funny and educational,
- targeted test visibly traces the system,
- at least one AHA moment feels earned,
- containment visibly changes the world,
- mission clear feels satisfying,
- replay reveals a different strategy or hidden variant,
- an interviewer can understand the professional skill beneath the game.

---

# 24. North star

> **Easy to enter. Delightful to touch. Deep enough to master.**

The player should leave thinking two things at once:

1. “That was fun.”
2. “I understand technical onboarding better now.”
