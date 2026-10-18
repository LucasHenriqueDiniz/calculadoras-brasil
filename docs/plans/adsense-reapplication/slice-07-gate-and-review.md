---
status: todo
---

# Slice 7 — Gate, record D6, request review once

## Delivers

1. **Full URL Inspection** over every URL in `src/lib/seo-pages.ts`, saved next to the 2026-10-18
   baseline as `measurements/url-inspection-<date>.json` in a new dated research note. Report the
   before and after per coverage state.
2. **A full `/adsense-site-auditor` run** against the deployed site, committed as its report.
   Pace it, one script at a time with pauses between them. Slice 1's `Done when` records why: a
   burst of scripted requests on 2026-10-18 was followed by this machine being unable to reach
   the site.
3. **D6** in `ARCHITECTURE.md`, inserted above D5:
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
