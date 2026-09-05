---
status: done
kanban: 58a01bb2-2852-47e5-bb92-72458c4b30c7
---

# Slice 2 — English identifiers in irpf and salarioLiquido

The two headline calculators, taken together because they duplicate the same
2026 deduction and bracket rules and a rename that touches one and not the
other makes that duplication harder to spot, not easier.

## Delivers

`irpf.ts` (21 matching lines) and `salarioLiquido.ts` (34) in English, with the
returning visitor's saved form still loading — not silently emptied.

Fields today:

```
IrpfInput            rendaBrutaAnual dependentes deducaoEducacao deducaoSaude
                     deducaoPrevidenciaComplementar regimeSimplificado
SalarioLiquidoInput  salarioBrutoMensal dependentes deducaoEducacao deducaoSaude
                     deducaoPrevidenciaComplementar temValeRefeicao
                     temValeTransporte temSindicato regimeSimplificado
```

Both are serialised whole into `localStorage` by `usePersistedState`, under
`"irpf-2026-input"` (`src/routes/calculadora-irpf-2026.tsx:139`) and
`"salario-liquido-input"` (`src/routes/calculadora-salario-liquido.tsx:101`).
Renaming a field without touching the key hands the new code an object whose
every property is `undefined`.

Bump both keys, the way `inss-autonomo-input-v2` already does in
`src/routes/calculadora-inss-autonomo.tsx:83` — the repo has done this before
for the same reason. A stale key is dead weight in one browser; a matching key
with a mismatched shape is a broken form.

## Needs

- Slice 1 merged: both modules import from `inss-constants.ts`, and doing them
  in the other order means renaming the same imports twice.
- The route components that read these types:
  `src/routes/calculadora-irpf-2026.tsx`,
  `src/routes/calculadora-salario-liquido.tsx`, plus any blog page importing
  the calculator (`grep -rl "calculators/irpf\|calculators/salarioLiquido" src`).

## Tests

- Cross-check test asserting `calculateIrpf` and `calculateSalarioLiquido`
  agree on the annual deduction total for one shared input — the duplication
  named in the pitch, pinned before it is renamed.
- A before/after value test: record the current output of both functions for
  three inputs, and assert the same numbers after the rename. A rename that
  changes a number is a bug, and this is what catches it.
- A test that `usePersistedState` returns `DEFAULTS` when the stored value is
  an object of old keys — the failure mode the key bump exists to prevent.
- Note: if slice 1 of `[tests]` has already landed, extend that file rather
  than starting a second one for `irpf`.

## Done when

Two separate blocks, because chaining them lets a failing test print the
passing string. Run the suite first:

```
pnpm run typecheck && pnpm test && echo "checks-ok"
```

`checks-ok` is only reached when both exit 0. No typecheck errors, and the
vitest summary must show a test count **higher** than the 17 passing today —
this slice adds the value tests listed above, so an unchanged count means they
were not written. Then, as its own command, so `$?` is the grep's:

```
grep -rniE 'aliquota|deducao|salario|contribuicao|beneficio' \
  src/lib/calculators/irpf.ts src/lib/calculators/salarioLiquido.ts
echo "grep-exit=$?"
```

Must print no matching lines and end with `grep-exit=1`. Today both files match
and it ends with `grep-exit=0`.

## If stuck

If the two calculators turn out to disagree on a shared input, do not fix the
disagreement here — that is a domain bug and a rename is the wrong change to
hide it inside. Record the failing input, leave the cross-check test skipped
with the reason, and raise it separately.

If the key bump feels like too much for one slice, ship the rename with the
**old** keys kept as a read-only fallback (read old key, write new) rather than
dropping either. Losing a saved form is worse than carrying one extra branch.

---

## What actually happened — 2026-09-05

`checks-ok` printed, the grep over all three files exits 1, and `pnpm run check` exits 0. The suite
went **268 → 275**.

⚠️ **The slice's `Done when` expects a count above "the 17 passing today".** That figure predates
`docs/plans/calculator-test-coverage/`. The check that matters is `pnpm run typecheck` exiting 0,
which is what proves no call site was missed — every symbol here is imported by name.

### Renamed

`IrpfInput` / `IrpfResult`:

| was                              | is                              |
| -------------------------------- | ------------------------------- |
| `rendaBrutaAnual`                | `grossAnnualIncome`             |
| `dependentes`                    | `dependants`                    |
| `deducaoEducacao`                | `educationDeduction`            |
| `deducaoSaude`                   | `healthDeduction`               |
| `deducaoPrevidenciaComplementar` | `supplementaryPensionDeduction` |
| `regimeSimplificado`             | `simplifiedRegime`              |
| `descInss`                       | `inssWithheld`                  |
| `baseCalculoSimplificada`        | `simplifiedCalculationBase`     |
| `totalDeducoes`                  | `totalDeductions`               |
| `baseCalculoCompleta`            | `fullCalculationBase`           |
| `descDependentes`                | `dependantAllowance`            |
| `baseImponivel`                  | `assessableBase`                |
| `aliquotaEfetiva`                | `effectiveRate`                 |
| `irpfPelaTabela`                 | `taxFromTable`                  |
| `reducaoLei15270`                | `reductionLei15270`             |
| `irpfCalculado`                  | `calculatedTax`                 |
| `irpfDevido`                     | `taxDue`                        |
| `aliquotaMarginal`               | `marginalRate`                  |

`SalarioLiquidoInput` → `NetSalaryInput`, `SalarioLiquidoResult` → `NetSalaryResult`,
`calculateSalarioLiquido` → `calculateNetSalary`:

| was                        | is                            |
| -------------------------- | ----------------------------- |
| `salarioBrutoMensal`       | `monthlyGrossSalary`          |
| `salarioBrutoAnual`        | `annualGrossSalary`           |
| `temValeRefeicao`          | `hasMealAllowance`            |
| `temValeTransporte`        | `hasTransportAllowance`       |
| `temSindicato`             | `hasUnionDue`                 |
| `descInssEmpregado`        | `inssWithheld`                |
| `baseParaIrpf`             | `monthlyBaseAfterInss`        |
| `baseImponivel`            | `annualAssessableBase`        |
| `baseImponivelMensal`      | `monthlyAssessableBase`       |
| `descIrpfEstimado`         | `estimatedIrpfWithheld`       |
| `descSindicato`            | `unionDue`                    |
| `descValeTransporte`       | `transportAllowanceDeduction` |
| `salarioLiquidoMensal`     | `monthlyNetSalary`            |
| `salarioLiquidoAnual`      | `annualNetSalary`             |
| `beneficiosNaoTributaveis` | `nonTaxableBenefits`          |
| `rendimentoTotalMensal`    | `totalMonthlyIncome`          |
| `aliquotaEfetivaIrpf`      | `effectiveIrpfRate`           |
| `economia.comDependentes`  | `savings.fromDependants`      |
| `economia.comDeducoes`     | `savings.fromDeductions`      |

The fields the two interfaces share landed on one spelling, and `taxFromTable`, `reductionLei15270`,
`totalDeductions`, `dependantAllowance` and `inssWithheld` now read the same in both — the
duplication the pitch names is visible in the diff instead of hidden behind two vocabularies.

**Storage keys bumped:** `irpf-2026-input` → `irpf-2026-input-v2`, `salario-liquido-input` →
`salario-liquido-input-v2`.

**No expected value moved.** 122 `expect` lines removed, 122 added, and the multiset of numeric
literals in `irpf.ts`, `salarioLiquido.ts` and both test files is byte-identical to `HEAD`. A probe
over 120 input combinations (deleted afterwards) returned every result field identical to the
pre-rename build.

### What the plan got wrong

**The third test is not satisfiable as written.** It asks that `usePersistedState` return `DEFAULTS`
when the stored value is an object of old keys. Measured: the hook does a raw `JSON.parse` and a
cast with no shape validation, so it hands the stale object straight back and every renamed field
reads `undefined`. Making the plan's test pass would mean changing the hook, which is out of scope.
`tests/usePersistedState.test.ts` therefore pins what the key bump actually buys — under the _new_
key the old object is absent, so `DEFAULTS` is what a returning visitor gets — and pins the
unvalidated behaviour itself so the reason for the bump cannot be forgotten. The plan's wording
assumed a validating hook; the key bump reaches the same outcome a different way.

**`tsconfig.json` does not include `tests/`**, so `pnpm run typecheck` never sees the test files.
The plan leans on typecheck to prove no call site was missed; for tests that proof came from running
`tsc` over them separately, which caught one real miss (`annual.baseImponivel` in the cross-check
had been renamed to the net-salary module's spelling).

**The `Done when` grep cannot reach `grep-exit=1` on field renames alone.** `SalarioLiquidoInput`,
`SalarioLiquidoResult` and `calculateSalarioLiquido` match it, and so did two comments in `irpf.ts`
naming `salarioLiquido.ts`. The exported symbols were renamed and the comments now name the
calculator rather than its file. **The module file itself is still `salarioLiquido.ts`** — the
plan's own grep addresses it by that path, so renaming it was left out.

**`irpf-constants.ts` had one match** and it was a citation of
`tests/calculators/salario-liquido.test.ts`. Reworded to name the test case instead of the path,
which is the more durable pointer anyway. The test file keeps its kebab-case name, in step with the
other five.

### The gate had a hole, and this slice is why we know

`tsconfig.json` listed `src/**`, three config files and `worker-configuration.d.ts` — **not
`tests/`** — so `pnpm run typecheck` compiled zero test files. Vitest transpiles without
typechecking, so a test referring to a field that no longer exists reached the suite as a runtime
`undefined` rather than a compile error. This slice hit exactly that: one cross-check assertion had
been rewritten to the other module's spelling and only a hand-run `tsc` caught it.

`tests/**/*.ts` is now in `include`, with `node` added to `types` for the built-ins the test
helpers use. It cost nothing — `tsc` over the test files was already clean.

Verified by injecting the same class of error and re-running the gate:

```
tests/calculators/salario-liquido.test.ts(145,19): error TS2339:
  Property 'baseImponivel' does not exist on type 'NetSalaryResult'.
TYPECHECK=2
```

Before the change that produced `TYPECHECK=0`. Seven test files are now in the program.
