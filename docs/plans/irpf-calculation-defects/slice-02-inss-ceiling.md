---
status: done
kanban: 6885cb74-4d96-4844-9d77-0cf09100115a
---

# Slice 2 — Deduct INSS with the progressive brackets that already exist

The smallest slice, and the one where the correct code is already in the repository.

## Delivers

`irpf.ts` stops computing `rendaBrutaAnual * 0.1` and calls `calcularInssEmpregado` from
`./inss-constants`, which `salarioLiquido.ts` and `inssAutonomo.ts` already import.

The function is monthly, the module is annual, so the call is on the monthly salary and the result
is annualised: `calcularInssEmpregado(rendaBrutaAnual / 12) * 12`. That is what puts the RGPS
ceiling in play — the reason the flat rate is wrong is that it has no ceiling, not that 10% is a
bad average.

Measured today: at R$ 500.000 the module deducts R$ 50.000 against a legal annual maximum of
R$ 11.857,10.

`INSS_RATE` is deleted, along with the comment conceding it is an average.

## Needs

- Slice 1 merged, so the assertion counts in `Done when` mean what they say.
- Nothing else. `inss-constants.ts` is in the same directory and needs no change.

## Tests

- `never deducts more INSS than the RGPS ceiling allows` goes green. It computes the ceiling from
  `calcularInssEmpregado(TETO_INSS) * 12` rather than hardcoding it, so it stays correct when the
  2027 table lands.
- `deducts INSS proportionally below the ceiling` currently asserts `descInss === 5000` for an
  income of 50.000 — a flat 10%. **It must be rewritten**, not kept: with progressive brackets the
  right figure at R$ 4.166,67 a month is no longer a round 10%. Assert against
  `calcularInssEmpregado` rather than against a literal.

## Done when

```
pnpm exec vitest run tests/calculators/irpf.test.ts -t "INSS"
```

Both INSS cases pass. Then the full file reports `Tests  2 failed | 25 passed (27)`.

## If stuck

If annualising monthly brackets turns out to disagree with how the annual declaration actually
treats INSS, that is a research question and not a coding one — record the disagreement, leave the
slice blocked, and do not invent a reconciliation.

---

## What actually happened — 2026-09-04

`Tests  2 failed | 25 passed (27)`, exactly as planned, and both reds are the simplified-regime
cases that slice 3 owns.

Measured after the change:

```
renda     50.000 -> descInss  4.663,20
renda    101.706 -> descInss 11.857,10   (the ceiling, reached exactly)
renda    500.000 -> descInss 11.857,10   (was 50.000,00)
```

**A second thing had to change and the plan only half-anticipated it.** The test helper was
`taxAtBase(base) => irpf({ rendaBrutaAnual: base / 0.9 })` — a division that was only correct while
INSS was a flat 10%. Left alone it would have kept every boundary test green while probing bases
that are not the boundaries, which is the quietest way a suite stops meaning anything.

It is now `incomeForBase`, inverting the whole deduction chain by bisection. Verified rather than
assumed — solving for each of the four boundaries and re-reading `baseImponivel` off the result:

```
target 29.145,60 -> income 31.707,4945 -> base produced 29.145,600000  (error 3.6e-12)
target 33.919,80 -> income 37.026,1336 -> base produced 33.919,800000  (error 0)
target 45.012,60 -> income 49.631,5882 -> base produced 45.012,600000  (error 0)
target 55.976,16 -> income 62.318,9916 -> base produced 55.976,160000  (error 7.3e-12)
```

Twelve orders of magnitude below the 0,005 the tests need.

⚠️ **Correction to this file, the pitch and ARCHITECTURE.md:** the annual INSS maximum was written
as R$ 11.857,11 in all three. `calcularInssEmpregado(TETO_INSS) * 12 = 11857,0968`, which is
R$ **11.857,10**. Fixed in all three on 2026-09-04.
