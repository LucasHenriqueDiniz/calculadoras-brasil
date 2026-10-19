---
status: done
---

# Slice 4 — The five tax calculators, on the pattern slice 3 proved

`/calculadora-irpf-2026`, `/calculadora-inss-autonomo`, `/calculadora-clt-vs-pj`,
`/calculadora-previdencia-complementar`, `/calculadora-beneficios-fiscais`.

## Delivers

For each one, slice 3's three parts:
- the top competitor fetched, with a written answer to what ours does that it does not;
- engine-generated content where the answer is weak;
- a pure builder with a test.

What fits each engine differs, and the slice decides. Candidates only:

| calculator | Google, 2026-10-18 | candidate content from its own engine |
|---|---|---|
| IRPF 2026 | indexed | tax due across incomes under both regimes, and where the simplified regime stops winning |
| INSS autônomo | unknown to Google | contribution at 20% versus 11% across incomes, and what each buys at retirement |
| CLT vs PJ | indexed | the break-even PJ invoice for each CLT salary, from the bisection #13 built |
| Previdência complementar | not indexed | balance at the visitor's own horizon across contribution levels |
| Benefícios fiscais | indexed | savings across salary levels |

**A calculator with no answer** is deepened, merged into a sibling, or dropped. Dropping one that
Google indexes (IRPF, CLT vs PJ, benefícios) is one-way and gets its own decision entry before it
ships.

## Needs

- ⚠️ **Found in slice 3, and to fix before any table here:** `cltVsPj.ts` computes the CLT
  withholding on the legal route only (INSS plus dependants). It never compares against the
  R$ 607,20 desconto simplificado mensal, which Lei 9.250, art. 4º, § 2º applies "caso seja mais
  benéfico ao contribuinte". The net salary module had the same defect: with no dependants it
  overstated the withholding by up to R$ 23,78 a month between R$ 4.878 and R$ 5.754 of gross
  (commit `dca8d9d`). The CLT side of the comparison inherits that error at exactly the salaries
  where CLT against PJ is closest. Reuse `calculateNetSalary` for the CLT side, or the same
  route rule, and test it with the same statute oracle.
- ⚠️ `calculateIrpf` (annual) computes whichever regime it is handed. The annual declaration does
  let the taxpayer choose, but the page should at least show which regime is more beneficial
  before the visitor relies on the one picked.

- Slice 3 done **and judged worth repeating**. If slice 3 changed its approach, this slice uses
  the changed one.
- The four calculators measured on 2026-09-10 are re-fetched on this slice's date, so all twelve
  are compared at one point in time.

## Tests

Per calculator, slice 3's three checks: a unit test with independently pinned rows, a smoke
assertion, and a UI-versus-page count on the deployed preview.

## Done when

```
pnpm run check && pnpm run test:seo
```

green, five written answers in the added-value research note, and a UI-versus-page count of N/N
in the PR for every calculator that gained a table.

⚠️ **Owner:** "Request indexing" for the five after deploy.

## If stuck

Ship the calculators one PR each rather than holding five for the slowest. The review only
happens in slice 7, so nothing is gained by batching here.

---

## What actually happened — 2026-10-18 (CLT vs PJ; the other four are still to do)

1. **CLT side** (`20ba562`): now one `calculateNetSalary` call, so it takes the more beneficial
   route. Forcing the legal route turns 2 tests red.
2. **The competitor reading changed the scope.** The leader, nagringa.dev, models the Simples,
   the Fator R and the pró-labore, and our PJ side was the 2026-09-05 note's known defect. The
   owner chose the real model. The research came first, all from Planalto, and D6 records the
   model (`8bf8ef5`).
3. **The model**, in three files:
   - `irpf-monthly.ts`: the shared monthly income tax, so the CLT salary and the pró-labore
     follow one rule;
   - `simples-nacional.ts`: the annexes and the effective rate;
   - the PJ side of `cltVsPj.ts`: three pró-labore strategies, the best kept.
   The third strategy, the one that holds the distribution at R$ 50.000, was not in D6 as first
   written. Without it the net fell about R$ 5.000 at the dividend threshold, and D6's text now
   includes it.
4. **What the tests found**, every one of them fixed:
   - the Fator R decided in floating point (R$ 7.334 put in Anexo V);
   - a pró-labore of 2.800,0000000000005;
   - the effective rate falling 2,5 points at RBT12 3,6M. That is the sublimit, so the model stops
     there and says so on the page;
   - the break-even rounding a centavo short;
   - a one-centavo surplus reading as "PJ é melhor".
5. **The page**: CLT and PJ breakdowns line by line, a dependants field, a costs field instead of
   the old "deductible expenses", an 11-row break-even table, and sections on the Fator R, the
   R$ 50.000 rule and what is not modelled. Every figure is computed. The storage key moves to v3.

| check | result |
|---|---|
| unit | 313 green across the suite. 5 mutants killed: INSS at 20%, no ceiling, float Fator R, no threshold strategy, 10% on the excess |
| oracle | PJ net equals the best strategy from the statutes' own arithmetic at every R$ 250 up to R$ 120.000, with costs 0 and 300 and 0 and 2 dependants |
| smoothness | the PJ net never falls and never rises more than the raise, from R$ 1.000 to R$ 150.000 |
| `test:seo` | 28 routes; the break-even table and the R$ 5.000 row prerendered |
| both ends | 5 of 5 salaries typed into the form match the table; the break-even invoice reads "Empate técnico" |
| deployed preview, 2026-10-19 | branch preview of #21 (`57cdadc`): the same 5 of 5, and "Empate técnico" at R$ 34.948,69 |

### IRPF 2026 — 2026-10-18

- **Leader:** the Receita's own simulator. It is official and bare, and its annual tab is
  exercício 2026.
- **Module** (`042769d`), against Lei 9.250 art. 8º on Planalto:
  - health uncapped, since the R$ 2.666,67 was invented;
  - education capped per person;
  - PGBL capped at 12%;
  - `compareIrpfRegimes`;
  - `buildRegimeThresholdTable`.
  Four mutants killed.
- **Page:**
  - both regimes side by side, with the better one named;
  - a 9-row table of the deductions the complete return needs beyond INSS;
  - the tax year stated up front, with a link to the Receita's simulator for the 2026 return;
  - FAQ corrected: no uniforms, transport or pharmacy medicines, and education per person;
  - rates with a decimal comma.
- **Checked in the form:**
  - the hand case matches;
  - the R$ 120.000 threshold flips between one real above and one real below;
  - `test:seo` asserts the table and the tax-year notice.

### INSS autônomo — 2026-10-18

- **Leader:** meutudo.com.br, an employee INSS calculator with 2025 tables.
- **Defect, against EC 103/2019 on Planalto:** the module applied art. 19's 20 years to every man.
  Art. 18 gives 15 to anyone affiliated before 13/11/2019. The 2-point increment still starts at
  20 for men (art. 26 § 2º), a threshold the module had conflated with the minimum.
- **Fixed:**
  - an affiliation field, with the storage key moved to v3;
  - the minimum age reported;
  - a 5-row plan table built by the calculator.
- **Checked:**
  - 2 mutants killed;
  - in the form, R$ 3.500 at 30 years gives R$ 2.800,00, as in the table;
  - a man with 15 years reaches the minimum before the reform and lacks 5 after it;
  - `test:seo` asserts the table.

### Previdência complementar — 2026-10-18

- **Leader:** an insurer's simulator (Icatu).
- **Defect:** the IRPF saving was the contribution times a hidden, fixed 22,5%.
- **Fix:** `pgblTaxSaving` computes the better-return tax without and with the PGBL through
  `compareIrpfRegimes`, which caps the deduction at 12%. The visitor gives an income, and the
  storage key moves to v3.
- **Hand case:** R$ 120.000 with R$ 12.000 saves R$ 1.709,70, not the R$ 2.700 the page showed.
- **New:** a 7-row table of what a 12% PGBL returns by income (0% to 24,2%). The unsourced
  "histórico médio 8-10%" hint is gone.
- **Checked:**
  - 1 mutant killed;
  - the form shows R$ 1.709,70;
  - `test:seo` asserts the table.
- The `ARCHITECTURE.md` known gap on the hidden rate is resolved.

### Benefícios fiscais — 2026-10-18

- **Defects, against Leis 7.418, 6.321 and 7.713 on Planalto:**
  - the cash equivalent left out INSS, dividing by one minus a typed income-tax rate;
  - the whole vale-transporte counted, though the worker pays up to 6% of the salary.
- **Now:** salary and commute cost are inputs, with the storage key at v3. Only the employer's
  share of the vale-transporte counts, and the equivalent raise is solved through
  `calculateNetSalary`.
- **New:** a 7-row table of what R$ 800 of meal benefit is worth in raise. At R$ 5.000 it is
  R$ 1.662,99, +108%, because of the 2026 reduction's phase-out.
- **Checked:**
  - 2 mutants killed;
  - the form shows R$ 1.662,99, and 220 / 180 for the vale-transporte split;
  - `test:seo` asserts the table.

**Slice 4 is done**: all five tax calculators, each read against its statute, with a computed
table, form-against-table checks and mutants killed. Every one of them had at least one defect in
its arithmetic. The deployed-preview checks for #21–#25 and the owner's "Request indexing" remain,
as in the other slices.
