---
status: doing
---

# Slice 2 — Give each hub a reason to exist, or redirect it

## Delivers

Google's verdict on the four hubs, on 2026-10-18:

| hub | coverage state |
|---|---|
| `/calculadoras` | **Soft 404** |
| `/comparar` | unknown to Google |
| `/blog` | discovered, never crawled |
| `/` | indexed |

Both `/` (`src/routes/index.tsx:134`) and `/calculadoras` render every entry of `calculators` from `src/data/calculators.ts` as cards. A listing that repeats the
home page has nothing of its own, which is the likeliest reading of the Soft 404. That is an
inference: Google does not say why.

Each hub either says something the others do not, or redirects to the one that does:

- **`/calculadoras`**: a guide to choosing, organised by the visitor's situation, with one
  original sentence per calculator on when it is the right one. Examples: "mudando de emprego",
  "saindo de casa", "virando PJ". The current grid stays below it. If no such guide can be
  written without repeating `/`, `/calculadoras` 301s to `/` and the nav link moves.
- **`/comparar`**: after slice 1 it may hold a single comparison. One child does not make a hub,
  so it redirects to that child or to `/`, unless slice 1 kept more.
- **`/blog`**: after slice 1 it lists only the articles that survived. Group them by the calculator
  they serve, so the index explains the relationship rather than repeating titles.
- **`/`**: what the site is for and who runs it. It is the first page a reviewer opens.

## Needs

- Slice 1 merged. The hubs list what survives it, and a hub written before the cut lists pages
  that are about to redirect.
- **`sitestats inspect`**, added to the `site-stats` skill in `~/.claude/skills/site-stats/`. It
  is the URL Inspection call from the research's scratch script, so it is a machine-setup step,
  not a commit here. Interface:
  `sitestats inspect <site> URL…` prints `coverageState  lastCrawlTime  url`, one URL per line,
  and `--json` for the full result. The token's `webmasters.readonly` scope was enough on
  2026-10-18.

## Tests

- `pnpm run test:seo` green. If a hub redirects, it leaves `PUBLIC_ROUTES` and `seo-pages.ts` like
  any slice-1 page.
- `pnpm run check` green.

## Done when

```
sitestats inspect calculebrasil https://calculebrasil.com/ https://calculebrasil.com/calculadoras \
  https://calculebrasil.com/comparar https://calculebrasil.com/blog
```

For every hub still serving 200: no line reads `Soft 404` or `URL is unknown to Google`, and
every `lastCrawlTime` is later than the deploy. A hub that redirects instead is checked with the
slice-1 `curl` loop.

This is Google's clock, not ours. Slices 3–5 proceed while it runs.

⚠️ **Owner:** "Request indexing" for each hub after deploy. There is no API for it.

## If stuck

If the Soft 404 survives a re-crawl with a guide in place, redirect `/calculadoras` to `/`. Two
pages competing to be the list of calculators is the problem either way, and one of them can
simply stop existing.

---

## What actually happened — 2026-10-18

Built on top of slice 1's branch, so the hubs list only what survived the cut.

| hub | before | after |
|---|---|---|
| `/calculadoras` | the same 12 cards as `/`, grouped by topic, behind a search box | **a guide by situation**: "vou sair de casa", "recebi uma proposta de emprego", "trabalho por conta própria", "imposto de renda", "carro", "pet", "cortar gastos fixos". Each calculator appears with one sentence on when it is the right one there. The data is `src/data/calculator-guide.ts`. |
| `/comparar` | 1 card left after slice 1 | **301 to `/comparar/energia`**, in `public/_redirects`. "Comparar" leaves the header and footer. The energia page's back link goes to `/calculadora-conta-de-luz`, and its breadcrumb drops the `/comparar` level. It stays linked from the guide's "cortar gastos fixos" situation. |
| `/blog` | grouped by category ("Guias", "Análises"…) | **grouped by the calculator each post explains**, with a link to that calculator. `BlogPost` gains `calculator`. The unused `blogCategoryLabels` is deleted. |
| `/` | "Seis ferramentas", over a grid of 12 | the count comes from `calculators.length`. The text links to the guide, and a new "Quem faz o Calcule Brasil" section names the author already named on `/sobre`, says what the site is not, and links to `/sobre`. The meta description now covers the tax calculators. |

Each sentence about a calculator was checked against what its module computes, not against its
tagline. For example, `beneficios-fiscais` computes the gross salary that would match the
benefit at the IRPF rate the visitor types, and the guide says exactly that. One claim was caught
and rewritten: `/metodologia` covers only the six household calculators, not the tax rules, so
the guide points to each tax calculator's own page for its rates and ceilings.

**Tests.**
- `tests/calculator-guide.test.ts`: every guide slug exists, and every calculator is placed at
  least once. Mutating a slug turned both red.
- `tests/blog.test.ts`: every post names an existing calculator. A misspelt slug turned it red.
- Unit suite at 286, `tsc` and `eslint` green.
- `test:seo` green on **28** routes, none orphaned, with the new `/comparar` rule exercised as a
  real 301.
- In the browser, against `pnpm run dev`:
  - `/calculadoras`, `/blog` and `/` render with no console errors;
  - the header and footer no longer link `/comparar`;
  - `vite dev` answers `/comparar` with 200, because the dev server does not apply `_redirects`.
    `vite preview`, which `test:seo` uses, does.

**Not done, by design.** `Done when` is Google's verdict: no Soft 404 on `/calculadoras`, and
`/blog` known and crawled. That needs this deployed to production and re-crawled.
`sitestats inspect` now exists in the `site-stats` skill to read it:

```
sitestats inspect calculebrasil https://calculebrasil.com/ https://calculebrasil.com/calculadoras https://calculebrasil.com/blog
```

On 2026-10-18 it read `Soft 404` for `/calculadoras` and `Discovered – currently not indexed`
for `/comparar`.

⚠️ **Owner:** after deploy, "Request indexing" for `/`, `/calculadoras` and `/blog`.

**Seen, and left out of scope.** The four surviving articles render their category in lower case
as the eyebrow, for example "guia • 6 min". #16 fixed that on the one article slice 1 then
redirected.
