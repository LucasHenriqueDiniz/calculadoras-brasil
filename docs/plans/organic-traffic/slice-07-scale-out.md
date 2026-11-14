---
status: todo
---

# Slice 7 — The other distributors, in batches of ten (only if D9 says scale)

## Delivers

Pages for the distributors the pilot left out, built exactly as slice 4, released at most ten per
deploy and at least seven days apart. 93 remain on 2026-11-14.

**Not every distributor gets a page.** A page exists only if it can say something its neighbours do
not. The bar, applied per distributor from the snapshot and recorded per batch:
- at least 8 tariff periods (all 103 had 8 or more on 2026-11-14); and
- a confirmed public name in the slice 3 map. A cooperative known only by its acronym stays a row in
  the hub, with no page of its own.

Order: by residential consumers if ANEEL's counts were found in slice 4, otherwise by the 12-month
change, largest first, because the change is what the page has to say.

## Needs

D9 = scale.

## Tests

Slice 4's tests, run over every page in the batch, including the masked-text check across the batch
and against the pilot.

## Done when

Per batch:

```bash
node scripts/verify-aneel-pages.mjs <each URL in the batch>
pnpm run build && node scripts/link-graph.mjs dist/client
```

- **N/N pages** match the live ANEEL API, every period and every bill row;
- 0 orphans, depth ≤ 2 for every new URL;
- ⚠️ **Owner:** "Request indexing" for the batch;
- 28 days after each batch: `sitestats inspect` and `sitestats gsc --dim page` for the batch, saved. If
  a batch's indexed share falls below the pilot's, the next batch waits and the cause is looked for
  first.
