---
tags: [research, area/content, 2026-10-18-adsense-added-value]
status: active
decided:
---

# What does each calculator do that the page ranking first for its query does not?

> Salário líquido, the pilot: nothing, until today. The top result applied the 2026 law correctly and ours did not. Fixed, it now does what the leader does, plus a table across 16 salaries, the simplified-discount crossover explained, a private pension field, and the 2026 reduction written out line by line. The other 11 calculators are slices 4 and 5.

## What was blocking

`ADS-CONTENT-ORIGINAL` asks, for each tool page, what it offers that the pages already ranking do
not. [[2026-10-18-adsense-reapplication]] found Google keeping 20 of the 51 public pages, and
[[adsense-reapplication]] makes this question the core of steps 3–5. Before building added value
on 12 pages, the approach is piloted on the one with the highest priority:
`/calculadora-salario-liquido`.

## Method

For each calculator:

1. Search its main query on Google Brasil (`hl=pt-BR&gl=br`) in the app's browser pane.
2. Read the first organic result: its page, and its calculation where it ships one.
3. Compare the two calculators on the same inputs, then write one answer.

Fetch files keep short quotes and descriptions, not page copies. Statute text is quoted in full,
because it is free to reproduce.

Measured against claimed is marked in every row.

## Answers

| calculator | query | #1 on 2026-10-18 | what ours does that #1 does not | status |
|---|---|---|---|---|
| salário líquido | calculadora salário líquido 2026 | buk.com.br | see below | **built** (slice 3) |
| CLT vs PJ | calculadora clt vs pj | nagringa.dev | see below | **built** (slice 4) |
| IRPF 2026 | calculadora irpf 2026 | receita.fazenda.gov.br (official simulator) | see below | **built** (slice 4) |
| INSS autônomo | calculadora inss autônomo | meutudo.com.br | see below | **built** (slice 4) |
| Previdência complementar | calculadora previdência privada pgbl | portal.icatuseguros.com.br | see below | **built** (slice 4) |
| Benefícios fiscais | — (no SERP read; the defects were in the arithmetic) | — | see below | **built** (slice 4) |
| Conta de luz | calculadora conta de luz por aparelho | portal.elfsm.com.br | see below | **built** (slice 5) |
| the other 5 household calculators | — | — | — | slice 5 |

## Salário líquido

### What the leader does (measured)

Buk's calculator (`fetches/buk-calculadora-salario-liquido.md`), read from its public script:

- it takes the larger of the R$ 607,20 simplified discount and INSS plus dependants;
- it applies the 2026 monthly table;
- it applies the Lei 15.270/2025 reduction with the statute's constants.

That is correct under Lei 9.250, art. 4º, § 2º (`fetches/planalto-lei-14663-2023.md`). The form
asks for gross, other deductions and dependants, and returns one salary's breakdown.

### What ours did before today (measured)

Ours was **wrong where the leader was right**. Measured with the module itself on 2026-10-18:

- **The legal route, always.** With the page's own default, R$ 5.000 and no deductions, it
  withheld **R$ 23,78** against the correct R$ 0, a salary the statute exempts. The error
  covered every gross from R$ 4.878 to R$ 5.754.
- **Health and education in the monthly base.** Art. 4º does not allow them; they belong to the
  annual adjustment (`fetches/planalto-lei-9250-1995-art-4.md`).
- **"Previdência complementar mensal" read as an annual amount**, and divided by twelve.

All three are fixed in commit `dca8d9d`, with tests built on an oracle from the published tables
that shares no code with the module. Each defect was put back in turn and turned the suite red.

### What ours does now that the leader does not

| | ours | Buk | how verified |
|---|---|---|---|
| applies the more beneficial route | yes | yes | ours: tests swept over 0–12.000 with 0–2 dependants; Buk: its script |
| **says which route applied, and what the other would have deducted** | yes, a breakdown line | no | page render |
| **a table across 16 salaries**, minimum wage to R$ 20.000 | yes, built by the calculator itself | no, one salary at a time | 8 of 8 table rows typed into the form matched |
| **where the simplified discount stops winning** | R$ 5.754,90 with no dependants, computed; the effect disappears with one dependant | no | `simplifiedRouteCeiling` tests |
| **the 2026 reduction as its own column and worked example** | yes | constants in the script, not on the page | page render |
| private pension (PGBL) deduction | yes | no field | form |
| "Outros descontos" free field | no | yes | form |

The row at R$ 4.500 reproduces the Receita's own worked example to the centavo: base R$ 3.892,80,
table R$ 200,39, reduced to zero. That is the cross-check that the table is the law and not only
the module's opinion of it.

### Verdict for this page

The added value is **correctness made visible**: the same rule the leader applies, explained where
it matters, across the salaries a visitor compares. It is not a longer page for its own sake. The section adds 702 words, counting the
table's cells, and takes the prerendered main content to 1.517 words, measured on the build. Its
value is that it is the part no competitor read had.

## CLT vs PJ

### What the leader does (measured, not its formulas)

nagringa.dev asks for far more than this page ever did: CLT benefits, PLR, currency, PJ regime,
activity, service export and accountant. Its copy names the Simples Nacional, the Fator R, Anexos
III and V, Lucro Presumido and MEI
(`../2026-10-18-pj-simples-nacional/fetches/nagringa-calculadora-clt-vs-pj.md`). Its formulas were
not read.

### What ours did before today (measured on the module, 2026-09-05 and 2026-10-18)

The PJ side was not a PJ:
- 20% INSS, uncapped, on the whole invoice;
- the IRPF table applied to the whole invoice;
- no Simples Nacional.

The CLT side missed the simplified discount at R$ 4.878–5.754. At a CLT salary of R$ 10.000 it
put the break-even at +67%. The September research had flagged all of it and left the PJ model as
a product decision.

### What ours does now that the leader does not

Built on the Simples Nacional model of D6, with every figure from Planalto
(`../2026-10-18-pj-simples-nacional/`):

| | ours | NaGringa | how verified |
|---|---|---|---|
| the DAS by the effective-rate formula, Anexos III and V, Fator R | yes | named in its copy | oracle from LC 123's tables, swept over invoices from 250 to 120.000 |
| **chooses the pró-labore, and says which and why** | three strategies, including the one that keeps the distribution at R$ 50.000 | not visible | tests; breakdown line |
| **2026's 10% on distributions above R$ 50.000, as a cliff on the total** | yes, and avoided when a larger pró-labore pays less | FAQ mentions the question | tests |
| **a break-even table across 11 CLT salaries** | yes, built by the calculator | one scenario at a time | 5 of 5 typed salaries matched the table; at the break-even invoice the page reads "Empate técnico" |
| breadth of CLT inputs (PLR, benefits, currency) | no | yes | — |

Two defects turned up while building, both found by tests and fixed:
- **The Fator R decided in floating point.** At R$ 7.334, 28% read as 27,99…%, and the company
  was put in Anexo V, losing R$ 648.
- **The break-even rounded to the nearest centavo.** It could land one centavo short of the
  package.

## IRPF 2026

### What the leader does (measured)

The Receita Federal's own simulator (`fetches/receita-simulador-irpf.md`): 132 words, two tabs,
one "Deduções" field, and tax and effective rate as the result. It is authoritative and bare.
Its annual tab is **exercício 2026**, the return filed in 2026 on 2025 income.

### What ours did before today (measured)

- It capped health at an invented R$ 2.666,67. Lei 9.250, art. 8º, II, "a" sets no limit.
- It capped education once per family. "b" says "limite anual individual".
- It did not cap private pension at the 12% the Receita's FAQ gives.
- It asked the visitor to pick a regime blind.
- Its FAQ called uniforms, school transport and pharmacy medicines deductible. None is.
- It said "IRPF 2026" without saying which year: the query covers the 2026 return, on 2025
  income, and this page models ano-calendário 2026.

### What ours does now that the leader does not

| | ours | Receita simulator | how verified |
|---|---|---|---|
| both regimes, side by side, with the better one named | yes | one field, no regimes | hand case R$ 100.000 + R$ 20.000 health: 7.900,34 complete against 11.744,34 simplified, matched in the form |
| **how much more than INSS the complete return needs, per income** | 9-row table built by the calculator | no | limiar R$ 5.782,90 at R$ 120.000: one real above picks complete, one below picks simplified, in the form |
| deductions itemised (dependants, health, education per person, PGBL at 12%) | yes | one total | tests, 4 mutants killed |
| says which tax year, and points the 2026 filer to the Receita's own simulator | yes | "Exercício 2026" only | page |

## INSS autônomo

### What the leader does (measured)

meutudo.com.br (Google Brasil, 2026-10-18; other results include ecalculos, the Receita's SAL and
gov.br's GPS page):
- 3.214 words, and one input: a salary. It is an **employee** INSS calculator.
- Self-employed, MEI and facultativo contributions are covered only in text.
- Its tables are headed **2025 and 2024**.

### What ours did before today (measured)

- It applied art. 19's 20 years to every man, so a man contributing since before the reform, who
  can retire with 15 under art. 18, was told he had not reached the minimum.
- Its sex selector said "Masculino (mínimo de 20 anos)".
- Its disclaimer said transition rules were not considered.

### What ours does now that the leader does not

| | ours | meutudo | how verified |
|---|---|---|---|
| the two self-employed plans, 20% and 11%, with their cost | yes | text only | form |
| **EC 103's minimum by affiliation date: art. 18 against art. 19** | yes, a field | no | form: a man with 15 years reaches it before the reform and lacks 5 years after it; 2 mutants killed |
| **what the 20% plan costs more, and what it pays more, across five incomes** | table built by the calculator | no | R$ 3.500 at 30 years: R$ 2.800,00 in the table and in the form |
| 2026 values | yes | 2025 and 2024 tables | page |

## Previdência complementar

### What the leader does (measured, partly)

Icatu Seguros' "Simulador Meu IR" ranks first; Grão, XP, Caixa, Brasilprev and BTG follow. Its
calculator renders in JavaScript and none of its working was readable. It is an insurer's tool,
built to sell a contribution. The tools around it ask for an income.

### What ours did before today (measured)

The "economia de IRPF" was the contribution times a 22,5% rate the visitor could neither see nor
set. It ignored three things:
- the deduction exists only in the complete return;
- it stops at 12% of income;
- it first has to overtake the simplified discount.

At R$ 120.000 with R$ 1.000 a month, the page said R$ 2.700. The real saving is R$ 1.709,70.

### What ours does now

| | ours | how verified |
|---|---|---|
| the saving from the visitor's income: tax on the better return without the PGBL, less with it | yes | hand case R$ 1.709,70, matched in the form; returning to contribution × rate turns 3 tests red |
| **what a 12% PGBL returns this year, by income** | table: 0% to R$ 60.000, 6,0% at R$ 72.000, 24,2% at R$ 400.000 | built by the IRPF calculator; `test:seo` asserts the R$ 120.000 row |
| no unsourced "historical average 8–10%" hint | removed | page |

## Benefícios fiscais

No competitor was read for this one: the defects were in its own arithmetic, read against three
laws on Planalto (`fetches/planalto-beneficios.md`).

- **Before:**
  - the cash equivalent was the benefit divided by one minus an income-tax rate the visitor typed,
    with no INSS at all, although the page's own FAQ said benefits escape both;
  - the whole vale-transporte counted as benefit, although the worker pays up to 6% of the salary
    towards it.
- **Now:**
  - the salary and the commute cost are inputs;
  - the vale-transporte counts only the employer's share above 6%;
  - the equivalent raise is the smallest gross raise whose extra net, by `calculateNetSalary`,
    reaches the benefit.
- **Found by it:** for someone earning R$ 5.000, R$ 800 of meal benefit is worth **R$ 1.662,99** of
  raise (+108%). Just above R$ 5.000 a raise pays INSS and income tax and shrinks the 2026
  reduction at once. Checked by hand: the net rises by exactly R$ 800,00.
- **Verified:**
  - two hand cases, R$ 1.103,45 at R$ 20.000 and R$ 320,77–78 at R$ 8.000;
  - 2 mutants killed;
  - the form matches the table;
  - `test:seo` asserts the table.

## Conta de luz

### What the leader does (measured)

portal.elfsm.com.br, the page of a distributor in Espírito Santo
(`fetches/elfsm-simulacao-de-consumo.md`):

- one appliance at a time, by power × hours × days, the same formula as ours;
- the result in kWh only, with no tariff and no reais;
- a list of 25 powers with no hours of use and no source, among them "Geladeira: 130W".

### What ours did before today (measured)

- **The refrigerator at its compressor rating.** The default list and the preset put it at 130 W
  for 24 h, 93,6 kWh a month. Eletrobrás puts a two-door frost-free one at 56,88 kWh
  (`fetches/idec-eletrobras-consumo.md`). The compressor cycles, so the page overstated the
  appliance every household has by 65%. The freezer, at 150 W, came out at 108 kWh against 47,55.
  The leader makes the same mistake.
- **An FAQ that contradicted the form.** It priced "uma geladeira média (500W)" at 4 hours a day,
  with a washing machine at 2.000 W against the preset's 500 W.
- **Percentages with no source:** standby "5%", a lukewarm shower "50%", cold water "30%".
- **The share column** printed with a decimal point, `16.4%`.

### What ours does now that the leader does not

- **Refrigerators at Eletrobrás's averages:** duplex frost-free 79 W, one-door frost-free 55 W,
  freezer 66 W, which is 56,88, 39,6 and 47,55 kWh over 720 hours.
- **Cost in reais** at the visitor's own tariff, or the distributor's from ANEEL, for the whole
  house at once.
- **A table of 20 appliances**, computed by the calculator at a typical use and the example
  tariff of R$ 0,95/kWh, in order of consumption.
- **An FAQ whose every figure comes from the same calculation**, with the unsourced percentages
  removed.
- **Found by it:** on the page's default house, a 9.000 BTU air conditioner on for 8 hours is
  62,3% of the bill, R$ 205,20 of R$ 329,37. The refrigerator is R$ 54,04 of it, where the old
  figure said R$ 88,92.

**The plan's candidate was a cost per appliance at each distributor's tariff. It was not built.**
ANEEL's TE + TUSD leave out ICMS, PIS/Cofins and the bandeira, as the page itself warns, so a
table per distributor would print a bill lower than any visitor pays. It would also be live data
at prerender time. The table uses one example tariff instead and takes no public data, so slice
5's `PublicDataUnavailable` test does not apply to it. The form keeps the per-distributor lookup.

- **Verified:**
  - 3 preset tests against Eletrobrás, within 0,1 kWh;
  - 1 mutant killed (the duplex back at 130 W);
  - the form matches the table on 6/6 shared rows;
  - `test:seo` asserts the table and the 56,9 kWh row.

## What this does not establish

- **That Google will judge it added value.** It is the kind of thing Google's own text names, as
  original information and analysis. Whether this instance clears the bar is answered only by the
  re-crawl and the review.
- **Positions 2–9.** Only #1 was read in depth. investnews.com.br was the longest page in
  September; it was not re-read.
- **Buk's rendered output.** Its form was not submitted. The comparison rests on its script, which
  could differ from what it renders.
- **That the SERP is the reviewer's.** One snapshot, from one machine, signed-in state unknown.
- **The example tariff of R$ 0,95/kWh.** It predates this note and was not sourced. Every figure in
  the conta de luz table scales with it.
- **Eletrobrás's figures for a 2026 refrigerator.** They are 2013 averages, quoted by IDEC; the
  primary table was not found.

## Sources

- [Google Brasil SERP](https://www.google.com.br/search?q=calculadora+sal%C3%A1rio+l%C3%ADquido+2026&hl=pt-BR&gl=br) — `fetches/serp-calculadora-salario-liquido-2026.md` — the 9 organic results
- [Buk, calculadora de salário líquido](https://www.buk.com.br/recursos/calculadoras/calculadora-salario-liquido) — `fetches/buk-calculadora-salario-liquido.md` — position 1, its form and its calculation
- [Lei 14.663/2023](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14663.htm) — `fetches/planalto-lei-14663-2023.md` — the simplified discount "caso seja mais benéfico"
- [Lei 9.250/1995](https://www.planalto.gov.br/ccivil_03/leis/l9250.htm) — `fetches/planalto-lei-9250-1995-art-4.md` — what the monthly base may deduct
- [Google Brasil SERP](https://www.google.com.br/search?q=calculadora+conta+de+luz+por+aparelho&hl=pt-BR&gl=br&num=10) — `fetches/serp-calculadora-conta-de-luz-por-aparelho.md` — the 10 organic results
- [ELFSM, simulação de consumo](https://portal.elfsm.com.br/consumo/simulacao-de-consumo/) — `fetches/elfsm-simulacao-de-consumo.md` — position 1, its form and its reference powers
- [IDEC, dicas de como economizar na conta de luz](https://idec.org.br/o-idec/sala-de-imprensa/release/idec-da-dicas-de-como-economizar-na-conta-de-luz) — `fetches/idec-eletrobras-consumo.md` — Eletrobrás's monthly consumption for refrigerators and freezer
- Secondary, search results only and not fetched: BP Money, Contabilidade.com and others saying payroll applies the more beneficial route. They agree with the statute; nothing rests on them.
