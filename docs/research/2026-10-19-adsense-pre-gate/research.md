---
tags: [research, area/content, 2026-10-19-adsense-pre-gate]
status: active
decided:
---

# Does the finished stack pass slice 7's gate before it reaches production?

> On the measurable half, yes. On a preview of the whole stack, no `auto` row fails. The five non-passing lines are two preview artifacts, two utility pages under a word threshold that is not Google's, and a web overlap the auditor never measures. The other half of the gate is Google's own view: Soft 404s and coverage. It cannot be measured until the stack is merged, deployed and re-crawled, so D7 is not written yet.

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

## Verdict

**Do not request review yet, and do not write D7 yet.** The measurable half of the gate passes on
the preview. The other half needs, in this order:

1. the owner merges #17 → #32;
2. on production, the slice-1 `curl` loop and `test:seo`, and the auditor's five scripts again,
   paced as here;
3. "Solicitar indexação" for the changed pages, then a wait for the re-crawl;
4. `sitestats inspect` over the 28 URLs: no Soft 404, and each `lastCrawlTime` after the deploy;
5. then D7, and the one review request.

## What this does not establish

- **That production will pass.** A preview is not the deployed site. The two artifacts above
  should disappear there, but that has to be measured.
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
