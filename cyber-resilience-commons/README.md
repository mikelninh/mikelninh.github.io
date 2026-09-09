# Cyber Resilience Commons

A free, open public-interest cyber resilience simulator for cities, hospitals, schools, NGOs and small organizations.

## Purpose

Help non-specialists understand one practical question: **if one identity, endpoint or vendor is compromised, how far can the incident spread before an explicit boundary stops it?**

The app uses synthetic organizations and deterministic incident paths. It never scans or attacks real systems.

## V1

- 5 organization templates
- 5 safe synthetic incident scenarios
- 8 defensive boundary controls
- deterministic blast-radius simulation
- before/after comparison
- prioritized missing controls
- recovery planning assumptions
- printable resilience brief

## Safety / truth boundary

This is a planning and education tool, not a penetration test, audit, vulnerability scanner or certification. Synthetic outcomes are not claims about any real organization. Real security assurance requires authorized testing in systems the organization owns or is permitted to assess.

## Run

Open `index.html` from a static server. Tests:

```bash
node --test cyber-resilience-commons/test.mjs
```
