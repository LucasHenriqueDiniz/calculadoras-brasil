---
tags: [research, area/domain, pj-tax-model]
status: active
decided: 2026-09-05
---

# Does `/calculadora-clt-vs-pj` model a real PJ, and is its FAQ or its arithmetic the thing that is wrong?

> **Verdict: the model is wrong and the copy is roughly right** — the opposite of what the
> whole-branch review assumed when it framed this as "either the copy or the model".

Searched in Portuguese: this is Brazilian tax practice and the sources are Brazilian. Both are
accounting firms, so **secondary** — no primary text was read for the Simples Nacional rates, and
that limit is stated again under "What this does not establish".

## What was blocking

The page's FAQ says it is common to need *"entre 25% e 40% a mais como PJ"*. The corrected module
renders **+65% to +72%**. A whole-branch review flagged the contradiction and could not settle
which side was wrong, because `docs/research/2026-09-04-irpf-2026-table/research.md` covers the
IRPF tables and the Lei 15.270/2025 reduction and nothing about pró-labore.

## Findings

### 1. The PJ contribution is 11% and capped — the module charges 20%, uncapped, on the wrong base

| | module | reality |
|---|---|---|
| rate | 20% | **11%** for the sócio |
| ceiling | none | **capped at the RGPS ceiling** — `0,11 × 8.475,55 = R$ 932,31/month` |
| base | the whole invoice | the **pró-labore**, a fraction of the invoice the company sets |

The 20% figure is real but belongs to someone else: it is the **patronal** contribution, paid by
the company, and only by companies **outside** Simples Nacional.

Measured on the module, 2026-09-05:

| CLT gross | module's `pjNecessaria` | INSS it charges on that invoice | legal pró-labore maximum |
|---|---|---|---|
| 8.000 | 13.204,86 (+65%) | 2.640,97 | 932,31 |
| 10.000 | 16.730,13 (+67%) | 3.346,03 | 932,31 |
| 15.000 | 25.771,01 (+72%) | 5.154,20 | 932,31 |

At R$ 10.000 the module invents **R$ 2.413,72 a month** of contribution that nobody owes — 3,6x
the ceiling.

### 2. It also models no Simples Nacional at all, which is what a service PJ actually pays

The module applies the IRPF monthly table to the invoice. A real service PJ pays a DAS of 6%–19,5%
(Anexo III, Fator R ≥ 28%) or up to 33% (Anexo V), and IRPF only on the pró-labore. The page's own
FAQ and disclaimer both mention Simples Nacional, so the copy already describes a regime the
arithmetic never implemented.

### 3. The FAQ's range is close to the source's worked case; the module's is not

For a CLT salary of R$ 10.000, netting about R$ 8.200, the source matches it by invoicing
**R$ 13.000–14.000** — **+30% to +40%**. The FAQ says 25%–40%. The module says R$ 16.730, +67%.

## Verdict

`INSS_RATE_PJ = 0.2` applied uncapped to the whole invoice is a defect, not a modelling
simplification, and it biases every verdict on the page toward CLT. The FAQ needs no change.

**What to do is a product decision this note does not make**, because the honest options differ in
size:

| option | cost | what the page then claims |
|---|---|---|
| cap the contribution at R$ 932,31 and drop the rate to 11% | small | still no Simples Nacional; closer, still overstated |
| add a pró-labore input and tax only that | medium | matches the real mechanism; asks the visitor something they may not know |
| model Simples Nacional with the Fator R | large | matches reality; needs the DAS bands, which are not researched |
| state the model's assumptions on the page and keep it simple | smallest | honest, and stops the FAQ contradicting the result |

## What this does not establish

- **No primary source was read.** Both fetches are accounting firms. The 11% and the R$ 932,31
  ceiling are corroborated by arithmetic against this repo's own `TETO_INSS`, but the Simples
  Nacional bands are quoted, not verified.
- The DAS band composition, and therefore any figure a Simples-modelling implementation would need.
- What fraction of an invoice a typical PJ takes as pró-labore — a company decision, and the thing
  the Fator R turns on.
- Whether the CLT side of the comparison (`1/12 + 0.15` for 13th, FGTS and allowances) is right.
  Not examined here.

## Sources

- [INSS pró-labore 2026 — Contabilizei](https://www.contabilizei.com.br/contabilidade-online/inss-pro-labore/) — `fetches/contabilizei-inss-pro-labore.md` — the 11% rate, the ceiling, and who owes the 20%.
- [Como comparar salário CLT e renda como PJ — Agilize](https://agilizecontabilidade.com.br/artigos/calculadora-salario-clt-pj-2026/) — `fetches/agilize-clt-vs-pj-2026.md` — the Simples Nacional bands, the Fator R threshold, and the worked equivalence case.
