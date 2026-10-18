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

---

## What actually happened — 2026-10-18

**The competitor answer came first, and it reversed the premise.** Position 1 on Google Brasil was
buk.com.br. Its public script applies Lei 9.250, art. 4º, § 2º: the R$ 607,20 simplified discount
when it beats INSS plus dependants. Ours did not, so on its own default of R$ 5.000 it withheld
R$ 23,78 from a salary the 2026 law exempts. Two more defects turned up on the same page:
- health and education were deducted from the monthly base, which art. 4º does not allow;
- the "mensal" pension field was divided by twelve.

The owner chose to fix before building, and that became its own commit, `dca8d9d`:
- the more beneficial route applies automatically;
- health and education leave the monthly calculation and point to the IRPF calculator;
- the pension is read as typed;
- the storage key moves to v3.

Mutation checks: putting each defect back turned 5, 6 and 1 tests red. Every statutory claim
cites Planalto: `docs/research/2026-10-18-adsense-added-value/fetches/`.

**Then the difference.** It comes from three pieces of code:
- `buildNetSalaryTable` is a pure function next to the module, and every row is a
  `calculateNetSalary` call;
- `simplifiedRouteCeiling` finds where INSS reaches R$ 607,20: R$ 5.754,90 with no dependants,
  and below the exempt range with one;
- a page section built on them: a 16-row table from the minimum wage to R$ 20.000, three findings
  in prose and a worked example at R$ 6.000. Every figure in it is computed; none is typed.

| check | result |
|---|---|
| unit, `salario-liquido.test.ts` | 73 green. 4 rows pinned to hand computations from the published tables. Returning gross as net turned 5 red. |
| `test:seo` | green on 28 routes. Asserts the prerendered page carries the table, the R$ 5.000 net (R$ 4.498,49) and the R$ 6.000 withholding (R$ 385,10). |
| both ends, form against table | **8 of 8** on `pnpm run dev`: R$ 1.621, 3.500, 4.500, 5.000, 5.500, 6.000, 7.000 and 20.000 typed into the form gave the table's net to the centavo |
| external cross-check | the R$ 4.500 row reproduces the Receita's own worked example: base 3.892,80, table 200,39, reduced to zero |
| size | the section is 702 words; the prerendered main content is 1.517 |

The added-value answer is in `docs/research/2026-10-18-adsense-added-value/research.md`. In short,
the leader applies the rule silently, and ours now applies it, says so, and shows it across 16
salaries.

**Is it worth repeating?** Yes, with one change to the method: **read the competitor's
calculation before writing anything**. Here, doing so found a defect in ours that no word count or
auditor row would have shown. Slice 4 starts with the same defect, already found in `cltVsPj.ts`,
and with a note on `calculateIrpf`; both are recorded in its Needs.

**Still to do:** the 8 typed checks again on the deployed preview of this branch's PR, as the
Tests section asks. ⚠️ **Owner:** "Request indexing" for `/calculadora-salario-liquido` after the
merge.
