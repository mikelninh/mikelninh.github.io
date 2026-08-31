# HYPERSPACE KIDS — MASTER ROADMAP

## North Star
Build a collectible brand and living digital universe where physical and digital booster packs unlock persistent characters, objects, memories and access to worlds. Blockchain is infrastructure, not the product.

## Product loop
PACK → DISCOVER → BIND → EVOLVE → ENTER WORLD → PLAY / CREATE / HELP → EARN MEMORY → UNLOCK → COLLECT AGAIN

## Non-negotiable principles
1. Fun even if crypto disappears tomorrow.
2. Wallet optional; normal sign-in first.
3. Physical and digital collectibles are equal citizens.
4. Rarity can be pulled, but the best rarity is earned.
5. Ownership/provenance onchain only where useful; high-frequency state offchain.
6. No financial-return promises, fake scarcity or floor-price culture.
7. Every sprint ships a testable end-to-end experience.
8. Booster opening is a hero product moment: premium, tactile, cinematic and never treated like a loading screen.

## Phase 0 — Brand Constitution
- [x] Name: Hyperspace Kids
- [x] First prototype character: #4821 — The First Traveller
- [x] First world: The Nexus
- [x] Booster-first product thesis
- [ ] Visual identity bible: silhouette, mask language, typography, materials, iconography
- [ ] Lore bible v0.1
- [ ] Naming system for worlds / packs / rarities / relics
- [ ] Brand/legal/IP checks

## Phase 1 — Vertical Slice: The First Traveller
Definition of done: a stranger can open one pack, understand the product loop, see #4821 change, and enter a newly unlocked world state in under 3 minutes.
- [x] Character portal
- [x] Identity / state panel
- [x] GENESIS // 001 pack
- [x] Five-card sequential reveal
- [x] Persistent browser state
- [x] Inventory binding
- [x] Character awakening
- [x] Rift Seed → Nexus unlock dependency
- [x] The Nexus portal preview
- [ ] Production character art for #4821
- [ ] Production booster / card art system
- [ ] Production sound design pass
- [ ] Motion / accessibility pass
- [ ] Mobile QA
- [ ] User test with 5 people

## Phase 2 — Collection Engine — PROTOTYPE COMPLETE ✅
Definition of done: we can define a pack set in data and generate/serve hundreds of unique pulls without handcoding each one.
- [x] Collection schema: Character Fragment / Wearable / Companion / Relic / Memory / World Key
- [x] Rarity + weighted drop tables
- [x] Data-driven pack recipes with slot rarity floors
- [x] Legendary/Mythic pity counters
- [x] Duplicate policy → Stardust conversion by rarity
- [x] Inventory service + append-only local event ledger
- [x] Claim provenance: pack id, seed, item ids, timestamps and bind events
- [x] Local admin/content console for adding live collectible objects
- [x] Pack simulator using the same generation logic as the consumer experience
- [x] 48 deterministic Genesis character candidates for art-direction curation
- [x] First-story-pack override for authored narrative without contaminating later random pack logic
- [x] Premium opening prototype: foil pack, drag-to-tear seal, sequential card stack, rarity choreography, Mythic blackout/burst, WebAudio and optional haptics

Production hardening still required later: cloud database, signed server-side RNG/claims, analytics, abuse controls, versioned migrations, independent probability tests and legal review before any paid randomised pack is sold.

## Phase 3 — Accounts & Persistence
- [ ] Email / Google / Apple login
- [ ] User profile + Hyperspace ID
- [ ] Cloud persistence
- [ ] Wallet connection as optional ownership layer
- [ ] Device sync
- [ ] Export / portability policy

## Phase 4 — Genesis 100
- [ ] Art-generation trait system
- [ ] Hand-curated final 100
- [ ] Character lore cards
- [ ] Rarity / provenance explorer
- [ ] Commercial-use license design
- [ ] Genesis holder benefits
- [ ] Fair mint / claim design

## Phase 5 — Onchain Ownership
- [ ] Base testnet contracts
- [ ] ERC-721 collection
- [ ] Token-bound account research / ERC-6551 prototype
- [ ] Gasless / sponsored UX
- [ ] Metadata permanence strategy (IPFS/Arweave)
- [ ] Security review / tests
- [ ] OpenSea integration

## Phase 6 — Physical ↔ Digital Bridge
- [ ] Physical card template
- [ ] Serialized claim codes
- [ ] NFC/QR anti-copy claim protocol
- [ ] One-time claim backend
- [ ] Physical Genesis booster prototype
- [ ] Print vendor samples
- [ ] Packaging / foil / tear experience
- [ ] Claim UX from phone in <20 seconds

## Phase 7 — The Nexus v1
- [ ] Browser 3D scene
- [ ] #4821 avatar in scene
- [ ] Inventory equipment
- [ ] Portals controlled by owned/earned world keys
- [ ] First explorable room
- [ ] First quest
- [ ] Performance fallback for low-end/mobile devices

## Phase 8 — AI Companion
- [ ] Character personality schema
- [ ] Long-term memory boundaries
- [ ] Lore-grounded chat
- [ ] World-aware actions
- [ ] Safe tool permissions
- [ ] Memory controls / deletion
- [ ] Voice experiment

## Phase 9 — Social / Multiplayer
- [ ] Friends / presence
- [ ] Visit another Kid
- [ ] Trading / gifting with safety controls
- [ ] Co-op mission
- [ ] Community-created artefacts
- [ ] Moderation / abuse tooling

## Phase 10 — Commerce
- [ ] Digital booster checkout
- [ ] Physical store
- [ ] Fulfilment / taxes / returns
- [ ] Gift packs
- [ ] Drop calendar
- [ ] Analytics: open rate, bind rate, D7 return, collection completion, world engagement

## Phase 11 — Creator & IP Platform
- [ ] Holder creative license
- [ ] Creator kits / 3D exports / transparent art assets
- [ ] Canon submission system
- [ ] Partner drops
- [ ] Brand collaborations

## Phase 12 — AR / Mobile / Live World
- [ ] Mobile app / PWA
- [ ] AR collectible reveal
- [ ] NFC figure interactions
- [ ] Location/event memories
- [ ] Live events / popups / world premieres

## Launch gates
We do not scale supply until:
- ≥70% of testers finish the first pack flow without explanation.
- ≥50% voluntarily revisit #4821 / inventory after reveal.
- ≥30% say they would want another pack even without resale value.
- Physical claim flow can be completed by a non-crypto user in <20 seconds.
- Smart contracts and claims have explicit threat models and tests.

## Current Sprint — S02: COLLECTION ENGINE + PREMIUM OPENING
Goal: prove that premium opening magic can be powered by a scalable, inspectable collection system rather than hardcoded demo cards.
1. Fix booster flow and persist state. ✅
2. Make Rift Seed visibly change #4821. ✅
3. Unlock Nexus from the pulled item. ✅
4. Premium drag-to-tear + card reveal + rarity choreography + sound/haptics prototype. ✅
5. Collection engine / recipes / pity / duplicates / provenance / simulator. ✅
6. Replace placeholder character with iconic production art. NEXT
7. Replace generic cards with production card frame + art system. NEXT
8. Mobile QA + five-user test.
