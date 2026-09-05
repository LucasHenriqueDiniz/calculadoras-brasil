---
status: done
kanban: 2b8cbde8-6f50-41d8-886d-74c8c3e3db5d
---

# Slice 3 — Tests for the last three untested calculators

`calculateCltVsPj`, `calculateBeneficiosFiscais` and
`calculatePrevidenciaComplementar`. Together because each is thin arithmetic
over a handful of inputs, and separately they would be three slices of twenty
minutes each.

## Delivers

Every module in `src/lib/calculators/` reachable from a test:

```
$ ls src/lib/calculators/*.ts | wc -l
      13
$ grep -rhoE 'src/lib/calculators/[a-zA-Z-]+' tests/ | sort -u | wc -l
      13
```

Today the second number is 8.

## Needs

- Slices 1 and 2 merged. `cltVsPj` reuses the CLT deduction path that slice 2
  pins, and `beneficiosFiscais` takes `aliquotaIrpfEstimada`, the rate slice 1
  establishes — writing these first means guessing at both.

## Tests

**calculateCltVsPj** (`src/lib/calculators/cltVsPj.ts:25`)

1. A CLT salary and a PJ proposal that come out even — the crossover point is
   the only number a user of this page actually wants.
2. PJ clearly ahead, and CLT clearly ahead, asserting the comparison flips.
3. `despesasDedutivelsPj` at zero and at a value large enough to change the
   verdict.

**calculateBeneficiosFiscais** (`src/lib/calculators/beneficiosFiscais.ts:23`)

4. Both benefits at zero returns zero saving.
5. `aliquotaIrpfEstimada` at the lowest and highest plausible rate against the
   same benefit values — the saving must scale with the rate.

**calculatePrevidenciaComplementar** (`src/lib/calculators/previdenciaComplementar.ts:24`)

6. `anosAteAposentadoria: 0` returns the contributions with no growth — the
   compounding base case, and where an off-by-one in the loop shows up.
7. A known compound-interest figure over 10 years, computed independently in the
   test rather than copied from the function's own output.
8. A zero return rate returns exactly the sum of contributions.

## Done when

```
pnpm test
```

Output must say `Test Files  4 passed (4)` — `calculators.test.ts` plus the
three files added across this feature — and `Tests  N passed (N)` with no
failures. Then:

```
comm -13 <(grep -rhoE 'src/lib/calculators/[a-zA-Z-]+' tests/ | sed 's|.*/||' | sort -u) \
         <(ls src/lib/calculators/ | sed 's|\.ts$||' | sort)
```

must print nothing: every module in the directory is imported by some test.

## If stuck

Case 7 is the one that can stall — if an independently computed compound figure
does not match to the cent, check the rounding policy before assuming either
side is wrong, and assert with a tolerance stated in the test rather than
loosening it silently.

If `previdenciaComplementar` turns out to model something more specific than
plain compounding (PGBL has its own deferred-tax treatment, and the input is
named `contribuicaoMensalPgbl`), that is a research question and not a test
question. Write cases 6 and 8, which hold either way, and leave 7 for after.
