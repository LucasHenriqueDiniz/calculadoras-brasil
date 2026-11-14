---
tags: [measurement, 2026-11-14-search-cliff-2026-07-25]
measured: 2026-11-14
---

# Search Console and Cloudflare dashboard, read on 2026-11-14

Read in the owner's Chrome (Claude in Chrome), property `sc-domain:calculebrasil.com` and the owner's
Cloudflare account. Nothing was changed on either screen. Portuguese literals are quoted as the
screen showed them.

## Search Console

| screen | what it showed |
|---|---|
| Ações manuais | "Nenhum problema foi detectado" |
| Problemas de segurança | "Nenhum problema foi detectado" |
| Remoções → Remoções temporárias | "Nenhuma solicitação enviada nos últimos seis meses" (covers 2026-05-14 onward, so 2026-07-25 is inside the window) |
| Configurações → Estatísticas de rastreamento | window 2026-08-15 .. 2026-11-11 only; 2.14k requests, 108 ms average; responses OK (200) 91%, 302 4%, 301 2%, "Erro do DNS" 1%, 404 1% |
| Hosts in that report | `calculebrasil.com` 2,104 requests, "Problemas no passado"; `www.calculebrasil.com` 32 requests, "Sem problemas" |
| Status do host, `calculebrasil.com` | robots.txt and DNS "Taxa de falhas aceitável"; "Conectividade do servidor": "Taxa de falhas aceitável recentemente, mas alta no passado". The chart shows one small spike near 2026-10-05..07 and nothing else |

The crawl-stats report keeps 90 days. It cannot see 2026-07-25.

## Cloudflare

**Audit log, old view** (the new view refuses dates before its retention window: "Selected date is
outside the allowed range"):

| filter | result |
|---|---|
| 2026-07-15 .. 2026-08-04, domain `calculebrasil.com` | "We couldn't find any matching records for this time frame." No DNS, zone-setting, SSL or route change on the zone in those three weeks. |
| 2026-07-23 .. 2026-07-26, no filter | account-level Worker events exist (script deploys, tail starts, a Pages project `sounddeck-…`). The one expanded on 2026-07-26 20:46 BRT was `Deployed script jikan-edge`. Not every row was expanded. |

**Worker `calcule-brasil` → Deployments.** The version list loads 30 rows at a time and shows ages
("2mo ago"), not dates. Paging back past the Workers Builds rows reaches a run of "Manually deployed /
Wrangler" versions, which are the GitHub Actions `wrangler deploy` runs of June and 2026-07-27. The ages
do not separate 2026-07-25 from 2026-07-27, so this screen neither shows nor rules out a manual deploy
between 2026-06-26 and 2026-07-27.

`wrangler versions list` and `wrangler deployments list` return only the last 10. A direct call to the
versions API with the local Wrangler token was refused by this session's permission check, so the full
list was not read.

## How to close the gap later

The owner can run this with an API token that has Workers Scripts Read, and it answers whether anything
was deployed on 2026-07-24..26:

```bash
curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/workers/scripts/calcule-brasil/versions?per_page=100" \
  | jq -r '.result.items[].metadata.created_on' | sort | awk '$1 >= "2026-06-20" && $1 < "2026-08-07"'
```
