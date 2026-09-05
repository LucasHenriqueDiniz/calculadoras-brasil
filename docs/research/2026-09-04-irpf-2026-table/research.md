---
tags: [research, area/domain, irpf-2026-table]
status: active
decided: 2026-09-04
---

# What is the IRPF table actually in force for the 2026 calendar year, and what does `calculateIrpf` have to implement?

> **Verdict:** every number in `IRPF_TABLE_2026` is wrong, and the table is only half the job —
> the 2026 exemption is a **redutor applied on top of the table**, which the module has no
> concept of at all.

Searched in Portuguese, deliberately: this is Brazilian tax law and the primary sources are the
Receita Federal and the law text. Portuguese literals are quoted verbatim below rather than
translated, per the `language` skill. The note itself is English.

## What was blocking

`docs/pitches/irpf-calculation-defects.md` proved four defects in `calculateIrpf` against the
module itself, but deliberately refused to say what the correct table is. Nothing could be fixed
until that was answered, and correcting one unverified table to another would have proved nothing.

## Findings

### 1. The official annual table (ano-calendário 2026, exercício 2027)

Source: the Receita's own table page — `fetches/receita-federal-tabelas-2026.md`.

| base de cálculo | alíquota | parcela a deduzir |
|---|---|---|
| até R$ 29.145,60 | — | — |
| 29.145,61 – 33.919,80 | 7,5% | 2.185,92 |
| 33.919,81 – 45.012,60 | 15,0% | 4.729,91 |
| 45.012,61 – 55.976,16 | 22,5% | 8.105,85 |
| acima de 55.976,16 | 27,5% | 10.904,66 |

Dependant R$ 2.275,08 · simplified-discount ceiling R$ 17.640,00 · education ceiling R$ 3.561,50.

**Measured, not cited** — two checks run locally on 2026-09-04:

- The official table is **continuous at all four boundaries**, to within half a cent of rounding.
  This is the same invariant `tests/calculators/irpf.test.ts` asserts, so that test is now known
  to encode a property the real table has.
- The annual table is **exactly 12× the monthly one** at every boundary
  (`2428,80 × 12 = 29.145,60`, and so on for all four).

### 2. Every figure in the module is wrong

| | module | official | |
|---|---|---|---|
| exemption ceiling | 21.503,34 | **29.145,60** | 7.642,26 too low |
| 7,5% parcel | 1.612,75 | **2.185,92** | |
| 15% boundary / parcel | 33.503,34 / 4.257,67 | **33.919,80 / 4.729,91** | |
| 22,5% boundary / parcel | 44.693,59 / 7.633,69 | **45.012,60 / 8.105,85** | |
| 27,5% boundary / parcel | 55.471,74 / 10.432,32 | **55.976,16 / 10.904,66** | |
| dependant | 2.275,00 | **2.275,08** | 8 centavos |
| education ceiling | 3.561,50 | **3.561,50** | the one correct constant |
| simplified rate | 20,5%, uncapped | **20%, capped at 17.640,00** | |

**No published table was found that matches the module's figures**, and that is a finding rather
than a gap in the search. The module's first parcel is internally consistent with its own first
boundary (`0,075 × 21.503,33 = 1.612,75`), so the numbers were computed, not mistyped — from an
exemption threshold that does not appear in any source read here.

### 3. The 2026 exemption is a redutor, not a table change — and this is the real finding

This is the part the pitch did not anticipate. Lei 15.270/2025 **did not move the brackets.** It
left the table alone and subtracts a separate reduction from the tax the table produces:

| annual income | reduction |
|---|---|
| up to R$ 60.000,00 | "até R$ 2.694,15 (de modo que o imposto devido seja zero)" |
| 60.000,01 – 88.200,00 | "R$ 8.429,73 - (0,095575 x rendimentos tributáveis sujeitos ao ajuste anual)" |
| above 88.200,00 | none |

Capped at the tax actually due, so it can zero the tax but never create a refund.

⚠️ **A calculator that implements only the table is wrong for everyone earning under R$ 88.200 a
year**, and most wrong precisely in the band this site's audience sits in. Fixing the numbers in
`IRPF_TABLE_2026` and stopping there would leave the page confidently telling someone on
R$ 4.000 a month that they owe tax they do not owe.

### 4. The law's own constants, derived independently

The research skill asks for an oracle other than the thing under test. Both first-band caps fall
out of the table with no appeal to the law text:

```
annual:  income 60.000 → discount min(20%, 17.640) = 12.000 → base 48.000
         48.000 × 0,225 − 8.105,85 = 2.694,15   ← law states 2.694,15
monthly: income  5.000 → discount 607,20        → base  4.392,80
          4.392,80 × 0,225 − 675,49 =   312,89   ← law states   312,89
```

Both to the centavo. The phase-out point corroborates too: `17.640 / 0,20 = 88.200`, exactly where
the annual reduction reaches zero — the ceiling on the simplified discount and the end of the
redutor are the same income by construction.

### 5. A fifth defect, found while reading the law

The simplified discount **replaces every other deduction**, dependants included. `irpf.ts:98`
subtracts `descDependentes` from the simplified base as well:

```ts
const baseImponvelSimplificada = Math.max(baseCalculoSimplificada - descDependentes, 0);
```

That is a deduction taken twice. ⚠️ **And `tests/calculators/irpf.test.ts` currently asserts this
behaviour as correct** — the case "applies dependants under the simplified regime too" passes
today and certifies the bug. It has to be inverted, not deleted.

## Verdict

1. Replace `IRPF_TABLE_2026` with the official annual table above, expressing boundaries once so
   the `.34`/`.35` gap cannot recur.
2. Add the Lei 15.270/2025 annual redutor. Without it the page is wrong for its core audience.
3. Simplified regime: rate 20% (not 20,5%), ceiling R$ 17.640,00, and **no other deduction on top**.
4. Dependant R$ 2.275,08.
5. Replace the flat 10% INSS with `calcularInssEmpregado` from `inss-constants.ts`.
6. Invert the simplified-dependants test before fixing the code, so it fails first.

## What this does not establish

- **Whether the page should present the monthly or the annual view.** The monthly table and
  redutor are recorded here and differ in structure; which one `/calculadora-irpf-2026` promises
  is a product question, not a research one.
- **`MAX_DEDUCTION_HEALTH = 2666.67`.** No cap on health deductions was found in any source read,
  consistent with the module's own comment that "no official cap exists". Whether to keep an
  invented cap is a product decision.
- **The 65+ exemption (R$ 1.903,98 monthly)** exists in the official table and the module has no
  concept of it. Out of scope here; recorded so it is not rediscovered as a surprise.
- **Nothing was verified against the Receita's own calculator**, which would be the strongest
  possible check. The figures cross-check against each other and against arithmetic instead.
- The redutor news page at the Receita is **behind authentication** — see
  `fetches/receita-federal-noticia-reducao.md`. The formula here comes from the law text and the
  worked-examples page, which agree.

## Sources

- [Tributação de 2026 — Receita Federal](https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/tabelas/2026) — `fetches/receita-federal-tabelas-2026.md` — the monthly and annual tables and every deduction ceiling. Primary, and the source of record.
- [Lei nº 15.270, de 26 de novembro de 2025](https://www2.camara.leg.br/legin/fed/lei/2025/lei-15270-26-novembro-2025-798354-publicacaooriginal-177117-pl.html) — `fetches/camara-lei-15270-2025.md` — the redutor formulas and limits, monthly and annual.
- [Exemplos de Aplicação da Lei 15.270/2025 — Receita Federal](https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/tabelas/exemplos-de-aplicacao-da-lei-15-270-2025) — `fetches/receita-federal-exemplos-lei-15270.md` — corroborates the monthly formula and shows the coefficient applies to gross income, not the base.
- [Receita Federal orienta fontes pagadoras…](https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2025/dezembro/receita-federal-orienta-fontes-pagadoras-e-contribuintes-a-calcular-a-reducao-do-imposto-de-renda-a-partir-de-1o-de-janeiro-de-2026) — `fetches/receita-federal-noticia-reducao.md` — **not readable**, authentication required. Recorded as a dead end.
