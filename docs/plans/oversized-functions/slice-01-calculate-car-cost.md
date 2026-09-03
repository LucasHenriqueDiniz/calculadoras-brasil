---
status: todo
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
awk '$0 ~ "^(export )?function calculateCarCost\\(" {s=NR;f=1} \
     f{d+=gsub(/\{/,"{")-gsub(/\}/,"}"); if(d<=0 && NR>s){print NR-s+1; exit}}' \
  src/lib/calculators/carCost.ts
```

Must print a number below 200 — it prints `229` today. Then:

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
