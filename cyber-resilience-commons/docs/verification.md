# Verification

Release gates for V1:

1. `node --test cyber-resilience-commons/test.mjs` passes.
2. Public Pages deploy succeeds.
3. Live smoke returns HTTP 200 and contains the hero marker `See how far an incident can spread`.
4. No code path accepts a real host, IP, credential, repository or arbitrary command as a simulation target.
5. Truth-boundary copy remains visible above the workspace.
6. Manual UI review checks desktop, narrow mobile, control toggles, scenario changes, recommended baseline, reset and print layout.

A passing V1 proves only that the synthetic simulator behaves as specified. It does not prove any real organization is secure.
