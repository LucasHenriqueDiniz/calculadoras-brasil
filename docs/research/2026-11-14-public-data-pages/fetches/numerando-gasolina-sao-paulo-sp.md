---
tags: [fetch, 2026-11-14-public-data-pages]
source: https://numerando.com.br/combustiveis/gasolina/sao-paulo-sp
fetched: 2026-11-14
kind: secondary
---

# Preço Gasolina Comum em São Paulo (SP) — Numerando

> Fetched 2026-11-14 (WebFetch + raw HTML via curl) · Commercial finance site with programmatic fuel pages per city, state and station. Found through WebSearch, which is US-located: the result list is not a Brazilian SERP and says nothing about where this page ranks for Brazilian users.

## What it says

- Shows an average of R$ 6,686 per litre, range R$ 5,69–R$ 8,97, across "308 postos pesquisados pela ANP".
- Lists every station with name, flag, address and price; each links to a per-station page (`/combustiveis/postos/<slug>`).
- Has a "Histórico de Preços" heading.
- Site sections: Combustíveis (ANP), Tabela FIPE, Índices, Tabelas, Ações, Fundos, calculadoras.

## What it does not say

- No date of the data anywhere on the page: the raw HTML contains no `dd/mm/yyyy` or `yyyy-mm-dd` string (MEASURED by regex on 677,685 bytes of HTML).
- No visible chart data under "Histórico de Preços" in the HTML text, no comparison with state or national averages.
- Its numbers do not match the current ANP week: ANP shows São Paulo city at R$ 6,34, 210 stations, min R$ 5,49 / max R$ 8,49 for 08–14/11/2026; the min/max R$ 5,69 / R$ 8,97 shown here match ANP weeks in late March–April 2026 (`anp-xlsx-semanal-municipios-2026.md`). ESTIMATE: the page is about 7 months stale. The 308 vs 210 station count suggests it uses the per-station file, not the weekly summary (inference).
