---
status: doing
---

# Slice 3 — Salário líquido: answer the competitor, then build what only this site can

The pilot, on the most important calculator: `priority: 0.95` in `seo-pages.ts`, indexed, and the
shallowest against its competitors on 2026-09-10 (0.53x the median).

## Delivers

1. **The answer.** The top organic result for `calculadora salário líquido 2026`, fetched on the
   day of the slice and committed under `docs/research/<date>-adsense-added-value/fetches/`, and a
   written answer in that note's `research.md` to *what does ours do that this one does not?* If
   the honest answer is "nothing yet", say so. That is what the rest of the slice is for.
2. **The difference, built from the engine.** A table of net salary across the gross salaries a
   Brazilian visitor actually has, from `MINIMUM_WAGE` (R$ 1.621, `src/lib/calculators/inss-constants.ts`) up to R$ 20.000. It is computed by
   `calculateNetSalary` from `src/lib/calculators/salarioLiquido.ts`, with INSS, IRPF before the
   reduction, the Lei 15.270/2025 reduction and net pay as columns. Add one or two worked examples
   that show where the 2026 reduction stops mattering. The table must be what a visitor would get
   by typing each row into the calculator, because it comes from the same function.
3. **A pure builder.** The rows are built by a pure function next to the module, for example
   `buildNetSalaryTable(grossSalaries)`, not inline in the route. That is what makes the table
   testable without a component framework, which this repo does not have.

Every word a visitor reads stays in Brazilian Portuguese.

## Needs

- Slice 1 merged, so that anything folded into this page from the `salario-liquido-*` articles is
  already here.
- `docs/research/2026-09-04-irpf-2026-table/research.md` for any figure that appears in prose. The
  table's figures come from the function, never typed.

## Tests

- **Unit**, in `tests/calculators/salario-liquido.test.ts`: the builder returns one row per input,
  and each row equals `calculateNetSalary` for that input. That alone would be a tautology, so add
  three rows pinned to values computed **independently** from the official tables in the research
  note, one in each IRPF band that the reduction does not zero out. Revert the builder to return
  gross as net, watch the pinned rows go red, and restore it.
- **Smoke**: `tests/seo-smoke.mjs` asserts that the prerendered `/calculadora-salario-liquido`
  contains the table, by checking for one known formatted net figure.
- **Both ends**: on the deployed preview, type N gross values from the table into the calculator
  UI and compare the net shown with the table row. State N and how many matched in the PR. Any
  mismatch is a defect in one of the two, not a rounding note.

## Done when

```
pnpm exec vitest run tests/calculators/salario-liquido.test.ts && pnpm run test:seo
```

green, the UI-versus-table count in the PR reads N/N, and the research note has a written answer
for this calculator.

Then **look at the result before slice 4**. If the table reads as filler, change the approach here,
on one page, not across eleven.

## If stuck

If the builder wants to change `calculateNetSalary`'s signature, stop. The table consumes the
module as it is. Changing a tested formula to suit a presentation is the wrong direction.
