---
tags: [fetch, pj-tax-model, area/domain]
source: https://www.contabilizei.com.br/contabilidade-online/inss-pro-labore/
fetched: 2026-09-05
kind: secondary
---

# INSS pró-labore 2026 — Contabilizei

> Fetched 2026-09-05 · An accounting firm's reference page. Secondary, but the two structural
> claims below are corroborated by the RGPS ceiling this repo already holds in
> `src/lib/calculators/inss-constants.ts`.

## What it says

- Rate: *"O valor do INSS sobre o pró-labore é de 11% sobre o valor retirado"*.
- Capped: *"a contribuição do INSS de 11% sobre o valor do pró-labore do sócio é fixa e
  obrigatória, sendo limitada ao teto de contribuição do INSS"*.
- 2026 maximum: *"o valor de R$932,31 para quem retira pró-labore"*.
  Cross-checks against this repo: `0,11 × TETO_INSS (8.475,55) = 932,31`.
- The 20% is a different contribution, paid by a different party:
  *"a empresa ainda deve recolher uma contribuição patronal de 20% sobre o valor bruto do
  pró-labore"* — and only for companies **outside** Simples Nacional.

## What it does not say

Nothing about how much of an invoice becomes pró-labore, which is the company's own decision and
is what the Fator R turns on.
