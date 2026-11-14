---
status: todo
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
