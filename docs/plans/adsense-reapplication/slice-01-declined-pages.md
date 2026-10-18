---
status: todo
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
