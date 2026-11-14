---
tags: [research, area/seo, area/data, 2026-11-14-public-data-pages]
status: active
decided: 2026-11-14
---

# Can pages built on the ANEEL and ANP data earn search traffic without being scaled content?

> Yes for electricity, with history and rank as the reason each page exists; fuel later and as one page. ANEEL's dataset gives 103 distributors a tariff series back to 2010 that no ranking competitor shows in HTML. Google draws the scaled-content line at purpose and value, never at a page count, and its own spokesman describes the site-level loss of trust this site's July drop looks like, so the pages ship as a pilot.

## What was blocking

[[2026-11-14-search-cliff-2026-07-25]] left the site indexed and invisible, with July's only traffic
coming from long-tail electricity questions. The idea on the table was pages built on the two public
datasets the site already reads. Four things had to be known before planning them:

1. What Google says about many pages generated from data.
2. Who already serves this data, and what they show.
3. Whether the data carries history and comparison, or only today's number.
4. How much demand there is.

Searches were run in English for Google's documentation and in Portuguese for the Brazilian sites and
the government data, since that is where those live. The search tool is US-located, so the competitor
list from it is not a Brazilian results page; two Brazilian result pages were read separately in the
owner's browser (`measurements/serp-brazil-2026-11-14.md`).

## Findings

### 1. Google draws the line at purpose and value, never at a count (cited)

The spam policy (`fetches/google-spam-policies.md`): scaled content abuse "is when many pages are
generated for the primary purpose of manipulating search rankings" and provide "little to no value to
users, no matter how it's created". Its examples include "Scraping feeds, search results, or other
content to generate many pages", and under doorways, "Having multiple domain names or pages targeted at
specific regions or cities that funnel users to one page" and "Creating substantially similar pages
that are closer to search results than a clearly defined, browseable hierarchy".

The 2024 announcement (`fetches/google-blog-2024-03-core-update-spam-policies.md`) widens it to
"automation, human efforts, or some combination". Neither page mentions open government data, and
neither gives a number.

The closest Google comes to endorsing data pages is the 2023 post on AI content
(`fetches/google-blog-2023-02-ai-generated-content.md`): "Automation has long been used to generate
helpful content, such as sports scores, weather forecasts, and transcripts." Structured, regularly
updated data is the example it gives of automation done right.

The helpful-content questions (`fetches/google-creating-helpful-content.md`) give the test a data page
has to pass: "Does the content provide original information, reporting, research, or analysis?", "If
the content draws on other sources, does it avoid simply copying or rewriting those sources, and
instead provide substantial additional value and originality?", "Does the content provide substantial
value when compared to other pages in search results?". On dates: "Are you changing the date of pages
to make them seem fresh when the content has not substantially changed?" is listed as a warning sign.

What that means for these pages, as an inference from the wording:
- a page that re-shows one ANP or ANEEL row is the "scraping feeds" example;
- history, rank and computed cost are the "substantial additional value" the questions ask for;
- a page per city or per kWh value is the doorway example;
- the date on a page moves only when the snapshot changes a number on it.

**Dataset markup is not a ranking lever.** Google documents it for the separate Dataset Search tool:
"Datasets are easier to find in the Dataset Search tool…"
(`fetches/google-dataset-structured-data.md`).

### 2. Google's spokesman describes this site's situation, in 2026 (cited, forum)

John Mueller on Bluesky, 2026-09-07, to an owner of generated pages
(`fetches/bluesky-johnmu-programmatic-seo-2026-09-07.md`, `fetches/seroundtable-google-lose-faith-programmatic-2026.md`):
"Programmatic SEO like this often leads to a site that's either spam, borderline spam, or low
quality", "Our systems have possibly lost faith in your site providing good value to users based on the
old pages", and "Resolving this tends to take time & significant effort to show the value".

It is a forum statement, not policy. It frames the loss as **site-level**, triggered by the old pages,
and slow to reverse. That matches this site: 52 pages published in four days in June, then every page
gone from results on one day in July, indexed but unseen since. It is the best explanation on record
for [[2026-11-14-search-cliff-2026-07-25]], and it is still an explanation by analogy.

### 3. The electricity data has what the ranking pages lack (measured)

ANEEL "Tarifas de Aplicação" (`fetches/aneel-dataset-tarifas-distribuidoras.md`,
`measurements/aneel-dataset-2026-11-14.md`, `measurements/aneel-b1-residential-2026-11-14.tsv`):

| measure | value |
|---|---|
| licence | Open Data Commons ODbL |
| coverage | "2010 em diante", updated weekly |
| B1 residential rows | 1,927, for 116 agents |
| distributors in force on 2026-11-14 | 103 (the same 103 the site's API lists) |
| tariff range, before taxes | R$ 0,4050 (CERSAD) to R$ 1,5692 (CERES), median R$ 0,8126 |
| series starting 2010–2011 | 88 of the 103 |
| per record | start, end, TUSD, TE and the homologating resolution (`DscREH`) |

Two quirks the pages must handle: the 2025 cycle is split into two identical rows at 2026-01-01 for
several agents (COPEL-DIS: 19 rows, 18 periods), and some years have no row at all (COPEL-DIS
2012-06-24 → 2013-01-23, 2016-06-24 → 2017-03-31). There is no state column.

The twelve-month change is itself content: COPEL-DIS +19.6%, CEEE-D +22.0%, RGE +14.9%, ENEL RJ +14.7%,
ENEL CE −1.2% (the TSV has all 103).

**Who already shows it** (`measurements/serp-brazil-2026-11-14.md` and the fetches):

| source | current tariff | taxes | history | rank | notes |
|---|---|---|---|---|---|
| Google AI Overview, "valor do kwh copel 2026" | yes | no | no | no | cites calculadoraenergia.com.br |
| calculadoraenergia.com.br | yes | — | not in snippet | no | one page per distributor, bill for 100–500 kWh |
| calculadoradomundo.com.br, s2vengenharia.com.br | yes | yes | no | no | |
| ANEEL "Ranking da Tarifa Residencial" | yes | no | **no** | yes, with UF and white tariff | Power BI canvas, not text (`fetches/aneel-portalrelatorios-ranking-tarifa-residencial.md`) |
| copel.com (the distributor itself) | yes, in a widget | yes | **average adjustment %** 2014–2026, not R$/kWh | no | each distributor may publish its own; this one's FAQ still says the next review is "prevista para o ano de 2021" (`fetches/copel-tarifas-energia-eletrica.md`) |
| sum.money | ~R$ 0,70 for Copel | yes | no | no | figure predates the June 2026 readjustment (`fetches/sum-money-calculadora-conta-de-luz.md`) |
| webarcondicionado.com.br | 26 capitals | no | no | yes | "Atualizado em 15/03/2022" |

Nobody in that list puts a distributor's series since 2010 and its rank among 103 on one readable page.
That is the gap, and only this kind of dataset fills it.

### 4. The fuel data is deep, and the field is crowded (measured)

ANP série histórica (`fetches/anp-serie-historica-levantamento-precos.md`,
`fetches/anp-xlsx-semanal-estados-desde-2013.md`): `semanal-estados-desde-2013.xlsx` holds 714 weeks
per state from 2012-12-30 to the week of 2026-11-08, for gasolina, etanol, diesel, diesel S10, GLP and
GNV, with stations sampled, average, minimum and maximum. São Paulo, gasolina comum, last week: 1,252
stations at R$ 6,36, which matches the site's `/api/fuel-prices` to the centavo. Three gaps longer than
a week, two of them explained in the file's notes. No licence inside the xlsx; the per-station series on
dados.gov.br carries Creative Commons Attribution.

The Brazilian results page for "preço médio gasolina sp semana" is led by Petrobras's own price site
and by UOL, which publishes one generated article per city per week with the week-on-week change. Other
sites in the fetches: numerando.com.br (per-station pages, no data date, numbers about seven months old
by ESTIMATE), gameoverdrive.com.br ("hoje" in the title over week-old data). The pattern in this query
family is a date in the title and no history.

Fuel has the data for a unique page (history and the ethanol ratio per state), but it competes with
Petrobras and UOL on the headline number.

### 5. Demand: relative, with one measured floor (measured and estimated)

**MEASURED, Google Trends, Brazil, 12 months** (`measurements/google-trends-2026-11-14.md`). Same
scale across the three comparisons through the shared terms:

| term | index | as a multiple of "calculadora salário líquido" |
|---|---|---|
| conta de luz | 80 | ~80× |
| preço gasolina | 31 | ~31× |
| preço diesel | 19 | ~19× |
| tarifa de energia | 5 | ~5× |
| preço etanol | 4 | ~4× |
| valor do kwh | 3 | ~3× |
| preço da gasolina hoje | 3 | ~3× |
| kwh em reais | 2 | ~2× |
| calculadora salário líquido | 1 | 1× |
| clt x pj | 1 | ~1× |
| bandeira tarifária | 0 | below resolution |

Values of 1–3 are near Trends' floor, so the small multiples carry a wide error. Electricity interest
is flat week to week; fuel interest spikes 3–5× with the news (2026-03-15, 2026-10-25).

**MEASURED floor, Search Console, July 2026.** `/calculadora-conta-de-luz` earned 230 impressions in 24
days at average position 8.2, from "N kWh em reais" questions most of which Google withholds as rare.
That is about 290 a month from one page on page 1, before it had a distributor table. It is a floor for
what the electricity long tail can show this site, not a market size.

**Absolute volume: one vendor number, then arithmetic.** Ubersuggest, unregistered, Brazil/Portuguese,
gave one figure before gating the next search: **"conta de luz" 18.1K a month**, SEO difficulty 41
(`fetches/ubersuggest-conta-de-luz-br.md`). That is a vendor's estimate, read from its screen, not a
count from Google. Ahrefs sat behind a captcha and Semrush behind a sign-up; neither was passed
(`fetches/ahrefs-keyword-generator-br.md`, `fetches/semrush-keyword-overview-br.md`). Keyword Planner
needs a Google Ads account and was not opened.

Scaling the Trends table by that one number (18,100 ÷ 80 ≈ 226 searches per index point) gives:

| term | ESTIMATE, searches a month |
|---|---|
| conta de luz | 18,100 (the vendor figure) |
| preço gasolina | ~7,000 |
| preço diesel | ~4,300 |
| tarifa de energia | ~1,100 |
| preço etanol | ~900 |
| valor do kwh | ~700 |
| preço da gasolina hoje | ~700 |
| kwh em reais | ~450 |
| calculadora salário líquido | ~230 |
| clt x pj | ~230 |

The subagent's own chain, through different comparisons, landed in the same range: "valor do kwh"
~710, "tarifa de energia" ~1.0K, "preço etanol" ~900 (`fetches/google-trends-br-2026-11-14.md`).

**Treat every row but the first as an order of magnitude at best.** Trends matches broadly, and "conta
de luz" is dominated by other intents ("segunda via", "empréstimo na conta de luz"). If the vendor's
18.1K is exact-match, every row above is too low, possibly by 10×. The ~230 for "calculadora salário
líquido" is a warning sign: a head term this site never reached page 1 for is unlikely to be that
small. What holds regardless of the anchor is the **ordering**: electricity long tail is several times
the salary head term in Trends, and fuel is an order of magnitude above both.

The July floor is consistent with the order of magnitude: ~290 impressions a month on "N kWh em reais"
questions from one page at position 8, against ~450 estimated for "kwh em reais" alone.

## Verdict

| question | answer |
|---|---|
| What does Google say about data pages at scale? | Purpose and value, no count. A page that only re-shows a row is the scraping example; history, rank and computed cost are the added value its questions ask for; a page per city or per number is the doorway example. |
| Who serves the data? | Electricity: three sites with a page per distributor, all current-tariff only, plus ANEEL's own unreadable ranking. Fuel: Petrobras and UOL, strong domains, weekly. |
| History and comparison? | Electricity: 16 years for 88 of 103 distributors, with the resolution per step. Fuel: 714 weeks per state. |
| Demand? | Relative (measured): "valor do kwh" ~3× "calculadora salário líquido", "preço gasolina" ~31×. Absolute (ESTIMATE from one vendor figure): "valor do kwh" ~700/month, "tarifa de energia" ~1,100, "preço gasolina" ~7,000. Floor (measured): one electricity page earned ~290 impressions a month in July. |

**Build electricity first, as a pilot**, because it has both the gap (history and rank nobody shows in
text) and the only demand this site has measured itself. **Fuel waits**, and comes as one page, because
its gap is narrower against far stronger domains. **Ship in small batches** and let Google's numbers on
the pilot decide the rest, because finding 2 says the site's problem may be trust at the site level,
which more pages do not fix by themselves.

## The strongest case against

**"Any batch of templated pages on this site makes it worse."** If Google has "lost faith" in the site
(finding 2), then adding pages from one template, however good the data, may read as more of the same.
The answer is in the plan rather than here: ten pages, each with numbers that differ, a check that two
pages do not read the same with the names swapped, and a stop rule if Google indexes them and still
shows nothing. If the stop rule fires, this verdict was wrong for this domain, and the pages are still
correct and cheap to keep.

**"The AI Overview answers the question, so nobody clicks."** For "valor do kwh copel 2026" the
Overview gives the current tariff and the 200 kWh bill. A page that only has those loses the click. The
pages this note argues for carry what the Overview did not: the 16-year history, the rank and the gaps.
Whether that earns clicks is exactly what slice 6 measures.

## What this does not establish

- **Absolute search volume.** One vendor figure and arithmetic on it (finding 5). Keyword Planner, if
  the owner has a Google Ads account, would replace the table with Google's own ranges.
- **Whether Google treats history pages differently from current-value pages.** No source says.
- **The ANP licence for the aggregate state series.** The per-station series is CC-BY on dados.gov.br;
  the xlsx on gov.br states none.
- **Residential consumer counts per distributor**, which would rank the pilot by size. Not found in
  the fetched datasets.
- **The ICMS per state** that competitors add. Not researched; in `docs/IDEAS.md`.

## Sources

Google:
- [Spam policies for Google web search](https://developers.google.com/search/docs/essentials/spam-policies) — `fetches/google-spam-policies.md` — scaled content, doorways, scraping
- [March 2024 core update and new spam policies](https://developers.google.com/search/blog/2024/03/core-update-spam-policies) — `fetches/google-blog-2024-03-core-update-spam-policies.md` — "automation, human efforts, or some combination"
- [Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) — `fetches/google-creating-helpful-content.md` — the value questions, the date warning
- [Dataset structured data](https://developers.google.com/search/docs/appearance/structured-data/dataset) — `fetches/google-dataset-structured-data.md` — Dataset Search only
- Also read: `fetches/google-blog-2023-02-ai-generated-content.md`, `fetches/google-using-gen-ai-content.md`, `fetches/google-publication-dates.md`, `fetches/google-ranking-systems-guide.md`

Forum and secondary:
- John Mueller on Bluesky, 2026-09-07 — `fetches/bluesky-johnmu-programmatic-seo-2026-09-07.md` — "lost faith", site-level, slow to reverse
- Search Engine Roundtable — `fetches/seroundtable-google-lose-faith-programmatic-2026.md`, `fetches/seroundtable-programmatic-seo-fancy-banner-spam-2023.md`, `fetches/seroundtable-technical-vs-programmatic-seo-2025.md`, `fetches/seroundtable-templated-content-above-fold-2021.md`

Data, primary:
- [ANEEL Tarifas das distribuidoras](https://dadosabertos.aneel.gov.br/dataset/tarifas-distribuidoras-energia-eletrica) — `fetches/aneel-dataset-tarifas-distribuidoras.md` — licence, coverage, quirks
- [ANEEL Bandeiras tarifárias](https://dadosabertos.aneel.gov.br/dataset/bandeiras-tarifarias) — `fetches/aneel-dataset-bandeiras-tarifarias.md` — flag history since 2015
- ANEEL ranking pages — `fetches/aneel-ranking-das-tarifas.md`, `fetches/aneel-portalrelatorios-ranking-tarifa-residencial.md`, `fetches/aneel-relatorios-tarifas-economico-financeiras.md`
- [ANP série histórica](https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/precos-revenda-e-de-distribuicao-combustiveis/serie-historica-do-levantamento-de-precos) — `fetches/anp-serie-historica-levantamento-precos.md`, `fetches/anp-xlsx-semanal-estados-desde-2013.md`, `fetches/anp-xlsx-semanal-municipios-2026.md`, `fetches/anp-dados-abertos-serie-historica-precos.md`, `fetches/dados-gov-br-serie-historica-precos-combustiveis-glp.md`, `fetches/anp-levantamento-precos-ultimas-semanas.md`, `fetches/anp-painel-dinamico-precos.md`
- This site's APIs — `fetches/calculebrasil-api-energy-fuel.md`

Competitors, vendor: `fetches/numerando-gasolina-sao-paulo-sp.md`, `fetches/numerando-gasolina-brasil.md`, `fetches/gameoverdrive-gasolina-hoje-27-estados.md`, `fetches/garagem360-etanol-gasolina-semana.md`, `fetches/valorfinal-preco-gasolina-por-governo.md`, `fetches/brasil61-gasolina-diesel-sao-paulo.md`, `fetches/acritica-precos-combustiveis-ms.md`, `fetches/sum-money-calculadora-conta-de-luz.md`, `fetches/webarcondicionado-tarifa-kwh-ranking-cidades.md`, `fetches/copel-tarifas-energia-eletrica.md`

Volume, vendor: [Ubersuggest](https://ubersuggest.com/) — `fetches/ubersuggest-conta-de-luz-br.md` — the one absolute figure; gated: `fetches/ahrefs-keyword-generator-br.md`, `fetches/semrush-keyword-overview-br.md`; Trends as read by the subagent: `fetches/google-trends-br-2026-11-14.md`

Measurements, this note: `measurements/google-trends-2026-11-14.md`, `measurements/serp-brazil-2026-11-14.md`, `measurements/aneel-dataset-2026-11-14.md`, `measurements/aneel-b1-residential-2026-11-14.tsv`
