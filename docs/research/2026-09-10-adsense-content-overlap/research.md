---
tags: [research, area/content, adsense-content-overlap]
status: active
decided: 2026-09-10
---

# Is calculebrasil.com's text copied from the competitors that outrank it?

> **No — decisively, and it does not matter.** Maximum overlap across 19 competitor
> pages is **0.41%**, every pair in the `safe` band. But a positive control shows
> 5-gram containment between *independently written* Portuguese pages on the same
> topic is naturally ~0%, so this metric was never capable of measuring what
> Google objected to. `ADS-CONTENT-OVERLAP` closes; the rejection stays unexplained.

## What was blocking

[[adsense-low-value-rejection]] records that Google moved the site to
**"Requer atenção — Conteúdo de baixo valor"** on 2026-09-07, and that
`ADS-CONTENT-OVERLAP` was the only machine-decidable requirement pointing at the
stated reason that had never been run. It had been open since June as item 5 of
`ADSENSE-CHECKLIST.md`, deadline "before submitting the application".

The pitch's Appetite section made this the gate: *"Do not reapply before the
number exists."* It also made a prediction worth holding onto, because the
measurement falsified half of it:

> If they sit under 40%, the six fixes plus the CMP are plausibly the entire gap.

They sit under 40%. The inference does not follow. See **What this does not
establish**.

## Method, and where it is weaker than it looks

`ADS-CONTENT-OVERLAP` names "the top 5 SERP results". Two deviations, both
recorded because they change how much the number is worth:

1. **The `WebSearch` tool returned `unavailable` for all four queries.** SERP
   position was therefore resolved by hand, in a real browser, against
   `google.com/search?hl=pt-BR&gl=br`, sponsored blocks excluded, on 2026-09-10.
   Every result href is a `/goto?url=<opaque>` redirect, so each of the 20
   positions was resolved by clicking it and reading the landing URL. Google's
   `cite` breadcrumbs are display paths, not URLs: three reconstructed from them
   404'd, and were re-resolved by clicking.
2. **This is one snapshot, from one machine, on one day.** A SERP is personalised
   and volatile. The ranking here is not provably the ranking Google's reviewer
   saw on 2026-09-07.

**Searched in Portuguese, deliberately.** The `research` skill's default is
English because primary sources are English; here the competitors *are* the
Brazilian pt-BR pages ranking for Brazilian queries, so the answer genuinely
lives in that language. Queries are quoted byte-identical below; the note is
English.

Both sides of every comparison were extracted with the auditor's own
`adsense_checks.text.extract_text`, so nothing is compared against a differently
parsed document. The metric is `containment(ours, theirs)` over 5-word shingles —
the share of *our* shingles that also occur on their page. `SHINGLE_SIZE = 5`,
`OVERLAP_MONITOR = 0.4`, `OVERLAP_HIGH_RISK = 0.6`.

## Findings

### 1. Overlap is essentially zero, on all four pages

19 of 20 competitor pages were readable. Every figure below is **measured**.

| our page | query | sources | worst overlap | band | `compare_against` |
|---|---|---|---|---|---|
| `/calculadora-salario-liquido/` | "calculadora salário líquido 2026" | 5/5 | 0.34% | safe | `OK` |
| `/calculadora-irpf-2026/` | "calculadora IRPF 2026 imposto de renda" | 4/5 | 0.32% | safe | `MISSING` |
| `/calculadora-clt-vs-pj/` | "calculadora CLT ou PJ comparação" | 5/5 | 0.12% | safe | `OK` |
| `/calculadora-custo-pet/` | "calculadora quanto custa ter um pet por mês" | 5/5 | 0.41% | safe | `OK` |

The IRPF row is `MISSING` rather than `OK` for one reason: **position 1 for that
query is the Receita Federal's own simulator**,
`www27.receita.fazenda.gov.br/simulador-irpf/`, and it is a client-rendered app
with no prose in its served HTML — `no extractable text`. Four of five is not
five, and the module escalates rather than presenting it as satisfied.

The absolute counts are the honest form of "0.34%". Against `buk.com.br`, the
largest overlap on the salary page, our 890 shingles share **three** with their
1397, and all three are generic statements of a tax rule:

- `cada dependente reduz a base`
- `dependente reduz a base de`
- `valor real pode variar conforme`

Against `carmelitas.com.br` — 1101 words on the same topic — the two pages share
**no 5-word sequence at all**.

### 2. The positive control: the metric works, and ~0% is the normal reading

A 0.0% result between two pages about the same Brazilian tax deserves suspicion
before it deserves a verdict, so the metric was checked against pairs whose
answer is known in advance:

| control pair | shared shingles | containment |
|---|---|---|
| our `/calculadora-clt-vs-pj/` vs our `/blog/clt-vs-pj-comparacao/` | 216 | **25.09%** |
| our `/calculadora-clt-vs-pj/` vs our `/calculadora-salario-liquido/` | 216 | **25.09%** |
| `buk.com.br` vs `carmelitas.com.br` — two independent competitors, same topic, 1397 and 1090 shingles | **1** | **0.07%** |

The metric detects overlap fine: it finds 25% between our own pages. That 216 is
identical for both of our pairs, which identifies it — it is the shared nav and
footer, not shared prose, and it sits far below the 60% `ADS-CONTENT-02` bar,
consistent with the auditor finding no near-duplicate groups across 12
calculators and 26 blog pages on 2026-09-10.

**The load-bearing row is the third.** Two established competitors, writing
independently about the same subject in the same language, share one 5-word
sequence out of 1397. So our ~0% against them is not evidence of unusual
originality — it is what any two independently written pages score. The bands
`<40% safe / >60% high risk` are calibrated for **copied** text, and they answer
the plagiarism question, not the topical-similarity one.

### 3. What the SERP does show: our pages are the shallow ones

The competitor corpus was already fetched, so relative depth cost nothing to
measure — and unlike overlap, it moves. Word counts are extracted main content,
same extractor both sides. **Measured, not estimated.**

| our page | ours | SERP median | ratio | depth rank |
|---|---|---|---|---|
| `/calculadora-salario-liquido/` | 768 | 1443 | **0.53x** | 5th of 6 |
| `/calculadora-clt-vs-pj/` | 776 | 1262 | **0.61x** | 5th of 6 |
| `/calculadora-custo-pet/` | 804 | 1178 | **0.68x** | 4th of 5 |
| `/calculadora-irpf-2026/` | 1353 | 1062 | 1.27x | 3rd of 5 |

Three of four sit at roughly half to two-thirds of the median competitor, and
place last or second-to-last. `/calculadora-salario-liquido/` carries
`priority: 0.95` in `src/lib/seo-pages.ts` — tied for the highest on the site —
and is the worst relative performer of the four: 768 words against
`investnews.com.br`'s 2259 and `buk.com.br`'s 1880.

`/calculadora-irpf-2026/` is the only page above its median, and the only one of
the four the 2026-09-10 audit had already measured as comfortably deep.

**The niche query was the control, and it failed the way the crowded ones did.**
`custo-pet` was picked because a pet-cost calculator should be the least
contested of the four; if a thin field also out-wrote us, the shape of the site
is the problem rather than the competition. It did: 804 against a 1178 median,
with `clubedospoupadores.com` at 1790 for a single article about 15 dog breeds.

### 4. Two zeros that are not evidence

Weakest part of the measurement, stated rather than buried:

- `calculadorabrasil.com.br/despesas-pets/` yielded **4 words**. Its 0.00% is
  vacuous — there was nothing to overlap with.
- `dieese.org.br/calculadoraIR.html` yielded 166 words, and
  `valorinveste.globo.com` 287. Both are thin JS widgets. Low overlap against a
  page with almost no prose establishes very little.

Nine of the nineteen readable competitors carry 1100+ words, so the finding does
not rest on the thin ones. But three of the four target pages had at least one
weak comparison inside their five.

## Verdict

**`ADS-CONTENT-OVERLAP`: Pass, band `safe`.** The site's prose is its own. Item 5
of `ADSENSE-CHECKLIST.md` — the plagiarism test pending since 26 June — is closed,
and closed in the direction that costs nothing to fix, because there is nothing
to fix.

**The rejection is not explained by this.** Nothing measured here supports
"Conteúdo de baixo valor", and the one thing that moves — relative depth — points
somewhere the overlap requirement does not reach.

## What this does not establish

- **It does not clear `ADS-CONTENT-ORIGINAL` or `ADS-CONTENT-ADDED-VALUE`.** Both
  are `judgement` rows, and both ask whether the page offers something its
  competitors do not. A page can be 100% original prose and still add nothing.
  The 2026-09-10 audit passed both on structure — every calculator has a FAQ
  block and a stated-limitations block — and Google contradicted it. This
  measurement does not change that; it removes the cheapest explanation for it.
- **It does not license reapplying.** The pitch's inference — safe overlap implies
  the six known fixes are the whole gap — is now known to be unsupported, because
  the metric that came back safe cannot see what was objected to. Treat the
  Appetite section of [[adsense-low-value-rejection]] as needing a rewrite on this
  point.
- **It says nothing about the other 45 public pages.** Four of 49 were measured.
- **It is one SERP snapshot**, taken three days after the rejection, from a
  different machine than the reviewer's, with `WebSearch` unavailable and every
  position resolved by hand.
- **It does not establish why Google's reviewer decided what it decided.** No
  primary source found for any operational threshold behind "Conteúdo de baixo
  valor"; section J of the auditor's reference already records that the
  rejection-rate figures it used to carry had no source and were removed. Assume
  the same of any threshold quoted in a blog post.

## Sources

Every competitor page read is its own file under `fetches/`, carrying its SERP
position, the query, its word and shingle counts, the shingles it shares with our
page, and the first 1500 characters of the extracted text verbatim.

**"calculadora salário líquido 2026"**
- [Buk](https://www.buk.com.br/recursos/calculadoras/calculadora-salario-liquido) — `fetches/buk-com-br-recursos-calculadoras-calculadora-salario-liquido.md` — 1880 words; our worst overlap on this page at 0.34%, three shared shingles, all generic tax phrasing
- [Carmelitas Contabilidade](https://carmelitas.com.br/ferramentas/calculadora-salario-liquido) — `fetches/carmelitas-com-br-ferramentas-calculadora-salario-liquido.md` — 1101 words; zero shared shingles with our page
- [MeuImposto](https://www.meuimposto2026.com.br/) — `fetches/meuimposto2026-com-br.md` — 1443 words, the median of this SERP
- [InvestNews](https://investnews.com.br/ferramentas/calculadoras/calculadora-de-salario-liquido/) — `fetches/investnews-com-br-ferramentas-calculadoras-calculadora-de-salario-liquido.md` — 2259 words, the deepest page measured on this query
- [Valor Investe](https://valorinveste.globo.com/ferramentas/calculadoras/calculadora-salario-liquido/) — `fetches/valorinveste-globo-com-ferramentas-calculadoras-calculadora-salario-liquido.md` — 287 words; too thin for its 0% to mean much

**"calculadora IRPF 2026 imposto de renda"**
- [Receita Federal, Simulador de alíquotas efetivas](https://www27.receita.fazenda.gov.br/simulador-irpf/) — `fetches/www27-receita-fazenda-gov-br-simulador-irpf.md` — **position 1, unreadable**: client-rendered, no extractable text. This is why the IRPF comparison is 4 of 5
- [Contábeis](https://www.contabeis.com.br/ferramentas/calculadora-ir/) — `fetches/contabeis-com-br-ferramentas-calculadora-ir.md` — 1601 words; zero shared shingles
- [Contec](https://contcontec.com.br/calculadora-de-imposto-de-renda-mensal-2026/) — `fetches/contcontec-com-br-calculadora-de-imposto-de-renda-mensal-2026.md` — 2139 words, deepest on this query
- [Brasilprev](https://www1.brasilprev.com.br/simulador-imposto-de-renda) — `fetches/brasilprev-com-br-simulador-imposto-de-renda.md` — 523 words
- [DIEESE](https://www.dieese.org.br/calculadoraIR.html) — `fetches/dieese-org-br-calculadorair-html.md` — 166 words; too thin to weigh

**"calculadora CLT ou PJ comparação"**
- [Na Gringa](https://www.nagringa.dev/calculadora-clt-vs-pj) — `fetches/nagringa-dev-calculadora-clt-vs-pj.md` — 1262 words, the median of this SERP
- [Contabilizei](https://www.contabilizei.com.br/calculadora-clt-pj/) — `fetches/contabilizei-com-br-calculadora-clt-pj.md` — **5064 words**, the deepest page in the whole corpus, 6.5x our 776
- [Hubs Contabilidade](https://www.hubscontabilidade.com.br/calculadora-pj-vs-clt/) — `fetches/hubscontabilidade-com-br-calculadora-pj-vs-clt.md` — 1674 words
- [Contmatic Simplifique](https://simplifique.contmatic.com.br/ferramentas/calculadora-pj-vs-clt) — `fetches/simplifique-contmatic-com-br-ferramentas-calculadora-pj-vs-clt.md` — 651 words
- [Contrato PJ](https://www.contratopj.com.br/pages/calculadora-clt-pj-lp.html?ref=BlogContratoPj) — `fetches/contratopj-com-br-pages-calculadora-clt-pj-lp-html-ref-blogcontratopj.md` — 878 words

**"calculadora quanto custa ter um pet por mês"**
- [CalculaPet](https://calculapet.com/calculadoras/custo-mensal) — `fetches/calculapet-com-calculadoras-custo-mensal.md` — 1469 words; our highest overlap anywhere at 0.41%, still `safe`
- [Calculadora Brasil](https://calculadorabrasil.com.br/despesas-pets/) — `fetches/calculadorabrasil-com-br-despesas-pets.md` — **4 words extracted**; its 0% is vacuous
- [CalcNator](https://www.calcnator.com.br/pet/custo-mensal-pet) — `fetches/calcnator-com-br-pet-custo-mensal-pet.md` — 887 words
- [Clube dos Poupadores](https://clubedospoupadores.com/calculadora/cachorro.html) — `fetches/clubedospoupadores-com-calculadora-cachorro-html.md` — 1790 words on 15 dog breeds; 2.2x our pet page
- [G1 Especiais](http://especiais.g1.globo.com/economia/seu-dinheiro/calculadoras/2017/pets/) — `fetches/especiais-g1-globo-com-economia-seu-dinheiro-calculadoras-2017-pets.md` — 556 words, published 2017

**Tooling** — `adsense_checks.duplicates` from `~/dev/pessoal/adsense-site-auditor`,
whose module docstring states the capability split this note relies on: *"this
module performs NO search"*, so the SERP retrieval above is the caller's work and
the measurement is the module's.
