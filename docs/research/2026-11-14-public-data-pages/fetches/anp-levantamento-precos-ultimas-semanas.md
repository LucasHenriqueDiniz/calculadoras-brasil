---
tags: [fetch, 2026-11-14-public-data-pages]
source: https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/levantamento-de-precos-de-combustiveis-ultimas-semanas-pesquisadas
fetched: 2026-11-14
kind: primary
---

# Levantamento de Preços de Combustíveis — últimas semanas pesquisadas (ANP)

> Fetched 2026-11-14 · The ANP page the site's `/api/fuel-prices` already reads (`resumo_semanal_lpc_2026_11_08-2026_11_14.xlsx`). Read to see what ANP itself offers a visitor and how far back the weekly files go.

## What it says

- Two `.xlsx` files per week: "Preços médios semanais: Brasil, regiões, estados e municípios" and "Preços por posto revendedor (combustíveis automotivos e GLP P13)".
- Latest week listed: 08/11/2026 a 14/11/2026 (`.../arquivos-lpc/2026/resumo_semanal_lpc_2026_11_08-2026_11_14.xlsx` and `revendas_lpc_2026_11_08-2026_11_14.xlsx`).
- At least 52 weeks are listed (17/11/2025 → 08/11/2026 in the first 100k characters; the page text is 247,934 characters, the rest was not read).
- File names are inconsistent week to week (underscores vs hyphens, suffixes like `-1`, `-4`) — links must be scraped, not built.
- Links to "Série histórica do Levantamento de Preços", "Série histórica do Levantamento de Preços - Dados Abertos" and "Painel Dinâmico de Preços de Combustíveis e Derivados do Petróleo".
- Notice for 10–16/05/2026: Belo Horizonte was not surveyed 26/04–16/05 because of operational problems at the contracted company.

## What it does not say

- No charts, no state-vs-state comparison, no history view on this page: it is a file list. A visitor must open spreadsheets.
- No licence on this page.
