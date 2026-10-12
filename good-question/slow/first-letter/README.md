# WUNDERPOST 001 — The Little Things We Return To

**Publisher:** GOOD QUESTION · Mikel & Huong (names supplied by founder).  
**Public after merge and deployment:** https://mikelninh.github.io/good-question/slow/first-letter/  
**Editorial edition:** 12 October 2026; trilingual EN/DE/VI.

This is a **four-chapter web letter and dual-owner vegan-staples ranking playground**, not a paid product endorsement or proof that both contributors supplied verified ratings. The live default has no Mikel or Huong S/A/B/C grades; either column is editable on the current device. Nothing is silently published to a server.

## Reader flow

1. Open the shareable web link; choose EN/DE/VI.
2. Read or listen to the introductory article. The browser's native SpeechSynthesis reads the rendered language at **1×, 1.25×, 1.5× or 2×**, with pause/resume/stop. No microphone, AI voice subscription, recorded user audio or remote TTS API. Background playback and available voices are browser/device-dependent; locking the screen may stop narration. A future release could use explicitly produced audio files, properly reviewed voiceovers and captions for any video.
3. Scroll to the 6-product eligible shortlist and enter Mikel/Huong grades independently. Each selection persists in localStorage, with graceful failure messaging.
4. Click **Share this tier list**. Only `tiers=id:MH` codes (S/A/B/C/-) and the chosen language enter the generated URL; names are pre-existing public editorial labels. No account, attestation or server database means **identity and authorship are not authenticated**. A visitor may edit both columns in their own browser and share a new draft. Do not call URL snapshots approved reviews.
5. Check sourced product details; the linked *113 g Shin Toomba cup* is separated as a **non-vegan ingredient warning** based on a German retailer's listed milk/fish ingredients. A manufacturer claim from another market must not override it.
6. Discover the editorial philosophy, tea pause, earlier Slow Edition and forthcoming WUNDERPOST.

## Commercial boundary

- All product links go directly to manufacturer/retailer information; **none is an affiliate referral**. No codes or reader discounts confirmed. No product price is shown as live.
- Awin's KoRo German publisher programme is a concrete partnership lead: https://ui.awin.com/merchant-profile/107808 ; it describes 5% on eligible *new customer* orders, but programme admission, terms and voucher eligibility must be reconfirmed. The brand is not listed as our favourite unless we genuinely test it.
- Other leads: direct outreach to Alpro/Danone, Nongshim Germany/Kreyenhop and suitable stores or networks. Do not represent that they have accepted us.
- Commercial links in future must be clearly labelled **Werbung / Affiliate-Link**, with relationship, material benefit, market and exact product/SKU disclosed before click. Bonuses or discount codes must be real, current, tested and lawful to offer. Editorial rankings must remain independent of conversion rates.
- Capture real individual tasting notes, packing photos and dates before publishing founders' actual S/A/B/C ratings. Obtain Huong's explicit approval for publishing her opinions or any quotes.

## Editorial quality & release

```bash
python3 good-question/slow/first-letter/qa_release.py
python3 good-question/newsroom/check_content.py
python3 good-question/slow/build_content.py --check
python3 good-question/slow/qa_slow.py
```

Run Playwright/live-browser smoke tests at 360, 390, 768, 1440px with all 3 languages and share/round-trip, pause/resume, rates and no console errors. Browsers may be unable to synthesize speech headlessly; test narration manually on a real Android device and mention background limitation. Offline tests **do not constitute scientific, editorial or native-language certification**.

Maintain the source register in `data.js` and check manufacturer product formulations by market/date before renewing any claims. Link to original, record last checked, note uncertainty. WUNDERPOST web edition can be shared immediately; email subscription and automatic sending are **not connected**.

**It won't and can't be perfect. It can be honest, readable, playful and useful.**
