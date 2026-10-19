---
status: doing
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

---

## What actually happened — 2026-10-18 (conta de luz; the other five are still to do)

### Conta de luz — 2026-10-18

- **Leader:** portal.elfsm.com.br, a distributor's simulator. One appliance at a time, kWh only,
  and a reference list with the refrigerator at 130 W.
- **Defects:**
  - our refrigerator was at its compressor rating too: 130 W × 24 h is 93,6 kWh a month, against
    the 56,88 kWh Eletrobrás gives for a two-door frost-free one (IDEC, 2013). The freezer was
    108 kWh against 47,55;
  - an FAQ priced a 500 W refrigerator at 4 hours a day, which contradicted the form;
  - percentages had no source;
  - the share column printed `16.4%`.
- **Fixed:**
  - refrigerator and freezer presets at Eletrobrás's average draw: 79, 55 and 66 W;
  - the default list moves to the duplex and its storage key to v2;
  - the FAQ and the worked example are computed by the calculator;
  - watts and percentages are in Brazilian format.
- **New:** a 20-row table of each appliance at a typical use and the example tariff. On the
  default house the 9.000 BTU air conditioner is 62,3% of the bill.
- **Not built: the plan's per-distributor table.** ANEEL's tariff leaves out the taxes and the
  bandeira, so it would print a bill lower than anyone pays. It would also be live data at
  prerender. With one example tariff, the table takes no public data, and the
  `PublicDataUnavailable` test has nothing to exercise.
- **Found on the way, every calculator:** the "Revisado em" every calculator shows was one
  site-wide date, 23/06, even on the pages revised today, while their JSON-LD said 2026-10-18.
  The layout now shows the page's own `lastmod`. `test:seo` holds it to the sitemap: with the
  fixed date put back, it fails on `/calculadora-custo-carro`.

| check | result |
|---|---|
| unit | 338 green. Mutants killed: the duplex back at 130 W (1 red); the date without UTC (2 red, "17 de outubro") |
| `test:seo` | 28 routes; the table and the 56,9 kWh row prerendered; "Revisado em" equal to lastmod on every route |
| both ends | 6 of 6 rows shared by the default form and the table match in kWh and R$ (AC R$ 205,20, duplex R$ 54,04) |

### Custo de carro — 2026-10-18

- **Leader:** calculadoras.rioclaro.com.br. It is broader than ours: cost of capital, financing,
  five years, and Uber and public transport. It has one fuel and one km/l.
- **Defects:**
  - flex ran ethanol at gasoline's km/l. At the defaults, R$ 4,20 against R$ 6,00, exactly the
    70% break-even, it called ethanol R$ 137,35 a month cheaper;
  - the FAQ charged "DPVAT R$ 150-200/ano", an insurance LC 207/2024 and LC 211/2024 ended;
  - ranges had no source;
  - the worked example said "próximo de R$ 1.500" against the calculator's R$ 1.582,85;
  - the ANP badge dated a week ending 10/10 as "09/10".
- **Fixed:**
  - ethanol under flex at its own yield, a new field defaulting to 70%. That is the median over
    the 261 flex cars of Inmetro's PBE 2026, measured from the PDF, with the script in the
    research folder;
  - the consumption fields name their fuel;
  - the storage key moves to v2;
  - every FAQ and article figure is computed;
  - the badge uses UTC and says "dados de" instead of "cache atualizado em".
- **New:**
  - a 27-row table: the example car under flex at each state's ANP average, with the week
    stated. Ethanol led in 11 states;
  - `fetchAnpPricesByState` reads every state from one workbook;
  - `scripts/refresh-anp-snapshot.mjs` writes `src/data/anp-weekly-snapshot.ts`.
- **Departure from the plan: a dated snapshot, not live data at prerender.** The build does not
  depend on gov.br. A failed fetch leaves the last week in place, and a missing price is a
  tested row.
- **Not built:** the leader's cost of capital and financing. Both need inputs and sourced
  defaults; the FAQ says financing is not simulated.

| check | result |
|---|---|
| unit | 348 green. Mutants killed: no yield (6 red), no yield fallback (1 red), the badge without UTC (1 red, "09/10/2026") |
| hand cases | tie at 70%; São Paulo R$ 485,3169 − R$ 420,7824 = R$ 64,5345 a month |
| `test:seo` | 28 routes; the fuel table, its ANP week, and 27 state rows |
| both ends | 3 of 3 states typed into the form match the table: SP (ethanol, R$ 64,53), RN (gasoline, R$ 44,69), PA (ethanol, R$ 1,09) |
