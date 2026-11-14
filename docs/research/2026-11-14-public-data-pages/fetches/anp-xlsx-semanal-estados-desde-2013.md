---
tags: [fetch, 2026-11-14-public-data-pages]
source: https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/precos-revenda-e-de-distribuicao-combustiveis/shlp/semanal/semanal-estados-desde-2013.xlsx
fetched: 2026-11-14
kind: primary
---

# semanal-estados-desde-2013.xlsx (ANP weekly series by state)

> Fetched 2026-11-14 · Downloaded (12,710,209 bytes; HTTP 200 with a browser User-Agent — a `HEAD` request returned 403) and parsed with the Python stdlib (zipfile + XML). Read to measure how much per-state history exists.

## What it says

MEASURED from the file:
- Sheet "ESTADOS - DESDE 30.12.2012"; header rows include "INTERVALO DE TEMPO: SEMANAL" and "PERÍODO: 30/12/2012 EM DIANTE".
- Columns: "DATA INICIAL", "DATA FINAL", "REGIÃO", "ESTADO", "PRODUTO", "NÚMERO DE POSTOS PESQUISADOS", "UNIDADE DE MEDIDA", "PREÇO MÉDIO REVENDA", "DESVIO PADRÃO REVENDA", "PREÇO MÍNIMO REVENDA", "PREÇO MÁXIMO REVENDA", "MARGEM MÉDIA REVENDA", "COEF DE VARIAÇÃO REVENDA", then distribution-price columns.
- 714 distinct weeks, first 2012-12-30, last week starting 2026-11-08 (ending 2026-11-14). 27 UFs.
- Rows per product: GASOLINA COMUM 19,267; ETANOL HIDRATADO 19,081; OLEO DIESEL 19,189; OLEO DIESEL S10 19,253; GLP 19,238; GNV 11,981; GASOLINA ADITIVADA 8,505.
- São Paulo / GASOLINA COMUM: 714 weekly rows; first week 2,374 stations at R$ 2,637; last week (2026-11-08) 1,252 stations at R$ 6,36. This matches the site's own `/api/fuel-prices?uf=SP&fuel=gasolina` today (averagePrice 6.36, sampleSize 1252).
- Gaps longer than one week: after 2015-08-09 (14 days), after 2020-08-16 (63 days), after 2022-09-11 (14 days). The sheet's own notes explain two of them: "não houve pesquisa de preços para o período de 16/8/2015 a 22/8/2015" and "Não houve pesquisa de preços entre 18/8/20 e 17/10/20."
- Other notes in the header: from 30/7/17 to 30/12/17 coverage was cut from 501 to 459 municipalities with alternating groups, and ANP recommends comparing alternate weeks in that period; 27/5/18–2/6/18 sample cut ~85% (truckers' strike); "Atualmente, o produto 'óleo diesel' se refere ao óleo diesel B S500 comum."
- Dates are Excel serials (41273 = 2012-12-30).

## What it does not say

- No licence inside the file.
- Distribution-price columns are "-" for recent weeks (distribution prices were collected only until 17/8/20 per the sheet note), so margin/distribution comparisons are not available for recent history.
