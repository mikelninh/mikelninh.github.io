# INCA · A/B/C architectural experiment

**Question:** Does Jev help a claims workflow save real effort, or does it merely add a second model call?

Six developer-authored fictional narrative claims reused from the [narrative pilot](narrative_pilot_cases.json). This is an *inspected development suite*, not independent expert-labelled holdout data.

## Three honest alternatives

| Arm | Execution | Claim of usefulness |
|---|---|---|
| A: GPT + guard | GPT extracts quoted evidence; independent Python verifies it and gives bounded next route | Working baseline for detailed evidence |
| B: GPT + Jev | Exactly the same GPT evidence + second Jev attention signal, which may escalate but never downgrade mandatory review | Possible extra safety, but adds a call |
| C: Jev-first | Jev on raw documents; high-attention runs GPT for cited handoff; low-attention skips GPT but **requires manual evidence verification** | Cheap tokens potentially offset by costly human checking |

**Critical:** C's skipped GPT executions are **reconstructed counterfactuals** using the exact same Jev and GPT responses collected once on every case. We did not independently execute an adaptive end-to-end backend or measure reviewer time. This deliberate restriction keeps the paired comparison controlled and avoids silently treating a binary probability as reliable document extraction.

The prompt for GPT contains the raw documents without the authored route. The Jev decision similarly receives raw untrusted documents, not the authored route or claim type. Jev's exploratory threshold was fixed at 0.5 before this experiment; its scores are not calibrated. All three arms use the independent document-injection guard and cannot authorize payments.

## Live trial

- Exactly **6 actual GPT-4o mini requests + 6 actual Jev requests maximum**, one per fictional case each; **no retries**.
- Provider errors stay explicit and fail closed; no claim mutations or customer messages.
- Full original provider outputs and token/time metadata are archived in a private GitHub Actions artifact for 30 days. Public web work sample receives an **honest aggregate only** after source checks.
- Expected case routes are authored, not expert-reviewed.
- Model costs use dated list-price estimates; actual billing statements unavailable.
- Review costs, time spent by claims specialists, downstream orchestration latency, insurer policy compliance, confidence intervals and production value are **not measured**.

## Free validation

```bash
python -m unittest discover inca-proof/agent-ops -p 'test_*.py' -v
python inca-proof/agent-ops/abc_comparison.py --mode dry-run
```

For end-to-end value, a real insurer pilot should run all three routes on a **previously unseen, expert-labelled dataset**, measure mandatory human review minutes, missing-information tasks, case completion time, verified citation coverage, false negatives and actual invoice costs. For any automated continuation the guard requires independently verified evidence; this is a *decision-assistance* experiment, not a coverage approval model.

**Best outcome for this application:** demonstrate the judgment to say *when a cheap decision model helps, and when it would quietly transfer work to humans*.
