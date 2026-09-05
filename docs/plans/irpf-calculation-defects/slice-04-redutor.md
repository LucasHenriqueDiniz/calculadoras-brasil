---
status: done
kanban: 7361b632-e42e-47ab-9f9e-9af2ae79bc2f
---

# Slice 4 — The Lei 15.270/2025 redutor, which the module has no concept of

The largest item in the pitch and the only one that is new behaviour rather than a wrong number.
Everything before this slice makes the module compute the right tax under the old rules; this is
what makes it compute the 2026 tax.

## Delivers

`calculateIrpf` subtracts the annual reduction of Lei 15.270/2025 from the tax the table produces:

| rendimento tributável anual | redução |
|---|---|
| até 60.000,00 | até R$ 2.694,15, "de modo que o imposto devido seja zero" |
| 60.000,01 – 88.200,00 | `8.429,73 − 0,095575 × rendimento` |
| acima de 88.200,00 | nenhuma |

Capped at the tax actually due: it can zero the tax, never turn it into a refund.

⚠️ **The coefficient applies to gross taxable income, not to the calculation base.** The Receita's
own worked example is explicit — for a R$ 6.000 monthly salary with a base of R$ 5.350,40, the
reduction is `978,62 − (0,133145 × 6.000,00)`. Applying it to the base instead is the easy mistake
and it is silent.

`IrpfResult` gains the reduction as its own field. A number this large that does not appear in the
result is a number the page cannot explain to the person reading it.

**Also here, because this slice touches the same lines:** delete the dead `parcelasRestituicao`
branch at `irpf.ts:119`. `irpfCalculado` is floored at zero, so `irpfDevido < 0` is unreachable and
the comment above it — "a negative value is a refund" — describes nothing.

## Needs

- Slices 1–3 merged. The redutor's first-band cap of R$ 2.694,15 is exactly the tax due at
  R$ 60.000 under the correct table with the correct simplified discount, so it only lines up once
  those are right.
- `docs/research/2026-09-04-irpf-2026-table/research.md` — the formula, its sources, and the
  independent derivation of both caps.

## Tests

⚠️ **The redutor makes the existing boundary tests vacuous, and this is the trap in this slice.**
`taxAtBase` drives the base through `rendaBrutaAnual = base / 0.9`, so a base of 33.919,81 means an
income of R$ 37.688 — under R$ 60.000, where the redutor zeroes the tax. Every continuity and
monotonicity assertion would then compare 0 to 0 and pass while proving nothing.

Fix it deliberately, one of two ways, and say which in the diff:

- move those cases to incomes above R$ 88.200, where no reduction applies; **or**
- export the table application separately and assert continuity against it directly.

New cases:

- income R$ 60.000 → tax exactly zero, and R$ 59.999 → also zero.
- income R$ 88.200 → the reduction is zero, so the tax equals the table's own answer.
- income R$ 70.000 → reduction `8.429,73 − 0,095575 × 70.000 = 1.739,48`, asserted to the centavo.
- the reduction never exceeds the tax: no input produces a negative `irpfDevido`.
- monotonicity across the whole phase-out band, 55.000 → 95.000. The reduction shrinks as income
  grows, so this is where a sign error would show.

## Done when

```
pnpm run check
```

Green end to end — that is `cf:types:check`, `test`, `typecheck`, `lint`, `build`, `test:seo`,
`worker:dry-run` and `audit`. The unit suite inside it must report every `irpf` case passing with
none skipped.

## If stuck

If the redutor needs a monthly figure the annual path does not have, stop: the monthly table and
its own redutor are recorded in the research but implementing both is a second slice, not a bigger
first one.

If the page turns out to need the reduction shown to make sense of the number — and it probably
does — that is the follow-up the pitch names as out of scope. Write it as a new pitch rather than
widening this one.

---

## What actually happened — 2026-09-04

`pnpm run check` green end to end. `tests/calculators/irpf.test.ts` is 34 cases, 51 across the repo.

**The vacuity trap was real and was handled by shaping the result, not the tests.** `IrpfResult` now
separates the two numbers:

| field | |
|---|---|
| `irpfPelaTabela` | what the progressive table produces |
| `reducaoLei15270` | the reduction actually applied, never more than the tax |
| `irpfCalculado` / `irpfDevido` | what is owed — the first less the second, floored at zero |

`taxAtBase` reads `irpfPelaTabela`, so every continuity and monotonicity assertion still probes the
table. Neither option the plan offered was needed: exporting the table application would have added
a seam that exists only for tests, and moving the cases above R$ 88.200 would have stopped testing
the low brackets at all.

**Measured, and not predicted: the statute's two bands do not meet.** Band 1 caps at R$ 2.694,15,
band 2 gives R$ 2.695,23 at R$ 60.000,01 — so the reduction steps up R$ 1,08 crossing R$ 60.000 and
the tax due steps down by the same. Zero monotonicity breaks under the simplified regime across
55.000-95.000 at step 1; exactly one under the itemised regime. Pinned by a test named as an
artifact rather than smoothed over.

`parcelasRestituicao` is gone, with the unreachable branch behind it.

⚠️ **This slice leaves the page rendering a false label, and that has to be fixed before any of
this ships.** `src/routes/calculadora-irpf-2026.tsx:220` and `:223` read:

```tsx
mainLabel={result.irpfCalculado > 0 ? "Você deve pagar" : "Você terá restituição"}
resultColor={result.irpfCalculado > 0 ? "negative" : "positive"}
```

Zero tax is not a refund. Before the redutor a result of exactly zero was rare; it is now the
normal outcome for anyone under R$ 60.000 a year — which is most of this site's audience. The page
would tell them they are getting money back.

The pitch put the page out of scope and that was right for widening the work, but this is not a
widening — it is a regression this slice causes. It also wants the reduction shown as its own line,
which is a genuine product decision. **Left deliberately untouched and raised instead.**

## Also worth carrying into another plan

`reducaoLei15270` and `irpfPelaTabela` are two more Portuguese identifiers, added to match the
surrounding interface rather than the `language` skill. `docs/plans/english-domain-identifiers/`
slice 2 covers this file and should pick them up.
