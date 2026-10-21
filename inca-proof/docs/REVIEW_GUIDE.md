# INCA reviewer guide

**Start here:** [INCA Release 1.0 — six fictional claim cases](https://mikelninh.github.io/inca/release.html)

The full [Release 1.0 reviewer guide](RELEASE_GUIDE_1_0.md) explains the claim-type demonstrations, what was actually measured, the observed model misses, new model-agnostic safety guard, independent-test limitations and routes to code.

## 20–90 seconds

1. Pick any of six fictional cases across five claim types; inspect the two text sources.
2. Click **Check the evidence**: see a transparent, browser-local next route and reason code.
3. Download an unsent handoff, or record simulated feedback as a regression candidate.
4. To investigate a real development failure, open the [Operator Shift](https://mikelninh.github.io/inca/operator-shift.html) and its H-A-011 origin note.

## 5 minutes for engineering

- `node --test inca/release-engine.test.cjs`
- `python -m unittest discover inca-proof/model-eval -p 'test_*.py' -v`
- `python inca-proof/src/claims_eval.py`
- Compare [recorded Jev vs GPT evidence](https://github.com/mikelninh/mikelninh.github.io/actions/runs/39633113245) with `inca/guard-evidence.json` (offline retrospective guard replay, **not** new model accuracy).

All documents and policy excerpts are developer-authored fiction. All routes require remaining checks or human responsibility; no customer communication, real case mutation or payment takes place. The Anthropic harness is optional and has no published Claude live result; our engineering approach is model-independent.
