---
status: todo
kanban: 4acf3d2a-71e5-4fd7-beb9-b3fc40fae5f5
---

# Slice 2 — Split ElectricityPage below 200 lines

The worst one: 559 lines, `src/routes/calculadora-conta-de-luz.tsx:165-723`.

## Delivers

`ElectricityPage` under 200 lines, with `/calculadora-conta-de-luz` still
prerendering and still interactive after hydration.

The component owns two persisted pieces of state —
`usePersistedState<number>("calculadoras-brasil:conta-luz:tariff:v1", …)` and
`usePersistedState<ApplianceInput[]>("calculadoras-brasil:conta-luz:appliances:v1", …)`
(lines 166 and 170) — and roughly 400 lines of JSX below them. The extraction
that pays is the appliance list: a presentational child taking the array and an
`onChange`, leaving the page holding state and layout.

## Needs

- Slice 1 merged, so that the smallest refactor in this feature has already
  proven the `Done when` measurement command works on this repo.
- `pnpm run test:seo` working locally before the change, as the baseline. It
  builds, boots a preview server on 127.0.0.1:4173 and asserts prerendered HTML
  for all 49 public routes — it is the safety net this slice depends on, so run
  it green **first**, not only after.

## Tests

- `pnpm run test:seo` passes, and its assertions for
  `/calculadora-conta-de-luz` in particular must still find the prerendered
  markup. This is the definition of done for the prerender half.
- Manual hydration check, recorded in the PR: load the page, enter an
  appliance, reload, and confirm the value survives — the persisted keys must
  not change in this slice, so a value stored before the refactor must load
  after it.
- No component test framework is installed and this slice does not add one.
  If that gap is unacceptable, say so and make it a separate slice; do not
  bundle a testing-library setup into a refactor.

## Done when

```
awk '$0 ~ "^(export )?function ElectricityPage\\(" {s=NR;f=1} \
     f{d+=gsub(/\{/,"{")-gsub(/\}/,"}"); if(d<=0 && NR>s){print NR-s+1; exit}}' \
  src/routes/calculadora-conta-de-luz.tsx
```

Must print a number below 200 — it prints `559` today. Then:

```
pnpm run typecheck && pnpm run lint && pnpm run build && pnpm run test:seo
```

`test:seo` must exit 0 and print `SEO smoke test passed for 49 routes.` — the
count `PUBLIC_ROUTES` in `tests/seo-smoke.mjs` carries today, with no assertion
failure on any of them. A
build that succeeds but a `test:seo` that fails means the page stopped
prerendering, which is the exact failure this refactor can cause.

## If stuck

If a hook has to move into the extracted child to make the split work, stop.
Moving a `usePersistedState` across a component boundary changes when it reads
`localStorage` relative to hydration, and that is a different change with a
different risk. Extract presentational JSX only; leave every hook in the page.

If 200 cannot be reached without moving a hook, land the partial split, record
the remaining line count in this file, and open a fractional slice (`02b`) for
the rest. A 300-line component with a clean seam is progress; a broken
prerender is not.
