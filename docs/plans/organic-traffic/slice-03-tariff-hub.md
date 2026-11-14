---
status: todo
---

# Slice 3 — The ANEEL snapshot, and `/tarifa-de-energia` ranking 103 distributors

## Delivers

A page no competitor snippet shows (`docs/research/2026-11-14-public-data-pages/measurements/serp-brazil-2026-11-14.md`):
every residential distributor in Brazil, ranked by the tariff in force, with how much it moved in
twelve months. Measured on 2026-11-14 (`…/measurements/aneel-b1-residential-2026-11-14.tsv`): 103
distributors, R$ 0,4050 to R$ 1,5692 per kWh before taxes, median R$ 0,8126; COPEL-DIS +19.6% in a year,
CEEE-D +22.0%, ENEL CE −1.2%.

1. **Snapshot.** `scripts/refresh-aneel-snapshot.mjs` reads ANEEL's `Tarifas de Aplicação` (resource
   `fcf2906c-…`, B1 residencial convencional, the adapter's filters) for **every period**, not only the
   one in force, and writes `src/data/aneel-tariff-snapshot.ts`: per `SigAgente`, the periods with
   start, end, TUSD, TE and `DscREH`. Consecutive rows with the same REH and the same values are one
   period: ANEEL split the 2025 cycle at 2026-01-01 for several agents
   (`fetches/aneel-dataset-tarifas-distribuidoras.md`). Agents spelled two ways (`CPFL SANTA CRUZ`,
   `CPFL Santa Cruz`) are one distributor. Licence: ODbL, credited on the page. Same shape of tool as `scripts/refresh-anp-snapshot.mjs`, and the
   same rule: generated, never edited by hand. Tariffs change about once a year per distributor, so a
   monthly refresh is enough; the page shows the snapshot date.
2. **Domain.** Pure functions in `src/lib/` over the snapshot: tariff in force on a date, change over
   twelve months, rank. No I/O. Tested with a fixture recorded from the API, not typed by hand.
3. **Names and states.** The tariff dataset carries no state and uses legal acronyms. ANEEL's own
   "Ranking da Tarifa Residencial" report has a "Baixar Dados" export with "Distribuidora" and "UF"
   per row (`fetches/aneel-portalrelatorios-ranking-tarifa-residencial.md`). Take the state from that
   export, committed as a dated file, and keep a short hand map only for the name people search
   (`ELETROPAULO` → "Enel São Paulo"), each entry citing the distributor's own site. Distributors
   without a confirmed name show the acronym.

   That report is also why the hub is not "the first ranking": ANEEL already ranks the tariffs. It
   does it in a Power BI canvas Google cannot read as text, with no history and no twelve-month change.
   The hub's claim is those two, in HTML.
4. **Route** `/tarifa-de-energia`, prerendered:
   - the 103-row table: name, states, R$/kWh, change in 12 months, start of the current period;
   - how the table is built and what it leaves out (taxes, flags, public lighting), in the words the
     API's note already uses;
   - a link to `/calculadora-conta-de-luz` with the tariff pre-selected, and from each pilot row to its
     page once slice 4 ships;
   - `BreadcrumbList` JSON-LD, the canonical, Open Graph; an FAQ only where a question has a number
     from the table as its answer. `Dataset` markup is optional: Google documents it for the separate
     Dataset Search tool, not for web ranking (`fetches/google-dataset-structured-data.md`).
5. `seo-pages.ts`, `tests/seo-smoke.mjs`, the `/calculadoras` guide's "energia" entry.
6. With the UF from step 3, `/api/energy-tariffs?uf=XX` filters by state. Today it returns the same
   103 distributors for any UF (measured 2026-11-14, `fetches/calculebrasil-api-energy-fuel.md`), so a
   visitor in Paraná scrolls past "Âmbar Amazonas" to find Copel.

## Needs

Slice 2 merged, so the guide entry that pointed at `/comparar/energia` is repointed once.

## Tests

- Unit: the domain functions against the recorded fixture for COPEL-DIS, ELETROPAULO and CEMIG-D:
  periods 19, 20, 20; first and last values as in `…/measurements/aneel-dataset-2026-11-14.md`.
- Mutation: shift the "in force on" date by a year and the rank test goes red.
- `pnpm run check` green; `test:seo` asserts the route and its canonical.

## Done when

`scripts/verify-aneel-pages.mjs` (new, committed) fetches the **live ANEEL API** and the **production
HTML** of `/tarifa-de-energia`, and compares every row, both ends:

```bash
node scripts/verify-aneel-pages.mjs https://calculebrasil.com/tarifa-de-energia
# prints: rows 103/103 match (tariff to 5 decimals, 12-month change to 0.1 pp), snapshot date YYYY-MM-DD
```

- **103/103** on production after the deploy (or N/N, N being the distributors in force that day);
- the same script, run against a build where one value in the snapshot was edited by hand, prints
  **102/103** and names the row. That proves it reads the page and not the snapshot;
- `curl -s 'https://calculebrasil.com/api/energy-tariffs?uf=PR' | jq '.distributors | length'` prints
  the number of distributors ANEEL's export lists for PR (not 103), `COPEL-DIS` among them and
  `Âmbar Amazonas` not; the same for SP and MG;
- ⚠️ **Owner:** "Request indexing" for `/tarifa-de-energia`. Google's state is read in slice 6.

## If stuck

If ANEEL's API is slow or truncates (the adapter already met a 2,000,000-byte cap), page through it
with `offset` as the research script did: 1,927 records in two calls on 2026-11-14.
