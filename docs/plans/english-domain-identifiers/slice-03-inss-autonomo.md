---
status: todo
kanban: 10e0f8bb-781b-4149-bc87-0c15599c13fe
---

# Slice 3 — English identifiers in inssAutonomo

The largest single file in this feature: 40 matching lines, and the only one
whose *values* — not just its field names — are Portuguese and persisted.

## Delivers

`inssAutonomo.ts` in English. Today:

```
PlanoInss = "normal" | "simplificado"     ← literal union, persisted as data
PlanoDetalhe
InssAutonomoInput { ganhoMensalBruto, mesesContribuidos, sexo }
   sexo: "masculino" | "feminino"          ← literal union, persisted as data
InssAutonomoResult
calculateInssAutonomo(input)
```

`PlanoInss` and `sexo` are different from every other rename in this feature:
their string values are written into `localStorage` under
`"inss-autonomo-input-v2"` (`src/routes/calculadora-inss-autonomo.tsx:83`). The
type name and the field name are internal and rename freely; the **literal
values** are stored data. Either keep the literals and rename only the type and
field, or change the literals and bump the key to `-v3`. Do not change a
literal and keep the key.

## Needs

- Slice 1 merged (`inssAutonomo.ts` imports from `inss-constants.ts`).
- `tests/calculators.test.ts` already imports `calculateInssAutonomo`, so this
  file has a safety net before the change — unlike slices 2 and 4.

## Tests

- The existing `calculateInssAutonomo` assertions in
  `tests/calculators.test.ts` keep passing with the same expected numbers.
- One added assertion per literal union: passing the stored literal value
  produces the same result as before. This is the test that fails if someone
  renames `"simplificado"` and forgets the key.

## Done when

```
pnpm run typecheck && pnpm test && \
  grep -rniE 'aliquota|deducao|salario|contribuicao|beneficio' \
    src/lib/calculators/inssAutonomo.ts; \
  echo "grep-exit=$?"
```

Output must end with `grep-exit=1` and the vitest summary must report all tests
passing with no expected-value edits in the existing INSS cases.

## If stuck

The `sexo` field encodes the EC 103/2019 minimum contribution length, which is
sex-based in the legislation — the existing doc comment says so. If the English
name is contentious, `contributorSex` with the existing comment retained beats
stalling the slice on wording; the requirement it drives is statutory and not
this repo's editorial choice.

If the literal-union question turns into a debate, take the conservative half:
rename the type and the field, leave `"normal" | "simplificado"` and
`"masculino" | "feminino"` alone, and say in the file why. That still clears the
grep, because the grep tokens do not match those literals.
