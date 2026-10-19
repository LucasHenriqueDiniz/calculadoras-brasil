---
tags: [fetch, 2026-10-18-adsense-added-value]
source: https://www.buk.com.br/recursos/calculadoras/calculadora-salario-liquido
fetched: 2026-10-18
kind: vendor
---

# Calculadora de Salário Líquido - Atualizado 2026 (INSS e IRRF) | Buk

> Fetched 2026-10-18 · Position 1 for "calculadora salário líquido 2026". Buk sells HR and payroll software; the calculator is a lead page for it.

## What it says

- **Form:** three fields: gross salary, "Outros Descontos" and number of dependants. There is no
  private pension field.
- **Page:** 688 words in the main element, as read by the browser on 2026-10-18. An H2 promotes
  the payroll product, and 8 FAQ entries cover gross vs net, the INSS table, IRRF exemption,
  benefits and use by companies.
- **Calculation**, read from its public script `template_calc-salario-BR.min.js` rather than by
  submitting the form:
  - the monthly IRRF base takes the larger of the R$ 607,20 simplified discount and INSS plus
    dependants;
  - the 2026 table is applied;
  - the Lei 15.270/2025 reduction follows, with constants 5.000 / 7.350 / 312,89 / 978,62 /
    0,133145.
  This is the same rule `calculateNetSalary` follows since commit `dca8d9d`.

## What it does not say

- It never explains to the visitor that the simplified discount was chosen, or where it stops
  winning. It applies the rule silently and returns one salary's breakdown at a time.
- No table across salaries, and no worked example with the 2026 reduction written out.
