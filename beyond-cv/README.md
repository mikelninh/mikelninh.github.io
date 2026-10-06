# Beyond the CV — Michael Ninh

Public page: https://mikelninh.github.io/beyond-cv/

A personal companion to the professional portfolio, not another CV. The website is a single self-contained `index.html`, with no runtime dependencies or build step. The repository's existing GitHub Pages workflow publishes changes on `main`.

## What is included

- Personal stories and a future-facing, explicitly aspirational section.
- Eight cycling conversation questions.
- A free five-question reflection tool with editable output, copy and text download.
- A reusable AI interview prompt.
- LinkedIn sharing controls, a copyable visitor post, and recruiter conversation links.
- Responsive layout, keyboard focus, native dialogs and disclosures, reduced-motion support and a readable no-JavaScript fallback.

The reflection tool arranges a visitor's own words. It does not call an AI model, score people, rewrite answers, collect emails, or send reflections to a server. Answers exist only in the open page, and are not saved to localStorage. Clipboard and download happen only on request. Hosting and external linked services have their own data-processing policies.

## Editing

Edit the copy and styles directly in `index.html`. Keep aspirations separate from established facts. Preserve the free prompt, accessibility and privacy boundaries. Keep professional proof and CV links on the main portfolio; avoid adding an achievement inventory here.

The `SETTINGS` object near the bottom holds the canonical URL, optional support URL and photo list. Never put credentials in this publicly served file.

### Photos

Only use Michael-approved real photos. Do not substitute generated images of his life or stock photos presented as personal memories. Confirm permission from identifiable people; exercise extra care with children. Remove unnecessary location metadata and private identifying details before publishing.

Upload optimised images to `beyond-cv/photos/` and then populate:

```js
photos: [
  {
    src: './photos/dinner.webp',
    alt: 'An accurate description of the real photo',
    caption: 'A short caption approved by Michael.'
  }
]
```

The gallery is hidden until configured. Images must be same-origin. There are no fake or empty public placeholders.

### Optional financial support

The free gift is not paywalled. `supportUrl` is currently empty and the payment link is hidden. Set it only after Michael approves a real HTTPS payment link for his own verified account. Do not describe ordinary project support as a tax-deductible charitable donation. No checkout, payment processor, or donation collection was activated by this release.

### Sharing

LinkedIn share buttons open LinkedIn; they do not post automatically. Copying a draft does not publish it. No recruiter messages have been sent. Review each message and recipient before outreach.

## Verification

The HTML was tested in Chromium through inline document rendering at widths 320, 390, 768, 1024 and 1440 pixels. Twenty-three local checks passed, including question cycling, empty-input validation, literal input handling, text download, keyboard Escape/focus, hidden unconfigured features, no external requests in tested flows, reduced motion and no-JavaScript reading.

Environment boundary: local network navigation was unavailable. Clipboard fallback payloads were instrumented; external LinkedIn publication was not tested. Public delivery is a separate deployment check, not implied by local UI tests.

## Next useful test

Share with a small, deliberately varied group and ask: “What felt like me? What would you ask me? Did anything feel performative or hard to use?” Measure actual conversations and specific feedback rather than inventing engagement numbers. Add real photos before expanding the page with more sections.
