---
status: done
kanban: 0c2590e1-5d2e-4d13-80a6-18ba6feae249
---

# Slice 1 — English identifiers in inss-constants

> **Counts refreshed 2026-09-05.** The IRPF correction work rewrote `irpf.ts`,
> `salarioLiquido.ts` and `cltVsPj.ts` and added two modules this plan predates,
> so the per-file figures below moved. Measured today with the plan's own grep
> (`aliquota|deducao|salario|contribuicao|beneficio`):
>
> | file | plan said | today | slice |
> |---|---|---|---|
> | `inss-constants.ts` | — | 12 | 1 |
> | `salarioLiquido.ts` | 34 | **40** | 2 |
> | `irpf.ts` | 21 | **23** | 2 |
> | `inssAutonomo.ts` | — | 40 | 3 |
> | `cltVsPj.ts` | 17 | **24** | 4 |
> | `beneficiosFiscais.ts` | 18 | 18 | 4 |
> | `previdenciaComplementar.ts` | 12 | 11 | 4 |
> | `irpf-constants.ts` | *did not exist* | 1 | **2** |
> | `money.ts` | *did not exist* | 0 | — |
>
> Total 169. The slice division still holds — it groups by file and the files are
> the same ones — but every `Done when` that cites a count needs the figure above.
> `irpf-constants.ts` joins slice 2, which already owns the modules that import it.
>
> ⚠️ One rename in this feature is **not** a `git mv`:
> `PrevidenciaComplementarInput.tasaRetornoAnual` is persisted verbatim in the
> visitor's `localStorage`. It needs a key version bump in the same change, or it
> orphans the stored value of everyone who returns. See `ARCHITECTURE.md`.


The warm-up, chosen because it is the only file in this feature with no
persisted state behind it. `inss-constants.ts` exports constants and two pure
functions, and `tests/calculators.test.ts` already imports it — so the rename is
proven by tests that exist today rather than by tests written in the same
change.

## Delivers

`src/lib/calculators/inss-constants.ts` compiles and passes its existing tests
with every identifier in English. Today it has 12 lines carrying Portuguese
ones:

```
INSS_ANO_REFERENCIA  SALARIO_MINIMO  TETO_INSS  INSS_FAIXAS_EMPREGADO
calcularInssEmpregado(salarioBrutoMensal)  salarioDeContribuicao(rendaMensal)
```

## Needs

- Nothing. This slice is the entry point of the feature.
- The importers to update are found by the type checker; today they are
  `tests/calculators.test.ts`, `salarioLiquido.ts`, `inssAutonomo.ts` and
  `cltVsPj.ts` (`grep -rl inss-constants src tests`).

## Tests

- No new test file. The existing INSS assertions in `tests/calculators.test.ts`
  are the safety net and must keep passing unchanged in their expected values —
  only the imported names change.
- `pnpm run typecheck` is the proof that no caller was missed: every one of
  these symbols is imported by name, so a rename that misses a call site is a
  compile error, not a runtime surprise.

## Done when

Two separate blocks, because chaining them lets a failing test print the
passing string. Run the suite first:

```
pnpm run typecheck && pnpm test && echo "checks-ok"
```

`checks-ok` is only reached when both exit 0, so its absence is the failure —
the vitest summary must read `Tests  17 passed (17)` with no typecheck errors.
Then, as its own command, so `$?` is the grep's and not a leftover from above:

```
grep -rniE 'aliquota|deducao|salario|contribuicao|beneficio' \
  src/lib/calculators/inss-constants.ts; echo "grep-exit=$?"
```

Must print no matching lines and end with `grep-exit=1` — grep exiting 1 means
it found nothing, which is the assertion. Today it prints the 12 Portuguese
lines listed under *Delivers* and ends with `grep-exit=0`.

## If stuck

If a constant name has no clean English equivalent — `TETO_INSS` is the
statutory contribution ceiling, `INSS_FAIXAS_EMPREGADO` the bracket table —
keep the Portuguese term as a doc comment above the English name rather than
inventing a translation nobody will recognise against the legislation. If a
symbol turns out to be referenced from outside `src/lib/`, stop and fold that
call site into slice 2 instead of widening this one.

---

## What actually happened — 2026-09-05

`checks-ok` printed, and the grep over `inss-constants.ts` exits 1 — no Portuguese identifier left
in the file.

⚠️ **The slice's `Done when` expects `Tests 17 passed (17)`.** That figure predates
`docs/plans/calculator-test-coverage/`, which took the suite to **268**. The check that matters is
the one this slice actually relies on — `pnpm run typecheck` exiting 0, which is what proves no
call site was missed, since every symbol here is imported by name.

**The plan listed four importers; there are nine.** `irpf.ts`, `calculadora-inss-autonomo.tsx` and
three of the new test files started importing this module during the IRPF work. The type checker
found them all, which is the point of doing this rename in a typed language rather than with sed
alone.

Renamed:

| was | is |
|---|---|
| `INSS_ANO_REFERENCIA` | `INSS_REFERENCE_YEAR` |
| `SALARIO_MINIMO` | `MINIMUM_WAGE` |
| `TETO_INSS` | `INSS_CEILING` |
| `INSS_FAIXAS_EMPREGADO` | `INSS_EMPLOYEE_BRACKETS` |
| `calcularInssEmpregado` | `calculateEmployeeInss` |
| `salarioDeContribuicao` | `contributionSalary` |

The bracket fields went `{ ate, aliquota }` → `{ upTo, rate }`, which is what `irpf-constants.ts`
already uses — the two constant modules now describe a bracket the same way. Nothing outside the
module destructured those fields, so the change is contained.

**No expected value in any test moved.** Every assertion in the diff appears twice with the same
number, removed and re-added under a new identifier.
