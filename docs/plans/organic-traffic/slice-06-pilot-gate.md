---
status: todo
---

# Slice 6 — The pilot gate: D9 decides scale, hold or stop

## Delivers

The decision this whole plan turns on, made from Google's numbers and not from ours.
[[2026-11-14-search-cliff-2026-07-25]] could not tell whether the site carries a site-wide demotion.
The pilot can: eleven pages of data nobody else shows in this shape, linked from pages Google already
indexes. If Google indexes them and still does not show them, that is the evidence.

Two readings, counted from the day slice 4 deployed (day 0):

| day | read | with |
|---|---|---|
| 28 | index state of the 11 cluster URLs, and of the slice 1–2 targets | `sitestats inspect calculebrasil <11 URLs>` |
| 42 | impressions, clicks and position per URL, days 14–42 | `sitestats gsc calculebrasil --dim page --start <day14> --end <day42>` |
| 42 | the same for `/calculadora-conta-de-luz`, against its July (230 impressions in 24 days) | same |

Saved under `docs/research/<date>-organic-pilot-gate/measurements/`, raw, as the October and November
notes did.

**D9**, at the top of the decisions in `ARCHITECTURE.md`, picks one row:

| result on day 42 | D9 | next |
|---|---|---|
| ≥ 9 of 11 indexed **and** ≥ 100 impressions over days 14–42 | **scale** | slice 7, then slice 8 |
| ≥ 9 indexed, 20–99 impressions | **hold** | read again on day 70 with the same bars; no new pages meanwhile |
| ≥ 9 indexed, < 20 impressions | **stop** | record the site-wide demotion as the working explanation; no slice 7 or 8; next is the owner's call (wait, or rethink the domain) |
| < 9 indexed | **fix first** | URL Inspection's reason per URL; the pages, not the site, are the problem |

The bars are judgement, set before the data so they cannot be fitted to it: 100 in 28 days for eleven
pages is under half of what one page did in July.

⚠️ **Owner:** approves D9. It is the point where the plan can end.

## Needs

Slice 4 deployed and the ten URLs submitted for indexing. Slice 5 merged at least 14 days before day
42, so the links were there for most of the window.

## Tests

None in code. The commands above are the test.

## Done when

- the two measurement files exist with the raw API output;
- D9 is in `ARCHITECTURE.md`, citing the row it took and the counts that put it there:
  `indexed N/11, impressions M, clicks K, best position P`.
