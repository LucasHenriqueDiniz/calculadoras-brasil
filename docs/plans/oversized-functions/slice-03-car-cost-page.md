---
status: todo
kanban: 18fb1a1f-c489-470d-b7e0-3188bdf7bfb8
---

# Slice 3 — Split CarCostPage below 200 lines

477 lines, `src/routes/calculadora-custo-carro.tsx:216-692`. The hardest of the
three pages, because it is the only one that talks to the network.

## Delivers

`CarCostPage` under 200 lines with fuel-price lookup, caching and prerender all
intact.

This page is not just long, it is doing three jobs. Besides
`usePersistedState<CarCostInput>` at line 217, it hand-rolls its own cache
around the ANP fuel-price adapter:

```
src/routes/calculadora-custo-carro.tsx:108  localStorage.getItem(`calculadoras-brasil:anp:${uf}:${fuel}`)
src/routes/calculadora-custo-carro.tsx:120  localStorage.setItem(`calculadoras-brasil:anp:${uf}:${fuel}`, …)
```

That cache is a hook's worth of behaviour living in a page component, and
lifting it into a named hook is most of the line count on its own.

## Needs

- Slice 1 merged: it changes `carCost.ts` internals, and doing the page first
  means reviewing two overlapping diffs against the same feature.
- Slice 2 merged, for the same reason it needed slice 1 — the page-refactor
  pattern and its `test:seo` proof should already exist.
- `pnpm run test:seo` green before starting.

## Tests

- `pnpm run test:seo` passes, including `/calculadora-custo-carro`.
- Manual check recorded in the PR: with the network blocked, the page still
  renders and falls back the way it does today. The ANP lookup is remote and
  the fallback path is the one a refactor silently deletes.
- The two `localStorage` cache keys must be byte-identical after the change —
  they are shared across UF/fuel combinations and a changed key silently
  re-fetches for every existing visitor. Prove it:
  `git diff src/routes/calculadora-custo-carro.tsx | grep 'calculadoras-brasil:anp'`
  should show no changed key string.

## Done when

```
awk '$0 ~ "^(export )?function CarCostPage\\(" {s=NR;f=1} \
     f{d+=gsub(/\{/,"{")-gsub(/\}/,"}"); if(d<=0 && NR>s){print NR-s+1; exit}}' \
  src/routes/calculadora-custo-carro.tsx
```

Must print a number below 200 — it prints `477` today. Then:

```
pnpm run typecheck && pnpm run lint && pnpm run build && pnpm run test:seo
```

All four exit 0, with `test:seo` reporting no failed route.

## If stuck

If the extracted fuel-price hook and the persisted input state turn out to be
coupled — the hook needing the UF that lives in the form state — pass the UF in
as an argument rather than lifting the form state into the hook. A hook that
owns the form is the same 477 lines wearing a different name.

If the network fallback cannot be verified locally, say so in the PR instead of
claiming it works. An unverified fallback is the thing that breaks in
production and nowhere else.
