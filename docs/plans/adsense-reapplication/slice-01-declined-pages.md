---
status: doing
---

# Slice 1 — Merge or remove the 22 pages Google declined

## Delivers

Each of the 22 pages that URL Inspection did not index on 2026-10-18 leaves the site as a page in
one of three ways:

| outcome | served | when |
|---|---|---|
| **merge** (default) | `301` to an indexed page on the same topic | a target exists. Anything the article says that the target lacks moves into the target. Nothing else does. |
| **remove** | `410` | no natural target |
| **keep** | `200`, unchanged | only with one written line on what it offers that the nearest target does not |

The 22, with the nearest **candidate** targets. The slice decides; this table only proposes:

| declined page | candidate target |
|---|---|
| `/blog/quanto-custa-morar-sozinho` | `/calculadora-morar-sozinho` (indexed) |
| `/blog/calculadora-irpf-2026`, `/blog/guia-irpf-2026`, `/blog/tabela-irpf-2026-completa`, `/blog/simplificado-vs-completo`, `/blog/dependentes-irpf-economia` | `/calculadora-irpf-2026` (indexed), or `/blog/deducoes-irpf-esqueca` (indexed) |
| `/blog/salario-liquido-entenda`, `/blog/negociar-salario-melhor`, `/blog/salario-por-setor-2026` | `/calculadora-salario-liquido` (indexed) |
| `/blog/clt-vs-pj-comparacao`, `/blog/quando-virar-pj`, `/blog/como-calcular-salario-pj`, `/blog/mei-vs-pj-custo`, `/blog/formal-vs-informal` | `/calculadora-clt-vs-pj` (indexed) |
| `/blog/quanto-custa-ser-autonomo`, `/blog/recibo-rpa-autonomo` | `/calculadora-inss-autonomo`, or `/blog/despesas-dedutiveis-autonomo` (indexed) |
| `/blog/planejamento-tributario` | `/blog/contador-necessario-pj` (indexed) |
| `/blog/aposentadoria-early-retirement` | `/calculadora-previdencia-complementar` |
| `/blog/quanto-custa-ter-carro` | `/calculadora-custo-carro` |
| `/comparar/streaming`, `/comparar/academia` | `/calculadora-assinaturas` (indexed) |
| `/comparar/mudanca` | `/calculadora-custo-mudanca` |

The triage table, with the chosen outcome and a one-line reason per page, goes in this file under
"What actually happened". It is the artefact the gate in slice 7 checks against.

Each removed or merged page leaves **every** place at once:
- its route file;
- `src/lib/seo-pages.ts`, which drives the sitemap and the prerender;
- `tests/seo-smoke.mjs`;
- `blogPosts` in `src/lib/blog.ts`, which drives the blog index;
- every internal link to it.

A link left pointing at a redirect is a defect, not a nicety.

## Needs

- **A way to serve 301 and 410 that this stack actually honours.** Nothing in the repo does it
  today: `public/` has `_headers` and no `_redirects`. Try a `_redirects` file in `public/`
  first. It must be verified on **workerd**, via `pnpm run build` and then `wrangler dev`, and on
  the deployed branch preview. Never on `vite preview`, which does not use the asset server: D4
  records the canonical bug that `vite preview` hid. If `_redirects` does not take effect under
  the TanStack Start entry, the fallback is a redirect map in the Worker's server entry. Either
  way the mechanism goes in this file.
- Whether `_redirects` supports `410` is part of that question. If it does not, a removed page
  may 301 to its section hub instead. Record which.
- The baseline is in `docs/research/2026-10-18-adsense-reapplication/measurements/url-inspection.json`.
  Do not re-derive the list of 22 from memory.

## Tests

- `pnpm run test:seo` stays green with the removed routes gone from `PUBLIC_ROUTES`. Add an
  assertion that each removed path is **absent** from the built `sitemap.xml`.
- `pnpm run check` green.
- No unit test: nothing here is a pure function.

## Done when

On the deployed branch preview, for every row of the triage table:

```
while read -r path expected; do
  got=$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "$PREVIEW$path")
  [ "$got" = "$expected" ] && echo "ok   $path" || echo "FAIL $path -> $got (want $expected)"
  sleep 2
done < docs/plans/adsense-reapplication/triage.tsv
```

prints no `FAIL`. The `sleep` is deliberate. On 2026-10-18, about 120 scripted requests in a few
minutes were followed by this machine's `curl` getting no response from the site for over 20
minutes, while the site was up from elsewhere. Cloudflare rate limiting is the likely cause, not a
confirmed one. A `000` in this loop is that, not a failed redirect: check from another network
before reading it as a defect. `triage.tsv` holds `path<TAB>301 https://…target` or `path<TAB>410 `, and is
written by this slice. Then:

```
for p in $(cut -f1 docs/plans/adsense-reapplication/triage.tsv); do
  grep -rn -e "\"$p\"" -e "\"$(basename "$p")\"" src/
done
```

prints nothing: no internal link still points at a removed path. The second pattern catches the
bare slugs that key `blogPosts` in `src/lib/blog.ts`. And `pnpm run test:seo` is green.

⚠️ **Owner:** after deploy, "Request indexing" in Search Console for the merge targets.

## If stuck

If the redirect mechanism takes more than one attempt on workerd, ship the **removals from the
sitemap and the internal links** first, with the route files left in place. A page Google declined
and nothing links to does no harm for a few days, and the redirect lands in a follow-up. Do not
ship a redirect verified only on `vite preview`.

---

## What actually happened — 2026-10-18

**Triage.** 20 pages redirect with a 301 and 2 are removed. The full table, with the served status
per path, is `triage.tsv` next to this file. It is the input to the `Done when` loop.

| target | redirected from |
|---|---|
| `/calculadora-irpf-2026` | `blog/calculadora-irpf-2026`, `blog/guia-irpf-2026`, `blog/tabela-irpf-2026-completa`, `blog/simplificado-vs-completo` |
| `/calculadora-clt-vs-pj` | `blog/clt-vs-pj-comparacao`, `blog/quando-virar-pj`, `blog/como-calcular-salario-pj` |
| `/calculadora-inss-autonomo` | `blog/quanto-custa-ser-autonomo`, `blog/recibo-rpa-autonomo`, `blog/formal-vs-informal` |
| `/calculadora-salario-liquido` | `blog/salario-liquido-entenda`, `blog/salario-por-setor-2026` |
| `/blog/deducoes-irpf-esqueca` | `blog/dependentes-irpf-economia`, `blog/planejamento-tributario` (its sections are deductions, PGBL, health, education and exempt investments) |
| `/calculadora-assinaturas` | `comparar/streaming`, `comparar/academia` (the calculator already covers gym and streaming) |
| `/calculadora-custo-carro` | `blog/quanto-custa-ter-carro` |
| `/calculadora-morar-sozinho` | `blog/quanto-custa-morar-sozinho` |
| `/calculadora-previdencia-complementar` | `blog/aposentadoria-early-retirement` |
| `/calculadora-custo-mudanca` | `comparar/mudanca` |
| **removed, 404** | `blog/negociar-salario-melhor` (salary negotiation, which no calculator answers), `blog/mei-vs-pj-custo` (MEI against PJ, which no calculator computes; `contador-necessario-pj` mentions MEI twice) |

No page was kept.

**Two deviations from the plan, both deliberate.**

1. **No 410.** Cloudflare's `_redirects` for Workers static assets supports 301, 302, 303, 307
   and 308, and nothing else (https://developers.cloudflare.com/workers/static-assets/redirects/,
   fetched 2026-10-18). A removed route already answers 404, which the browser confirmed against
   production for three unknown paths. So "removed" means 404. Google treats 404 and 410 alike
   for a page it never indexed.
2. **No content was folded into the targets.** Folding is writing, and the writing for each
   calculator is slices 3–5, which start from a competitor answer. Moving paragraphs now would
   decide that content before the answer exists. The deleted articles are recoverable as
   `git show 9242ae4:src/routes/blog/<slug>.tsx`, and slices 3–5 read the ones redirected to
   their calculator before they write.

**The redirect mechanism is `public/_redirects`**, copied by the build to
`dist/client/_redirects` with 20 rules. Probed under `vite preview` (port 4174) on 2026-10-18:

| request | answer |
|---|---|
| `/blog/quanto-custa-ter-carro` | `301 → /calculadora-custo-carro` |
| `/comparar/streaming` | `301 → /calculadora-assinaturas` |
| `/blog/negociar-salario-melhor` | `404` |
| `/calculadora-irpf-2026` | `200` |
| `/calculadora-irpf-2026/` | `307 → /calculadora-irpf-2026` |
| `/blog/quanto-custa-ter-carro/` | `307 → /blog/quanto-custa-ter-carro`, then the 301: two hops, on a form nothing links |

⚠️ **`vite preview` runs the Workers asset server here.** It applied both `_redirects` and
`html_handling`, using `@cloudflare/vite-plugin` 1.54.2 and wrangler 4.127.1. D4 says the
opposite, and now carries a dated note saying so. The consequence for this plan: the smoke test
exercises the real redirects, and the deployed preview stays the final check rather than the only
one.

**Tests.**
- `tests/seo-smoke.mjs` reads `dist/client/_redirects`. Every rule must be a 301 whose source is
  not a public route and whose `Location` is one.
- Mutation, run against the built file and then restored. Pointing `guia-irpf-2026` at a removed
  page made it fail ("must redirect to a public route"). A rule redirecting the live
  `/calculadora-irpf-2026` also made it fail, through that page's canonical check.
- A dropped rule is **not** caught by the smoke test. The removed page would 404 instead of 301,
  and the `Done when` loop against `triage.tsv` is what catches that.

**Also changed.**
- `irpf-2026` had only declined posts as `relatedPosts`. It now lists the two indexed IRPF
  articles, `deducoes-irpf-esqueca` and `investimentos-isentos-irpf`.
- `salario-liquido` has none left. `RelatedPosts` renders nothing for an empty list.
- `/comparar` lists one comparison, and its meta copy no longer names the three that left.
  Whether a hub with one child should exist is slice 2's call.
- README: 49 → 29 prerendered pages.

**Gate.** `pnpm run check` passes every step except the last, `pnpm audit`:
- 282 unit tests, `tsc`, `eslint`, build, `test:seo` on 29 routes, `wrangler deploy --dry-run`;
- `pnpm audit` reports 21 advisories in `undici` 7.29.0, through miniflare. The lockfile is
  untouched here, so they predate this slice. Raised as a separate task.

**Merge conflict with #16, resolved for the redirect.** #16 (authored 2026-09-12, merged into
`main` on 2026-10-18 while this PR was open) rendered the six FAQs of
`blog/quanto-custa-morar-sozinho` and completed its meta. This slice redirects that article to
`/calculadora-morar-sozinho`. The merge keeps the redirect, which is what D5 decided for every
declined page. Google crawled the article on 2026-09-22 and declined it, and #16 changes its
markup, not what it says. #16's version stays recoverable as
`git show 12d2a23:src/routes/blog/quanto-custa-morar-sozinho.tsx`. Its FAQs are the first thing
slice 5 reads for the morar-sozinho calculator. Reversing this means deleting one line of
`public/_redirects` and restoring those two files from `12d2a23`.

**Not done yet, and it is what `Done when` asks for:**
- the `triage.tsv` loop against the **deployed** preview. That needs a pushed branch and a PR,
  because Workers Builds uploads a preview version on pull requests (`docs/deploy.md`).
- ⚠️ the owner's "Request indexing" for the merge targets.
