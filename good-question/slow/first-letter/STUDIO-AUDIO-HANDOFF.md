# WUNDERPOST premium narration — production handoff
12 October 2026

## Decision
Current Web Speech/browser reader is not acceptable as the main premium magazine audio. Keep it as optional fallback; prefer a real MP3 with licensed and human-reviewed voice narration.

## Production status
**Blocked: fal account Mikel (GitHub login) returned 403 balance_exhausted. No paid narration was generated.** Do not claim there is a premium audio track. Prices inspected on 12 October 2026: Eleven v4 via fal **$0.08/1,000 characters**, Eleven v4 Turbo **$0.04/1,000 characters**, before possible fees and hosting. Pricing is not a promise of service quality or availability. No paid requests should be retried until the user confirms credit restoration.

## Audio authoring
- Canonical source: `first-letter/data.js` -> `i18n.{en,de,vi}.intro1,intro2,intro3`, with approved spoken intro/headline.
- Choose an appropriate, licensed voice. English natural, warm, non-salesy with gentle pauses. German and Vietnamese require independently checked pronunciations and a proficient listener. Avoid cloned or impersonated voices.
- Do a **20–30 second voice audition first**, then a full script per approved locale.
- Normalize punctuation deliberately; do not change factual meaning, invent testimonials, or read advertisements as journalism.
- Use audio model whose official metadata documents a permitted commercial redistribution license; preserve provider/model/voice, generation date, prompt hash, cost, script hash and reviewer status.
- Download actual completed audio to `good-question/slow/first-letter/audio/wunderpost-001-{en,de,vi}.mp3` (or a verified exact file path). Prefer MP3 44.1 kHz 128–192 kbps; check clipping/loudness, intelligibility and duration.
- Test offline/background HTMLAudioElement with real Android screen lock, a Bluetooth headset, driving/cycling safety and media controls.
- Only then set `audio-manifest.js` `tracks.en/de/vi` to real relative MP3 paths. Until then, leave them null. The new player intentionally remains hidden until a verified recording exists.
- Use the existing `studio-player.js` HTML5 native audio playback/speed/download/Media Session. Never expose a broken link or mark TTS fallback as premium. Check language switching stops the prior track.
- Run `python3 good-question/slow/first-letter/qa_studio_audio.py` (update its empty-manifest condition after audio is actually approved), `qa_release.py`, and browser smoke.
- Do not silently regenerate costly audio whenever text changes. Require an editor-approved script version.

## Next pillars
Our two-person favourites shelf can grow to crisps/chips, chocolates, tea, pantry items, and real restaurants. Keep restaurant recommendations separate from online retailer affiliates. Human taste notes and verified products are a release requirement.
