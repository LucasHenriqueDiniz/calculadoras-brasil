---
status: doing
---

# Slice 7 — Gate, record D7, request review once

## Delivers

1. **Full URL Inspection** over every URL in `src/lib/seo-pages.ts`, saved next to the 2026-10-18
   baseline as `measurements/url-inspection-<date>.json` in a new dated research note. Report the
   before and after per coverage state.
2. **A full `/adsense-site-auditor` run** against the deployed site, committed as its report.
   Pace it, one script at a time with pauses between them. Slice 1's `Done when` records why: a
   burst of scripted requests on 2026-10-18 was followed by this machine being unable to reach
   the site.
3. **D7** in `ARCHITECTURE.md`, inserted at the top of the decisions:
   - the decision to reapply;
   - the coverage numbers before and after;
   - the auditor verdict;
   - the date.

   Or the decision **not** to reapply yet, and why. That is a legitimate outcome of this slice.
4. ⚠️ **Owner:** one review request on the AdSense Sites page.

## Needs

Slices 1–6 done. Slice 6 in particular, because the auditor cannot pass owner rows nobody
answered.

**The gate.** Request review only when all four hold:

| condition | measured by |
|---|---|
| no public URL is a Soft 404 | `sitestats inspect` over `seo-pages.ts` |
| every sitemap URL is one the work chose to keep, and every triaged URL serves its status | the slice-1 `curl` loop and `seo-pages.ts` |
| no `auto` row fails | the auditor report |
| every `judgement` row cites written evidence | the auditor report, read against the added-value research note |

If one fails, fix it and run the gate again. A partial request risks a third rejection on a
whole-site review.

## Tests

The gate is the test.

## Done when

The AdSense API reports the site as `GETTING_READY`:

```
sitestats adsense-sites calculebrasil
```

`adsense-sites` does not exist yet. It is the `accounts.sites.list` call from the research's
scratch script, added to `sitestats` the same way `inspect` was in slice 2. A `READY` or
`NEEDS_ATTENTION` result then closes the epic, either way, with a postmortem.

---

## What actually happened — 2026-10-19 (pre-gate; the gate itself waits for the merge)

- **`sitestats adsense-sites` already exists.** The line above saying it does not is out of date.
  On 2026-10-19 it reports `NEEDS_ATTENTION calculebrasil.com`.
- **The gate cannot run yet.** Two of its four conditions read Google's index of the deployed
  site, and production is still `main`: #17–#32 are open. Running it now would measure the site
  Google already rejected.
- **The pre-gate ran on the preview of #32**, which carries slices 1–6. The five auditor scripts
  ran one at a time, 20 s apart, with the crawler at 1 s per page
  ([[2026-10-19-adsense-pre-gate]]). **No `auto` row fails.** The non-passing lines:

  | line | why it is not a defect |
  |---|---|
  | ADS-CRAWL-07 WARN, sitemap on another host | the preview's `robots.txt` names production's sitemap |
  | ADS-CRAWL-05 MISS, canonical elsewhere | canonicals point to production by design |
  | ADS-CONTENT-03 WARN, `/termos` 180 and `/contato` 123 words | utility pages; 300 is the auditor's review threshold, not Google's, and padding them would be worse |
  | ADS-CONTENT-OVERLAP MISS | the script never searches; measured by hand at 0,41% on 2026-09-10 |

  The crawl found the 28 pages of `seo-pages.ts`, all 200, with no redirects.
- **D7 is not written yet.** The research's verdict: do not request review until steps 1–4
  below have run.

### Remaining, in order

1. ⚠️ **Owner:** merge #17 → #32.
2. On production: the slice-1 `curl` loop, `test:seo` against the live site, and the five auditor
   scripts again, paced as on 2026-10-19. The two preview artifacts should be gone.
3. ⚠️ **Owner:** "Solicitar indexação" for the changed pages, then wait for the re-crawl.
4. `sitestats inspect` over the 28 URLs: no Soft 404, and every `lastCrawlTime` after the deploy.
   On 2026-10-18 the 28 were 20 indexed, 5 discovered and not indexed, 2 unknown and 1 Soft 404
   (`/calculadoras`).
5. D7 in ARCHITECTURE.md, then ⚠️ **owner:** one review request.
