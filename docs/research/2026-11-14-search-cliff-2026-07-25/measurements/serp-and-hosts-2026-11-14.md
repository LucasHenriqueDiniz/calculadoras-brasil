---
tags: [measurement, 2026-11-14-search-cliff-2026-07-25]
measured: 2026-11-14
---

# What Google shows for the site, and which hosts answer

## Google, google.com.br, `hl=pt-BR&gl=br`

Read in the owner's Chrome. The session is logged in, so results may carry personalisation.

| query | result |
|---|---|
| `calculebrasil` | Google rewrites it: "Exibindo resultados para calcule brasil". Page 1 holds calculabrasil.com (twice), calculadorabrasil.com.br, brasilcalculadora.com.br, fiscaldata.com.br, bcb.gov.br, nexojornal, calculabrasilonline.com.br, tributos.gov.br. **calculebrasil.com is not on page 1.** |
| `"calculebrasil.com"` | 9 results on page 1, all calculebrasil.com: `/`, `/calculadoras`, `/sobre`, `/contato`, `/calculadora-assinaturas`, `/metodologia`, `/calculadora-salario-liquido`, `/blog`, `/termos` |
| `site:calculebrasil.com` | results on 3 pages, starting with `/`, `/calculadoras`, `/blog`, `/metodologia`, `/privacidade`, `/termos`, `/sobre`, `/contato`, `/calculadora-custo-mudanca`, `/calculadora-inss-autonomo` |

The site is indexed and Google can find it by its exact domain. It does not surface it for the
unquoted brand, and prefers a misspelling to it.

## Hosts, `curl`

| URL | status | canonical in the HTML |
|---|---|---|
| `https://calculebrasil.com/` | 200 | `https://calculebrasil.com/` |
| `https://calcule-brasil.lucas-hdo.workers.dev/` | **200**, same page | `https://calculebrasil.com/` |
| `https://calcule-brasil-preview.lucas-hdo.workers.dev/` | 404 | — |
| `https://www.calculebrasil.com/` | no answer: `dig` returns **NXDOMAIN** (SOA `elsa.ns.cloudflare.com`) | — |

The `workers.dev` host serves the full site with a 200. Its canonical points at the apex, so Google
should fold it into the apex, but it is a second copy that a redirect would remove.
