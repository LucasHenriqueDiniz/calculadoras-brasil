---
status: todo
kanban: 0c2590e1-5d2e-4d13-80a6-18ba6feae249
---

# Slice 1 — English identifiers in inss-constants

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

```
pnpm run typecheck && pnpm test && \
  grep -rniE 'aliquota|deducao|salario|contribuicao|beneficio' src/lib/calculators/inss-constants.ts; \
  echo "grep-exit=$?"
```

Output must say `Tests  17 passed (17)`, report no typecheck errors, and end
with `grep-exit=1` — grep exiting 1 means it found nothing, which is the
assertion. Any matching line printed above it is a remaining Portuguese
identifier.

## If stuck

If a constant name has no clean English equivalent — `TETO_INSS` is the
statutory contribution ceiling, `INSS_FAIXAS_EMPREGADO` the bracket table —
keep the Portuguese term as a doc comment above the English name rather than
inventing a translation nobody will recognise against the legislation. If a
symbol turns out to be referenced from outside `src/lib/`, stop and fold that
call site into slice 2 instead of widening this one.
