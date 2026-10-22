# INCA Jev Final Research: H2, H6 and H7

## Source integrity

The H2/H6 findings below are a **posthoc, zero-new-model-call analysis** of the original real 300 Jev + 300 GPT-4o-mini response archive: [recorded GitHub run #39691808881](https://github.com/mikelninh/mikelninh.github.io/actions/runs/39691808881). The 240-case holdout was **already inspected for other hypotheses**. It cannot now honestly be advertised as a new blind holdout. The labels are generated synthetic trace faults, not actual insurance outcomes.

The evidence JSON is published at [INCA H2/H6 result](https://mikelninh.github.io/inca/jev-h2-h6.json). Reproduce offline:

```bash
python inca-proof/agent-ops/jev_h2_h6_analysis.py --input jev_v2_300_real.json --out /tmp/jev_h2_h6.json
```

### H2 · Does Jev actually save optional expensive audits?

We calibrate the Jev cutoff on the *60 development cases only* to catch all 11 seeded critical faults there, producing threshold **0.13**. Applying the fixed cutoff to the already-inspected 240 test records produces:

| Metric | GPT-only optional audit | Jev → selective GPT audit |
|---|---:|---:|
| Jev calls | 0 | 240 |
| GPT audits (replayed from actual paid calls) | 240 | 230 |
| Avoided GPT calls | 0 | **10 (4.2%)** |
| Seeded critical faults selected | 49/49 baseline audits | **44/49** |
| Estimated API cost | **$0.020713** | **$0.027950** |
| Financial result | Baseline | **+$0.007237 (+34.9%)** |

Not a live selective system: the model API was called on all cases in the *original* real benchmark; the 10 skipped GPT requests are **counterfactual**. The ability of GPT to actually recognize errors once called is separate: an audit can be commissioned but fail to detect the problem. This table assumes each selected trace is sent for optional audit, not that every selected case is fixed. Mandatory deterministic checks and actual human approval would remain in both architectures.

**Reject this implementation of H2**: with this case mix and this tiny GPT mini model, Jev adds cost and could skip seeded critical errors. A more expensive, genuinely optional reviewer or a more selective *noncritical* use case might have different economics, but that has not been tested.

### H6 · Are Jev confidence probabilities usable?

On the same 240 synthetic trace records:

| Measure | Jev | GPT | Constant-fault-rate baseline |
|---|---:|---:|---:|
| Brier score (lower better) | **0.0750** | 0.1902 | 0.1625 |
| ECE, five equal-width score bins (lower better) | 0.1244 | 0.1242 | — |

Jev's Brier score improves ~54% versus the constant fault-rate baseline. Nevertheless, it **does not meet** our preregistered ECE ≤0.10 calibration gate. A score of 0.13 means a *hypothesized probability on developer-planted faults*, not a verified likelihood of real claim fraud or coverage.

**H6 outcome:** useful ranking signal, insufficient evidence for autonomous thresholding. Human review and mandatory source validation stay in place.

### H7 · Jev 1.13 versus Jev 1.14 in English and German

A separate genuinely new paired fictional-language test is implemented at [jev_h7_bilingual.py](jev_h7_bilingual.py). It uses **40 newly written concept cases**, with aligned German and English document versions (80 inputs), two explicitly pinned model versions, same fixed `choice` + `noul` questions. Up to **160 possibly billable TypeSafe calls**, no retries. It records actual response version, evidence of rejected/unsupported version, tool-choice accuracy, critical-seeded-fault recall at score 0.5, Brier and model latency by language. Version pinning is not assumed to work unless the provider returns that exact revision.

These constructed parallel language templates are *not professional translations or domain-expert insurance labels*. No full-case insurance coverage or payment decisions are made.

### Cost interpretation

Input token costs at dated provider list prices, **not verified invoices**: Jev $0.042/million input (output free), GPT-4o-mini $0.15/million input + $0.60/million output. The old 300+300 call experiment cost an **estimated $0.03569** in combined model inference; it does not measure the actual expenses of insurer workflows or employees. The H2 replay above shows why cheaper decision-token pricing is not sufficient evidence of process savings.

## Recommendation for INCA

**Ship no additional model solely because it is fast.** Keep deterministic guardrails, measure where the optional expensive judgment step truly exists, require evidence grounding and compare total cost per *resolved* claim. Review H7 separately before proposing a multilingual/version upgrade. The central hiring-manager work sample stays a 60-second readable experience; technical findings remain optional.
