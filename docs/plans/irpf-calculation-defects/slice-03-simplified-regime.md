---
status: done
kanban: adf22b96-9e63-465b-bf7d-4508ec79920f
---

# Slice 3 — Fix the simplified regime: rate, ceiling, and the deduction it replaces

Three defects in one branch, together because they are the same six lines.

## Delivers

`irpf.ts` computes the simplified regime as the legislation defines it:

| | today | after |
|---|---|---|
| rate | 20,5% | **20%** |
| ceiling | none | **R$ 17.640,00** |
| other deductions on top | dependants subtracted as well (`irpf.ts:98`) | **none** |

The third is the one to be careful with. The desconto simplificado **replaces** every deduction
the legislation allows, dependants included; subtracting both takes one of them twice. So
`baseImponvelSimplificada` stops subtracting `descDependentes`.

`SIMPLIFIED_DEDUCTION_RATE` becomes `0.20` and gains a companion ceiling constant. The comment
claiming the discount runs "up to the allowed cap" becomes true instead of aspirational.

## Needs

- Slices 1 and 2 merged.
- `docs/research/2026-09-04-irpf-2026-table/research.md`, Findings 5 — the double-deduction is
  recorded there with the line number.
- ⚠️ **Know that `descDependentes` stays in the returned result** even when the simplified regime
  ignores it. It is a computed field the page may render; this slice changes what the tax is
  computed from, not what the result reports.

## Tests

- `caps the simplified discount instead of scaling it without limit` goes green. It asserts the
  discount at R$ 100.000 and at R$ 1.000.000 are equal — true once the ceiling binds, and it binds
  above R$ 88.200.
- `ignores dependants under the simplified regime` goes green. ⚠️ **This test was inverted on
  2026-09-04**: it previously asserted the buggy behaviour and passed. Do not "fix" it back.
- Add one case: at an income where the ceiling does **not** bind (say R$ 50.000), the discount is
  exactly 20% of income. A ceiling test alone cannot tell a correct rate from a wrong one.

## Done when

```
pnpm exec vitest run tests/calculators/irpf.test.ts
```

`Tests  28 passed (28)` — the original 27 plus the rate case added here. No failures, no skips.
This is the point at which `docs/plans/calculator-test-coverage/slice-01-irpf.md` goes back to
`status: done`.

## If stuck

If removing the dependant subtraction makes the simplified regime worse than the full regime for
every input you try, that is expected and not a bug: the simplified discount is meant to lose for
taxpayers with real deductions. Do not add a `Math.min` between the two regimes — whether the
function should pick the cheaper one is explicitly out of scope in the pitch.

---

## What actually happened — 2026-09-04

`Tests  28 passed (28)`. No failures, no skips, and no assertion relaxed to get there.

Three changes, all in the one branch:

| | was | is |
|---|---|---|
| rate | 20,5% | 20% |
| ceiling | none | R$ 17.640,00 |
| dependants | subtracted on top | not subtracted — the discount replaces them |

`descDependentes` is still computed and still returned in `IrpfResult`; it simply no longer reduces
the tax under this regime. That distinction is now stated in the code rather than implied.

The local `baseImponvelSimplificada` is gone with the change, taking its typo with it.
