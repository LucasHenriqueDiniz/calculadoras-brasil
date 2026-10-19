---
status: todo
---

# Slice 5 — The six household calculators

`/calculadora-custo-carro`, `/calculadora-morar-sozinho`, `/calculadora-conta-de-luz`,
`/calculadora-assinaturas`, `/calculadora-custo-mudanca`, `/calculadora-custo-pet`.

## Delivers

The same three parts as slice 4, per calculator. These engines differ from the tax ones: several
take public data, ANEEL tariffs and ANP fuel prices, through `src/server/adapters/`. That is a
source of original information no competitor's static article has. Candidates:

| calculator | Google, 2026-10-18 | candidate |
|---|---|---|
| Custo de carro | not indexed | monthly cost per car category, with live fuel prices by state |
| Morar sozinho | indexed | the minimum salary per capital city for a given budget split |
| Conta de luz | indexed | cost per appliance at each distributor's tariff |
| Assinaturas | indexed | annual cost of common subscription bundles |
| Custo de mudança | not indexed | cost by distance and size |
| Custo de pet | indexed | annual cost by species and size |

**Content built on live public data inherits its rules** (`CLAUDE.md`): timeout, cache,
response-size limit and manual fallback. A table rendered at prerender time from live data must
say the date it was computed and degrade to the fallback. Otherwise it is a figure the page cannot
stand behind.

## Needs

Slice 3 done, and slice 4's version of the pattern if it changed.

## Tests

As slice 4. For data-backed tables, add one test where the adapter returns `PublicDataUnavailable`,
and check that the page renders the fallback rather than an empty table.

## Done when

```
pnpm run check && pnpm run test:seo
```

green, six written answers in the research note, and an N/N UI-versus-page count per calculator
that gained a table.

⚠️ **Owner:** "Request indexing" for the six after deploy.

## If stuck

Same as slice 4: one PR per calculator.
