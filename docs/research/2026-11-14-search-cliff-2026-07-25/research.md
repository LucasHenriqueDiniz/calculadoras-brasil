---
tags: [research, area/seo, 2026-11-14-search-cliff-2026-07-25]
status: active
decided: 2026-11-14
---

# Why did Google stop showing calculebrasil.com on 2026-07-25?

> The cause is still unknown. The deploy lead is refuted: production did not change between 2026-06-26 and 2026-07-27, and the build never took the site down. What is left points at Google's side, a site-wide drop, and the plan has to work under it rather than wait for it to be explained.

## What was blocking

The plan to bring traffic back depends on this answer. If a broken deploy caused the drop, fixing
infrastructure is the plan. If Google demoted the site as a whole, new pages inherit the demotion and
have to be built and measured with that in mind.

The lead handed to this research: on 2026-07-27 the deploy moved from Cloudflare Pages to Workers, and
the build was red until about 2026-08-30.

[[2026-10-18-adsense-reapplication]] already measured the date of the drop (finding 5) and left the
cause open. This note picks it up from there.

## Findings

### 1. The drop is one day, every page, every position (measured)

`measurements/gsc-daily-2026-06-20-to-2026-11-12.json`, Search Console API, web search:

| window | impressions | per day | clicks |
|---|---|---|---|
| 2026-07-01 – 2026-07-24 | 581 | 24.2 | 5 |
| 2026-07-24 alone | 41 | — | 0 |
| 2026-07-25 alone | **0** | — | 0 |
| 2026-07-25 – 2026-11-12 (111 days) | 25 | 0.23 | 0 |

On 2026-07-24, six pages had impressions. On 2026-07-25, none did:

| page | impressions on 07-24 | position on 07-24 |
|---|---|---|
| `/calculadora-clt-vs-pj` | 12 | 91.4 |
| `/calculadora-assinaturas` | 11 | 6.0 |
| `/calculadora-conta-de-luz` | 11 | 7.5 |
| `/calculadora-custo-pet` | 5 | 5.6 |
| `/calculadora-irpf-2026` | 1 | 83 |
| `/calculadora-salario-liquido` | 1 | 87 |

Pages at position 6 and pages at position 91 went to zero on the same day. A ranking change that moves
a page from 8 to 50 still leaves it some impressions. This looks like the site stopped being shown,
not like it slid.

The 25 impressions since then are scattered single queries at positions 3–99, so the site is not
removed from the index.

### 2. Production did not change on or near 2026-07-25 (measured)

`measurements/deploy-timeline.tsv`, from the GitHub Actions API and `git show`:

| when (UTC) | what ran | result |
|---|---|---|
| 2026-06-25 13:43 → 2026-06-26 14:05 | `deploy-cloudflare.yml`, `wrangler deploy` to the Worker `calcule-brasil` | 13 successful deploys; the last is `59386d8` |
| 2026-06-26 15:06 | `79a2e3b` replaces it with `deploy.yml`: `pages deploy dist --project-name=brasil-calculadoras` | failure |
| 2026-06-26 → 2026-07-27 | no commit on `main` | nothing to deploy |
| 2026-07-27 11:47 | `efed25d`, "Deploy to Cloudflare Pages" | failure (Pages project does not exist) |
| 2026-07-27 11:56 | `bbe7431`, back to `wrangler deploy` | success, first deploy in 31 days |
| 2026-08-06 13:42 | Workers Builds takes over (`446d5ce`) | success |
| 2026-08-18, 2026-09-01 (×2) | Workers Builds on `main` | success |

So the lead does not hold:

- **The site never ran on Pages.** It was the Worker `calcule-brasil` in June and stayed the Worker.
  From 2026-06-26 to 2026-07-27 the *workflow* pointed at a Pages project that did not exist, so
  nothing was deployed, and the Worker kept serving `59386d8`. That build served 41 impressions on
  2026-07-24 and 0 on 2026-07-25.
- **The red builds were previews.** The failures around 2026-08-30 are on the PR branch
  `chore/migrate-to-pnpm` (the Worker's Deployments screen lists them as "Failed … chore/migrate-to-pnpm").
  Every Workers Builds check on `main` from 2026-08-06 on is `success`. Production was never replaced by
  a failed build.
- **The impressions were already zero two days before `bbe7431`.**

### 3. Nothing on the Cloudflare zone changed, and Google lists no action (measured)

`measurements/console-and-dashboard-2026-11-14.md`:

- Cloudflare audit log, 2026-07-15 .. 2026-08-04, domain `calculebrasil.com`: no records. No DNS,
  SSL, zone-setting or route change.
- Search Console: no manual action, no security issue, and "Nenhuma solicitação enviada nos últimos
  seis meses" under Removals. Six months back from today covers 2026-07-25.

### 4. Google indexes the site but does not surface it for its own name (measured)

`measurements/serp-and-hosts-2026-11-14.md`:

- `site:calculebrasil.com` and `"calculebrasil.com"` both list the site's pages.
- `calculebrasil`, unquoted, is rewritten to "calcule brasil", and page 1 is nine other calculator
  sites. calculebrasil.com is not on it.
- URL Inspection over the 28 sitemap URLs on 2026-11-14
  (`measurements/url-inspection-sitemap-2026-11-14.txt`): **26 "Submitted and indexed"**, 2 "Crawled -
  currently not indexed" (`/blog/assinaturas-que-valem-a-pena`, last crawl 2026-10-14, and
  `/comparar/energia`, 2026-09-20). Every calculator that earned July's impressions is indexed, crawled
  between 2026-10-20 and 2026-11-14.

26 indexed pages earned 25 impressions in 111 days. In July, 4 of them earned 471 in 24 days.

A site that is indexed, has no manual action, and still cannot rank for its own domain name is the
profile of a site-wide judgement, not of a page-level one. That is an inference: Google does not report
algorithmic demotions anywhere a site owner can read them.

### 5. Most of July's impressions were long-tail queries Google does not list (measured)

`measurements/gsc-query-page-2026-07-01-to-07-24.json`: the query-and-page rows add up to 152 of the
581 impressions. The other ~74% came from queries Search Console withholds as rare.

- `/calculadora-conta-de-luz`: 230 impressions at position 8.2, but only 5 visible queries, one
  impression each: "39 kwh em reais", "54 kwh mês quanto custa", "55 kwh/mes valor", "quanto custa 26
  kwh em reais", "como calcular o valor do kwh da conta de luz". The page earned its July from
  hundreds of different "N kWh em reais" questions.
- `/calculadora-assinaturas` (138 impressions, 4 clicks) and `/calculadora-custo-pet` (52) show one
  visible query each, "quero ajuda" and "sim", both at position 1. Those read like follow-ups typed into
  a conversation rather than searches. That is an inference about where they came from.
- 555 of 581 impressions came from Brazil.

### 6. Google announced nothing that week (cited)

The Search Status Dashboard lists the June 2026 spam update (2026-06-24 to about 06-26) and the August
2026 spam update (from 2026-08-18), and nothing in July
(`../2026-10-18-adsense-reapplication/fetches/search-status-dashboard-ranking-history.md`).

## Verdict

**Unknown, with the deploy cause ruled out.**

| candidate | status | evidence |
|---|---|---|
| Pages → Workers deploy, red build | **ruled out** | finding 2 |
| zone change (DNS, SSL, routes) | **ruled out** for 07-15..08-04 | finding 3 |
| owner removal request | **ruled out** | finding 3 |
| manual action | **none today**; Search Console keeps no history of a lifted one | finding 3 |
| a deploy outside GitHub on 07-24/25 | **not ruled out**, unlikely: no commit existed to deploy | the Worker's version list was not read to the day; command in `measurements/console-and-dashboard-2026-11-14.md` |
| server errors on 07-25 | **not ruled out**: crawl stats start 2026-08-15 and July's Worker logs are gone | an outage would not keep an indexed site at zero for four months |
| unannounced site-wide algorithmic demotion | **most consistent with the shape**, not provable | findings 1, 4, 6 |

Google's John Mueller described the same shape on 2026-09-07, to the owner of another site of
generated pages: "Our systems have possibly lost faith in your site providing good value to users based
on the old pages", and "Resolving this tends to take time & significant effort to show the value"
([[2026-11-14-public-data-pages]], finding 2). A forum statement about a different site, so an
analogy, not evidence about this one.

The site matches the profile the spam policy describes as scaled content: 52 of 53 route files
committed between 2026-06-23 and 2026-06-26, 40 of them on 25 and 26 June
([[2026-10-18-adsense-reapplication]] finding 7), most of them articles written with an AI model, as
the June commit trailers record. The October work removed 22 of them. Whether Google has re-assessed the
site since is not visible from outside.

### What this changes in the plan

1. **No infrastructure fix will bring July back.** There is nothing broken to fix. The `www` record and
   the `workers.dev` duplicate are hygiene, not the cause.
2. **New pages can inherit the demotion.** Build a small pilot first and measure whether Google shows
   it before building 130 pages. If a pilot of real-data pages gets indexed and still earns no
   impressions where weaker competitors rank, that is the best evidence of a site-wide demotion this
   site can get, and it says to stop adding pages.
3. **Do not repeat the June pattern.** Many pages published together from one template is exactly what
   the scaled-content policy names. The data pages go out in small batches, each one carrying numbers
   no other page on the site has.

## The strongest case against

**There was no demotion: the site just lost a new-site boost.** It went live on 2026-06-23, climbed for
three weeks and fell on 2026-07-25. SEO forums describe a "honeymoon" in which Google shows new pages
widely while it gathers signals, then settles them where those signals put them. No Google page fetched
here documents such a mechanism, so it is folklore with a matching shape. If it is true, the
conclusion is the same: the site has no standing signal of its own, and only pages that earn one will
rank. The plan does not depend on which story is right.

**It was an outage.** The cache, the edge or the origin could have failed on 2026-07-25 and nothing
recorded it. But 16 of the 20 indexed pages were re-crawled in October with 200s, and impressions
stayed at zero, so an outage in July does not explain November.

## What this does not establish

- **The cause.** Everything above narrows it; nothing names it.
- **Whether a manual action existed and was lifted.** Search Console shows current actions only.
- **The Worker versions created between 2026-06-26 and 2026-07-27.** The dashboard gives ages, not
  dates; the API call was refused in this session.
- **Whether the July queries were AI Mode.** "sim" and "quero ajuda" at position 1 suggest a
  conversational surface; the API does not say which surface an impression came from.

## Sources

- Search Console API, `sitestats gsc` — `measurements/gsc-*.json` — daily totals, pages and queries
- GitHub Actions API and `git show` — `measurements/deploy-timeline.tsv` — what was deployed when
- Search Console UI and Cloudflare dashboard — `measurements/console-and-dashboard-2026-11-14.md` — manual
  actions, removals, crawl stats, audit log, Worker versions
- google.com.br and `curl` — `measurements/serp-and-hosts-2026-11-14.md` — brand query, `site:`, hosts
- URL Inspection API, `sitestats inspect` — `measurements/url-inspection-sitemap-2026-11-14.txt` — index state of the 28 sitemap URLs
- [Google Search Status Dashboard](https://status.search.google.com/products/rGHU1u87FJnkP6W2GwMi/history) —
  `../2026-10-18-adsense-reapplication/fetches/search-status-dashboard-ranking-history.md` — no July 2026 update
