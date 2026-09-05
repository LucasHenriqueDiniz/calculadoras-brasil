---
status: done
kanban: 3308c8b1-ede8-4fd8-b6c3-6cb5dc29a3c7
---

# Slice 1 — Split calculateCarCost below 200 lines

First because it is the only one of the four with a test suite behind it today,
and the only one with no hydration risk at all. It is a pure function.

## Delivers

`calculateCarCost` (`src/lib/calculators/carCost.ts:89-317`, 229 lines) under
200 — and ideally under the 80-line soft limit — with
`tests/calculators.test.ts` passing unchanged.

The natural seams are the cost categories the function already computes in
sequence: fuel, insurance, maintenance, depreciation, taxes. Each is a private
helper taking an explicit slice of the input and returning a number, and the
main function becomes the composition.

## Needs

- Nothing. `carCost.ts` is pure, imported by `tests/calculators.test.ts` and by
  `src/routes/calculadora-custo-carro.tsx`.
- Its exported signature must not change in this slice — `CarCostPage` is
  slice 3 and changing both at once means neither is provable alone.

## Tests

- No new test file. `tests/calculators.test.ts` already asserts
  `calculateCarCost` output, and this refactor is proven precisely by those
  expected numbers not needing an edit.
- If a helper ends up with a branch the existing tests do not reach, add a case
  for it in the same file rather than leaving the extraction unproven.

## Done when

```
awk '$0 ~ "^(export )?(default )?(const|function) calculateCarCost[ ]*[=(]" {s=NR;f=1} \
     f && !n {d+=gsub(/\{/,"{")-gsub(/\}/,"}"); if(d<=0 && NR>s){n=NR-s+1; print n}} \
     END{if(!s){print "calculateCarCost: signature not found"; exit 1} \
         if(!n){print "calculateCarCost: closing brace not found"; exit 1} \
         exit (n<200 ? 0 : 1)}' \
  src/lib/calculators/carCost.ts
```

Prints the line count and exits 0 only when it is below 200 — today it prints
`229` and exits 1. The pattern also matches
`export const calculateCarCost = (`, so an honest conversion to an arrow
function is still measured; and when neither form is found the command prints
`calculateCarCost: signature not found` and exits 1, instead of printing
nothing and exiting 0 as the old `function calculateCarCost(` anchor did.
Then:

```
pnpm test && pnpm run typecheck && pnpm run lint
```

`Tests  17 passed (17)` with **no expected value changed in the diff** (check
with `git diff tests/`), no typecheck errors, no lint errors.

## If stuck

If a category cannot be extracted without passing eight arguments, that is the
function telling you the input type wants a sub-shape, not that the extraction
is wrong — group the fields into a named parameter object rather than giving up
or flattening the signature further.

If the line count lands between 80 and 200, stop there and say so. This slice
buys the hard limit; going after the soft one inside the same change makes the
diff harder to review than the function was to read.

---

## What actually happened — 2026-09-05

The `Done when` awk prints **40** and exits 0. It was 229 and exited 1 — so this landed under the
soft 80-line limit too, not just the hard 200 the slice bought.

Five helpers, along the seams the slice predicted:

| helper | lines | what it owns |
|---|---|---|
| `chooseFuel` | 65 | which fuel is paid for, and the flex comparison — the only branch producing one |
| `monthlyCostsOf` | 18 | every non-fuel cost normalised to a month |
| `buildBreakdown` | 24 | the eleven rows, now a table rather than eleven object literals |
| `buildHighlights` | 36 | the four conditional sentences |
| `collectWarnings` | 16 | the two validations plus the standing caveat |

`buildBreakdown` shrank most: the original repeated `monthly: x, annual: x * 12` eleven times, and
`annual` could disagree with `monthly` in any one of them without a test noticing. It is now derived
once from a tuple table, so that class of typo is unrepresentable.

**Removed one piece of dead code**: `selectedPrice` was assigned in all four fuel branches and then
discarded with `void selectedPrice;`. It reached no field of the result.

### The proof is differential, not "the tests pass"

`tests/` is untouched — `git diff tests/` is empty, which is what this slice asked for. But the
existing suite does not reach every branch, so passing it is weak evidence for a refactor.

The old function was extracted from `HEAD` into a throwaway module and both versions run
side by side over the input space: 4 fuel types × 4 mileages × 3 city consumptions × 3 highway
consumptions × 5 city-use percentages (including -10 and 130, outside the valid range) × 2 petrol
prices × 3 ethanol prices × 4 depreciation percentages — **17.280 combinations**, comparing
`JSON.stringify` of the whole result. Byte-identical every time. Probe deleted afterwards.
