---
tags: [fetch, 2026-11-14-public-data-pages]
source: https://trends.google.com/trends/explore?geo=BR&date=today%2012-m
fetched: 2026-11-14
kind: primary
---

# Google Trends — Brazil, last 12 months (13 target queries)

> Fetched 2026-11-14 through Trends' own JSON endpoints (`/trends/api/explore` → `/trends/api/widgetdata/multiline` and `/relatedsearches`), no login, no captcha, geo=BR, hl=pt-BR, window 2025-11-09 → 2026-11-14 (53 weekly points). Read because it is the only free source that returned data for every query. Trends is relative interest (0–100 within one comparison), not search volume.

## What it says

MEASURED — 12-month mean of weekly interest, each row within its own 5-term comparison (Trends' `averages` field agreed with my means):

| comparison | values |
|---|---|
| A | "conta de luz" 70.09 · "preço gasolina" 31.26 · "preço da gasolina hoje" 2.57 · "preço gasolina sp" 1.02 · "preço etanol" 3.47 |
| B | "conta de luz" 80.04 · "valor do kwh" 3.13 · "tarifa de energia" 4.55 · "quanto custa 1 kwh" 0.08 · "kwh em reais" 1.53 |
| C | "conta de luz" 80.04 · "bandeira tarifária" 0.49 · "valor kwh enel sp" 0.00 · "valor kwh cemig" 0.15 · "valor kwh copel" 0.08 |
| D (small anchor) | "valor do kwh" 52.06 · "quanto custa 1 kwh" 1.04 · "kwh em reais" 25.38 · "valor kwh enel sp" 0.04 · "valor kwh cemig" 1.83 |
| E (small anchor) | "valor do kwh" 52.06 · "valor kwh copel" 0.85 · "bandeira tarifária" 6.34 · "bandeira tarifaria" 2.70 · "preço gasolina sp" 17.47 |

MEASURED ratios to "conta de luz" (= 1), chaining D/E through "valor do kwh" (0.0391 of "conta de luz"):
"preço gasolina" 0.446 (median-based 0.371) · "tarifa de energia" 0.057 · "preço etanol" 0.050 · "valor do kwh" 0.039 · "preço da gasolina hoje" 0.037 · "kwh em reais" 0.019 · "preço gasolina sp" 0.013–0.015 · "bandeira tarifária" 0.0048 (+0.0020 unaccented) · "valor kwh cemig" 0.0014 · "quanto custa 1 kwh" 0.0008 · "valor kwh copel" 0.0006 · "valor kwh enel sp" ~0.

Peaks and medians (MEASURED): "conta de luz" median 70, max 88 (4–10 Jan 2026); "preço gasolina" median 26, max 100 in the week 25–31 Oct 2026; "valor do kwh" max in the week 28 Dec 2025–3 Jan 2026. Over 5 years "preço gasolina" peaked 6–12 Mar 2022.

Related queries (MEASURED, top, 12 months):
- "kwh": "valor kwh" 100, "consumo kwh" 67, "valor do kwh" 54, "kwh preço" 47, "qual valor do kwh" 21, "preço do kwh" 14, "kwh cemig" 12, "calcular kwh" 11, "kwh copel" 8.
- "preço gasolina": "preço da gasolina" 100, "preço de gasolina" 71, "preço gasolina hoje" 25, "gasolina hoje" 25, "preço médio gasolina" 8; rising "preço da gasolina em são paulo 2026" ("Aumento repentino"), "preço da gasolina em são paulo hoje" (+170%).
- "conta de luz": top is "empréstimo" 100, "empréstimo conta de luz" 97, "pagar conta de luz" 53, "enel conta de luz" 47, "segunda via conta de luz" 40; rising "bandeira amarela na conta de luz" (+100%).

## What it does not say

- No absolute volumes. Terms are matched broadly (`"type":"BROAD"` in the request), so "conta de luz" includes loan and second-copy queries that have nothing to do with tariffs — any volume derived from it inherits that mix.
- Values under ~1 are rounding noise on the 0–100 scale; the per-distributor "valor kwh <distribuidora>" phrasings are too small to measure against "conta de luz" and are better read as "near zero in this exact wording".
- The request is tagged `"userType":"USER_TYPE_SCRAPER"` by Google; results can differ from the web UI.
