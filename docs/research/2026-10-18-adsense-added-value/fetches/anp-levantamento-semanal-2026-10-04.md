---
tags: [fetch, 2026-10-18-adsense-added-value]
source: https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/arquivos-lpc/2026/resumo_semanal_lpc_2026-10-04_2026-10-10.xlsx
fetched: 2026-10-18
kind: primary
---

# ANP — weekly survey of pump prices, 04 to 10/10/2026, state averages

> Fetched 2026-10-18 by `scripts/refresh-anp-snapshot.mjs`, through the app's own ANP adapter (sheet ESTADOS of the latest weekly workbook). The data is in `src/data/anp-weekly-snapshot.ts`; this note records what it showed.

## What it says

- 27 states with an average for "GASOLINA COMUM", and 26 for "ETANOL HIDRATADO": Amapá had no
  ethanol price that week.
- Ethanol over gasoline ranges from 0,607 in São Paulo (R$ 3,86 over R$ 6,36) to 0,762 in Rio
  Grande do Norte (R$ 5,03 over R$ 6,60).
- Below 0,70, the PBE median yield: 11 states, AC, BA, DF, GO, MG, MS, MT, PA, PR, RO and SP. Pará
  is at 0,698.

## What it does not say

- Any one station's price. These are state averages of the surveyed stations.
- Anything after 10/10/2026. The table on the page says which week it is, and the form fetches
  the latest one.
