---
status: done
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
awk '$0 ~ "^(export )?(default )?(const|function) CarCostPage[ ]*[=(]" {s=NR;f=1} \
     f && !n {d+=gsub(/\{/,"{")-gsub(/\}/,"}"); if(d<=0 && NR>s){n=NR-s+1; print n}} \
     END{if(!s){print "CarCostPage: signature not found"; exit 1} \
         if(!n){print "CarCostPage: closing brace not found"; exit 1} \
         exit (n<200 ? 0 : 1)}' \
  src/routes/calculadora-custo-carro.tsx
```

Prints the line count and exits 0 only when it is below 200 — today it prints
`477` and exits 1. The pattern also matches `const CarCostPage = () =>`, so an
honest conversion to an arrow function is still measured; and when neither
form is found the command prints `CarCostPage: signature not found` and exits
1, instead of printing nothing and exiting 0 as the old
`function CarCostPage(` anchor did. Then:

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

---

## What actually happened — 2026-09-05

The `Done when` awk prints **66** and exits 0. It was 477 and exited 1 — under the soft 80-line
limit as well as the hard 200 the slice bought. Only `src/routes/calculadora-custo-carro.tsx`
changed: 517 insertions, 398 deletions, `git diff tests/` empty.

### The hook the slice asked for

```ts
function useFuelPrices(
  uf: string,
  fuelType: FuelType,
  onPriceLoaded: (key: FuelPriceKey, price: number) => void,
): {
  fuelFields: FuelFields;
  activeFuelRequests: FuelRequest[];
  loadFuelPrices: (requests?: FuelRequest[]) => Promise<void>;
  markFuelManual: (key: FuelPriceKey) => void;
  resetFuelFields: () => void;
};
```

It took the `useState` for the three field states, the `useMemo` deriving `activeFuelRequests`
from the fuel type, the `useEffect` keyed on `[uf, fuelType]`, and the whole ~85-line load
routine. `readFuelCache` / `writeFuelCache` stayed module-level and untouched.

The `If stuck` clause applied exactly as written: the hook needs the UF and the fuel type, both
of which live in the page's persisted form state, so **both are arguments** and the loaded price
goes back to the page through `onPriceLoaded`. The hook owns no form state.

Four pure module-level builders came out of the load routine, one per outcome the ANP lookup can
have: `fieldFromPrice`, `fieldFromUnavailable`, `fieldFromNetworkError`, plus `emptyFuelFields`.

Seven presentational components, all module-level in the same file:
`CarCostForm` composing `UsageSection`, `FuelSection`, `VehicleCostsSection` and
`RunningCostsSection`, then `CarCostResults` and `CarCostArticle`. The three near-identical
`PublicDataField` blocks collapsed into one `activeFuelRequests.map`, which meant giving
`FUEL_REQUESTS` a `label` — the render order is unchanged because every `fuelRequestsFor` branch
is a `filter`, which preserves order.

`CarCostPage` keeps `usePersistedState` × 2, `useMemo` for the result, `update`,
`updateFuelManually`, `reset`, `shareText` and the layout.

**Hook ordering did not change what runs when.** Composing `useFuelPrices` keeps every
`useState`/`useMemo`/`useEffect` in the same component instance and the same order on every
render; nothing was pushed down into a presentational child, which is the move slice 2 forbade
for its hydration timing.

### The proof is the prerendered HTML, not the build exiting 0

`dist/client/calculadora-custo-carro/index.html` from a build of `HEAD` compared with the same
file after. Normalising Vite's content hashes (`-XXXXXXXX.js`) and TanStack's render timestamp
(`u:<epoch ms>`), the two are **byte-identical** — 90.207 characters each; the raw files are
90.763 bytes each. Two builds of `HEAD` were compared first, to confirm the hashes and the
timestamp are the build's own nondeterminism and not something the change introduced.

The persisted keys are untouched — `git diff -U0` shows **no added or removed line containing
`calculadoras-brasil`** at all. That covers both ANP cache keys
(`` `calculadoras-brasil:anp:${uf}:${fuel}` ``, read and write), `custo-carro:input:v1` and
`custo-carro:uf:v1`. The cached object's shape is unchanged too: a live load wrote
`{"averagePrice":6.34,"field":{"isManual","sourceName","sourceLastUpdated","sourceUrl",
"sourcePeriod","isStale","error"},"cachedAt":…}` — the same key order the old inline literal
produced, so a cache entry written before this refactor is read after it.

### The network fallback, verified — and differentially

Run in a browser against the dev server, with `window.fetch` stubbed to fail for
`/api/fuel-prices` in two ways, and the **same probe run again on stashed `HEAD`**. The two runs
returned identical output for all three scenarios:

| scenario                                                                                                                                | what the page does                                                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| fetch rejects (`TypeError: Failed to fetch`), refresh button                                                                            | field keeps 6,34, stays editable, shows `Não foi possível consultar a ANP agora.`, nothing written to the cache         |
| server returns `available:false` — the exact body `unavailable("ANP", …)` emits from the catch in `api.fuel-prices.ts` — refresh button | field keeps its value, shows `Não foi possível consultar a planilha semanal da ANP agora. Informe o valor manualmente.` |
| fetch rejects, UF changed SP → RJ (the hook's `useEffect` path, not the button)                                                         | same as row 1                                                                                                           |

The `h1` and all 16 form inputs render in every case. The happy path was checked live too: the
network is reachable in this environment, so a real ANP lookup filled 6,34 from the weekly
spreadsheet and wrote `calculadoras-brasil:anp:SP:gasolina`.

### Out of scope, reported not fixed

`/calculadora-custo-carro` fails hydration on every load — `Hydration failed because the server
rendered text didn't match` — and it does so on `HEAD` too, with `localStorage` empty. It is
**not** the `nextId`/`Date.now()` cause recorded at `docs/architecture/ARCHITECTURE.md:285`,
which is scoped to `/calculadora-conta-de-luz`: the same error reproduces on `/metodologia`, a
static page with no calculator state at all. So the site-wide shell is failing hydration and the
ARCHITECTURE.md entry's scoping is too narrow. Not touched here.
