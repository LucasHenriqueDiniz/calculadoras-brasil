---
status: doing
---

# Slice 5 — Link the cluster from the pages that earned July

## Delivers

Today, read from production HTML on 2026-11-14:

| page | internal links in `<main>` | inbound |
|---|---|---|
| `/calculadora-conta-de-luz` (230 impressions in July) | 8, to five calculators and two posts | nav, guide, related posts |
| `/comparar/energia` | 1 | the `/calculadoras` guide only |
| `/blog/assinaturas-que-valem-a-pena` | 14 | five `relatedPosts` entries |

The new pages from slices 3 and 4 have to be reachable the way Google reaches pages it keeps: from
pages it already indexes, in few clicks, with anchor text that says what the target holds.

1. `/calculadora-conta-de-luz`: when a distributor is chosen, a link to its page if it has one, and a
   permanent link to `/tarifa-de-energia` beside the tariff field.
2. `/blog/como-economizar-conta-de-luz` (indexed): one link to the hub where it talks about the tariff.
3. `/` and `/calculadoras`: the hub listed with the calculators, in the guide's "energia" entry.
4. The hub links every pilot page; every pilot page links the hub, the two neighbours in the rank,
   and the calculator.
5. Breadcrumbs: Início → Tarifa de energia → distributor.

Anchor text names the thing ("tarifa da Copel", "ranking das 103 distribuidoras"), never "clique aqui".

## Needs

Slices 3 and 4 merged.

## Tests

`scripts/link-graph.mjs` (new) crawls `dist/client` after `pnpm run build`, starting at
`index.html`, following only internal links, and prints per URL: inbound count, distinct source
pages, click depth from `/`. `tests/seo-smoke.mjs` runs it and fails on any orphan in `SEO_PAGES`.

## Done when

```bash
pnpm run build && node scripts/link-graph.mjs dist/client
```

- **0 orphans** among the URLs in `SEO_PAGES`;
- each of the 11 cluster URLs: **≥ 3 inbound links from distinct pages**, at least one of them from a
  page that is `Submitted and indexed` today, and **click depth ≤ 2** from `/`;
- the same numbers printed for the whole site, before and after, committed in the PR description;
- revert check: drop the hub from the nav and the guide, and the script reports its depth rising
  above 2.

## If stuck

If the nav gets crowded, the hub goes in the footer and in `/calculadoras` instead. Depth ≤ 2 is the
bar, not the nav.

---

## What actually happened — 2026-11-14

Links added, every one of them in the HTML the prerender writes:

| where | link |
|---|---|
| footer, every page | "Tarifa de energia" → `/tarifa-de-energia` |
| `/calculadoras`, "Quero cortar gastos fixos" | the guide's `extra` card, restored for the hub (slice 2 had removed it with `/comparar/energia`) |
| `/calculadora-conta-de-luz`, beside the distributor field | "Comparar com as outras distribuidoras" → hub; and, once a pilot distributor is chosen, "Histórico da tarifa da …" → its page (client-side only) |
| `/calculadora-conta-de-luz`, "Fonte da tarifa de energia" | the ten pilot pages by name |
| `/blog/como-economizar-conta-de-luz` | one sentence on the kWh price depending on the distributor → hub |
| every pilot page | "Outras distribuidoras": the other nine |

No `lastmod` moved: links are not a substantial change to any of these pages.

`scripts/link-graph.mjs dist/client <url-inspection.txt>` crawls the build from `index.html`. The
indexed column counts sources that URL Inspection called "Submitted and indexed" on 2026-11-14.

| URL | before (main at `3cd6771`) depth · sources · indexed sources | after |
|---|---|---|
| `/tarifa-de-energia` | 2 · 11 · 1 | **1 · 36 · 26** |
| each of the 10 pilot pages | 3 · 1–2 · 0 | **2 · 11 · 1** |
| whole site | 37 URLs, 0 orphans, deepest 3 | 37 URLs, **0 orphans, deepest 2** |

`tests/seo-smoke.mjs` now imports `linkGraph` and fails if any `/tarifa-de-energia*` URL is more
than two clicks from `/` or linked from fewer than three pages. Against the "before" build it would
fail on all ten pilot pages (depth 3, 1–2 sources): that build is the revert check.

Gate: `cf:types:check`, `typecheck`, `lint`, `build`, `test:seo` (37 routes), `worker:dry-run`,
`audit` exit 0; related unit tests 41/41.

Full graphs, before and after:

```
before  depth  sources  links  indexed-sources  path
before      0       36     36               25  /
before      1       36     36               25  /calculadoras
before      1       36     36               25  /calculadora-custo-carro
before      1       36     36               25  /calculadora-morar-sozinho
before      1       36     36               25  /calculadora-conta-de-luz
before      1       36     36               25  /calculadora-assinaturas
before      1       36     36               25  /calculadora-custo-mudanca
before      1       36     36               25  /calculadora-custo-pet
before      1       36     36               25  /calculadora-irpf-2026
before      1       36     36               25  /calculadora-salario-liquido
before      1       36     36               25  /calculadora-inss-autonomo
before      1       36     36               25  /calculadora-clt-vs-pj
before      1       36     36               25  /calculadora-previdencia-complementar
before      1       36     36               25  /calculadora-beneficios-fiscais
before      1       36     36               25  /blog
before      2        6      6                6  /blog/como-economizar-conta-de-luz
before      2        4      4                4  /blog/custo-pet-anual
before      2        4      4                4  /blog/deducoes-irpf-esqueca
before      2        5      5                5  /blog/investimentos-isentos-irpf
before      2        2      2                2  /blog/despesas-dedutiveis-autonomo
before      2        2      2                2  /blog/contador-necessario-pj
before      2       11     11                1  /tarifa-de-energia
before      3        1      1                0  /tarifa-de-energia/cemig
before      3        1      1                0  /tarifa-de-energia/enel-sao-paulo
before      3        2      2                0  /tarifa-de-energia/neoenergia-coelba
before      3        1      1                0  /tarifa-de-energia/cpfl-paulista
before      3        1      1                0  /tarifa-de-energia/copel
before      3        1      1                0  /tarifa-de-energia/neoenergia-pernambuco
before      3        2      2                0  /tarifa-de-energia/light
before      3        1      1                0  /tarifa-de-energia/enel-ceara
before      3        1      1                0  /tarifa-de-energia/equatorial-goias
before      3        1      1                0  /tarifa-de-energia/celesc
before      1       36     36               25  /sobre
before      1       36     36               25  /metodologia
before      1       36     36               25  /privacidade
before      1       36     36               25  /termos
before      1       36     36               25  /contato
before  
before  37 URLs, 0 orphans, deepest 3

after   depth  sources  links  indexed-sources  path
after       0       36     36               25  /
after       1       36     36               25  /calculadoras
after       1       36     36               25  /calculadora-custo-carro
after       1       36     36               25  /calculadora-morar-sozinho
after       1       36     36               25  /calculadora-conta-de-luz
after       1       36     36               25  /calculadora-assinaturas
after       1       36     36               25  /calculadora-custo-mudanca
after       1       36     36               25  /calculadora-custo-pet
after       1       36     36               25  /calculadora-irpf-2026
after       1       36     36               25  /calculadora-salario-liquido
after       1       36     36               25  /calculadora-inss-autonomo
after       1       36     36               25  /calculadora-clt-vs-pj
after       1       36     36               25  /calculadora-previdencia-complementar
after       1       36     36               25  /calculadora-beneficios-fiscais
after       1       36     36               25  /blog
after       2        6      6                6  /blog/como-economizar-conta-de-luz
after       2        4      4                4  /blog/custo-pet-anual
after       2        4      4                4  /blog/deducoes-irpf-esqueca
after       2        5      5                5  /blog/investimentos-isentos-irpf
after       2        2      2                2  /blog/despesas-dedutiveis-autonomo
after       2        2      2                2  /blog/contador-necessario-pj
after       1       36     36               26  /tarifa-de-energia
after       2       11     11                1  /tarifa-de-energia/cemig
after       2       11     11                1  /tarifa-de-energia/enel-sao-paulo
after       2       11     11                1  /tarifa-de-energia/neoenergia-coelba
after       2       11     11                1  /tarifa-de-energia/cpfl-paulista
after       2       11     11                1  /tarifa-de-energia/copel
after       2       11     11                1  /tarifa-de-energia/neoenergia-pernambuco
after       2       11     11                1  /tarifa-de-energia/light
after       2       11     11                1  /tarifa-de-energia/enel-ceara
after       2       11     11                1  /tarifa-de-energia/equatorial-goias
after       2       11     11                1  /tarifa-de-energia/celesc
after       1       36     36               25  /sobre
after       1       36     36               25  /metodologia
after       1       36     36               25  /privacidade
after       1       36     36               25  /termos
after       1       36     36               25  /contato
after   
after   37 URLs, 0 orphans, deepest 2
```
