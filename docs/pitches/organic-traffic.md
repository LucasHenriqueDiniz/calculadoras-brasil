---
status: proposed
epic: organic-traffic
---

# Get Google to show the site again, with pages only its data can write

## The problem

Search Console, 2026-11-14 (`sitestats`):

| window | clicks | impressions | position |
|---|---|---|---|
| July 2026 | 5 | 581 | — |
| last 28 days | 0 | 8 | 15.9 |
| last 90 days | — | 25 (−95.7% against the 90 before) | — |

26 of the 28 sitemap URLs are indexed. Indexed is not shown: those 26 pages earned 25 impressions in
111 days, and in July four of them earned 471 in 24 days. AdSense has marked the site "Requer atenção —
conteúdo de baixo valor" since 2026-09-07, and the owner will not ask for review until the site has
real visitors. So traffic is the blocker for the only revenue this site could have.

**Why it fell.** [[2026-11-14-search-cliff-2026-07-25]] measured the drop to a single day, 2026-07-25,
across every page and every position. It ruled out the deploy lead: production served the same build
from 2026-06-26 to 2026-07-27, and no failed build ever replaced it. It ruled out zone changes, a
removal request and a current manual action. What remains is most consistent with a site-wide
judgement on Google's side, of unknown cause. That cannot be proven from outside, and it shapes this
pitch: **any new page may inherit the same demotion, so the work starts small and measures before it
scales.**

**What used to work.** July's impressions came from long-tail questions, not head terms:

| page | July impressions | position | what people asked |
|---|---|---|---|
| `/calculadora-conta-de-luz` | 230 | 8.2 | "39 kwh em reais", "54 kwh mês quanto custa", and ~225 more impressions on queries Google withholds as rare |
| `/calculadora-assinaturas` | 138 | 6.5 | 4 clicks |
| `/calculadora-custo-pet` | 52 | 6.1 | |
| `/calculadora-clt-vs-pj` | 71 | 88.6 | head terms |
| `/calculadora-salario-liquido` | 76 | 88.7 | head terms |

The head terms never got past page 9. The long tail reached page 1.

## Solution

Build pages on the two public datasets the site already reads and nobody else ranks with in the same
shape, starting with electricity, and fix the hygiene items while Google re-crawls.

### 1. Hygiene first (cheap, measured by `curl` and URL Inspection)

- `www.calculebrasil.com` returns NXDOMAIN. Googlebot asked for it 32 times in 90 days. Add the record
  and a 301 to the apex.
- `calcule-brasil.lucas-hdo.workers.dev` serves the whole site with a 200. Its canonical points at the
  apex, but it is a second copy. 301 it to the apex too.
- The two URLs Google crawled and declined, `/blog/assinaturas-que-valem-a-pena` and
  `/comparar/energia`, are merged into their calculator behind a 301, per D5. Neither has an
  impression to lose. The owner asked Google to re-index the blog post on 2026-11-13. If Google has
  indexed it by the time the slice runs, it stays.

### 2. Electricity: one page per distributor, with what nobody else shows

ANEEL's open dataset carries, for **103 distributors**, the residential tariff in force and every
tariff since 2010–2011 for 88 of them, each with the resolution that set it
([[2026-11-14-public-data-pages]]). Today the tariff runs from R$ 0,41 to R$ 1,57 per kWh, before
taxes.

The result page for "valor do kwh copel 2026" already has an AI Overview with the current tariff and
three sites with one page per distributor. None of their snippets shows **history** or **rank**. So
each page carries what only a 16-year series and a 103-row table can give:

- the tariff in force, TUSD and TE, and the resolution, linked;
- every readjustment since 2010, with the percentage of each, and the total since then;
- the rank among 103, and the distributors either side;
- the bill for 50 to 500 kWh at that tariff. That table answers the "N kWh em reais" questions that
  earned July without a page per number.

Plus a hub, `/tarifa-de-energia`: the 103 distributors ranked, the change in twelve months, and the
distribution. ANEEL ranks the tariffs itself, but in a Power BI panel Google cannot read as text, with
no history and no change over time. The hub is that ranking in HTML, with the two things it lacks.

**Pilot, then scale.** Ten distributor pages and the hub ship first. Twenty-eight and forty-two days
later, the pilot's own numbers decide (D9): scale to the rest in batches, hold, or stop. A data page
that Google indexes and still never shows, while thinner competitors rank, is the clearest signal of a
site-wide demotion this site can get, and it says to stop adding pages.

### 3. Fuel, only if electricity earns impressions

The ANP weekly survey covers 27 states. The fuel SERP is a harder field: UOL publishes one generated
article per city per week, and Petrobras publishes the state averages with a cost breakdown. Both are
far stronger domains. Trends puts "preço gasolina" at about 10× "valor do kwh", but the interest
comes in news spikes. Fuel waits for the electricity gate. When it opens, it is one hub, with state
history and the ethanol-versus-gasoline ratio week by week, before any page per state.

### 4. Internal links

Today `/comparar/energia` has one inbound link, from the guide. The calculators link to each other
and to two posts. The new cluster is linked from the pages that already had impressions in July
(`/calculadora-conta-de-luz` first), from the home page and from `/calculadoras`. Every new page is
reachable from `/` in two clicks, has inbound links from at least three indexed pages, and links back
to the calculator that uses its number.

### 5. Head terms: stop

"calculadora salário líquido" and "clt vs pj" sat at 85–96 against sites that have ranked for years.
No more work targets them. The pages stay as they are, indexed and correct. Recorded in D8 with what
would reopen it.

## Interfaces it touches

- `src/server/adapters/aneel.ts`: reads more fields (`DscREH`, every period, not only the one in
  force).
- `scripts/refresh-aneel-snapshot.mjs` (new), generating `src/data/aneel-tariff-snapshot.ts`, the same
  way `scripts/refresh-anp-snapshot.mjs` feeds `src/data/anp-weekly-snapshot.ts`. Pages are
  prerendered at build, so the numbers are in the HTML Googlebot fetches.
- New routes under `src/routes/tarifa-de-energia/`, entries in `src/lib/seo-pages.ts`,
  `tests/seo-smoke.mjs`.
- The Worker's request handling, for the host redirect.
- Cloudflare DNS, for `www`. **Owner action.**

## Scope

**In:** hygiene (www, workers.dev, the two declined pages), the ANEEL snapshot, the hub, ten
distributor pages, internal links, the pilot gate, then the scale-out and the fuel hub if the gate
opens.

**Out:**
- a page per kWh value, per city or per query wording. That is the template-at-scale pattern the
  spam policy names;
- head-term work on `/calculadora-salario-liquido` and `/calculadora-clt-vs-pj`;
- new blog articles;
- the AdSense review (D7). It waits for traffic;
- fuel pages per state, the white tariff, solar payback per distributor and tax-inclusive tariffs.
  They go to `docs/IDEAS.md`;
- the cause of 2026-07-25 beyond what [[2026-11-14-search-cliff-2026-07-25]] closed. The one cheap
  check left, the Worker's version list for 2026-07-24..26, is a command for the owner in that note.

## Questions answered before building

| question | answer | where |
|---|---|---|
| Did the deploy cause the drop? | No. | [[2026-11-14-search-cliff-2026-07-25]] |
| Does the data carry history and comparison, or only today's number? | 16 years for 88 of 103 distributors, with the resolution per step. | [[2026-11-14-public-data-pages]] |
| What do competitors already show? | Current tariff, taxes, a bill simulation. Not history, not rank. | same |
| What does Google say about data pages at scale? | Purpose and value, no count. A page that re-shows one row is the "scraping feeds" example; a page per city or per number is the doorway example; history, rank and computed cost are the "substantial additional value" its questions ask for. Its own 2023 example of good automation is "sports scores, weather forecasts". | same |
| Is the site-level loss of trust a known thing? | Google's John Mueller, 2026-09-07, on generated pages: "Our systems have possibly lost faith in your site… Resolving this tends to take time & significant effort". Forum, not policy. | same |
| How much demand? | Measured, relative (Trends): "valor do kwh" ~3× "calculadora salário líquido", "preço gasolina" ~31×. ESTIMATE from one vendor figure ("conta de luz" 18.1K/month): "valor do kwh" ~700/month, "tarifa de energia" ~1,100, "preço gasolina" ~7,000, all low-confidence. Measured floor: one electricity page earned ~290 impressions a month in July. | same |

## How it gets tested, and what success looks like

Two clocks, kept apart:

- **Ours.** Every slice ends with a command whose output is the pass or fail: the `curl` loop over
  hosts, the page's numbers against the ANEEL API (N of N), the link graph over the built site,
  `pnpm run check`.
- **Google's.** URL Inspection and Search Console impressions for the new URLs, 28 and 42 days after
  the deploy. These decide D9.

**Success, in order:**
1. 28 days after the pilot deploys: 9 of the 11 pilot URLs indexed (`sitestats inspect`).
2. 42 days after: the 11 pilot URLs together earn **at least 100 impressions in 28 days**
   (`sitestats gsc --dim page`). For scale, July's `/calculadora-conta-de-luz` alone earned 230 in 24
   days, so this bar is below what one page once did. Under 20 is the stop signal.
3. Three months after the scale-out: the site back above July's 581 impressions in a calendar month.
   That is the only month this site has had traffic, so it is the honest yardstick.
