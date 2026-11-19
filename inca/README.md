# INCA Evidence Lab — correctness, traceability, human workload

> **We measure our success not by what we create, but by what changes because we created it.**
>
> **Love is our intention. Action is our expression. Impact is our evidence.**

Independent, non-official application work sample. All claims and source documents are fictional. No insurer systems, policy decisions, payouts or customer data are connected.

## Our impact card · 19 November 2026

| Project | Now → Desired change | Next action and measurable success |
| --- | --- | --- |
| INCA Evidence Lab | Existing browser-local date checker and recorded synthetic model studies; **expert reviewed real-workflow baseline not established** → Correct, traceable decisions with less human work | Independently label new claims, repair safety failures, re-run held-out evaluations; measure correct routing, unflagged critical errors and operator minutes per claim |

## Fresh 30-case benchmark — measured, but not expert reviewed

**[Open inspectable case viewer](https://mikelninh.github.io/inca/impact-benchmark.html)** · [Machine-readable report](impact-30-report.json) · [Original fictional cases](impact-30-fixtures.json) · [Regression test](impact-benchmark.test.cjs)

On 19 November 2026, the **unchanged** `interactive-case.js` function was evaluated against 30 newly written synthetic travel-cancellation text pairs (not general claims cases):

| Indicator | Result |
| --- | ---: |
| Developer-authored expected routes matched | **24 / 30** |
| Different routes | **6 / 30** |
| Unsafe continuations (should not have continued) | **2 / 30** |
| Actual external actions | **0** |
| Independently expert-reviewed labels | **0 / 30** |
| Measured manual workload improvement | **Unknown** |
| Decision | **RELEASE BLOCKED** |

### Six recorded failures

- `IMP-009`, `IMP-010`: matching dates written in natural language → `NEED_INFO`, rather than `CONTINUE_CHECKS`.
- `IMP-019`, `IMP-020`: conflicting dates written in natural language → `NEED_INFO`, rather than `HUMAN_REVIEW`.
- `IMP-029`, `IMP-030`: malicious instructions embedded in otherwise matching dated documents → `CONTINUE_CHECKS`, rather than `HUMAN_REVIEW`. **These two cases trigger the blocked safety gate.**

The 30 expected labels were authored by the developer, not by a claims expert. Cases were designed to probe the existing evaluator's likely weaknesses. This is a **reproducible diagnostic**, not a statistically representative independent blind benchmark, production accuracy estimate, LLM performance test, or claim that human workload decreased. The evaluation uses a limited date-only deterministic parser.

### Repeat the test locally

```bash
node --test inca/impact-benchmark.test.cjs
```

The test loads the actual workshop evaluator and independently replays each recorded input, checking output, safety escapes and whether the public report agrees with execution. **Passing this test only proves reproducibility; it does not override a blocked release gate.**

## Follow-up evaluation plan

1. Have a qualified insurer-side claims expert independently review expected next-route labels; resolve ambiguous cases and preserve provenance.
2. Correct free-text extraction and hostile-source instruction handling. Freeze the candidate before the next unseen split.
3. Retest on at least 30 **different** held-out cases, with independently reviewed labels and explicit stop rules: zero unflagged critical escapes. Do not reclassify the first 30 as fresh holdout.
4. Run a consent-based paired human workflow study; measure baseline vs assisted **minutes per claim**, correctness, escalation frequency and corrections. If the intervention increases errors or doesn't reduce total effort, change it.
5. Only then consider a shadow pilot with authorised oversight. There is **no production release approval**.

## Other demos / historical evidence

- [INCA project landing](https://mikelninh.github.io/inca/)
- [Operator workshop](https://mikelninh.github.io/inca/operator-shift.html)
- [One-minute interactive cancellation example](https://mikelninh.github.io/inca/60s.html)
- [Reliability loop](https://mikelninh.github.io/inca/reliability-loop.html)
- [Recorded real-model responses](live-model-eval.json): distinct older developer-authored synthetic evaluation. Do not combine scores or claim it was an independent expert review.

**Link status:** these file paths were checked against the GitHub repository on 19 November 2026. External HTTP availability of the GitHub Pages deployment was not independently verified in this session.

