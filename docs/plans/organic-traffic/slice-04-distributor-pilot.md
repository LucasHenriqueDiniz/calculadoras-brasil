---
status: doing
---

# Slice 4 — Ten distributor pages: history, rank and the bill, from ANEEL

## Delivers

`/tarifa-de-energia/<slug>` for ten distributors. Chosen for size and for demand Trends shows rising
("qual o valor do kwh da cemig", "valor do kwh em goias", "qual o valor do kwh em sp"), not for the
easiest data. The choice is a judgement; if ANEEL's consumer counts are readable when the slice
starts, the ten with the most residential consumers replace this list:

| `SigAgente` | searched as | R$/kWh on 2026-11-14 | 12 months | ANEEL rows |
|---|---|---|---|---|
| ELETROPAULO | Enel São Paulo | 0.78938 | +8.9% | 20 |
| CEMIG-D | Cemig | 0.90329 | +5.2% | 20 |
| COPEL-DIS | Copel | 0.76802 | +19.6% | 19 |
| CPFL-PAULISTA | CPFL Paulista | 0.73945 | +9.5% | 20 |
| LIGHT SESA | Light | 0.88056 | +6.9% | 20 |
| ENEL RJ | Enel Rio | 1.06110 | +14.7% | 19 |
| COELBA | Neoenergia Coelba | 0.87773 | +4.8% | 20 |
| CELESC | Celesc | 0.75975 | +9.2% | 20 |
| EQUATORIAL GO | Equatorial Goiás | 0.95439 | +7.0% | 20 |
| Neoenergia PE | Neoenergia Pernambuco | 0.79886 | +3.9% | 20 |

Each page carries, all from the slice 3 snapshot:

1. **Today.** The tariff in force, TUSD and TE, the period, and the resolution (`DscREH`) that set it.
2. **History.** Every period since the series starts (2010 for most): R$/kWh, the change against the
   period before, and the change since the first one. A table, and a simple chart drawn from the same
   numbers. This is what the three competing sites do not show.
3. **Rank.** Position among 103, the national median, and the two distributors on either side.
4. **The bill.** The cost of 50, 100, 150, 200, 250, 300, 400 and 500 kWh at this tariff, before taxes,
   and a link to `/calculadora-conta-de-luz` with the distributor selected for any other number. This
   table answers "N kWh em reais" for this distributor. There is no page per kWh value (D8).
5. **What it leaves out.** ICMS, PIS/Cofins, flags and public lighting, said plainly, with the API's
   existing note.

Text on each page is written from that page's own numbers: what moved, when, and by how much. Two
pages that would read the same with the names swapped have failed the slice (D8).

## Needs

Slice 3 merged: the snapshot, the domain functions, the name map and the hub that links here.

## Tests

- Unit: the bill table for COPEL-DIS at 0.76802 R$/kWh: 200 kWh → R$ 153,60. The same value the AI
  Overview printed on 2026-11-14, so the oracle is not ours.
- Unit: the history for COPEL-DIS. ANEEL returns 19 rows; the 2025 cycle is split at 2026-01-01 into
  two rows with the same REH 3.472 and the same values, so the page shows **18 periods**: first
  2010-06-24 at R$ 0,30000/kWh (188,98 + 111,02 per MWh), last 2026-06-24 at R$ 0,76802 (REH 3.592).
  The dataset has no row for 2012-06-24 → 2013-01-23 nor 2016-06-24 → 2017-03-31, and the page shows
  those as gaps, not as interpolated values.
- `pnpm run check` green; `test:seo` asserts the ten routes.
- A text check: for each pair of pilot pages, the body text with the distributor's names and numbers
  masked differs. Fails if two pages are the same template with values swapped.

## Done when

```bash
node scripts/verify-aneel-pages.mjs https://calculebrasil.com/tarifa-de-energia/<slug>   # for each of the 10
# prints, per page: periods N/N, bill rows 8/8, rank ok
```

- **10/10 pages**, each with every history period, every bill row and the rank equal to the live ANEEL
  API (both ends: the API, and the production HTML);
- one page fed a snapshot with one period removed prints a mismatch for that page only;
- ⚠️ **Owner:** "Request indexing" for the ten URLs. Start the clock for slice 6 on the deploy date.

## If stuck

If the history chart needs a library, use none: an inline SVG drawn from the table's numbers is
enough, and it keeps the page as light as the others.

---

## What actually happened — 2026-11-14

**The ten, by size.** ANEEL's SAMP had residential consumer counts ("Número de consumidores", class
Residencial). September 2026 listed only 21 distributors that day; August listed all 103. The ten
largest (`docs/research/2026-11-14-public-data-pages/measurements/samp-residential-consumers-2026-08.tsv`)
replace the judgement list above: **ENEL CE in, ENEL RJ out**.

| slug | `SigAgente` | residential consumers | name checked at |
|---|---|---|---|
| cemig | CEMIG-D | 8,536,384 | cemig.com.br (title "Cemig") |
| enel-sao-paulo | ELETROPAULO | 7,619,153 | enel.com.br/pt-saopaulo ("Enel São Paulo" ×9) |
| neoenergia-coelba | COELBA | 6,282,407 | neoenergia.com/web/bahia ("Neoenergia Coelba" ×27) |
| cpfl-paulista | CPFL-PAULISTA | 4,650,887 | cpfl.com.br/institucional ("CPFL Paulista" ×4) |
| copel | COPEL-DIS | 4,505,635 | copel.com (title "Copel") |
| neoenergia-pernambuco | Neoenergia PE | 3,849,786 | neoenergia.com/web/pernambuco ("Neoenergia Pernambuco" ×14) |
| light | LIGHT SESA | 3,799,152 | light.com.br (title "Light") |
| enel-ceara | ENEL CE | 3,507,540 | enel.com.br/pt-ceara (title "Enel Ceará") |
| equatorial-goias | EQUATORIAL GO | 3,185,346 | **press only** (Jornal Opção): the group's pages render the name in JavaScript |
| celesc | CELESC | 2,840,717 | celesc.com.br (title "A Celesc") |

The GD ("Sistema de Compensação") market rows are in the count; whether they overlap "Regular" is not
stated, so the page says "cerca de".

**The pages.** `/tarifa-de-energia/<slug>` (`src/routes/tarifa-de-energia_.$slug.tsx`, not nested
under the hub). Each carries today's tariff and resolution, every period with its change and the
gaps ANEEL left (shown, never filled), a step chart drawn from the same numbers, the neighbours in
the national ranking, the bill for 50–500 kWh, and an FAQ whose answers are numbers. The prose
branches on the distributor's own facts: third of the national table it falls in, above or below the
median change, its place in its state, how many reductions, off-cycle revisions, gaps. Two examples
from the build: Light is "uma das tarifas mais altas do país" and "a mais barata das 5 distribuidoras
do Rio de Janeiro"; Copel rose "mais que a mediana", Enel São Paulo "menos que a mediana".

The head reads `aneel-distributor-summaries.ts` (generated), so the history stays out of `index-*.js`
(410 KB, no history in it); the snapshot sits in one chunk the tariff pages share (162 KB, 30 KB
gzip). The hub's table now links each pilot row to its page.

**Measured locally** (`vite preview` of the build):

| check | result |
|---|---|
| `verify-aneel-pages.mjs` on each of the 10 pages vs live ANEEL | **10/10**: every period (18–19 per page, from 19–20 ANEEL rows), every gap (1–4), bill rows 8/8, rank |
| same, Copel copy with the 100 kWh cell and the 2014 period edited | periods 17/18, bill rows 7/8, both rows named |
| hub, same build | 102/102 |
| `test:seo` | 37 routes, none orphaned; each page ≥ 8 periods and 8 bill rows; **the 10 narratives differ pairwise** with numbers, names, acronyms, UFs and state names masked |
| unit tests (history, gaps, bill, facts, head summaries, lastmod) | 45/45 across the six related files |
| `cf:types:check`, `typecheck`, `lint`, `build`, `worker:dry-run`, `audit` | exit 0 |

One defect found and fixed on the way: a string replace meant for the comparison pages' breadcrumb
also hit `calculatorStructuredData`, where `parent` would have resolved to `window.parent`. The
typecheck caught it before any commit.

Production and ⚠️ the owner's "Request indexing" for the ten URLs: after the merge. Slice 6's clock
starts on the deploy date.
