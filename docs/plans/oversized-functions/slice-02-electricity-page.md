---
status: done
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
awk '$0 ~ "^(export )?(default )?(const|function) ElectricityPage[ ]*[=(]" {s=NR;f=1} \
     f && !n {d+=gsub(/\{/,"{")-gsub(/\}/,"}"); if(d<=0 && NR>s){n=NR-s+1; print n}} \
     END{if(!s){print "ElectricityPage: signature not found"; exit 1} \
         if(!n){print "ElectricityPage: closing brace not found"; exit 1} \
         exit (n<200 ? 0 : 1)}' \
  src/routes/calculadora-conta-de-luz.tsx
```

Prints the line count and exits 0 only when it is below 200 — today it prints
`559` and exits 1. The pattern also matches `const ElectricityPage = () =>`,
so an honest conversion to an arrow function is still measured; and when
neither form is found the command prints
`ElectricityPage: signature not found` and exits 1, instead of printing
nothing and exiting 0 as the old `function ElectricityPage(` anchor did. Then:

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

---

## What actually happened — 2026-09-05

The `Done when` awk prints **197** and exits 0. It was 559 and exited 1. No `02b` is needed —
but the margin is three lines, so the next person to add JSX to this page will have to extract
before they add.

Six presentational components, all module-level in the same file (each is single-use, so a
home under `src/components/calculator/` would only add indirection):

| component | props | what it owns |
|---|---|---|
| `TariffSection` | uf, distributor, distributors, isLoadingDistributors, tariff, tariffState, onUfChange, onDistributorChange, onRefresh, onTariffChange | the state/distributor/ANEEL `FormSection` |
| `ApplianceRow` | appliance, tariff, onPatch, onRemove | one `<li>`: name, remove, the four `NumberInput`s, the per-row consumption line |
| `ApplianceSection` | appliances, tariff, presetValue, onAdd, onAddPreset, onPatch, onRemove | the header, the preset picker, the empty state and the `<ul>` of rows |
| `ElectricityResults` | result, tariff, shareText | the summary cards, highlights, `WarningList` and the share buttons |
| `ConsumptionTable` | result, rows, colorOf | the `SimpleBarChart` plus the consumption table |
| `ElectricityArticle` | — | the static `<Prose>` block |

Plus one pure module-level helper, `newAppliance`, collapsing the object literal that
`addAppliance` and `addPreset` each built by hand. `APPLIANCE_PRESETS` entries are already
exactly `Omit<ApplianceInput, "id" | "quantity">`, so `addPreset` is now a single spread.

**Every hook stayed in `ElectricityPage`.** The four `usePersistedState` calls, the three
`useState`, the two `useEffect` and the two `useMemo` are all still between lines 629 and the
first `const`; there is no hook call anywhere above the component. The persisted keys are
untouched — `tariff:v1`, `appliances:v1`, `uf:v1`, `distributor:v1`, no bump — so a value
stored before this refactor loads after it.

### The proof is the prerendered HTML, not the build exiting 0

`dist/client/calculadora-conta-de-luz/index.html` was saved from a build of `HEAD` before the
change and compared with the same file after. Normalising Vite's content hashes
(`-XXXXXXXX.js`) and TanStack's render timestamp (`u:<epoch ms>`), the two files are
**byte-identical** — 103.382 characters each, `<body>` included. The raw files differ only in
those hashes and that timestamp; the chunk list and its order are the same 30 entries, and
every referenced asset exists on disk. Two builds of the same source were also compared, to
confirm the timestamp is the build's own nondeterminism and not something the change
introduced.

`newAppliance` spreads `quantity: 1` last rather than first, so the JSON written to
`localStorage` keeps the same key order the old literals produced.

`tests/` is untouched (`git diff tests/` empty); 282 tests, typecheck, lint and
`SEO smoke test passed for 49 routes.` all green.

### The manual hydration check the slice asked for, and what it turned up

Done in a browser against the dev server, seeding `localStorage` with exactly what a pre-refactor
build would have written — the old key names and the key order the hand-built literals produced:

```
{ id: "seeded-1", name: "Geladeira antiga", watts: 350, hoursPerDay: 8, daysPerMonth: 30, quantity: 2 }
```

It loaded: the field showed `Geladeira antiga` and the row computed `168,0 kWh/mês`
(350 × 8 × 30 × 2 / 1000), with the tariff at `0,97`. Editing the name and reloading round-tripped,
and the object written back kept the key order `id, name, watts, hoursPerDay, daysPerMonth,
quantity` — the same order as before. All four keys still end `:v1`.

⚠️ **The console is not clean, and it was not clean before either.** The page reports
`Hydration failed because the server rendered text didn't match` on every load. Attributed rather
than assumed: the change was stashed, the same dev server reloaded on `HEAD`, and the identical
error appeared with the same ids differing the same way. Root cause is `nextId()` using
`Date.now()` inside a module-scope constant. Recorded in `ARCHITECTURE.md`; not fixed here, because
a determinism bug is not a refactor and this slice must stay provable on its own.
