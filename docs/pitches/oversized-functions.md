---
status: done
epic: size
---

# Functions past the hard 200-line limit

## The problem

The `clean-code` skill treats 80 lines as a soft limit and 200 as a refactor
blocker. Measured by matching braces from each `function` declaration, nine
functions are over 200 lines:

| lines | location | function |
|---|---|---|
| 559 | `src/routes/calculadora-conta-de-luz.tsx:165-723` | `ElectricityPage` |
| 477 | `src/routes/calculadora-custo-carro.tsx:216-692` | `CarCostPage` |
| 314 | `src/routes/calculadora-morar-sozinho.tsx:144-457` | `LivingAlonePage` |
| 283 | `src/routes/privacidade.tsx:112-394` | `PrivacidadePage` |
| 280 | `src/routes/blog/quanto-custa-ter-carro.tsx:69-348` | `BlogPost` |
| 276 | `src/routes/blog/calculadora-irpf-2026.tsx:37-312` | `BlogPost` |
| 253 | `src/routes/blog/guia-irpf-2026.tsx:37-289` | `BlogPost` |
| 229 | `src/lib/calculators/carCost.ts:89-317` | `calculateCarCost` |
| 201 | `src/routes/index.tsx:36-236` | `Home` |

## The nine are two different problems

**Four hold state.** `ElectricityPage`, `CarCostPage`, `LivingAlonePage` and
`calculateCarCost` are where the length is actually costing something: three of
them interleave `useState`, `usePersistedState`, `useMemo` and 400 lines of JSX
in one scope, and the fourth is a domain function long enough that its branches
are hard to hold in one head.

**Five are prose.** `PrivacidadePage`, the three `BlogPost` components and
`Home` contain no hooks at all:

```
$ grep -cE 'useState|useEffect|useMemo|useCallback|usePersistedState' \
    src/routes/privacidade.tsx src/routes/blog/quanto-custa-ter-carro.tsx \
    src/routes/blog/calculadora-irpf-2026.tsx src/routes/blog/guia-irpf-2026.tsx \
    src/routes/index.tsx
0
0
0
0
0
```

They are long because the page has a lot of copy. Splitting a static JSX tree
into `<SectionOne/> <SectionTwo/>` moves the line count without making anything
easier to reason about. **This plan does not slice them.** If the owner wants
the limit enforced literally rather than for its reason, that is a separate
decision and a separate plan.

## The risk being bought

Refactoring a TanStack Start route component touches hydration and
prerendering: these 49 pages are prerendered at build time and the calculators
become interactive after hydration. A hook moved across a component boundary
changes when it runs.

The safety net already exists and is not obvious: `pnpm run test:seo` builds,
boots the preview server and asserts the prerendered HTML of all 49 public
routes. Every page slice below leans on it, and it is the reason a page can be
refactored here without a component test suite.

## Appetite

Four slices, one per stateful function, smallest blast radius first.
`calculateCarCost` goes first because it is already covered by
`tests/calculators.test.ts` — the refactor is proven by tests that exist today.

---

**Delivered 2026-09-05.** Four slices, `docs/plans/oversized-functions/`.

| target | was | is |
|---|---|---|
| `calculateCarCost` | 229 | **40** |
| `ElectricityPage` | 559 | **197** |
| `CarCostPage` | 477 | **66** |
| `LivingAlonePage` | 314 | **46** |

All four are under the hard 200-line limit and three are under the soft 80. Each was proven the
way its own risk demanded rather than by the gate alone: `calculateCarCost` differentially over
17.280 inputs, the three pages by comparing their prerendered HTML before and after — byte-identical
in every case — plus a manual hydration check per page.

Two things the work turned up that were not about size. `CarCostPage` was hiding a hand-rolled
cache that is now the named `useFuelPrices` hook. And an entry this branch had added to
`ARCHITECTURE.md`, claiming a production hydration failure, was **wrong** and is corrected there:
the failure is a dev-server artifact of TanStack's stylesheet injection, and production logs no
error at all.

The five prose components the pitch deliberately excluded (`PrivacidadePage`, three `BlogPost`s,
`Home`) are still excluded. Slice 4 raises whether they should get the same treatment; that is the
owner's call.
