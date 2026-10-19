# Plan — AdSense reapplication

Pitch: `docs/pitches/adsense-reapplication.md`
Research: `docs/research/2026-10-18-adsense-reapplication/research.md`
Decision: D5 in `docs/architecture/ARCHITECTURE.md`

Seven slices, in order. Slices 1 and 2 go first because they are cheap and because Google measures
them directly: re-crawling takes days to weeks, and that wait runs while slices 3–5 are built.

| slice | delivers | done when, in one line |
|---|---|---|
| 1 — declined pages | 22 pages Google declined merged (301) or removed (410) | every triaged URL serves its status; `test:seo` green |
| 2 — hubs | `/calculadoras`, `/comparar`, `/blog`, `/` each with a reason to exist | URL Inspection: no Soft 404, no unknown, crawled after deploy |
| 3 — salário líquido pilot | competitor answer plus engine-generated content on one calculator | unit test, smoke assertion, N/N UI-vs-page match |
| 4 — tax calculators | the same, for IRPF, INSS autônomo, CLT vs PJ, previdência, benefícios | 5 answers written; each changed page passes slice 3's checks |
| 5 — household calculators | the same, for carro, morar sozinho, luz, assinaturas, mudança, pet | 6 answers written; same checks |
| 6 — close-out | owner rows, checklist, old pitch, `/metodologia`, `/sobre` | the five artefacts exist, and `/metodologia` measures without `ERR` |
| 7 — gate and review | full inspection, full audit, D7, one review request | the AdSense API reports `GETTING_READY` |

**Baseline, 2026-10-18** (`docs/research/2026-10-18-adsense-reapplication/measurements/`): 20 of
51 public URLs indexed, 1 Soft 404, 7 unknown to Google, AdSense state `NEEDS_ATTENTION`.

**Owner actions.** Each is marked ⚠️ in its slice, and none of them can be done from code:
- "Request indexing" in Search Console, after slices 1, 2 and 3–5 deploy;
- the 12 `owner` rows and the `/sobre` decision, in slice 6;
- the review request, in slice 7.

Out of scope for all seven, per the pitch: expanding any article, word count as a target, new
pages, ads layout, and the cause of the 2026-07-25 drop.
