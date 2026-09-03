---
status: todo
kanban: 84e6ee00-51bc-43dd-be71-b6670f38274a
---

# Slice 4 — Split LivingAlonePage below 200 lines

314 lines, `src/routes/calculadora-morar-sozinho.tsx:144-457`. Last because it
is the smallest of the three pages and the least risky: one persisted state
hook, no network.

## Delivers

`LivingAlonePage` under 200 lines with `/calculadora-morar-sozinho` still
prerendering.

Its only persisted state is
`usePersistedState<LivingAloneInput>("calculadoras-brasil:morar-sozinho:v1", …)`
at line 145 — note that this page already uses the namespaced, versioned key
format the older calculators do not, so nothing about the key needs touching.

## Needs

- Slices 2 and 3 merged. By this point the extraction pattern is settled and
  this slice should be the mechanical application of it.
- `pnpm run test:seo` green before starting.

## Tests

- `pnpm run test:seo` passes, including `/calculadora-morar-sozinho`.
- `calculateLivingAloneCost` is already covered by `tests/calculators.test.ts`,
  so the domain half needs nothing new; this slice touches presentation only,
  and a diff that reaches into `src/lib/calculators/livingAlone.ts` is out of
  scope for it.
- Manual hydration check recorded in the PR: a value entered before the change
  still loads after it, since the storage key is unchanged.

## Done when

```
awk '$0 ~ "^(export )?(default )?(const|function) LivingAlonePage[ ]*[=(]" {s=NR;f=1} \
     f && !n {d+=gsub(/\{/,"{")-gsub(/\}/,"}"); if(d<=0 && NR>s){n=NR-s+1; print n}} \
     END{if(!s){print "LivingAlonePage: signature not found"; exit 1} \
         if(!n){print "LivingAlonePage: closing brace not found"; exit 1} \
         exit (n<200 ? 0 : 1)}' \
  src/routes/calculadora-morar-sozinho.tsx
```

Prints the line count and exits 0 only when it is below 200 — today it prints
`314` and exits 1. The pattern also matches `const LivingAlonePage = () =>`,
so an honest conversion to an arrow function is still measured; and when
neither form is found the command prints
`LivingAlonePage: signature not found` and exits 1, instead of printing
nothing and exiting 0 as the old `function LivingAlonePage(` anchor did. Then:

```
pnpm run typecheck && pnpm run lint && pnpm run build && pnpm run test:seo
```

All four exit 0. And the feature closes when no stateful function is left over
the limit:

```
git diff --stat src/lib/calculators/livingAlone.ts
```

must print nothing — proof this slice stayed in the route file.

## If stuck

If this page splits cleanly in twenty minutes, it is worth asking on the PR
whether the five prose components the pitch deliberately excluded
(`PrivacidadePage`, three `BlogPost`, `Home`) should get the same treatment
after all. That is the owner's call, not this slice's — do not widen the diff
to make the point.
