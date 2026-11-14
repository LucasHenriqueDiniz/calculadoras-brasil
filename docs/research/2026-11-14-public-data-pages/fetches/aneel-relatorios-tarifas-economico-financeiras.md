---
tags: [fetch, 2026-11-14-public-data-pages]
source: https://www.gov.br/aneel/pt-br/centrais-de-conteudos/relatorios-e-indicadores/tarifas-e-informacoes-economico-financeiras
fetched: 2026-11-14
kind: primary
---

# Tarifas e Informações Econômico-Financeiras — ANEEL relatórios

> Fetched 2026-11-14 · Index of ANEEL's tariff reports (page modified 09/11/2026). Read to list what ANEEL already offers for residential tariffs, history and flags.

## What it says

- "Ranking das tarifas" → `https://portalrelatorios.aneel.gov.br/luznatarifa/rankingtarifas`; Excel `RankingB1.xlsx` on `git.aneel.gov.br`.
- "Componentes da tarifa residencial" (TUSD/TE history) and "Índices de reajuste das tarifas residenciais" (B1 history) — both Power BI embeds.
- "Entenda sua conta" — Power BI bill simulator.
- "Base de Dados das Tarifas das Distribuidoras de Energia Elétrica" (since 2010) → `portalrelatorios.aneel.gov.br/luznatarifa/basestarifas`.
- "Conta Bandeiras" Power BI report and monthly Excel/PDF notes since 2015; "Subsidiômetro".

## What it does not say

- The `RankingB1.xlsx` link returned HTTP 403 with a Cloudflare "Just a moment..." challenge page to curl (MEASURED, 5,842-byte HTML body). Not pursued — challenge not solved.
- Whether any of the history panels are crawlable HTML: they are Power BI embeds (inference from the `app.powerbi.com/view` URLs).
