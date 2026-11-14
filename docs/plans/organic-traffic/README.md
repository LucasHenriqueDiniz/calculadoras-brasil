# Plan — organic traffic

Pitch: `docs/pitches/organic-traffic.md`
Research: `docs/research/2026-11-14-search-cliff-2026-07-25/research.md`,
`docs/research/2026-11-14-public-data-pages/research.md`
Decision: D8 in `docs/architecture/ARCHITECTURE.md` (proposed; becomes binding when the owner merges
this plan)

Eight slices. 1 and 2 are cheap and go first because Google takes weeks to re-crawl, and that wait
runs while 3–5 are built. 6 is a wait on Google's clock. 7 and 8 happen only if 6 says so.

| slice | delivers | done when, in one line |
|---|---|---|
| 1 — hosts | `www` and `workers.dev` answer 301 to the apex | 28/28 sitemap paths × 2 hosts → `301` to the same path on the apex |
| 2 — declined pages | the 2 URLs Google declined merged behind a 301 | 2/2 → `301`; sitemap lists 26; both targets still indexed |
| 3 — tariff hub | ANEEL snapshot + `/tarifa-de-energia`, 103 distributors ranked | 103/103 rows in the HTML equal the ANEEL API to 5 decimals |
| 4 — distributor pilot | 10 distributor pages with history, rank and bill table | 10/10 pages: every period and every bill value equals the ANEEL API |
| 5 — internal links | the cluster linked from the pages that earned July | 0 orphans; every new page ≥ 3 inbound links, ≤ 2 clicks from `/` |
| 6 — pilot gate | D9: scale, hold or stop, from Google's numbers | D9 written with inspection and impression counts for the 11 URLs |
| 7 — scale-out | the other distributors, in batches | per batch, slice 4's check N/N; per batch, Google's numbers recorded |
| 8 — fuel hub | `/preco-combustivel`, 27 states with history | 27 × 3 values equal the ANP workbook; history equals the série histórica |

**Baseline, 2026-11-14** (`docs/research/2026-11-14-search-cliff-2026-07-25/measurements/`):
26 of 28 sitemap URLs indexed; 0 clicks and 8 impressions in the last 28 days; 25 impressions in the
111 days since 2026-07-25.

**Owner actions.** Each is marked ⚠️ in its slice, and none can be done from code:
- the `www` DNS record (slice 1);
- "Request indexing" for every new URL after it deploys (slices 3, 4, 7, 8);
- approving D9 (slice 6);
- for slice 8, choosing how the weekly fuel snapshot gets committed.

**Rules every slice keeps** (D8):
- no page per kWh value, city or query wording;
- every page carries numbers from the dataset that no other page on the site carries;
- new pages ship in batches of at most 10, never the whole set in one deploy;
- each slice's done criterion compares the page against the source, not against our own fixture.

Out of scope for all eight, per the pitch: head-term work, new articles, the AdSense review, and the
items in `docs/IDEAS.md`.
