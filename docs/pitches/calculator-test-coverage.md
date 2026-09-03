---
status: active
epic: tests
---

# Five calculators with no test at all

## The problem

`tests/calculators.test.ts` is the only test file in the repository, and it
imports 8 of the 13 modules in `src/lib/calculators/`:

```
$ grep -c 'from "../src/lib/calculators/' tests/calculators.test.ts
8
$ ls src/lib/calculators/ | wc -l
      13
```

Imported: `carCost`, `livingAlone`, `electricityBill`, `subscriptions`,
`movingCost`, `petCost`, `inssAutonomo`, `inss-constants`.

Not imported by anything under `tests/`:

- `irpf.ts` — `calculateIrpf`
- `salarioLiquido.ts` — `calculateSalarioLiquido`
- `cltVsPj.ts` — `calculateCltVsPj`
- `beneficiosFiscais.ts` — `calculateBeneficiosFiscais`
- `previdenciaComplementar.ts` — `calculatePrevidenciaComplementar`

The `testing` skill makes Layer 1 mandatory for a domain file with executable
code. All five are pure functions with no I/O, which is the cheapest possible
thing to test — there is no fixture, no clock, no network.

## Why it matters more than the count suggests

`/calculadora-salario-liquido` carries `priority: 0.95` in
`src/lib/seo-pages.ts`, the highest of the 38 public pages, and
`/calculadora-irpf-2026` is the product's other headline page. The two
calculators the site is ranked for are the two with no proof they compute
anything correctly. A wrong INSS bracket or a wrong deduction cap would ship
green: `pnpm run check` runs `vitest run`, and `vitest run` currently has
nothing to say about these files.

Worse, `irpf.ts` and `salarioLiquido.ts` implement the same 2026 deduction and
bracket rules twice. Nothing today would notice the two drifting apart.

## What this is not

This is not a coverage-percentage project. `@vitest/coverage-v8` is not
installed and this pitch does not install it — the check is that a named test
file exists, runs, and asserts the numbers the calculator is supposed to
produce.

## Constraint

`vitest.config.ts` sets `include: ["tests/**/*.test.ts"]`. New test files go
under `tests/`, or vitest will not see them.

## Appetite

Three slices. The two headline calculators get one each, because their bracket
tables need care and a shared-rule cross-check between them. The remaining
three are thin wrappers over arithmetic and fit in one slice together.
