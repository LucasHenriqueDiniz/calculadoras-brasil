---
tags: [research, area/content, 2026-10-19-adsense-pre-gate]
status: active
decided:
---

# Does the finished stack pass slice 7's gate before it reaches production?

> On the measurable half, yes, first on a preview of the whole stack and then on production after the merge: no `auto` row fails, the 22 triaged URLs answer as triaged, and every calculator serves its new table. Google's half does not pass yet. `/calculadoras` is still a Soft 404, last crawled on 2026-10-13, and no URL has been crawled since the deploy. D7 waits for a re-crawl.

## What was blocking

Slice 7 requests one review, and only when four conditions hold
(`docs/plans/adsense-reapplication/slice-07-gate-and-review.md`). Two of them read Google's index
of the deployed site, and the deployed site is still `main`: none of #17–#32 is merged. Running
the gate against production now would measure the site Google already rejected. This note runs
what can be run beforehand, against a preview that has everything, so that anything the gate
would catch is fixed before the merge rather than after.

## Method

- **Target:** the Cloudflare branch preview of #32 (`feat-adsense-closeout`), which carries
  slices 1–6.
- **Tool:** the `adsense-site-auditor` skill's five scripts, run one at a time, 20 seconds
  apart, with the crawler at 1 second between pages. Slice 1 recorded that a burst of requests
  on 2026-10-18 was followed by this machine losing the site.
- **AdSense state:** `sitestats adsense-sites calculebrasil`. The plan said this command did not
  exist; it does.
- **Baseline:** the URL Inspection of 2026-10-18,
  `docs/research/2026-10-18-adsense-reapplication/measurements/url-inspection.json`, restricted
  to the 28 URLs in `src/lib/seo-pages.ts`.

## Findings

### 1. No `auto` row fails on the preview (measured)

| script | result | non-passing lines |
|---|---|---|
| `check_completeness.py` | 5 PASS | none |
| `check_technical.py` | 2 PASS, 1 note, 1 WARN | ADS-CRAWL-07 WARN: the sitemap is on `calculebrasil.com`, not on the preview host |
| `crawl_site.py` | 3 PASS, 1 MISS | ADS-CRAWL-05 MISS: every canonical points to `calculebrasil.com` |
| `analyze_text_depth.py`, 28 routes | 24 PASS, 2 notes, 2 WARN | WARN `/termos` 180 words, `/contato` 123; notes `/` 445, `/sobre` 363 |
| `check_duplicates.py`, 22 URLs | 1 PASS, 1 MISS | ADS-CONTENT-OVERLAP MISS, as on every run |

Raw outputs: `measurements/auditor-preview-*.txt`.

The crawl found exactly the 28 pages `seo-pages.ts` lists, all answering 200, with no redirects.

### 2. Two of the five are artifacts of measuring a preview (reasoned)

- **ADS-CRAWL-07:** `robots.txt` names the production sitemap, which production still serves with
  51 URLs. After the merge, host and sitemap are the same site, and the sitemap has 28 URLs.
  `test:seo` already asserts that.
- **ADS-CRAWL-05:** the canonical is the production URL by design. On production it is the page
  itself.

Both must be re-run on production. Neither is a defect.

### 3. Two are utility pages under the auditor's threshold, not Google's (measured, then a choice)

`/termos` has 180 words and `/contato` 123. The auditor's own documentation calls its 300 words
"a review threshold, not a Google policy line". The terms cover the service, the absence of
advice, liability, intellectual property, changes and jurisdiction. The contact page has a
channel, a response time and what to write about. Lengthening either to clear a count would be
padding. `/termos` is a legal document and stays the owner's to change.

### 4. The overlap row is never measured by the script (by design)

ADS-CONTENT-OVERLAP is `MISSING` on every run: the auditor performs no search. It was measured by
hand on 2026-09-10 at 0,41%, a level that rules out copying and nothing else
([[2026-09-10-adsense-content-overlap]]).

### 5. Google's half: the baseline, and why it waits (measured)

Of the 28 URLs that stay, Google's verdict on 2026-10-18 was:

| coverage | URLs |
|---|---|
| Submitted and indexed | 20 |
| Discovered – currently not indexed | 5 |
| URL is unknown to Google | 2 |
| Soft 404 | 1 (`/calculadoras`) |

The gate asks for no Soft 404. `/calculadoras` gained editorial content in slice 2, but Google
re-classifies a page only after it re-crawls the deployed version. AdSense still reports the
site as `NEEDS_ATTENTION` (`measurements/adsense-site-state.txt`).

### 6. On production after the merge, 2026-10-19 (measured)

The stack, #17 to #32, was merged as squash commits on 2026-10-19, and production serves `main` at
`1b607bb`. Its tree is the one the full gate passed on (`bf6daff`), plus the deployed-preview table
for slice 2 that the stack had lost.

| check | result |
|---|---|
| slice-1 triage, 22 URLs | 22 of 22 answer with their status and target (`measurements/triage-production.txt`) |
| internal links to removed paths | none; the two matches are the `mudanca` section id on `/metodologia` |
| new content on 14 pages | 26 of 26 strings, every calculator's table included |
| auditor, completeness | 5 PASS |
| auditor, technical | 3 PASS and 1 note. The preview's sitemap WARN is gone |
| auditor, crawl with `--verify-canonical --verify-stateless` | 4 PASS on 28 pages. The preview's canonical MISS is gone |
| auditor, text depth on 28 routes | 24 PASS, 2 notes (`/` 445, `/sobre` 363), 2 WARN (`/termos` 180, `/contato` 123) |
| auditor, duplicates on 22 URLs | PASS; the web-overlap row MISS as always |
| AdSense | `NEEDS_ATTENTION` |

Raw outputs: `measurements/auditor-production-*.txt`.

**This machine's `curl` got no response from the site, while Python and the browser did.** It
connected over IPv4 and IPv6 and then timed out, with or without a browser user agent. Python's
client got 200 in 0,26 s on the same URL. The checks above ran from Python, 2 seconds apart. Slice 1
recorded the same symptom after a burst of requests on 2026-10-18. The likely cause is Cloudflare
holding `curl`'s TLS signature from this address. It is not a fault of the site.

**Google's view on the same day** (`measurements/url-inspection-production-2026-10-19.json`), for
the 28 URLs:

| coverage | 2026-10-18 | 2026-10-19 |
|---|---|---|
| Submitted and indexed | 20 | 20 |
| Discovered – currently not indexed | 5 | 4 |
| URL is unknown to Google | 2 | 3 |
| Soft 404 | 1 | 1 (`/calculadoras`, last crawled 2026-10-13) |

No URL had been crawled since the deploy. The three changes are among the pages not indexed:
`/blog` and `/privacidade` went from discovered to unknown, and `/contato` the other way. The
eight URLs not indexed are `/calculadoras`, `/calculadora-custo-carro`,
`/calculadora-custo-mudanca`, `/calculadora-inss-autonomo`,
`/calculadora-previdencia-complementar`, `/blog`, `/privacidade` and `/contato`.

## Verdict

**Do not request review yet, and do not write D7 yet.** Three of the gate's four conditions pass on
production. The fourth, no Soft 404, waits on Google:

1. ⚠️ **Owner:** in Search Console, resubmit `sitemap.xml`, which now lists 28 URLs instead of 51.
   Then "Solicitar indexação", in this order, as the daily quota allows: `/calculadoras` first,
   because it is the Soft 404; then the four calculators not indexed; then the eight
   indexed calculators whose content changed most.
2. When `sitestats inspect` shows `/calculadoras` crawled after 2026-10-19 and not a Soft 404:
   D7, then one review request.

## What this does not establish

- **That Google will index more of the 28.** Coverage is Google's call, and it moves on Google's
  crawl schedule.
- **That the `judgement` rows pass.** Every one now cites written evidence:
  [[2026-10-18-adsense-added-value]] for the 12 calculators, and
  `docs/adsense/owner-attestations.md` for the owner rows. Whether Google agrees is what the
  review is for.
- **The seven kept blog articles.** They were not re-read against sources in slices 3–6 (slice 6
  notes).

## Sources

- `adsense-site-auditor`, scripts at the version in `~/dev/pessoal/adsense-site-auditor` on
  2026-10-19 — `measurements/auditor-preview-*.txt`.
- AdSense Management API v2, `accounts.sites.list`, via `sitestats adsense-sites` —
  `measurements/adsense-site-state.txt`.
- Search Console URL Inspection, 2026-10-18 —
  `docs/research/2026-10-18-adsense-reapplication/measurements/url-inspection.json`.
