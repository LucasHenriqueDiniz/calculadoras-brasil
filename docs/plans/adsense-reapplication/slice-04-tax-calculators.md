---
status: doing
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
