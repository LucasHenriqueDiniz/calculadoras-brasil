---
status: todo
---

# Slice 8 — `/preco-combustivel`: 27 states, with history (only if D9 says scale)

## Delivers

One page, not 27. The fuel SERP is held by much stronger domains
(`docs/research/2026-11-14-public-data-pages/measurements/serp-brazil-2026-11-14.md`): Petrobras with
the state average and its cost breakdown, UOL with one generated article per city per week. What they
do not put on one page:

1. The 27 states this week for gasolina, etanol and diesel: average, minimum, maximum, number of
   stations sampled (São Paulo: 1,252 on 2026-11-14), and the rank.
2. **Ethanol or gasoline, state by state.** The etanol/gasolina ratio against the 70% rule of thumb
   the site's own `/calculadora-custo-carro` already applies ("compensa em 11 de 27 UFs" on 2026-11-13),
   and how many weeks in the last year each state was under 70%.
3. **History.** Each state's weekly average since the ANP's historical series starts, from the ANP
   série histórica (format, start year and licence in [[2026-11-14-public-data-pages]]), as a table
   and an inline chart.
4. A link to `/calculadora-custo-carro` with the state pre-selected.

**Freshness has to be real.** The page claims "this week", so it must be rebuilt when the ANP
publishes. `scripts/refresh-anp-snapshot.mjs` already produces the weekly table; what is missing is
running it weekly. ⚠️ **Owner** chooses one:
- a scheduled GitHub Action that runs the script and opens a PR, merged by hand; or
- the same Action committing to `main` directly, which deploys without review.

## Needs

D9 = scale, and slice 7's first batch without a drop in indexed share.

## Tests

- Unit: the ratio and the "weeks under 70%" count for one state, against a fixture recorded from the
  série histórica.
- `pnpm run check` green; `test:seo` asserts the route.

## Done when

```bash
node scripts/verify-anp-page.mjs https://calculebrasil.com/preco-combustivel
# prints: this week 81/81 (27 states x 3 fuels) equal the ANP workbook; history rows N/N equal the série histórica
```

- **81/81** this week, against the live ANP workbook, and **N/N** history rows;
- for 4 consecutive Mondays after the first deploy, the page's week equals the ANP's latest published
  week (the same script, scheduled or run by hand, its output saved);
- ⚠️ **Owner:** "Request indexing" after the first deploy; impressions read 28 days later, as in slice 6.

## If stuck

If the série histórica is too large to snapshot into the bundle, keep the history to the last 104
weeks and link the ANP file for the rest.
