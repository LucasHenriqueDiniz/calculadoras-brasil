---
tags: [fetch, 2026-10-18-adsense-added-value]
source: https://www.gov.br/inmetro/pt-br/assuntos/regulamentacao/avaliacao-da-conformidade/programa-brasileiro-de-etiquetagem/tabelas-de-eficiencia-energetica/veiculos-automotivos-pbe-veicular/mascara-pbev-2026_19_jan-rev01.pdf/@@download/file
fetched: 2026-10-18
kind: primary
---

# Inmetro — PBE Veicular 2026, the consumption table for light vehicles

> Fetched 2026-10-18 with WebFetch, 3.387.564 bytes, SHA-256 `43e928f8…a688ba0`, and converted with `pdftotext -layout`. The Inmetro page lists it as "Tabela PBEV 2026_25_AGO.pdf", "Atualizado em 31/08/2026". Read for how far a litre of ethanol takes a flex car, against a litre of gasoline.

## What it says

- **Title block:** "PROGRAMA BRASILEIRO DE ETIQUETAGEM VEICULAR - PBEV", "Tabela Ano 2026",
  "ATUALIZAÇÃO 14/ago/26". 976 models and versions from 43 brands, of them "Flex 310 Modelos".
- **Columns:** the consumption block prints "Etanol" over three columns and "Gasolina ou Diesel"
  over the next three, each "Cidade", "Estrada" and "Combinado", in km/l.
- **Measured** (`measurements/pbev-2026-ethanol-yield.py`, output beside it): across the 261
  combustion rows whose fuel is "F", ethanol's km/l over gasoline's is

  | | median | min | max | p10 | p90 |
  |---|---|---|---|---|---|
  | city | 0,698 | 0,660 | 0,744 | 0,686 | 0,716 |
  | highway | 0,701 | 0,671 | 0,753 | 0,689 | 0,719 |
  | combined | **0,700** | 0,664 | 0,726 | 0,690 | 0,710 |

  255 of the 261 fall between 0,68 and 0,74. Over the 114 distinct consumption figures, the median
  is still 0,700.

## What it does not say

- Anything about the other 49 flex rows, the hybrids. They were left out.
- Consumption on the road. These are Inmetro's laboratory figures, the ones on the label.
- That the median holds for older cars. Only the 2026 table was read.
