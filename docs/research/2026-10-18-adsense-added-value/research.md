---
tags: [research, area/content, 2026-10-18-adsense-added-value]
status: active
decided:
---

# What does each calculator do that the page ranking first for its query does not?

> Salário líquido, the pilot: nothing, until today. The top result applied the 2026 law correctly and ours did not. Fixed, it now does what the leader does, plus a table across 16 salaries, the simplified-discount crossover explained, a private pension field, and the 2026 reduction written out line by line. The other 11 followed in slices 4 and 5, and every one of the 12 had at least one defect in its arithmetic or a false statement. Each now has a table its own calculator computes, checked against the form, with every figure from the calculator or a dated source.

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
| Custo de carro | calculadora custo de carro | calculadoras.rioclaro.com.br | see below | **built** (slice 5) |
| Morar sozinho | calculadora morar sozinho | customorarsozinho.com.br | see below | **built** (slice 5) |
| Assinaturas | calculadora de assinaturas | nucleo.jor.br (Calculadora de Streaming) | see below | **built** (slice 5) |
| Custo de mudança | calculadora custo de mudança | translidermudancas.com.br (blog) | see below | **built** (slice 5) |
| Custo de pet | calculadora custo pet | calculadorabrasil.com.br | see below | **built** (slice 5) |

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

### Found later, in slice 6 (2026-10-19)

Writing `/metodologia` exposed three figures this note did not read:

- the vale-transporte as min(6%, R$ 250), where Lei 7.418/1985 caps the worker's share at the
  commute's cost, with no R$ 250;
- a fixed R$ 360 meal allowance;
- a monthly 0,33% union due, where CLT, arts. 580, I, and 582, take one day's pay in March.

The FAQ also said the meal allowance "reduz o imposto". All four are fixed in `80eb069`, with a
red test for each mutant.

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

## Custo de carro

### What the leader does (measured)

calculadoras.rioclaro.com.br, an investment adviser (`fetches/rioclaro-custo-do-carro.md`). It is
broader than ours where ours is thinnest:

- the cost of capital, the money tied up in the car at 14% a year;
- financing;
- a five-year table with falling depreciation;
- a comparison with Uber and public transport.

It takes one fuel price and one km/l, so it cannot compare a flex car's two fuels.

### What ours did before today (measured)

- **Flex compared the fuels at the same km/l.** A litre of ethanol went as far as a litre of
  gasoline. At the page's own defaults, R$ 6,00 and R$ 4,20, exactly the 70% its FAQ calls the
  break-even, the form said ethanol was R$ 137,35 a month cheaper.
- **An FAQ charging an insurance that no longer exists:** "DPVAT (obrigatório) custa R$ 150-200/ano".
  LC 207/2024 revoked the DPVAT law, and LC 211/2024 revoked the SPVAT that replaced it
  (`fetches/planalto-lc-207-211-2024.md`).
- **Ranges with no source:** cost per car class, cost per km, insurance, maintenance, parking,
  "depreciação representa 30-40%" (it is 21% at the defaults), "reduz consumo 3-5%" and IPVA
  "2-4%".
- **A worked example the calculator contradicted:** "próximo de R$ 1.500, quase o triplo", where
  the calculator said R$ 1.582,85, 3,5 times the fuel.
- **The ANP badge a day early:** "cache atualizado em 09/10/2026" for a survey ending 10/10, the
  same midnight-UTC read as the review date.

### What ours does now that the leader does not

- **Ethanol at its own yield.** The 70% rule, measured rather than repeated: across the 261
  combustion flex rows of Inmetro's PBE 2026, ethanol's combined km/l is a median 70,0% of
  gasoline's, from 66,4% to 72,6% (`fetches/inmetro-pbev-2026.md`). That is the default, and the
  visitor can type their own car's figure.
- **A table of the 27 states.** It is built by the calculator under flex from the ANP's weekly
  state averages, with the week stated. Ethanol was cheaper in 11 states in the week of
  04–10/10/2026. The saving ran from R$ 67,59 a month in Mato Grosso to R$ 1,09 in Pará.
- **Every FAQ figure from the calculator**, the unsourced ranges gone, and the DPVAT answer
  corrected from the statute.

**The live data is a dated snapshot, not a build-time fetch.** `scripts/refresh-anp-snapshot.mjs`
reads one ANP workbook through the app's adapter and writes `src/data/anp-weekly-snapshot.ts`, so
the build never depends on gov.br. Slice 5's `PublicDataUnavailable` case moves with it: when
the ANP fails, the script throws and writes nothing, and the page keeps the last week. A state
with no price is a tested row, "sem preço de etanol", as Amapá's was.

**Not taken from the leader: the cost of capital and financing.** They are real costs. At the
leader's defaults the cost of capital alone is R$ 1.167 a month, 30% of its total. They would add
inputs, and their defaults would need a source this note did not read. The FAQ now says
financing is not simulated.

- **Verified:**
  - hand cases: the tie at 70%, São Paulo at R$ 64,5345 a month;
  - 2 mutants killed, the yield removed (6 red) and the yield fallback removed (1 red);
  - the form matches the table in 3 states: SP, RN with gasoline ahead and PA at R$ 1,09;
  - `test:seo` asserts the table and its 27 state rows.

## Morar sozinho

### What the leader does (measured)

customorarsozinho.com.br, a site built for the query (`fetches/customorarsozinho-calculadora.md`):

- a form that starts from 13 capitals and the type of home;
- a table of "custo mensal total" for 8 capitals, as ranges marked "Valores estimados", with no
  source;
- rules of thumb with no source;
- a paid plan.

### What ours did before today (measured)

- **An FAQ that contradicted the calculator.** It called 50–70% of income "apertado". The
  calculator labels that band "Atenção" and keeps "Apertado" for 70–90%.
- **Figures with no source** in 9 of 12 answers: cost by city, rent in SP, RJ and BH, condo and
  IPTU, energy, the reserve, "comida caseira é 60% mais barata".
- **#16's FAQs, written for the article slice 1 redirected here, had a legal error.** They listed
  "taxa de imobiliária (geralmente 1 aluguel)" among the tenant's costs. Lei 8.245/1991, art. 22,
  VII, puts intermediation and administration fees on the landlord, and art. 43 makes charging
  beyond rent and permitted charges a contravenção (`fetches/planalto-lei-8245-1991.md`).

### What ours does now that the leader does not

- **A table of 22 capitals with sourced figures.** It shows a 40 m² flat at each city's average
  rent per m² in FipeZAP's September 2026 report, plus the DIEESE/Conab cesta básica for the same
  month (`fetches/fipezap-locacao-2026-09.md`, `fetches/dieese-cesta-basica-2026-09.md`). The
  calculator adds the two and expresses them in minimum wages. The table runs from R$ 3.553,71 in
  São Paulo, 2,2 minimum wages, to R$ 2.002,15 in Teresina. It says that it is a floor, and that
  one-bedroom flats cost more per m² than the city average.
- **The lease rules from the statute.** Who pays the agency fee, extraordinary condo expenses and
  the IPTU; the cap of three months on a cash deposit; one guarantee per contract; and when rent
  can be charged in advance. These are #16's topics, corrected.
- **FAQ bands read from the module** (`FINANCIAL_STATUS_BANDS`), so the FAQ cannot drift from
  the calculator again.

**Data, not a live fetch.** Both reports are PDFs, transcribed into
`src/data/capital-living-costs.ts` with the month and the source URLs. The FipeZAP values were
extracted by script and agree with the report's own summary paragraph, all 22 of them.

- **Verified:**
  - hand cases: São Paulo 65,78 × 40 + 922,51 = R$ 3.553,71, and Teresina R$ 2.002,15;
  - 1 mutant killed (the basket dropped, 3 red);
  - the form matches the table for SP and Teresina;
  - `test:seo` asserts 22 capital rows and São Paulo's total.

## Assinaturas

### What the leader does (measured)

Núcleo Jornalismo's Calculadora de Streaming (`fetches/nucleo-calculadora-de-streaming.md`):

- about 70 services, each with a preloaded monthly price and no collection date;
- "descontos de planos anuais" named only as a reason the total may differ.

### What ours did before today (measured)

- **A false claim:** "Netflix, Disney+, Prime permitem compartilhamento (é nos termos de
  serviço)". Netflix's Help Center for Brazil says "Não é possível compartilhar a conta Netflix
  fora da residência" (`fetches/streaming-annual-plans-2026-10-18.md`).
- **Prices and averages with no source or date:**
  - streaming prices by service;
  - "Usuário médio: R$ 500-800/mês";
  - Microsoft 365 and Adobe prices;
  - "compartilhe (reduz 50%)".
- **An invented rule:** "A regra dos 70%: se usa menos de 70% do tempo disponível, cancela".
- **A US app suggested to Brazilian visitors**, Truebill, and a typo, "servicosé".

### What ours does now that the leader does not

- **When an annual plan pays off.** The table covers the 6 plans that Amazon Prime, Disney+ and
  HBO Max sell both monthly and yearly, priced from their own pages on 2026-10-18. The
  calculator works out the yearly saving and how many monthly payments the annual price buys.
  That runs from 8,2 months for Disney+ Padrão to 9,6 for HBO Max Platinum. Keep the service at
  least that long and the annual plan is cheaper; fewer months, and paying monthly then
  cancelling costs less.
- **Every FAQ figure from the calculator or a dated official page.** The sharing answer now
  comes from Netflix's own terms.

- **Verified:**
  - hand case: Prime, 12 × 19,90 − 166,80 = R$ 72,00, or 8,38 monthly payments;
  - 1 mutant killed (the break-even taken on the monthly equivalent, 3 red);
  - the form matches the table for Prime (R$ 72,00) and HBO Max Platinum (R$ 132,00);
  - `test:seo` asserts the 6 plan rows and Prime's 8,4 months.

## Custo de mudança

### What the leader does (measured)

translidermudancas.com.br, a removal company's blog post (`fetches/translider-simulador-frete.md`).
It points to the ANTT's calculator, then gives "Mudanças residenciais/comerciais: R$ 8,00 a
R$ 15,00 por quilômetro" as if from the ANTT table. The ANTT has no such category.

### What ours did before today (measured)

- **The reserve for the unforeseen fell on the lease too.** 10% of the deposit and the first rent
  added R$ 450 of the default R$ 1.085 reserve. The page's own text says the reserve covers
  materials, repairs and installations. An existing unit test pinned the inflated figure.
- **The deposit counted as a cost.** Lei 8.245/1991, art. 38, § 2º, sends a cash deposit to a
  savings account and back to the tenant with its yield.
- **Every FAQ answer gave ranges with no source.** "Cartório: R$ 300-600" is not a cost of a
  lease. The word "mudançadora" appeared three times.

### What ours does now that the leader does not

- **The ANTT's binding floor for the truck.** It is computed from the coefficients in force: carga
  geral, Tabela A of Portaria SUROC 22/2026, from 30/09/2026
  (`fetches/antt-piso-minimo-frete-2026-09.md`). The page shows a table of 6 distances on 2 and 3
  axles, and the form computes it for the visitor's trip. 500 km on 2 axles is at least
  R$ 2.488,74. Per km it falls from R$ 8,59 at 100 km to R$ 4,22 at 3.000 km, because loading is
  paid once.
- **The reserve on what the lease does not fix**, and the deposit shown as money that comes back:
  R$ 11.485 needed at the defaults, R$ 8.485 that stays spent.
- **FAQ answers from the statute and the calculator.** The agency fee is the landlord's, the
  deposit is capped at three rents and returns with its yield, and there is one guarantee.

- **Verified:**
  - hand cases: 500 × 5,2177 + 541,86 = R$ 3.150,71, and the reserve at R$ 635;
  - 1 mutant killed (the reserve back on the contract, 3 red);
  - the form matches the table at 500 km on 2 axles and 3.000 km on 3 axles;
  - `test:seo` asserts 6 rows and R$ 2.488,74.

## Custo de pet

### What the leader does (measured)

calculadorabrasil.com.br (`fetches/calculadorabrasil-custo-pet.md`): a breed list, food as a price
range by size, and multipliers for age and for Brasília. It claims "95% de acurácia" and does not
say how that was measured.

### What ours did before today (measured)

- **A month of food was 30 days**, so the year came to 360: five days of food short on the
  largest item. An existing unit test pinned R$ 60 for 200 g at R$ 10/kg; the year is R$ 730, not
  R$ 720.
- **Every FAQ answer gave ranges with no source.**
- **"Muitos proprietários cobram taxa (R$ 100-300/mês extra)"** for a pet in a lease. The Lei do
  Inquilinato provides no such charge, and art. 43, I, makes demanding sums beyond rent and
  permitted charges a contravenção.
- **A typo,** "hapcedem".

### What ours does now that the leader does not

- **The ration from the animal's weight.** The FEDIAF Nutritional Guidelines (September 2025,
  the same as July 2024) set an adult dog at 130, 110 or 95 kcal per kg^0,75 by age, and a cat at
  75 or 100 kcal per kg^0,67 (`fetches/fediaf-energy-requirements.md`). The form turns weight,
  profile and the energy on the bag into grams a day, and can copy them into the calculation.
- **A table of 8 pets** at an example food of 3.500 kcal/kg and R$ 10/kg. A 10 kg adult dog eats
  177 g a day, R$ 53,84 a month; a 40 kg dog, 500 g; a 4 kg indoor cat, 54 g, R$ 16,43.
- **Compare by the day, not by the kilo.** A denser food needs a smaller portion, and the page
  says so with the formula behind it.

- **Verified:**
  - hand cases: 110 × 10^0,75 = 618,6 kcal, 75 × 4^0,67 = 189,9 kcal, and 177 g over 365/12 days
    = R$ 53,8375;
  - 2 mutants killed, the 30-day month and the dog's exponent for the cat (3 red);
  - the form's suggestion, copied into the calculation, matches the table for the 10 kg dog and
    the 4 kg cat;
  - `test:seo` asserts 8 rows and 177 g.

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
- **That the fuel table is current.** It is one ANP week, 04–10/10/2026, and moves only when the
  snapshot script is run again.
- **That a 40 m² flat at the city's average rent per m² is what a person living alone pays.** It is
  the table's scenario. FipeZAP publishes rent by size only nationally.
- **The streaming prices after 2026-10-18.** They are one day's reading of three pages.
- **That the freight floor is current after a diesel move.** The coefficients are those of
  Portaria SUROC 22/2026; the ANTT must replace them whenever diesel moves more than 5%.
- **That 3.500 kcal/kg is a typical Brazilian dry food.** It is the table's example; the form
  takes the figure on the visitor's bag.
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
- [Google Brasil SERP](https://www.google.com.br/search?q=calculadora+custo+de+carro&hl=pt-BR&gl=br&num=10) — `fetches/serp-calculadora-custo-de-carro.md` — the 9 organic results
- [Rio Claro, custo do carro](https://calculadoras.rioclaro.com.br/custo-do-carro/) — `fetches/rioclaro-custo-do-carro.md` — position 1, inputs and result
- [Inmetro, PBE Veicular 2026](https://www.gov.br/inmetro/pt-br/assuntos/avaliacao-da-conformidade/programa-brasileiro-de-etiquetagem/tabelas-de-eficiencia-energetica/veiculos-automotivos-pbe-veicular) — `fetches/inmetro-pbev-2026.md`, `measurements/pbev-2026-ethanol-yield.*` — ethanol's yield over 261 flex cars
- [ANP, levantamento semanal](https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/levantamento-de-precos-de-combustiveis-ultimas-semanas-pesquisadas) — `fetches/anp-levantamento-semanal-2026-10-04.md` — state averages for 04–10/10/2026
- [LC 207/2024](https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp207.htm) and [LC 211/2024](https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp211.htm) — `fetches/planalto-lc-207-211-2024.md` — the end of DPVAT and SPVAT
- [Google Brasil SERP](https://www.google.com.br/search?q=calculadora+morar+sozinho&hl=pt-BR&gl=br&num=10) — `fetches/serp-calculadora-morar-sozinho.md` — the 9 organic results
- [Custo Morar Sozinho](https://www.customorarsozinho.com.br) — `fetches/customorarsozinho-calculadora.md` — position 1
- [FipeZAP Locação, setembro de 2026](https://downloads.fipe.org.br/indices/fipezap/fipezap-202609-residencial-locacao.pdf) — `fetches/fipezap-locacao-2026-09.md`, `measurements/fipezap-2026-09-city-prices.*` — rent per m² in 22 capitals
- [DIEESE, cesta básica de setembro de 2026](https://www.dieese.org.br/analisecestabasica/2026/202609cestabasica.html) — `fetches/dieese-cesta-basica-2026-09.md` — the basket in 27 capitals
- [Lei 8.245/1991](https://www.planalto.gov.br/ccivil_03/leis/l8245.htm) — `fetches/planalto-lei-8245-1991.md` — who pays what in a lease
- [Google Brasil SERP](https://www.google.com.br/search?q=calculadora+de+assinaturas&hl=pt-BR&gl=br&num=10) — `fetches/serp-calculadora-de-assinaturas.md` — the 9 organic results
- [Núcleo, Calculadora de Streaming](https://nucleo.jor.br/calculadora-de-streaming/) — `fetches/nucleo-calculadora-de-streaming.md` — the leading tool
- [Amazon Prime](https://www.amazon.com.br/prime), [Disney+](https://www.disneyplus.com/pt-br), [HBO Max](https://www.hbomax.com/br/pt), [Netflix, compartilhamento](https://help.netflix.com/pt/node/123277) — `fetches/streaming-annual-plans-2026-10-18.md` — monthly and annual prices; Netflix's household rule
- [Google Brasil SERP](https://www.google.com.br/search?q=calculadora+custo+de+mudan%C3%A7a&hl=pt-BR&gl=br&num=10) — `fetches/serp-calculadora-custo-de-mudanca.md` — the 9 organic results
- [Translider, simulador de frete](https://translidermudancas.com.br) — `fetches/translider-simulador-frete.md` — position 1
- [Portaria SUROC 22/2026](https://anttlegis.antt.gov.br/action/UrlPublicasAction.php?acao=abrirAtoPublico&num_ato=00000022&sgl_tipo=POR&sgl_orgao=SUROC/ANTT/MT&vlr_ano=2026&seq_ato=000&cod_modulo=623&cod_menu=9230), [Resolução ANTT 5.867/2020](https://anttlegis.antt.gov.br/action/UrlPublicasAction.php?acao=abrirAtoPublico&sgl_tipo=RES&num_ato=00005867&seq_ato=000&vlr_ano=2020&sgl_orgao=DG/ANTT/MI&cod_modulo=161&cod_menu=5408), [Lei 13.703/2018](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13703.htm) — `fetches/antt-piso-minimo-frete-2026-09.md` — the freight floor and its coefficients
- [Google Brasil SERP](https://www.google.com.br/search?q=calculadora+custo+pet&hl=pt-BR&gl=br&num=10) — `fetches/serp-calculadora-custo-pet.md` — the 9 organic results
- [Calculadora Brasil, custo de pet](https://calculadorabrasil.com.br) — `fetches/calculadorabrasil-custo-pet.md` — position 1
- [FEDIAF, Nutritional Guidelines](https://europeanpetfood.org/self-regulation/nutritional-guidelines/) — `fetches/fediaf-energy-requirements.md` — energy needs of adult dogs and cats
- Secondary, search results only and not fetched: BP Money, Contabilidade.com and others saying payroll applies the more beneficial route. They agree with the statute; nothing rests on them.
