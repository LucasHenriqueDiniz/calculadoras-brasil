# Plan — IRPF calculation defects

Pitch: `docs/pitches/irpf-calculation-defects.md`
Research: `docs/research/2026-09-04-irpf-2026-table/research.md`

Four slices, in order. Each ends with the unit suite in a stated colour, so a half-finished plan is
visible rather than inferred.

| slice | fixes | red cases left after it |
|---|---|---|
| 1 — official table | the table, the bracket gap, the dependant constant | 3 |
| 2 — INSS ceiling | flat 10% with no ceiling | 2 |
| 3 — simplified regime | rate, ceiling, double-counted dependants | 0 |
| 4 — redutor | Lei 15.270/2025, plus dead code | 0, and `pnpm run check` green |

The starting point is `Tests  10 failed | 34 passed (44)` on 2026-09-04, of which 10 red are in
`tests/calculators/irpf.test.ts`. **No assertion in that file may be relaxed to make a slice pass.**

Out of scope for all four, per the pitch: `salarioLiquido.ts`, the health-deduction cap, the
`regimeSimplificado` toggle semantics, and `src/routes/calculadora-irpf-2026.tsx`.
