# RETURN LOOP and product ecosystem — release readiness record

**Audit date:** 2026-11-04  
**Scope:** RETURN LOOP Pilot Studio; RETURN LOOP model arena and public entrypoints; HausPilot synthetic shadow replay; Digital Worker Factory core boundaries; LaunchCheck public MCP.
**Source of truth:** This PR plus its GitHub Actions run results. No real customer data or paid orders were used.

## What is working and how it was verified

| Product / flow | Evidence run | Verified result | Current limit |
|---|---|---|---|
| RETURN LOOP Pilot Studio | `return-loop-v14-ci` / `unit-and-integration-tests` | CSV parser, deterministic multi-label keyword baseline, exact evidence, invalid inputs, review summary and safe export | Not a live AI classifier; no accounts, hosted files, paid subscription or helpdesk connectors |
| RETURN LOOP browser | `return-loop-v14-ci` / `browser-smoke` | Chromium: 5 sample tickets, review accept/correct/escalate, local CSV upload, malformed CSV rejection, JSON export without raw message, 390px viewport without horizontal overflow, clear on reload | Browser-only state disappears on reload. No independent accessibility audit or customer usability study |
| RETURN LOOP public entrypoints | `return-loop-v14-ci` / `ecosystem-readiness` | Public Pages and Vercel home return HTTP 200 and expected content; Vercel status JSON reports v14 | The new Pilot Studio URL remains unpublished until this PR is approved/merged |
| HausPilot | `ecosystem-readiness` | Public demo returns HTTP 200; shadow-only runtime/policy/privacy unit checks, synthetic demo generator and preflight pass | Live model + customer-data/privacy + measured human review are not proven |
| Digital Worker Factory | `ecosystem-readiness` | Harness, synthetic reliability eval and core gateway tests pass | General platform is not a hosted self-service production SaaS |
| LaunchCheck | `ecosystem-readiness` | Deterministic engine/routing tests, live MCP initialize, tool list, example.com audit and localhost rejection pass | Static HTTP audit only; no rendered-browser journey, public customer billing or ChatGPT discovery benchmark proof |

## Bugs found and fixed in this change

1. **Mobile:** the new pilot heading stretched a 390px viewport to 427px. Fixed line wrapping and header wrapping; added a real mobile viewport assertion plus screenshot.
2. **CI cleanup race:** Chromium test passed but deleting its live temporary profile caused sporadic `ENOTEMPTY` failures. The runner now waits for browser exit and retries cleanup.
3. **Discoverability:** the existing `/application-demos/return-loop/` entry redirects to the legacy demo, hiding the new Pilot Studio. Added a prominent link from that legacy page, retained the old experience, and added a source regression test.

## What a visitor can do after publication

1. Open the RETURN LOOP sample experience.
2. Follow **Eigenes anonymisiertes CSV testen** to `/application-demos/v14/pilot.html`.
3. Open five synthetic sample tickets or import up to 500 synthetic/anonymised tickets in `id,message,product` CSV.
4. Inspect keyword evidence, accept/correct/escalate each ticket, download a JSON review receipt.
5. Enquire about a controlled pilot via an explicit email link, without being told a self-service paid product exists.

**Privacy boundary:** files are handled inside the browser tab and are not sent to a server. Do not import personal customer messages. Review state is intentionally ephemeral; exported report omits original message bodies. This is not a GDPR certification.

## No-go for public recurring billing (P0)

- [ ] Proper per-customer authentication, roles, rate limiting and durable tenant-isolated records
- [ ] Secure ingestion/storage, deletion, DPA/privacy/processor review, incident and backup procedures
- [ ] Production provider credentials, bounded consumption and observable costs, failure handling
- [ ] Billing checkout + webhook fulfilment + cancellation + receipts + subscription entitlements
- [ ] Independent customer-labelled dataset + blind holdout; demonstrate accuracy, correction rate, missed critical issues and time saved
- [ ] Five first-time user sessions on desktop and mobile; no verbal assistance, no dead ends
- [ ] Human approval of external actions, support runbook, contact and escalation process
- [ ] Verified live preview and manual visual/accessibility release approval

## Next proof milestone

**One supervised, paid pilot**, not immediate mass onboarding. Agree a narrow workflow and success metric in advance, use permitted historical cases, compare baseline vs AI under human review, retain evidence of time-to-decision and corrections, then decide KEEP / FIX / STOP.

Pricing is not proof of a viable subscription until actual customers can complete the job and see value.

## How to reproduce

```bash
# Node 22+
cd application-demos/v14-source
npm test
# Chrome for Testing / Chromium installed:
CHROME_PATH=/path/to/chrome node scripts/pilot-browser-smoke.mjs
# From repository root, requires public network:
node scripts/product-live-readiness.mjs
```

The GitHub Actions workflow additionally checks the canonical Digital Worker Factory and deployed LaunchCheck MCP service. All checks are read-only except writing local test artifacts.
