---
tags: [research, area/domain, filing-and-pension-limits]
status: active
decided: 2026-09-05
---

# The site states two different values for three tax rules. Which is right?

> **Verdict: on all three, neither of the site's own figures was current — and on one of them the
> rule is not a monetary figure at all.**

`ARCHITECTURE.md` recorded these as contradictions that must not be resolved by picking a side,
because correcting one to match the other would be guessing. This is the research that removes the
guess.

## Findings

| rule | site said | actually |
|---|---|---|
| obligation to file, taxable income | R$ 28.559,70 **and** R$ 33.888 | **R$ 35.584,00** for ano-calendário 2025 |
| obligation to file, assets | R$ 300 mil **and** R$ 800 mil | **R$ 800.000,00** — the higher of the two was right |
| supplementary-pension deduction | "R$ 63.454/ano (13% da renda bruta)" **and** "12% da renda bruta" | **12% do rendimento tributável, with no monetary ceiling** |

### The pension limit is the one worth dwelling on

The Receita's own FAQ is unambiguous: *"até o limite de 12% do rendimento tributável"*. **There is
no R$ ceiling.** So `R$ 63.454/ano` is not a stale figure to refresh — it is a category error, a
number where the rule is a proportion. It also came with "13%", which is wrong against 12%
whichever way the sentence is read.

Where that figure came from was not established. It appears in seven files and matches no published
limit found here.

### The filing thresholds were both stale, and by different amounts

R$ 33.888 was the previous year's figure. R$ 28.559,70 is older still. The current one, for the
return filed in 2026 covering 2025, is **R$ 35.584,00**.

⚠️ **A nuance the copy has to respect.** This site's calculators compute **ano-calendário 2026**,
filed in 2027, and *that* threshold is not published yet. Quoting R$ 35.584,00 as "the 2026 rule"
would repeat the mistake in a new direction. The copy should give the current published figure,
say which year it covers, and say the next one is not out.

## Verdict

- Filing income threshold → R$ 35.584,00, labelled as ano-calendário 2025, with the AC2026 figure
  named as unpublished.
- Assets → R$ 800.000,00 everywhere; the two articles saying R$ 300 mil are wrong.
- Pension → "12% do rendimento tributável", and **every R$ 63.454 reference deleted rather than
  updated**, because there is no figure to update it to.

## What this does not establish

- **The ano-calendário 2026 thresholds**, which are not published. Anything the site says about
  them is a guess until the Receita publishes.
- Whether VGBL is treated anywhere on this site as deductible. The Receita's FAQ says it is not
  (*"A despesa com PGBL é dedutível. A despesa com VGBL não."*), and some copy here names the two
  together — checked and corrected where found, but not exhaustively audited.
- The rural-income, capital-gains and stock-market criteria, which the site does not mention and
  which were not researched.

## Sources

- [O quanto posso deduzir com previdência privada? — Receita Federal](https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/perguntas-frequentes/imposto-de-renda/dirpf/deducoes/despesa-de-previdencia-privada) — `fetches/receita-previdencia-privada.md` — primary, and the one that settles the pension rule.
- [Saiba quem deve declarar Imposto de Renda em 2026 — Agência Brasil](https://agenciabrasil.ebc.com.br/economia/noticia/2026-03/saiba-quem-deve-declarar-imposto-de-renda-em-2026) — `fetches/agencia-brasil-quem-declara-2026.md` — the two filing thresholds and the year they cover.
