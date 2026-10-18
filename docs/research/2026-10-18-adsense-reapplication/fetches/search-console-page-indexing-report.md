---
tags: [fetch, 2026-10-18-adsense-reapplication]
source: https://support.google.com/webmasters/answer/7440203?hl=en
fetched: 2026-10-18
kind: primary
---

# Page indexing report — Search Console Help

> Fetched 2026-10-18 · Google's own definitions of the coverage states the URL Inspection API returned for the site's 51 public URLs.

## What it says

- **Discovered – currently not indexed:** the page "was found by Google, but not crawled yet". Google may have postponed the crawl to avoid overloading the site.
- **Crawled – currently not indexed:** Google crawled the page but did not index it, and it "may or may not be indexed in the future".
- **Soft 404:** Google thinks the response is a soft 404, meaning a page that reads as "not found" or empty while returning a success code.

## What it does not say

- It gives no quality reason for either "not indexed" state. Reading them as a site-quality signal is a common inference, and Google does not state it on this page.
- The overload explanation is hard to apply to a 51-page site on Cloudflare's edge, but this page does not rule it out.
