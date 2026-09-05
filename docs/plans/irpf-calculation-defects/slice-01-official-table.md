---
status: done
kanban: a0375b3f-f4b2-447b-9b79-454133f66559
---

# Slice 1 — Replace the table with the official one, and make the lookup total

The core of the fix. Seven of the ten red cases in `tests/calculators/irpf.test.ts` are this slice.

## Delivers

`IRPF_TABLE_2026` holds the Receita's annual table for ano-calendário 2026, and no base can miss
a bracket.

| base de cálculo | alíquota | parcela |
|---|---|---|
| até 29.145,60 | — | — |
| 29.145,61 – 33.919,80 | 7,5% | 2.185,92 |
| 33.919,81 – 45.012,60 | 15,0% | 4.729,91 |
| 45.012,61 – 55.976,16 | 22,5% | 8.105,85 |
| acima de 55.976,16 | 27,5% | 10.904,66 |

**Express each boundary once.** The current shape is a `max` on one bracket and a `min` on the
next, two numbers that have to agree and do not — which is what opened the `.34`/`.35` gap. A
list of `{ upTo, rate, deduction }` with the lookup taking the first bracket whose `upTo` the base
does not exceed has no second number to disagree with.

`findTaxBracket` becomes total: every base ≥ 0 gets a bracket, and the "past every range
(unlikely)" fallback is deleted rather than left as a trap.

Also in this slice, because they are the same table: `DEDUCTION_PER_DEPENDENT` 2275.0 → **2275.08**.

## Needs

- `docs/research/2026-09-04-irpf-2026-table/research.md` for every figure. Do not retype them from
  this file — read them from the research, which has the fetches behind it.
- **Two test constants move with the table**, and missing them reads as a broken test rather than
  a stale one:
  - `BRACKET_BOUNDARIES` in `tests/calculators/irpf.test.ts` is the old table's four boundaries.
    It becomes `[29145.60, 33919.80, 45012.60, 55976.16]`.
  - the dependant case asserts `2275` and `6825`; those become `2275.08` and `6825.24`.

## Tests

No new test file. The ones that must go from red to green:

- `does not jump across the boundary at …` — all four
- `never charges less for more income near …` — all four
- `applies a rate to every base, leaving no unclassified gap`

and the ones that must stay green, having been updated for the new constants:

- `deducts a flat amount per dependant, uncapped in count`
- `charges nothing below the first bracket`

## Done when

```
pnpm exec vitest run tests/calculators/irpf.test.ts
```

`Tests  3 failed | 24 passed (27)`. Exactly three red, and they are the INSS one and the two
simplified-regime ones — slices 2 and 3. Any other failure means a constant was missed.

## If stuck

If expressing boundaries once turns into a redesign of `IrpfResult`, stop and keep the array shape
it has, fixing only the numbers and the `<=`/`>=` overlap. A correct table in an awkward shape
ships; a better shape that is half-built does not.

---

## What actually happened — 2026-09-04

Done when met exactly: `Tests  3 failed | 24 passed (27)`, and the three red are the INSS case and
the two simplified-regime ones, which are slices 2 and 3.

**One test had to be rewritten rather than merely re-constanted, and that was not in the plan.**
`applies a rate to every base, leaving no unclassified gap` asserted that a base half a centavo
above a boundary carries the *same* marginal rate as the boundary. That is false for any correct
progressive table — half a centavo above a boundary you are in the next bracket. The assertion
only ever looked meaningful because the gap made both sides land on the fallback's 27.5%; it could
never have passed.

It is now `applies a rate to every base, and that rate never goes down`, which is the property that
was actually meant: the marginal rate climbs and never spikes.

⚠️ **This is a rewrite, not a relaxation, and it was verified as such rather than argued.** The old
buggy table and the old lookup were restored temporarily and the new test run against them:

```
AssertionError: expected 7.5 to be greater than or equal to 27.5
```

It kills the mutant it describes — the 27.5% spike inside the gap, dropping back to 7.5% one
centavo later. Both files were restored from backup afterwards and verified clean.
