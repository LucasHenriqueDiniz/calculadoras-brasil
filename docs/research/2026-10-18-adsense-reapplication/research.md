---
tags: [research, area/content, 2026-10-18-adsense-reapplication]
status: active
decided:
---

# What does Google say, and what does Google measure, about calculebrasil.com before it goes back for review?

> Google declines to index 31 of the site's 51 public pages, and has shown the site almost nowhere since 2026-07-25. The two longest blog articles were crawled and turned down, so the gap is not length. Google measures `/calculadoras` as an empty page. A review covers the whole site. Fix it as one batch, and treat the pages Google already declined as the cheapest place to cut.

## What was blocking

The Research needed list of [[adsense-reapplication]] had seven open items. Two were carried over
from [[adsense-low-value-rejection]] and had been open since 2026-09-10. The pitch could not settle
its own scope without them. The biggest open choice was what to do with a page that has nothing to
add, and the risk of a second rejection depends on whether a review re-reads the whole site.

This round **measured** the site through Google's own APIs before reading anything Google wrote
about it. That was not possible on 2026-09-10, because the `site-stats` token was not used then.

## Method

| what | how | measured or cited |
|---|---|---|
| AdSense state and policy issues | AdSense Management API v2: `accounts.sites.list`, `accounts.policyIssues.list` | measured |
| index state of every public URL | Search Console URL Inspection API over the 51 URLs in `src/lib/seo-pages.ts` | measured |
| search visibility over time | Search Console Search Analytics, daily and per page, 2025-06-01 to 2026-10-16 | measured |
| sitemap read by Google | Search Console Sitemaps API | measured |
| depth of every page | the auditor's `analyze_text_depth.py --min-words 450`, live site | measured |
| near-duplication inside the blog's topic clusters | the auditor's `check_duplicates.py --threshold 0.3` | measured |
| when the pages were created | `git log --follow --diff-filter=A` over `src/routes/` | measured |
| what Google publishes | 10 Google pages, all primary, in `fetches/` | cited |

Raw outputs are in `measurements/`, one file per call. All of them were taken on 2026-10-18.
Search Analytics stops at 2026-10-16 because of the API's usual two-day lag.

The fetch files keep short quotes and paraphrase the rest, not the full page text. Every claim in
them names the page it came from.

## Findings

### 1. The site is in a readiness state, not a policy one (measured)

The AdSense API returns `state: NEEDS_ATTENTION` for `calculebrasil.com` and **zero** policy issues
for the account. "Conteúdo de baixo valor" is therefore a Sites-page readiness verdict. Nothing in
the Policy center enforces it. That matters for finding 6.

### 2. Google has declined most of the site (measured)

URL Inspection, 51 public URLs:

| coverage state | URLs |
|---|---|
| Submitted and indexed | **20** |
| Discovered – currently not indexed | 21 |
| URL is unknown to Google | 7 |
| Crawled – currently not indexed | 2 |
| Soft 404 | 1 |

| section | indexed |
|---|---|
| calculators | 8 of 12 |
| blog articles | 7 of 26 |
| comparisons | 1 of 4 |
| hubs and institutional | 4 of 9 |

Every one of the 51 URLs is in `sitemap.xml`. Google downloaded the sitemap on 2026-10-18 and
reported 0 errors and 0 warnings. Discovery is not the problem: Google knows where the pages are
and is choosing not to fetch or keep most of them. The seven "unknown" URLs are the exception. The
data here does not explain why a sitemap-listed URL is unknown, and the API's `indexed` field for
the sitemap reads `0`, a field that is not a reliable count.

**Linking every page did not move this.** The message of #15 (2026-09-12) records 23 of 50
sitemap URLs indexed and 27 discovered but not indexed, with `/blog` answering 404 and 25 of 26
articles carrying no inbound internal link. #15 fixed both and made the smoke test fail on any
orphaned route. Five weeks later the count is 20 of 51. The rejection on 2026-09-07 also predates
that fix: on the day of the review, the blog hub was a 404. That figure is cited from the commit
message, not re-measured.

Not indexed:

- calculators: `/calculadora-custo-carro`, `/calculadora-custo-mudanca`,
  `/calculadora-previdencia-complementar`, and `/calculadora-inss-autonomo` (unknown)
- hubs: `/calculadoras` (**Soft 404**), `/comparar` (unknown), `/blog`
- institutional: `/privacidade`, `/contato` (unknown)
- 19 of 26 blog articles, and 3 of 4 comparisons

### 3. Length is not what Google is filtering on (measured)

Google **crawled and turned down** the two longest blog articles on the site:
`/blog/quanto-custa-morar-sozinho` (1619 words) and `/blog/guia-irpf-2026` (1579). Of the four
articles that reach 1200 words, which #13 counted as closing `ADS-COMPLETE-02`, **none** is
indexed. Meanwhile `/blog/como-economizar-conta-de-luz` (494 words) and
`/blog/assinaturas-que-valem-a-pena` (547) are indexed.

The expansion that #2 (2026-07-27) and #13 (2026-09-10) made to raise word counts closed an
auditor row and moved nothing Google measures. This is the measured version of what
[[adsense-reapplication]] argued: padding a page to the median moves the number and not the
answer.

### 4. Google measures `/calculadoras` as empty (measured)

URL Inspection classifies `/calculadoras` as a **Soft 404**. Google's own definition, in
`fetches/search-console-page-indexing-report.md`, is a page that reads as "not found" or empty
while returning 200. This is no longer the auditor's inference about a hub page. It is Google's
verdict on that page. `/comparar` is unknown to Google, and `/blog` was discovered but never
crawled.

### 5. Search visibility collapsed on 2026-07-25, and no announced update explains it (measured, then cited)

| window | impressions | per day | clicks |
|---|---|---|---|
| 2026-06-23 – 2026-06-30 | 6 | 0.75 | 0 |
| 2026-07-01 – 2026-07-24 | **581** | **24.2** | 5 |
| 2026-07-25 – 2026-10-16 | **18** | **0.21** | 0 |

That is a 99% drop, from one day to the next. The Search Status Dashboard lists **no ranking
incident in July 2026** (`fetches/search-status-dashboard-ranking-history.md`).

Two things from `git log` sit next to that date:

- commit `efed25d` on 2026-07-27 says Google had **already** flagged the site for low-value
  content, so 2026-09-07 is at least the **second** rejection, not the first;
- commit `bbe7431`, the same day, fixed a deploy that pointed at a Cloudflare Pages project that
  did not exist.

Neither proves the cause. AdSense review and Search ranking are separate systems, and no source
fetched links them.

### 6. A review covers the whole site, and repeated rejections may lock the button (cited)

- The review is of the **whole site**: "We review your entire site to check it complies"
  (`fetches/adsense-connect-site.md`). Fixing part of it does not get the rest of the site waved
  through.
- It takes a few days, or 2–4 weeks (`fetches/adsense-site-status.md`).
- The button "will be inactive if your site has been reviewed and rejected several times recently",
  and a date is given for the next attempt. This is documented **only on the Policy center page**
  (`fetches/adsense-fix-policy-issues.md`), and finding 1 shows this site has no Policy center
  issue. Search snippets attributed the same sentence to two Sites-page articles, but the live
  pages do not contain it (`fetches/adsense-inactive-sites.md`).

### 7. Google's own words for what is missing (cited)

No Google page gives a threshold. The vocabulary repeats across all of them:

| source | wording |
|---|---|
| AdSense rejection categories | not enough original, rich content of value to users; no ad code on auto-generated pages or pages with little original content |
| Publisher Policies, inventory value | no ads on screens without publisher content, with low-value content, or used for navigation; auto-generated content without curation |
| Search, helpful content | original information, research or analysis; substantial value compared with other pages in search results |
| Search, spam policies | scaled content abuse: many pages generated, including with generative AI, without adding value for users |
| Search, Who/How/Why | bylines where expected; disclose automation where a reader would wonder how content was made |

Two notes on that table:

- The "used for navigation" clause in the Publisher Policies is the closest Google wording to
  finding 4. Applying it to `/calculadoras` is an inference.
- On creation dates: 52 of the 53 public route files were first committed between 2026-06-23 and
  2026-06-26, 40 of them on 25–26 June. Publishing fast is not the violation the spam policy
  describes. Many pages without added value is.

### 8. The blog's topic clusters are not near-duplicates of each other (measured)

`check_duplicates.py` at a 30% threshold found **no** near-duplicate group in the IRPF cluster (7
articles plus the calculator) or the PJ/autônomo cluster (8 articles plus the calculator). The blog
is not repeating itself in text. Whatever Google is declining in it, it is not copies.

## Verdict, item by item

| pitch research item | answer |
|---|---|
| What does Google publish about low value and added value? | No thresholds anywhere. The repeated test is original information or analysis that adds substantial value **compared with what already ranks**, plus no auto-generated or navigation-only screens (finding 7). |
| Cooldown, and whole site or only changes? | **Whole site** (primary). No cooldown is documented for readiness reviews. A lockout after "several" recent rejections is documented for Policy center reviews only, and this site has been rejected at least twice. **Ship as one batch and request review once.** A partial batch risks a third rejection on a whole-site review, for no gain. |
| Which pages does Google index? | 20 of 51 (finding 2). Since 2026-07-25 the site has had nearly zero impressions (finding 5). |
| Do the blog clusters read as mass-produced? | Not by text: no near-duplicates (finding 8). But Google declined 19 of 26 articles, including the two longest (finding 3). The signal is not similarity. It is that Google does not find enough value in them to keep them. |
| Named authorship on `/sobre`? | Search guidance asks for bylines where readers expect them, and for a disclosure of how content is produced where they would wonder. No AdSense page cites that guidance. It is cheap and honest, and it is the owner's call, especially the part about how the content was produced. |
| What counts as added value for a calculator? | Google's words are original information, research or analysis, and substantial value against the pages that rank. Engine-generated tables and worked examples fit that wording. That is consistent, not proven. Building on `/calculadora-salario-liquido` first stands. |
| Deepen, merge or drop? | Still a per-page decision. But the one-way cost the pitch worried about is **close to zero for the 31 pages Google never indexed**: they have no impressions or rankings to lose. Dropping or merging them is cheap. Dropping an indexed calculator is not. |

### What this changes in [[adsense-reapplication]]

1. **The blog is not out of scope any more.** "Rewriting the 26 articles" stays out. **Consolidating
   or removing the 19 that Google declined** is the cheapest change with the most direct link to
   what Google measured, and it is reversible in substance because those pages carry nothing.
2. **The hub pages move from "below 450 words" to "Google calls one of them empty".** Step 2 of
   the pitch stays and gets more urgent, and its success criterion should be the Soft 404 clearing,
   not a word count.
3. **Word count stops being a success criterion anywhere.** Finding 3 shows it does not predict
   what Google keeps. The criterion becomes the coverage state from URL Inspection, measured with
   the same call as here.
4. **Request review once, after everything ships.** This was a research question and is now an
   answer.

## The strongest case against

**The site is simply too young, and none of this matters.** It went live around 2026-06-23 and was
rejected about one month and about ten weeks later. Many publishers report rejections they blame
on site age. Against it:

- no Google page fetched sets an age requirement;
- a young site would ramp up, while this one had 24 impressions a day and lost 99% of them
  overnight;
- Google has left 21 sitemap-listed pages uncrawled for months. Its own definition allows a
  server-load reason for that, which is hard to credit for 51 pages on Cloudflare's edge.

Age may be part of it. It does not explain the cliff or the Soft 404, and nothing the owner can do
changes it except wait. Waiting is compatible with everything above.

**The cliff was an outage, not a judgement.** The deploy fix two days later (finding 5) leaves
this open. It cannot be checked after the fact: the Workers logs for July are not available here, and no
crawl-error history was pulled. Today every URL answers 200, 16 of the 20 indexed pages were
crawled in October, and Google still declines the rest. So an outage in July does not explain the
state in October.

## What this does not establish

- **Why Google's AdSense reviewer decided what it decided.** AdSense review and Search indexing
  are separate systems. Everything in findings 2–5 is Search data, and its link to the AdSense
  verdict is an inference from shared vocabulary (finding 7), not a documented mechanism.
- **The date and reason of the first rejection.** Commit `efed25d` says it happened before
  2026-07-27, and the AdSense API does not return state history. The owner may have the email.
- **Whether the rejection-limit applies to readiness reviews.** It is documented for the Policy
  center only.
- **Why seven sitemap-listed URLs are "unknown to Google".**
- **Whether removing pages helps an AdSense review**, as opposed to Search. No Google page fetched
  says it does. It is argued here from cost: those pages carry nothing to lose.
- **What happened on 2026-07-25.** It is measured as a date and not as a cause.

## Sources

- [Check the status of your AdSense sites](https://support.google.com/adsense/answer/12170222?hl=en) — `fetches/adsense-site-status.md` — the three site states, review time, request flow
- [Your AdSense account wasn't approved](https://support.google.com/adsense/answer/81904?hl=en) — `fetches/adsense-account-not-approved.md` — Google's wording for content-quality rejections
- [Connect your site to AdSense](https://support.google.com/adsense/answer/7584263?hl=en) — `fetches/adsense-connect-site.md` — the review covers the entire site
- [Fix policy issues that affect ad serving](https://support.google.com/adsense/answer/3229242?hl=en) — `fetches/adsense-fix-policy-issues.md` — button inactive after several rejections, Policy center only
- [Inactive sites and requesting a review](https://support.google.com/adsense/answer/9393996?hl=en) — `fetches/adsense-inactive-sites.md` — does **not** carry the rejection-limit sentence that search snippets attributed to it; [12171038](https://support.google.com/adsense/answer/12171038?hl=en) checked the same day, same result
- [Google-served ads on screens without publisher-content](https://support.google.com/publisherpolicies/answer/11112688?hl=en) — `fetches/publisher-policies-screens-without-content.md` — low-value and navigation screens
- [Spam policies for Google web search](https://developers.google.com/search/docs/essentials/spam-policies) — `fetches/search-spam-policies-scaled-content.md` — scaled content abuse
- [Page indexing report](https://support.google.com/webmasters/answer/7440203?hl=en) — `fetches/search-console-page-indexing-report.md` — definitions of the coverage states in finding 2
- [Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) — `fetches/search-creating-helpful-content.md` — added value against what ranks; Who/How/Why
- [Search Status Dashboard, ranking history](https://status.search.google.com/products/rGHU1u87FJnkP6W2GwMi/history) — `fetches/search-status-dashboard-ranking-history.md` — no ranking incident in July 2026
- Search Engine Roundtable and other trackers on July 2026 volatility — **seen in search results only, not fetched, not relied on**
- Measurements — `measurements/`: `adsense-site-state.txt`, `url-inspection.json`, `gsc-daily.json`, `gsc-pages.json`, `gsc-sitemaps.json`, `text-depth-450.txt`, `blog-cluster-duplicates.txt`
