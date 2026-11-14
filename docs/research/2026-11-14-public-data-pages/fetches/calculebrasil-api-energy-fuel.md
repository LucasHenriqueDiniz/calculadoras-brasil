---
tags: [fetch, 2026-11-14-public-data-pages]
source: https://calculebrasil.com/api/energy-tariffs?uf=SP
fetched: 2026-11-14
kind: primary
---

# calculebrasil.com own APIs — /api/energy-tariffs and /api/fuel-prices

> Fetched 2026-11-14 with curl · The site's own data endpoints, read to see the shape the new pages would build on.

## What it says

- `/api/fuel-prices?uf=SP&fuel=gasolina` → `{"averagePrice":6.36,"minPrice":5.39,"maxPrice":8.49,"sampleSize":1252,"period":"2026-11-08 a 2026-11-14","source":"ANP","sourceUrl":".../resumo_semanal_lpc_2026_11_08-2026_11_14.xlsx","lastUpdated":"2026-11-14","isStale":false}`. Matches the ANP state series row for SP (MEASURED, `anp-xlsx-semanal-estados-desde-2013.md`).
- `/api/energy-tariffs?uf=SP` returns 103 distributors with only `uf`, `distributor`, `source`, `sourceUrl` — no tariff values. The `uf` field echoes the query: `?uf=MG` and `?uf=RJ` also return the same 103 distributors, each labelled with that UF (MEASURED). Without `uf` it returns "Informe uma UF válida."
- `/api/energy-tariffs?uf=SP&distributor=ELETROPAULO` → `tariffKwh` 0.78938, `tusd` 0.47242, `te` 0.31696, `taxesIncluded:false`.

## What it does not say

- The API carries only the tariff in force — no history, although the ANEEL dataset keeps every cycle since 2010.
- No distributor→UF mapping: the list is not filtered by state (the ANEEL dataset has no UF column).
