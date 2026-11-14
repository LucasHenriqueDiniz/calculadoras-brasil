---
status: todo
---

# Slice 1 — `www` and `workers.dev` answer with a 301 to the apex

## Delivers

Measured on 2026-11-14 (`docs/research/2026-11-14-search-cliff-2026-07-25/measurements/serp-and-hosts-2026-11-14.md`):

| host | today | after |
|---|---|---|
| `www.calculebrasil.com` | NXDOMAIN. Googlebot asked for it 32 times in 90 days, and crawl stats count 1% DNS errors | `301` to `https://calculebrasil.com` + same path and query |
| `calcule-brasil.lucas-hdo.workers.dev` | `200`, the whole site, canonical pointing at the apex | `301` to the apex, or no longer served (see below) |

This is hygiene. The research found no sign that either host caused the drop of 2026-07-25.

**`www`.** ⚠️ **Owner**, in the Cloudflare dashboard for the zone:
1. DNS: a **proxied** record for `www` pointing at a placeholder (`A 192.0.2.1` or `AAAA 100::`). The
   placeholder has no origin, so without step 2 visitors get a 522.
2. Rules → Redirect Rules: the "Redirect from WWW to root" template, `301`, preserve query string.

Both from Cloudflare's own example,
<https://developers.cloudflare.com/rules/url-forwarding/examples/redirect-www-to-root/> (search
result read 2026-11-14; reread the page when doing this, it is the dashboard's current wording that
counts).

Nothing in the repo changes for this half. Record the two settings in `docs/deploy.md`, next to the
other dashboard-only configuration, because invisible config is what broke the build in August.

**`workers.dev`.** Prerendered pages are served by the asset server before the Worker runs, so a host
check in Worker code would not see them. Two ways out, chosen inside this slice:
- `"workers_dev": false` in `wrangler.jsonc`, **only if** the Workers Builds PR previews survive it.
  Read the Wrangler docs for the version in `package.json` (skill `docs-stack`) before relying on how
  `workers_dev` and `preview_urls` interact, then prove it on the PR: the "Workers Builds" check still
  posts a preview URL that answers `200`.
- otherwise, leave it. The canonical already points at the apex, and Google consolidates on it. Say so
  in `docs/deploy.md` and close the slice on the `www` half.

## Needs

Nothing from other slices.

## Tests

- `pnpm run check` green if `wrangler.jsonc` changed.
- The PR's own preview URL answers `200`, if `workers_dev` changed.

## Done when

```bash
curl -s https://calculebrasil.com/sitemap.xml | grep -o '<loc>[^<]*</loc>' | sed 's/<[^>]*>//g; s#https://calculebrasil.com##' > /tmp/paths.txt
ok=0; n=0; while read -r p; do n=$((n+1));
  r=$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "https://www.calculebrasil.com$p?x=1")
  [ "$r" = "301 https://calculebrasil.com$p?x=1" ] && ok=$((ok+1)) || echo "FAIL $p -> $r"
done < /tmp/paths.txt; echo "www: $ok/$n"
```

**Baseline, run 2026-11-14 before any change:** `www: 0/28`, apex `200` on 28/28, `workers.dev` `200`.
The check is red today for the reason it exists.

- **`www: 28/28`** (or N/N for however many paths the sitemap lists that day).
- The same loop against the apex prints `200` for N/N: nothing on the apex moved.
- For `workers.dev`, whichever way was chosen: `curl -s -o /dev/null -w '%{http_code}'
  https://calcule-brasil.lucas-hdo.workers.dev/` prints `301` (redirected) or a non-200 (not served),
  or `docs/deploy.md` records why it was left at `200`.
- Revert check: with the redirect rule disabled for a minute, the loop prints `0/28`. Re-enable it.

Google's half, read in slice 6 and not blocking this slice: Search Console crawl stats for host
`www.calculebrasil.com` shows 301 responses, not DNS errors.

## If stuck

If the redirect rule template is not offered on the zone's plan, a Bulk Redirect list with one entry
(`www.calculebrasil.com` → `https://calculebrasil.com`, subpath matching, preserve path and query) does
the same thing.
