---
tags: [research, area/domain, 2026-10-18-pj-simples-nacional]
status: active
decided: 2026-10-18
---

# What does a one-person service PJ in the Simples Nacional actually net, under the 2026 rules?

> Revenue minus a DAS at the effective rate of Anexo III or V; minus 11% INSS on a pró-labore capped at R$ 932,31; minus the IRPF the pró-labore attracts; minus the company's costs. The rest is distributed tax-free up to R$ 50.000 a month, with 10% on the whole distribution above that. The pró-labore picks the annex: 28% of revenue reaches Anexo III, while the minimum wage leaves software and consulting in Anexo V.

## What was blocking

[[2026-09-05-pj-tax-model]] found the CLT vs PJ module charging 20% INSS, uncapped, on the whole
invoice, and taxing the whole invoice with the IRPF table, with no Simples Nacional at all. It
left the fix as a product decision. On 2026-10-18 the owner chose the real model. That model
needs figures the September note only quoted from accounting firms: the annex tables, the Fator R
rule, the partner's contribution and the 2026 treatment of profits. Every one is read here from
Planalto.

## Findings

### 1. The DAS: an effective rate on the revenue, by annex (primary)

LC 123/2006, art. 18, § 1º-A: effective rate = `(RBT12 × Aliq − PD) / RBT12`, with the nominal rate
and the parcela a deduzir from the annex, chosen by the revenue of the previous twelve months. The
tables for Anexos III and V are in `fetches/planalto-lc-123-2006-art-18-anexos.md`.

Because PD exists to make the formula continuous, the effective rate has no jump at any band
boundary. Measured in the module's tests, not assumed.

### 2. The annex depends on the payroll ratio, so the pró-labore decides it (primary)

- Software development and websites are **Anexo III** (§ 5º-D, IV and VI), and become **Anexo V**
  when payroll is below 28% of revenue (§ 5º-M).
- Consulting, engineering, testing, design and other intellectual services are **Anexo V**
  (§ 5º-I), and become **Anexo III** at 28% or more (§ 5º-J).

Either way, the outcome for a one-person service company is the same: a pró-labore of 28% of
revenue puts it in Anexo III, and a smaller one leaves it in Anexo V. In the first band that is
6% against 15,5% of revenue.

### 3. The partner pays 11% on the pró-labore, capped (primary for the arithmetic)

Lei 8.212/1991: 20% (art. 21), less up to 9 points (art. 30, § 4º), gives 11% on a
salário-de-contribuição capped at the RGPS ceiling of R$ 8.475,55. That is at most R$ 932,31 a
month. The company's own 20% is inside the DAS for Anexos III and V. That last link is
corroborated by practice, not quoted.

### 4. The pró-labore is taxed like a salary, on the monthly rules (primary, already in the repo)

The IRPF monthly table, the art. 4º deductions (INSS and dependants), the R$ 607,20 simplified
route when it is more beneficial, and the Lei 15.270/2025 monthly reduction. These are the same
rules `calculateNetSalary` follows since commit `dca8d9d`.

### 5. Profits are free up to R$ 50.000 a month; above it, 10% on all of it (primary)

Lei 9.250, art. 6º-A (Lei 15.270/2025), from January 2026: 10% withheld on the **total** distributed
in a month by one company to one person, when that total exceeds R$ 50.000. At R$ 50.000,01 the
withholding is R$ 5.000. The model shows this cliff, because it is what the law does.

### 6. The leader's page is broader than ours, and not necessarily more right (measured)

nagringa.dev, position 1, asks for far more: CLT benefits, PLR, currency, regime, activity and
export (`fetches/nagringa-calculadora-clt-vs-pj.md`). Its formulas were not read. Breadth is
not the gap this note can close. Correctness on the regime most service PJs actually use is.

## Verdict: the model to build

For a monthly invoice `F`, with RBT12 = 12·F as a steady-state assumption, take the better of two
pró-labore strategies, as an accountant would:

| strategy | pró-labore | annex | why it exists |
|---|---|---|---|
| Fator R | max(minimum wage, 28% of F) | III | lowest DAS, more INSS and IRPF on the pró-labore |
| minimum pró-labore | minimum wage | V | least INSS and IRPF, highest DAS |

`PJ net = F − DAS − INSS(pró-labore) − IRPF(pró-labore) − costs − 10% × distribution if the distribution exceeds R$ 50.000`

Out of the model, and stated on the page:
- Lucro Presumido and MEI;
- service export (no ISS, PIS or Cofins on exported services);
- revenue above the Simples ceiling of R$ 4,8 million a year;
- the annual IRPFM;
- any change LC 214/2025 makes to the DAS.

## What this does not establish

- **LC 214/2025.** The tax reform's effect on the Simples in 2026 was not read. The annexes are the
  ones Planalto prints as in force.
- **"Folha de salários"** as § 24 defines it, quoted. The model takes the pró-labore as the whole
  payroll of a one-person company.
- **That 28% of revenue is the pró-labore any given accountant sets.** It is the minimum that
  reaches Anexo III, and the common choice. The model compares it with the minimum-wage
  alternative and keeps the better one, rather than asserting either.
- **The CLT side's 1/12 + 15% for 13th, FGTS and holidays.** Not re-examined. The leader asks for
  these as inputs instead.

## Sources

- [LC 123/2006](https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp123.htm) — `fetches/planalto-lc-123-2006-art-18-anexos.md` — effective rate, Fator R, Anexos III and V
- [Lei 8.212/1991](https://www.planalto.gov.br/ccivil_03/leis/l8212cons.htm) — `fetches/planalto-lei-8212-1991-art-21-30.md` — 20% less 9 points
- [Lei 15.270/2025](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15270.htm) — `fetches/planalto-lei-15270-2025-art-6a.md` — 10% on distributions above R$ 50.000
- [NaGringa, calculadora CLT vs PJ](https://www.nagringa.dev/calculadora-clt-vs-pj) — `fetches/nagringa-calculadora-clt-vs-pj.md` — position 1, inputs and scope
- Superseded in part: [[2026-09-05-pj-tax-model]], whose verdict this note implements. It stays, because it is the record of why the old model was wrong.
