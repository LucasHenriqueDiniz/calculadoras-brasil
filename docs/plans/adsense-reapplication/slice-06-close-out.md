---
status: done
---

# Slice 6 — Close out what the first round left open

## Delivers

| item | artefact |
|---|---|
| the 12 `owner` rows (`ADS-ELIG-01/02`, `ADS-OWN-01/02`, `ADS-SITE-01/02`, `ADS-PROG-01/04/07`, `ADS-PRIV-08/09/10`) | written answers by the account holder in `docs/adsense/owner-attestations.md`, one line per row, dated |
| `ADSENSE-CHECKLIST.md` | deleted. Its replacement is the auditor's report in slice 7, which cannot grade itself |
| `docs/pitches/adsense-low-value-rejection.md` | every scope item ticked with the 2026-10-18 measurement that closed it, or pointed at this plan; `status: done` |
| `/metodologia` | main content separated from nav and footer, so `analyze_text_depth.py` returns a count instead of `ERR` |
| `/sobre` | what the owner decides about authorship and about how the content is produced |

⚠️ **Owner, two decisions this slice cannot make:**
- **the 12 rows.** They attest to things only the account holder knows: eligibility, ownership,
  account history.
- **`/sobre`.** Google's Search guidance asks for bylines where readers expect them, and for a
  disclosure of how content was produced where readers would wonder
  (`fetches/search-creating-helpful-content.md`). Whether the page names an author, and how it
  describes the use of AI in writing the site, is the owner's call. Whatever it says must be true:
  the same guidance calls fabricated author profiles deceptive.

## Needs

Nothing from slices 1–5, except that the old pitch's reconciliation cites their outcomes. It can
run in parallel with them and close last.

## Tests

`pnpm run check` and `pnpm run test:seo` green.

## Done when

```
test ! -e ADSENSE-CHECKLIST.md \
  && grep -q '^status: done' docs/pitches/adsense-low-value-rejection.md \
  && [ "$(grep -c '^| ADS-' docs/adsense/owner-attestations.md)" -eq 12 ] \
  && ~/dev/pessoal/adsense-site-auditor/.venv/bin/python \
       ~/dev/pessoal/adsense-site-auditor/scripts/analyze_text_depth.py \
       https://calculebrasil.com/metodologia | grep -v ERR | grep -q 'ADS-CONTENT-03' \
  && echo OK
```

prints `OK`.

## If stuck

If the owner has not answered the 12 rows, this slice stays open, and slice 7 does not start.
Unanswered owner rows are exactly what the 26 June checklist assumed.

---

## What actually happened — 2026-10-19

1. **The 12 owner rows.** Each requirement was put to the account holder as a statement, and the
   owner confirmed all 12 in writing. `docs/adsense/owner-attestations.md` has one dated line per
   row. Where the repository or the AdSense panel also shows something, the line says what. Where
   the evidence was weaker than it first read, the line says that too: Search Console cannot rule
   out non-search traffic, and serving a domain does not show who registered it.
2. **`/sobre`.** The page already named the author with LinkedIn and GitHub. The owner chose to
   disclose how the content is made. A new section, "Como o conteúdo é feito", says that the
   code and texts are written with AI (Claude, from Anthropic) and reviewed by the author before
   publishing, that the rules come from official or primary sources, and that the tables are
   computed and the formulas tested.
3. **`ADSENSE-CHECKLIST.md`** is deleted, and the ARCHITECTURE.md known gap is marked resolved.
4. **The old pitch** is `status: done`. Each item is ticked with the measurement that closed it.
   The three success criteria that need the final audit point at slice 7.
5. **`/metodologia` was wrong, not just unmeasurable.** It covered 6 of 12 calculators. It
   described a freight estimate "from distance and volume" that no calculator ever made, and a
   "35% of income" rule the calculator did not use. It said personal taxes were not covered,
   while six calculators computed them. It listed Inmetro's efficiency data as used by the car
   calculator, which used none. It now has a section per calculator, describing what the code
   does and reading its figures from the modules, so the page cannot drift.
   - **The `ERR` was fixed by the content, not the markup.** The extractor erred only because the
     22 words of the table of contents put the page on either side of the 450-word band, 449 or
     471. At 1678 words that cannot happen: with the document wrapped in `<div>` instead of
     `<article>`, the check still passes. The `<article>` stays because it is the right
     element, but nothing claims it fixed anything.
6. **Found while writing it: three invented figures in the net-salary calculator** (`80eb069`).
   - The vale-transporte took min(6%, R$ 250); the law has no R$ 250 cap.
   - The meal allowance was a fixed R$ 360.
   - The union due was 0,33% a month. CLT, art. 582, has it as one day's pay, once a year, in
     March.
   The FAQ also answered "Sim" to "Vale refeição reduz meu imposto?". Each is fixed from the
   statute, with a test that turns red when it is put back.

| check | result |
|---|---|
| owner rows | `grep -c '^| ADS-' docs/adsense/owner-attestations.md` = 12 |
| checklist | `test ! -e ADSENSE-CHECKLIST.md` |
| old pitch | `status: done` |
| `/metodologia` text depth | PASS, 1678 words, against the local server. Run against production after the merge |
| `/sobre` text depth | 363 words, a note in the 300–449 band, not a failure |
| unit | 386 green. Mutants killed: the R$ 250 cap and the monthly union due (1 red each) |
| `test:seo` | 28 routes; all 12 calculator sections on `/metodologia`, no "35% da renda", and the disclosure on `/sobre` |
| browser | R$ 6.000 with a R$ 400 commute: vale-transporte R$ 360,00, net R$ 4.613,39, union R$ 200,00 in March only |
| `pnpm run check` | stops at `pnpm audit`, on findings that predate this work; a separate task |

**Not done here, and worth a look before slice 7:** the 7 blog articles slice 1 kept were not
re-read against sources. They carry figures like "o chuveiro pode representar 20-30% da conta"
in their FAQs, and the calculators no longer stand behind figures like that.
