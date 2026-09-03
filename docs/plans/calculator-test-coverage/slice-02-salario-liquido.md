---
status: todo
kanban: b86bccd4-b689-471a-a875-d2d575f6524c
---

# Slice 2 — Tests for calculateSalarioLiquido

The other headline calculator, and the highest-priority page in
`src/lib/seo-pages.ts` (`priority: 0.95`). No test today.

## Delivers

`tests/calculators/salario-liquido.test.ts` exists and passes, covering
`calculateSalarioLiquido` (`src/lib/calculators/salarioLiquido.ts:43`), and
`pnpm test` covers 10 of 13 calculator modules.

## Needs

- Slice 1 merged. `salarioLiquido.ts` and `irpf.ts` implement the same 2026
  deduction rules, and this slice's cross-check case compares them; writing it
  before slice 1's bracket cases exist means writing the same figures twice.
- `calcularInssEmpregado` from `src/lib/calculators/inss-constants.ts`, which is
  already tested — those assertions are the reference for the INSS half and do
  not need restating here.

## Tests

1. Gross-to-net for one ordinary salary, asserting the full breakdown the
   `SalarioLiquidoResult` returns, not just the final net.
2. INSS ceiling: a salary above `TETO_INSS` (8475.55) contributes the ceiling
   amount and not a proportion of the salary.
3. Each of `temValeRefeicao`, `temValeTransporte`, `temSindicato` toggled alone
   against the same base salary — three booleans that are trivially transposed
   and would not be caught by a test that sets all three.
4. `regimeSimplificado` true vs false, same rule as slice 1.
5. Cross-check with `calculateIrpf`: for one input expressible in both, the
   annual deduction totals agree. This is the test that catches the two copies
   of the rules drifting apart.
6. Zero salary returns zero net with no `NaN` in any breakdown field.

## Done when

```
pnpm exec vitest run tests/calculators/salario-liquido.test.ts
```

Output must say `Test Files  1 passed (1)` and `Tests  N passed (N)` with N at
least 6 and no failures. The cross-check in case 5 must be a real assertion
between the two functions' outputs, not two hard-coded literals that happen to
match — a hard-coded pair passes forever and proves nothing.

## If stuck

If the cross-check fails, the two implementations already disagree. That is the
finding, not an obstacle: record the input and both outputs in the first line of
this file, set `status: blocked`, and raise the discrepancy rather than tuning
either side to agree.

If the result shape has more fields than are worth asserting individually,
snapshot the whole object for the ordinary case (case 1) and keep the targeted
assertions for cases 2-6 — but never snapshot alone, because a snapshot
approves whatever the code does today, including a bug.
