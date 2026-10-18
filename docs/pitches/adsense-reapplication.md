---
status: active
epic: adsense
---

# The fixes shipped, and the reason Google gave is still untouched

## The problem

On **2026-10-18** the AdSense site panel still reads exactly what it read on
**2026-09-07 at 21:53 GMT-3**:

| column | value |
|---|---|
| status | **Requer atenção** |
| reason | **Conteúdo de baixo valor** |
| ads.txt | Autorizado |

The date has not moved, so no review has been requested since the rejection.
Between the two dates, #13 (2026-09-10) and #15 (2026-09-12) shipped the
mechanical half of [[adsense-low-value-rejection]]. Measured on the live site
on 2026-10-18, not read off the old pitch, whose checkboxes still show all of
it as open:

| item | 2026-09-07 | 2026-10-18 | how measured |
|---|---|---|---|
| `ADS-PRIV-04` consent | `__tcfapi` undefined | `function`; Funding Choices serving, `__tcfapiLocator` iframe present | browser, `/calculadora-salario-liquido` |
| `ADS-CRAWL-05` canonical answers 200 | 307 | 200 | `curl`, D4 |
| `ADS-CRAWL-04` permanent redirect | 307 | 307 on the slash form only, which nothing links | `curl`, D4 |
| `ADS-CRAWL-07` `/calculadoras` | orphaned | in `seo-pages.ts` and `seo-smoke.mjs` | `grep` |
| `ADS-CONTENT-03` `blog/quanto-custa-morar-sozinho` | 286 words | 1619 | `analyze_text_depth.py` |
| `ADS-COMPLETE-02` articles at 1200+ | 2 | 4 | `analyze_text_depth.py` |
| auditor skill installed | no | symlinked into `~/.claude/skills/` | `ls` |

Every item in that table is the part the old pitch's Appetite called *"small and
known"*. None of them is what Google said. What Google said is
"Conteúdo de baixo valor", and the rows that speak to it are untouched:

| still open | state on 2026-10-18 |
|---|---|
| `ADS-CONTENT-ORIGINAL`, `ADS-CONTENT-ADDED-VALUE`, `ADS-CONTENT-01` | Never reviewed against a competitor. The old pitch promoted this to **the blocking item** on 2026-09-10 and nothing has been done on it. On three of the four SERPs sampled, our page is 0.53x–0.68x the median competitor's depth ([[2026-09-10-adsense-content-overlap]]). `/calculadora-salario-liquido` measures 813 words today. The competitor median on 2026-09-10 was 1443. The page carries `priority: 0.95` in `seo-pages.ts`, tied for the highest on the site. |
| hub pages | `/` 315 words, `/calculadoras` 339, `/comparar` 342. These are the pages a reviewer opens first, and they are link lists. The auditor's own rubric gives *"homepage is just a grid of … links, no editorial content"* as the worked example of a fail. |
| `/metodologia` | The extractor returns `ERR`: 22 words of nav and footer sit inside the measured container, and without them the page is 449 words. |
| the 12 `owner` rows | No written answer anywhere. |
| `ADSENSE-CHECKLIST.md` | Still in the repo root, still saying *"Version: 1.0 — Ready for submission"*. |
| the decision to reapply | No entry in `## Decisions` of `docs/architecture/ARCHITECTURE.md`. |

The trap is the same one as in June. Every mechanical row is green now, so the
next tempting move is to click "solicitar revisão". That is how the site got
rejected the first time: a checklist graded itself 63/63, the site went into
the queue, and Google contradicted it. Requesting review now would send the
same content back with a greener checklist.

This is wrong for the owner, who gets no ad revenue while the site sits in
"Requer atenção". It would get worse with a second rejection on the record
for the same reason.

## Solution

⚠️ **Revised 2026-10-18, after [[2026-10-18-adsense-reapplication]].** The first draft had four
steps and measured success in words. The research measured what Google keeps: 20 of 51 pages are
indexed, Google crawled the two longest articles and turned both down, and it classifies
`/calculadoras` as a Soft 404. Word count does not predict what Google keeps, so no criterion
below uses it.

Five steps. They are ordered so that the cheap changes Google measures directly ship first. Google
takes days or weeks to re-crawl, and that wait runs while the longer steps are built.

1. **Cut what Google already declined.** 19 of the 26 blog articles and 3 of the 4 comparisons
   are not indexed. For each one, choose one of three outcomes:
   - **merge** it into an indexed page on the same topic and redirect its URL there with a 301.
     This is the default.
   - **remove** it with a 410 when there is no natural target.
   - **keep** it only if a written line says what it offers that the merge target does not.

   These pages have no impressions or rankings to lose, which is what makes this step the cheapest
   one with a direct link to what Google measured. "Rewriting" stays out of scope: a declined
   article gets merged or removed, not expanded.

2. **Give the hubs a reason to exist.** `/calculadoras` is a Soft 404 in Google's own
   classification, `/comparar` is unknown to Google, and `/blog` was discovered and never crawled.
   Each hub should say something the home page does not, for example how to choose between the
   calculators or what each section is for. A hub that cannot do that redirects to the page that
   can. The test is Google's coverage state, not a word count.

3. **Answer the added-value question per calculator, against the page that actually ranks.** For
   each of the 12 calculators, take the top organic result for its main query and write one
   answer: *what does our page do that this one does not?* Commit the SERP snapshot and the
   competitor fetch, as [[2026-09-10-adsense-content-overlap]] already did for four of them. A
   page whose only answer is "it has a FAQ block" has no answer.

   **Where the answer is weak, build the difference.** The candidate to argue with is content
   only this site can produce, generated by its own engine:
   - result tables across the incomes or scenarios a visitor actually has;
   - worked examples with real numbers;
   - a page that applies a 2026 rule, if this step finds a competitor that misses it.

   That is original information and analysis in the sense Google uses
   (`fetches/search-creating-helpful-content.md`), and it costs no invented copy. Start with
   `/calculadora-salario-liquido` as the pilot, look at the result, then do the other eleven. A
   calculator with no answer is deepened, merged or dropped. Dropping one that Google indexed is
   one-way and gets its own decision.

4. **Close out what the first round left open.**
   - Answer the 12 `owner` rows in writing.
   - Retire `ADSENSE-CHECKLIST.md`.
   - Reconcile [[adsense-low-value-rejection]] by ticking each item with the measurement that
     closed it, and mark it done.
   - Make `/metodologia` measurable.
   - Apply the owner's decision on authorship and on how the content is produced to `/sobre`.

5. **Gate, then request review once.** The review covers the whole site, and repeated rejections
   can lock the button, so there is one request, after everything has shipped. Request it only
   when all of these hold:
   - URL Inspection over every public URL shows no Soft 404, and every URL in the sitemap is one
     the work chose to keep;
   - a full `/adsense-site-auditor` run against the deployed site fails no `auto` row;
   - every `judgement` row cites written evidence rather than structure.

   The decision to reapply is D6, dated, with the coverage numbers in it. The request itself is an
   owner action in the AdSense panel.

## Architecture

Nothing structural changes. The domain stays pure. Where step 3 produces engine-generated
content, the route calls the existing pure functions in `src/lib/calculators/` at render time, or
a new pure function beside them that builds a table from those functions. That is the same
composition the calculators already use, so there is no new port and no new adapter.

What the work touches:

- **Removed or merged pages** leave several places at once, and missing one leaves a dead
  internal link or a sitemap entry for a URL that now redirects:
  - their route files in `src/routes/blog/` and `src/routes/comparar/`;
  - `src/lib/seo-pages.ts`, which drives the sitemap and the prerender;
  - `tests/seo-smoke.mjs`;
  - the blog listing in `src/lib/blog.ts`;
  - every internal link that points at them.
- **Redirects:** nothing in the repo serves a 301 today. `public/` has `_headers` but no
  `_redirects`. Whether Workers static assets honour a `_redirects` file under this
  TanStack Start entry is the first thing slice 1 settles. It must be verified on workerd via
  `wrangler dev` over the build, not on `vite preview`, for the reason D4 records.
- **Calculators:** `src/routes/calculadora-*.tsx`. Editorial content is inline in each route, with
  the FAQ through `src/components/calculator/FAQSection.tsx`. The FAQ feeds the `FAQPage`
  JSON-LD, so a changed answer is indexed as well as displayed.
- **Hubs:** `src/routes/index.tsx`, `src/routes/calculadoras.tsx`, `src/routes/comparar/index.tsx`,
  `src/routes/blog/index.tsx`.
- `src/routes/metodologia.tsx` and `src/routes/sobre.tsx`.
- **Measurement:** the URL Inspection call used in the research moves from a scratch script into
  `sitestats inspect`, in the `site-stats` skill, so every slice can run it. That skill is a
  machine-setup step, not a commit to this repo.
- **Docs:** `docs/research/<date>-adsense-added-value/` for the per-calculator answers and their
  fetches, and `docs/architecture/ARCHITECTURE.md` for D5 and D6. `ADSENSE-CHECKLIST.md` is deleted
  or rewritten.

All copy a visitor reads stays in Brazilian Portuguese, per `CLAUDE.md`.

## Schema / data changes

No schema. Nothing about AdSense is persisted.

**Two kinds of change here are one-way, and they are not equally expensive:**

| change | one-way because | cost |
|---|---|---|
| merging or removing one of the 22 declined pages | the URL leaves the sitemap, and a 410 is final for Google | close to zero: no impressions, no ranking, and a 301 keeps any stray link working |
| dropping a calculator Google indexed | it loses whatever ranking it has | real, so each one is its own decision, not an edit |

## Interfaces / APIs

No new routes. Existing public routes that change:

| Method | Route / Entry point | Auth | Description |
|--------|---------------------|------|-------------|
| GET | `/blog/*` (19 declined articles) | public | 301 to the merge target, or 410 |
| GET | `/comparar/{streaming,academia,mudanca}` | public | 301 to the merge target, or 410 |
| GET | `/calculadoras` | public | out of Soft 404, or 301 to `/` |
| GET | `/`, `/comparar`, `/blog` | public | hub content of their own |
| GET | `/calculadora-*` (12) | public | added-value content, where step 3 finds it missing |
| GET | `/metodologia`, `/sobre` | public | main content measurable; authorship per the owner |

## Scope

### In scope

- [ ] A triage table for the 22 declined pages (19 articles, 3 comparisons): merge target,
      removal or keep, each with its reason.
- [ ] The merges and removals shipped: 301 or 410 served, gone from `seo-pages.ts`, the
      sitemap, the smoke test and every internal link.
- [ ] `/calculadoras`, `/comparar` and `/blog` each give a reason to exist, or redirect.
- [ ] `/` says something the hubs do not.
- [ ] `sitestats inspect` in the `site-stats` skill.
- [ ] SERP snapshot and competitor fetch for the main query of each of the 12 calculators,
      including the 4 measured on 2026-09-10, so all 12 are compared at one date.
- [ ] A written added-value answer per calculator.
- [ ] Added-value content on every calculator whose answer is weak, piloted on
      `/calculadora-salario-liquido`.
- [ ] `/metodologia` measured without `ERR`.
- [ ] `/sobre` updated per the owner's decision on authorship and production.
- [ ] Written answers to the 12 `owner` rows: `ADS-ELIG-01/02`, `ADS-OWN-01/02`,
      `ADS-SITE-01/02`, `ADS-PROG-01/04/07`, `ADS-PRIV-08/09/10`.
- [ ] `ADSENSE-CHECKLIST.md` retired.
- [ ] [[adsense-low-value-rejection]] reconciled and marked done.
- [ ] D5 (strategy, written 2026-10-18) and D6 (reapply) in `ARCHITECTURE.md`.
- [ ] Full `/adsense-site-auditor` run and full URL Inspection run against the deployed site.
- [ ] One review request in the AdSense panel, by the owner, after the gate.

### Out of scope

- **Rewriting or expanding any blog article.** A declined article is merged or removed. An indexed
  one is left alone: Google kept it, and expanding it would be the word-count move the research
  showed does not work.
- **Word count as a target anywhere.** `analyze_text_depth.py` stays as a diagnostic and stops
  being a criterion.
- **Lengthening `/termos` and `/contato`.** Legal and contact pages are short by nature.
- **`ADS-CRAWL-04` to the letter.** D4 records why the residual 307 stays.
- **New calculators or new articles.** The site has more pages than Google wants. Adding more is
  the opposite of step 1.
- **Ranking and traffic as goals.** Search Console data sets the order of work and supplies the
  coverage check. Impressions and clicks are not success criteria.
- **Moving off Auto Ads, and the ads layout.** Nothing in the rejection points there.
- **Building SERP search into the auditor.** That belongs to the `adsense-site-auditor` repo.
- **Finding out what happened on 2026-07-25.** The research records it as a date without a
  cause. Nothing in this work depends on the cause.

## Research needed

Answered 2026-10-18 in [[2026-10-18-adsense-reapplication]]. Each line keeps its question and
adds the answer. The four scope changes the note proposed were adopted the same day: they are why
the Solution has five steps and why no success criterion counts words. Decision D5 in
`ARCHITECTURE.md` records them.

- [x] **What does Google itself publish about "low value content" and added
      value?** No thresholds anywhere. The repeated test is original
      information or analysis that adds substantial value compared with what
      already ranks, plus no auto-generated or navigation-only screens.
- [x] **Is there a cooldown before requesting review again, and does a review
      look at the whole site or only at what changed?** The whole site, per
      Google. No cooldown is documented for readiness reviews. A lockout after
      "several" recent rejections is documented for the Policy center only, and
      this site has been rejected at least twice. Ship as one batch and request
      review once.
- [x] **Which pages does Google actually index and show?** 20 of 51. Google
      measures `/calculadoras` as a Soft 404. Impressions fell from 24.2 a day
      to 0.21 on 2026-07-25, with no announced update behind it.
- [x] **Do the blog's topic clusters read as mass-produced?** Not by text: no
      near-duplicate group at 30%. But Google declined 19 of the 26 articles,
      including the two longest, so the signal is value, not similarity.
- [x] **Does financial content need named authorship on `/sobre`?** Search
      guidance asks for bylines where readers expect them, and for a disclosure
      of how content is produced. No AdSense page cites that guidance. It is the
      owner's call.
- [x] **What counts as added value for a calculator page?** Original
      information, research or analysis against the pages that rank. Engine
      tables fit that wording but are not proven. Build on
      `/calculadora-salario-liquido` first.
- [ ] **What happens to a calculator with no answer: deepen, merge or drop?**
      Still per page, after step 3. The one-way cost is close to zero for the
      31 pages Google never indexed, and real for an indexed calculator.

## Testing strategy

Two kinds of check, and they answer on different clocks.

**At merge, deterministic.** These run against the deployed preview, never `vite preview` (D4):

| what | proves it with |
|---|---|
| a removed or merged URL | `curl -s -o /dev/null -w '%{http_code} %{redirect_url}'` returns `301 <target>` or `410` for every URL in the triage table |
| no dead internal link | `grep -rn` over `src/` for each removed path returns nothing |
| sitemap and prerender agree | `pnpm run test:seo` is green with the removed routes gone from `seo-pages.ts` and `seo-smoke.mjs` |
| engine-generated content | the pure function that builds a table has a unit test against independently computed values. For N inputs per table, the figure on the deployed page equals what the calculator UI returns for the same input. Both ends are compared and the count is stated. |
| nothing else broke | `pnpm run check` |

**At Google's pace, the verdict.** `sitestats inspect` over every URL in `seo-pages.ts` returns the
coverage state Google holds. A slice whose aim is a Google verdict, such as the Soft 404 clearing,
is done when that call shows it, after a `lastCrawlTime` later than the deploy. The owner can
shorten the wait with "Request indexing" in Search Console, which has no API.

The `judgement` rows have no automated test. Their check is the written per-calculator answer,
with the competitor page fetched next to it, so that anyone can disagree with it against the same
evidence.

## Success criteria

- [ ] Every one of the 22 declined pages is merged, removed or kept with a written reason, and
      the served status matches the triage table.
- [ ] URL Inspection shows **no Soft 404** on any public URL, with a crawl later than the deploy.
- [ ] Every URL left in the sitemap is one the work chose to keep. The number indexed is recorded
      in D6, before and after.
- [ ] Each of the 12 calculators has its top competitor fetched and a written answer to *"what
      does ours do that this one does not"*. No answer is "nothing" without a recorded decision.
- [ ] Engine-generated content matches the calculator UI on every input checked, with the count
      stated.
- [ ] `/metodologia` measures without `ERR`.
- [ ] The 12 `owner` rows are answered in writing by the account holder.
- [ ] `ADSENSE-CHECKLIST.md` is gone, or rewritten so it cannot report a score it did not measure.
- [ ] [[adsense-low-value-rejection]] has every item ticked with its measurement, or carried here,
      and `status: done`.
- [ ] A full `/adsense-site-auditor` run against the deployed site fails no `auto` row, and every
      `judgement` row cites evidence.
- [ ] `pnpm run check` and `pnpm run test:seo` are green.
- [ ] D6 in `ARCHITECTURE.md` records the decision to reapply, its date, and the evidence.
- [ ] One review requested. The AdSense API reports `GETTING_READY`, then a verdict.
