---
status: active
epic: adsense
---

# Google rejected the site for low-value content, and our own checklist had signed off

## The problem

On **2026-09-07 at 21:53 GMT-3** the AdSense site panel moved
`calculebrasil.com` to:

| column | value |
|---|---|
| status | **Requer atenção** |
| reason | **Conteúdo de baixo valor** |
| ads.txt | Autorizado |

The `ads.txt` column clears `ADS-TXT-01` — the publisher line is accepted and is
not what failed. The single stated reason is content value.

Three days later, on 2026-09-10, the `adsense-site-auditor` skill was run against
the live site for the first time. It returned **`Ready after fixes`, 0 blockers**,
53 Pass of 81. Google had already said no.

That gap is the problem this pitch exists to close, and it is not a bug in the
auditor. The auditor's own reference says so, in the Decidability table: 35 of 81
requirements are `auto`, 34 are `judgement`, 12 are `owner` — *"for the other 46
it cannot, and no amount of tooling changes that … Pretending otherwise is how an
audit produces a confident verdict that Google then contradicts."*

### Where the two verdicts actually disagree

"Conteúdo de baixo valor" maps onto seven requirement IDs. Here is what the
2026-09-10 audit said about each:

| ID | severity | 2026-09-10 verdict | how it was decided |
|---|---|---|---|
| `ADS-CONTENT-01` | Blocker | Pass | judgement, **on structure** |
| `ADS-CONTENT-ORIGINAL` | High | Pass | judgement, **on structure** |
| `ADS-CONTENT-ADDED-VALUE` | High | Pass | judgement, **on structure** |
| `ADS-CONTENT-OVERLAP` | High | **Unknown — never measured** | `auto`, implemented by nothing |
| `ADS-CONTENT-03` | High | **Fail** | measured |
| `ADS-COMPLETE-02` | High | **Fail** | measured |
| `ADS-PUB-11` | Blocker | Pass, with a caveat pointing at `ADS-CONTENT-03` | judgement |

Two were already failing when the application was submitted. One was never
measured. The three that passed, passed because the pages *have the right parts* —
every one of the 12 calculators carries a FAQ block and a stated-limitations
block, and the word counts are healthy. That is not what those rows ask for.
`ADS-CONTENT-ORIGINAL` asks, in its own words, to *"search Google for
competitors. Read competitor pages."* Nobody did. `ADS-CONTENT-OVERLAP` asks for
a similarity number against the top 5 results, and no script in the auditor
repo searches, so it prints a permanently `MISSING` line.

**The one machine-decidable item that speaks directly to the rejection reason is
the one item that has never been run.** It has been open since June — item 5 of
[[ADSENSE-CHECKLIST]], "Plagiarism Test", deadline "before submitting the
application".

### The checklist that authorized the submission checked itself off

`ADSENSE-CHECKLIST.md` is dated 26 June 2026 and ends with **"Version: 1.0 —
Ready for submission"**. It marks **63 of 63 ✅**. Measured on 2026-09-10, at
least five of those ticks were false at the moment they were written:

| ticked ✅ in June | measured 2026-09-10 |
|---|---|
| `ADS-CRAWL-04`: "No redirect chains" | 22 pages redirect, via **307** (temporary) for permanent URL normalisation |
| `ADS-CRAWL-05`: "Stable URLs" | canonical declares the no-slash URL, which **never returns 200** — it always 307s to the trailing-slash form |
| `ADS-PRIV-04`: "GDPR/CCPA compliance improved" | `window.__tcfapi` is `undefined`; no CMP, no banner, no consent code anywhere in `src/` |
| `ADS-CONTENT-03`: "Substantive content" | `blog/quanto-custa-morar-sozinho` is **286 words**; four more pages sit in the 300–449 band |
| `ADS-COMPLETE-02`: "20+ substantive articles" | only **2** blog articles reach the 1200-word bar the row names |

It also counts **63 requirements against a reference that has 81**, ticks
`ADS-TXT-01` while its own text says the file is "to be created after approval",
and ticks `ADS-UX-06` "Ad labels implemented" while a later section records that
the `AdLabel`/`AdContainer` components were **removed**.

A document that grades itself, in the same pass that decides whether to submit,
produced a 100% score and a rejection. That is the second thing to fix here, and
it is cheaper than the first.

## Solution

Three things, in this order, because the first one is the only one that can tell
us whether the rest matters.

1. **Measure the overlap.** Retrieve the top 5 search results for the queries the
   main pages target, and feed their text to
   `adsense_checks.duplicates.compare_against`. Thresholds are in the reference:
   `<40%` safe, `40–60%` monitor, `>60%` High Risk. This turns the rejection
   reason from a guess into a number.
2. **Close the six measured findings** from the 2026-09-10 audit — 3 High, 3
   Medium, listed in Scope.
3. **Replace the self-certifying checklist** with a re-run of the skill, so the
   next submission is gated by a tool that reports `Unknown` when it does not
   know, and by owner answers that are written down rather than assumed.

Only then reapply.

## Architecture

Nothing structural changes in the app. The work touches:

- `src/routes/__root.tsx` — the AdSense tag currently loads unconditionally at
  line 125. A CMP has to run before it, or Funding Choices has to be enabled in
  the AdSense account (which needs no code change at all — see Research needed).
- `src/lib/seo-pages.ts` — the sitemap and the prerender both read it, and
  `/calculadoras` is absent from it.
- Whatever produces the canonical tag, so that the canonical URL and the URL that
  answers 200 are the same string.
- `docs/research/<date>-adsense-content-overlap/` — the overlap measurement and
  its fetched sources, following the pattern the three existing research folders
  already set.

The auditor skill itself lives in a **different repo**,
`~/dev/pessoal/adsense-site-auditor`. Installing it is a symlink into
`~/.claude/skills/` and changes nothing here. It is in scope because the work
cannot be re-verified without it, but it is a machine-setup step, not a commit.

## Schema / data changes

None. Nothing about AdSense is persisted, there is no stored result to migrate,
and no rename here is one-way.

## Interfaces / APIs

No new routes. `/calculadoras` already exists and already server-renders with a
title, a canonical and an `h1`; it is only missing from the three files that are
supposed to know about it.

| Method | Route / Entry point | Auth | Description |
|--------|---------------------|------|-------------|
| GET | `/calculadoras` | public | exists, 200, orphaned from `sitemap.xml`, `seo-pages.ts` and `seo-smoke.mjs` |

## Scope

### In scope

- [x] ~~**Measure `ADS-CONTENT-OVERLAP`.**~~ **Done 2026-09-10** —
      `docs/research/2026-09-10-adsense-content-overlap/research.md`, 20 competitor
      pages fetched. **Max overlap 0.41%, band `safe`, on all four pages measured.**
      The row closes. It also closed the wrong question: a positive control in that
      note shows two *independent* competitors on the same topic share 1 shingle in
      1397 (0.07%), so ~0% is what any two independently written pt-BR pages score.
      The bands are calibrated for copied text. **This measurement was never able to
      see what Google objected to**, which is why the item below is now the blocking
      one rather than a follow-up.
- [ ] **⚠️ Re-review the three judgement rows against competitors, not against
      structure** — `ADS-CONTENT-01`, `ADS-CONTENT-ORIGINAL`,
      `ADS-CONTENT-ADDED-VALUE`. **Now the blocking item**, promoted by the research
      above. For each of the 12 calculators: what does this page do that the top
      result for the same query does not? A page whose only answer is "it has a FAQ
      block" has no answer.
      The research already measured the shape of the problem — our pages are the
      shallow ones on 3 of the 4 SERPs sampled, at 0.53x-0.68x the median
      competitor and placing last or second-to-last on depth:

      | our page | ours | SERP median | ratio | rank |
      |---|---|---|---|---|
      | `/calculadora-salario-liquido/` | 768 | 1443 | **0.53x** | 5th of 6 |
      | `/calculadora-clt-vs-pj/` | 776 | 1262 | **0.61x** | 5th of 6 |
      | `/calculadora-custo-pet/` | 804 | 1178 | **0.68x** | 4th of 5 |
      | `/calculadora-irpf-2026/` | 1353 | 1062 | 1.27x | 3rd of 5 |

      `/calculadora-salario-liquido/` is `priority: 0.95`, tied for the highest on
      the site, and is the worst of the four. `custo-pet` was picked as the control
      — the least contested query — and it failed the same way, which argues the
      shape of the pages is the problem rather than the competition.
- [ ] **`ADS-PRIV-04` — ship a consent path.** Either enable Funding Choices on
      the account, or gate the `adsbygoogle.js` tag in `__root.tsx` behind a
      certified CMP. Today the tag fires for every visitor including EEA/UK ones,
      and `__tcfapi` is undefined.
- [ ] **`ADS-CONTENT-03` — raise `blog/quanto-custa-morar-sozinho`** from 286
      words, and decide what to do about the four pages in the 300–449 band
      (home 315, `/comparar/` 342, `blog/como-economizar-conta-de-luz` 300,
      `blog/assinaturas-que-valem-a-pena` 318).
- [ ] **`ADS-COMPLETE-02` — get a third blog article past 1200 words.** Two make
      it today: `guia-irpf-2026` (1494) and `calculadora-irpf-2026` (1952). The
      row can be argued closed by counting calculator bodies instead, and the
      point of doing the work is to stop arguing.
- [ ] **`ADS-CRAWL-05` — make the canonical URL be a URL that answers 200.**
      Affects the 24 pages that declare a canonical.
- [ ] **`ADS-CRAWL-04` — 301/308 instead of 307** for trailing-slash
      normalisation, on the 22 pages that redirect.
- [ ] **`ADS-CRAWL-07` — add `/calculadoras`** to `src/lib/seo-pages.ts`, and
      therefore to `sitemap.xml`, and to `tests/seo-smoke.mjs`.
- [ ] **Install the auditor skill** so it is invocable as
      `/adsense-site-auditor` rather than read by hand:
      `ln -s ~/dev/pessoal/adsense-site-auditor ~/.claude/skills/adsense-site-auditor`
- [ ] **Answer the 12 `owner` rows in writing** — `ADS-ELIG-01/02`,
      `ADS-OWN-01/02`, `ADS-SITE-01/02`, `ADS-PROG-01/04/07`, `ADS-PRIV-08/09/10`.
      Eight came back `Unknown` on 2026-09-10 because nobody had been asked.
      An attestation that is written down is a different artefact from one that
      is assumed, and the reference insists on the distinction.
- [ ] **Retire `ADSENSE-CHECKLIST.md`** in its current form. Whatever replaces it
      must not be able to grade itself: the verdict comes from a skill run whose
      `Unknown` rows survive into the report.

### Out of scope

- **Reapplying.** That is the gate this work opens, not part of the work. It
  happens after the success criteria are green, not alongside them.
- **Rewriting the other 24 blog articles.** Their word counts are healthy
  (median ~640, none below 450 except the one named above). If the overlap
  measurement says otherwise, that is a new pitch with a number behind it.
- **Moving off Auto Ads to manual slots.** `ADS-CONTENT-05`, `ADS-PROG-03`,
  `ADS-PUB-10/12` and `ADS-REST-08` all passed with the current setup — one
  `ins.adsbygoogle` on a 700-word page, no obstruction, Google supplying its own
  labels. Nothing in the rejection points here.
- **Building SERP search into the auditor.** The reference deliberately records
  `ADS-CONTENT-OVERLAP` as decidable-in-principle-but-unimplemented. Implementing
  it is a pitch in the `adsense-site-auditor` repo, and this work only needs the
  measurement once, by hand.
- **The IRPF numbers.** [[irpf-calculation-defects]] is in flight on this very
  branch and its own pitch owns it. A calculator that computes the wrong tax is a
  content-quality problem in the ordinary sense, but it is not what
  "Conteúdo de baixo valor" is about and mixing the two doubles the surface
  under change.
- **Anything about the `hotmail.com` contact address.** `ADS-AUTHOR-02` passes
  on it. `contato@calculebrasil.com` would read as stronger trust; that is taste,
  not a finding.

## Research needed

- [x] ~~**What is the overlap against the top 5 SERP results, per main page?**~~
      **Answered 2026-09-10** — [[2026-09-10-adsense-content-overlap]]. Kept as
      written below, because the reasoning that motivated it was half wrong and the
      note is the record of how. It said "this is the one number that decides
      whether the fixes are sufficient or whether the content strategy is the
      problem". It decides neither: 0.41% max overlap rules out copying and rules
      out nothing else. `WebSearch` was unavailable, so all 20 SERP positions were
      resolved by hand in a browser; the note records that and the two competitor
      pages whose extracted text was too thin for their 0% to carry weight.
- [ ] **Does Google publish anything operational behind "Conteúdo de baixo
      valor"?** Section J of the reference already records that the rejection-rate
      figures it used to carry had no source and were removed. Assume the same
      applies to any threshold found in a blog post, and cite only Google.
- [ ] **Does enabling Funding Choices satisfy `ADS-PRIV-04` without a code
      change, and can it be configured while the site is in "Requer atenção"?**
      If yes, the cheapest fix for a High risk is a dashboard toggle.
- [ ] **Is there a cooldown before reapplying, and does a resubmission re-review
      the whole site or only what changed?** This decides whether the fixes ship
      as one batch or can go out incrementally.
- [ ] **Which of the 49 pages did the review actually look at?** Probably not
      knowable. If it is not, say so in the research note rather than leaving the
      question open — an unanswerable question closed as unanswerable is worth
      more than one that looks pending forever.
- [ ] **Does the `/comparar/` section read as thin aggregation?** Its four pages
      measure 1016–1278 words, which is healthy, but a comparison page is the
      shape most likely to be read as curation without added value, and the
      audit passed it on structure like the rest.

## Testing strategy

The measured findings each have a check that already exists and already fails, so
the test is the same tool that found them:

| finding | what proves it fixed |
|---|---|
| `ADS-CRAWL-07` | `pnpm run test:seo` covers `/calculadoras`; `curl sitemap.xml \| grep calculadoras` is non-empty |
| `ADS-CRAWL-04/05` | `scripts/crawl_site.py` stops reporting the redirect and canonical `MISS` lines; the canonical string and the 200-answering URL are byte-identical |
| `ADS-CONTENT-03` | `scripts/analyze_text_depth.py` over every page in `seo-pages.ts` reports no `WARN` |
| `ADS-COMPLETE-02` | three blog articles at 1200+, measured by the same script |
| `ADS-PRIV-04` | `window.__tcfapi` is a function on the live site before `adsbygoogle.js` fires |
| `ADS-CONTENT-OVERLAP` | a number under 40%, with its fetches committed |

Per the `testing` skill, the SEO smoke test is the layer that owns
`/calculadoras`: it is a real public route and `CLAUDE.md` already requires new
public routes to appear in `tests/seo-smoke.mjs`. Nothing here needs a unit test —
none of it is a pure formula.

## Success criteria

- [ ] `docs/research/<date>-adsense-content-overlap/research.md` holds an overlap
      percentage per main page, with every competitor page fetched and committed.
- [ ] A fresh `/adsense-site-auditor` run against the live site reports **zero
      `Fail` rows among the 35 `auto` requirements**, and every `Unknown` that
      remains says what access it needs.
- [ ] The 12 `owner` rows are answered, in writing, by the account holder.
- [ ] `window.__tcfapi` is defined on the live site, or the account's Funding
      Choices setting is recorded as the reason it does not need to be.
- [ ] No page reachable from `src/lib/seo-pages.ts` measures below 450 words.
- [ ] `pnpm run check` and `pnpm run test:seo` are green.
- [ ] `/adsense-site-auditor` is invocable as a skill, not read by hand from
      another repo.
- [ ] `ADSENSE-CHECKLIST.md` is gone or rewritten so that it cannot report a
      score it did not measure.
- [ ] The decision — reapply, or hold and change the content strategy — is an
      entry in the `## Decisions` section of
      `docs/architecture/ARCHITECTURE.md`, dated, with the overlap number in it.

## Appetite

⚠️ **Rewritten 2026-09-10, after the measurement.** What stood here framed
`ADS-CONTENT-OVERLAP` as the number that would decide the pitch: above 60% and the
content strategy is the problem, under 40% and *"the six fixes plus the CMP are
plausibly the entire gap"*. The number came back at 0.41%, and the second half of
that sentence does not follow. The metric's bands grade **copying**; the control in
[[2026-09-10-adsense-content-overlap]] shows independent pt-BR pages on one topic
score ~0% against each other as a matter of course. A safe overlap was never
evidence that the rest of the gap is small — it is evidence about plagiarism, and
plagiarism was never the accusation.

So the appetite splits, and not the way it was written:

**Small and known — half a day, no unknowns.** A symlink, three files for
`/calculadoras`, a redirect status code, a canonical string, one 286-word article
to lengthen, one dashboard toggle. Worth doing regardless of everything else,
because each one is a `Fail` a re-run of the auditor will keep reporting.

**Open-ended, and now the real pitch.** `ADS-CONTENT-ORIGINAL` and
`ADS-CONTENT-ADDED-VALUE`, re-reviewed against what actually ranks. The research
measured our pages at 0.53x-0.68x the median competitor's depth on three of four
SERPs, last or second-to-last, including on the query picked *because* it should
have been the least contested. On `calculadora CLT ou PJ`, `contabilizei.com.br`
answers with 5064 words against our 776. On `calculadora IRPF 2026`, position 1 is
the Receita Federal's own simulator. That is not a housekeeping backlog and it does
not have a fixed cost — it is the question of what these twelve pages are for when
a reader can already get the arithmetic from an accountancy firm with a content
team, or from the government.

**Do not reapply on the strength of the overlap number.** It is a Pass on a row
that was never the objection. The 2026-09-10 audit already produced one confident
verdict Google contradicted; closing the one item that could not have caused the
rejection does not make the second verdict safer. What would: an honest answer to
the two judgement rows, written down, before the site goes back in the queue.
