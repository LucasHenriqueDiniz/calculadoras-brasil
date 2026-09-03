---
status: active
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
prerendering: these 38 pages are prerendered at build time and the calculators
become interactive after hydration. A hook moved across a component boundary
changes when it runs.

The safety net already exists and is not obvious: `pnpm run test:seo` builds,
boots the preview server and asserts the prerendered HTML of all 38 public
routes. Every page slice below leans on it, and it is the reason a page can be
refactored here without a component test suite.

## Appetite

Four slices, one per stateful function, smallest blast radius first.
`calculateCarCost` goes first because it is already covered by
`tests/calculators.test.ts` — the refactor is proven by tests that exist today.
