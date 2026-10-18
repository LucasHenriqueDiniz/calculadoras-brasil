---
status: todo
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
