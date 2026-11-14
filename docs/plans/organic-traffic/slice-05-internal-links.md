---
status: todo
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
