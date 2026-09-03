---
status: todo
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
