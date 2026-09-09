# Golden Cases

## GC-01 — Stolen password, weak baseline
City template + stolen-credentials + default controls.
Expected: path is uncontained and modeled exposure is non-zero.

## GC-02 — Stolen password, strong baseline
City template + stolen-credentials + all recommended controls.
Expected: phishing-resistant MFA blocks the first step; zero modeled data exposure.

## GC-03 — Ransomware assumes compromise
City template + ransomware + all recommended controls.
Expected: the first endpoint compromise is still counted; segmentation stops subsequent spread. The result is contained-after-impact, never “nothing happened.”

## GC-04 — Recommendations are causal
A recommended control must be currently disabled and must improve at least one scenario when enabled.

## GC-05 — Recovery evidence matters
Restore-tested immutable backups must improve the modeled restoration assumption compared with no protected backups.
