---
status: doing
---

# Slice 2 — The two pages Google declined, merged behind a 301

## Delivers

URL Inspection, 2026-11-14 (`docs/research/2026-11-14-search-cliff-2026-07-25/measurements/url-inspection-sitemap-2026-11-14.txt`):

| URL | state | last crawl | what it is | target |
|---|---|---|---|---|
| `/blog/assinaturas-que-valem-a-pena` | Crawled - currently not indexed | 2026-10-14 | 470 words of general advice ("o teste dos 70%"), 14 links out | `/calculadora-assinaturas` (indexed, 4 of July's 5 clicks) |
| `/comparar/energia` | Crawled - currently not indexed | 2026-09-20 | solar vs grid, 1,291 words, one inbound link (the `/calculadoras` guide) | `/calculadora-conta-de-luz` |

D5 applies as written: merge into an indexed sibling behind a 301, keep only with a written reason.
Neither page has had an impression since July.

**Gate at the start of the slice.** The owner asked Google to re-index the blog post on 2026-11-13.
Run `sitestats inspect` on both URLs first. A URL that reads `Submitted and indexed` stays, and this
file records the date and the reason. Only the declined ones move.

For each page that moves:
1. A line in `public/_redirects`, the same form as the 22 from slice 1 of the AdSense plan.
2. Out of `src/lib/seo-pages.ts`, `src/lib/blog.ts` (for the post), `PUBLIC_ROUTES` and
   `tests/seo-smoke.mjs`; the route file deleted.
3. Every internal reference repointed: `relatedPosts` in `src/data/calculators.ts` (five entries name
   the post) and the `/comparar/energia` link in `src/data/calculator-guide.ts`.
4. If the target lacks something the old page had that a reader would miss, it moves as one FAQ entry
   on the target. Otherwise nothing moves. Prose is not added to make up length (D5).

The solar comparison is not lost as an idea: "solar payback at your distributor's real tariff" goes to
`docs/IDEAS.md`, to be built on slice 4's data if the pilot earns it.

## Needs

Nothing from other slices.

## Tests

- `pnpm run test:seo` green, with the removed paths out of `PUBLIC_ROUTES`.
- `pnpm run check` green.

## Done when

```bash
for p in /blog/assinaturas-que-valem-a-pena /comparar/energia; do
  curl -s -o /dev/null -w "$p %{http_code} %{redirect_url}\n" "https://calculebrasil.com$p"; done
curl -s https://calculebrasil.com/sitemap.xml | grep -c '<loc>'
grep -rn -e 'assinaturas-que-valem-a-pena' -e 'comparar/energia' src public --include='*.ts' --include='*.tsx' --include='_redirects'
```

**Baseline, run 2026-11-14:** both URLs `200` with no redirect, sitemap `28`.

- each moved URL prints `301` and its target; each target answers `200`;
- the sitemap count is 28 minus the pages moved (26 if both move);
- the `grep` finds the paths only in `public/_redirects`;
- Google's half, in slice 6: both targets still `Submitted and indexed` after their next crawl.

## If stuck

If `/calculadoras` loses its only "energia" entry and reads thin, point that guide entry at
`/calculadora-conta-de-luz` now and at `/tarifa-de-energia` once slice 3 ships.

---

## What actually happened — 2026-11-14

**Gate.** `sitestats inspect` the same day: both still `Crawled - currently not indexed` (last crawls
2026-10-14 and 2026-09-20), both targets `Submitted and indexed`. Both moved.

| removed | 301 to | why nothing moved into the target |
|---|---|---|
| `/blog/assinaturas-que-valem-a-pena` | `/calculadora-assinaturas` | Its "teste dos 70%" cites no source, and its tip "Netflix/Disney+ permitem compartilhamento" contradicts the calculator's FAQ, which quotes Netflix's help centre. The calculator's 12 FAQs already cover cutting, annual plans and totals. |
| `/comparar/energia` | `/calculadora-conta-de-luz` | Generic solar payback; the idea is in `docs/IDEAS.md` on real tariffs. |
| `/comparar` (already a 301 to `/comparar/energia`) | `/calculadora-conta-de-luz` | Pointed straight at the final page, so it is one hop, not two. |

Code: the two route files and `src/routes/comparar.tsx` (a layout with no child left) deleted; the
post out of `src/lib/blog.ts`; both paths out of `seo-pages.ts` and `PUBLIC_ROUTES`;
`relatedPosts` repointed (custo-carro now lists none, since the only other post is about electricity);
the guide's `extra` link, its type and its rendering removed, since no situation uses it any more.
No `lastmod` moved: dropping a related link is not a change to a page's content.

**Local, before the PR** (load average ~100 on this machine):
- `test:seo`: passed for **26 routes**, and it walks every rule in `_redirects`: 301, target public,
  source not public;
- `cf:types:check`, `typecheck` (after the build regenerated `routeTree.gen.ts`, −74 lines), `lint`,
  `build`, `worker:dry-run`: exit 0;
- `vitest` on blog, guide, calculators and site tests: 43/43. The full suite runs in CI.

Production after the merge is recorded on the PR (#46 or the number GitHub gives it); Google's half, both targets still indexed after their next crawl, is read in slice 6.
