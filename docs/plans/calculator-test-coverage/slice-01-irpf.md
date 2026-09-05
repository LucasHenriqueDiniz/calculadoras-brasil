---
status: done
kanban: c5fc34fd-52c5-4217-862f-6ef83da6ff50
---

# Slice 1 — Tests for calculateIrpf

**Resolved 2026-09-04.** This slice was blocked the day it was written: its 27 tests were green on
18 and red on 9, and the 9 named four defects in `calculateIrpf` rather than bugs in the tests.
A fifth turned up during the research that followed.

All of them are fixed. `tests/calculators/irpf.test.ts` reports `28 passed (28)` — 28 rather than
27 because slice 3 of the fix added a case, and no assertion was relaxed to get there.

The trail, in the order it happened:
`docs/pitches/irpf-calculation-defects.md` → `docs/research/2026-09-04-irpf-2026-table/research.md`
→ decision `D3` in `docs/architecture/ARCHITECTURE.md` → `docs/plans/irpf-calculation-defects/`,
slices 1–4, the last of which added the Lei 15.270/2025 redutor — new behaviour rather than a
defect this slice found.

The first of the two headline calculators. `/calculadora-irpf-2026` is a top
public page and `calculateIrpf` has no test today.

## Delivers

`tests/calculators/irpf.test.ts` exists and passes, and `pnpm test` covers 9 of
the 13 calculator modules instead of 8.

## Needs

- Nothing in the repo. `calculateIrpf(input: IrpfInput): IrpfResult`
  (`src/lib/calculators/irpf.ts:55`) is pure — no fetch, no clock, no storage —
  so the test needs no fixture and no setup file.
- The 2026 bracket and deduction figures the code claims to implement, read from
  the module itself and from `src/lib/calculators/inss-constants.ts`
  (`INSS_ANO_REFERENCIA = 2026`, `SALARIO_MINIMO = 1621.0`, `TETO_INSS =
  8475.55`). ~20 min to read both files and write down what each branch asserts.
- `vitest.config.ts` sets `include: ["tests/**/*.test.ts"]`, so a file under
  `tests/calculators/` is picked up with no config change. Verify that on the
  first run rather than assuming it.

## Tests

The list is the definition of done:

1. Exemption band — income below the first bracket returns zero tax.
2. One case per bracket boundary, at the boundary and one cent either side. A
   bracket table is wrong at its edges or nowhere.
3. `regimeSimplificado: true` vs `false` on the same input — the simplified
   regime must win exactly when it is the smaller tax, which is the one branch
   a user would notice being wrong.
4. `dependentes` scaling: 0, 1, 3 dependants, asserting the deduction is
   per-dependant and capped where the code caps it.
5. Each of `deducaoEducacao`, `deducaoSaude`,
   `deducaoPrevidenciaComplementar` applied alone, then all three together —
   education is capped in law and health is not, and a test that only exercises
   them together cannot tell which cap fired.
6. Zero and negative income do not produce a negative tax or `NaN`.

## Done when

```
pnpm exec vitest run tests/calculators/irpf.test.ts
```

Output must say `Test Files  1 passed (1)` and a `Tests  N passed (N)` line with
N at least 6, one per numbered case above, with no failures and no skipped
tests. Then `pnpm test` must report a higher total than the 17 passing today.

## If stuck

If a bracket boundary produces a number you cannot justify against the 2026
table, **do not** write the test to match the code. Assert the figure the
legislation gives, let the test fail, and mark the slice `blocked` with the
failing input in the first line of this file — a red test naming a real
discrepancy is worth more than a green one that certifies the bug.

If `calculateIrpf` turns out to need a value only `salarioLiquido.ts` computes,
stop and merge this slice with slice 2 rather than importing across.
