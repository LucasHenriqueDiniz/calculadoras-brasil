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
| the other 11 | — | — | — | slices 4–5 |

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

## What this does not establish

- **That Google will judge it added value.** It is the kind of thing Google's own text names, as
  original information and analysis. Whether this instance clears the bar is answered only by the
  re-crawl and the review.
- **Positions 2–9.** Only #1 was read in depth. investnews.com.br was the longest page in
  September; it was not re-read.
- **Buk's rendered output.** Its form was not submitted. The comparison rests on its script, which
  could differ from what it renders.
- **That the SERP is the reviewer's.** One snapshot, from one machine, signed-in state unknown.

## Sources

- [Google Brasil SERP](https://www.google.com.br/search?q=calculadora+sal%C3%A1rio+l%C3%ADquido+2026&hl=pt-BR&gl=br) — `fetches/serp-calculadora-salario-liquido-2026.md` — the 9 organic results
- [Buk, calculadora de salário líquido](https://www.buk.com.br/recursos/calculadoras/calculadora-salario-liquido) — `fetches/buk-calculadora-salario-liquido.md` — position 1, its form and its calculation
- [Lei 14.663/2023](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14663.htm) — `fetches/planalto-lei-14663-2023.md` — the simplified discount "caso seja mais benéfico"
- [Lei 9.250/1995](https://www.planalto.gov.br/ccivil_03/leis/l9250.htm) — `fetches/planalto-lei-9250-1995-art-4.md` — what the monthly base may deduct
- Secondary, search results only and not fetched: BP Money, Contabilidade.com and others saying payroll applies the more beneficial route. They agree with the statute; nothing rests on them.
