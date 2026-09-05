---
status: active
epic: irpf
---

# `calculateIrpf` computes the wrong tax, in four ways

## The problem

`/calculadora-irpf-2026` carries `priority: 0.95` in `src/lib/seo-pages.ts` — tied
for the highest of the 49 public pages after the home page. It is one of the two
pages the site is ranked for, and on 2026-09-04 it got its first test.

Nine of the 27 cases failed. None of them is a test bug.

Every defect below is proven **against the module itself**, with no appeal to the
legislation. That matters, because what the correct 2026 table is remains an open
question (see Research Needed) — and none of these four needs it answered to be
wrong.

### 1. The progressive table is discontinuous at 3 of its 4 boundaries

A table of rates plus deduction parcels is continuous by construction: the parcel
exists precisely so that tax computed from either side of a boundary agrees. The
required parcel is `d_next = d_prev + (r_next − r_prev) × boundary`.

| boundary | declared | required | off by |
|---|---|---|---|
| 21.503,34 | 1.612,75 | 1.612,75 | 0,00 |
| 33.503,34 | 4.257,67 | 4.125,50 | **132,17** |
| 44.693,59 | 7.633,69 | 7.609,69 | **24,00** |
| 55.471,74 | 10.432,32 | 10.407,28 | **25,04** |

Only the first boundary holds. Crossing the second makes the tax **fall**:

```
base 33.503,34  →  irpfCalculado 900,00
base 33.503,35  →  irpfCalculado 767,83
```

Earning one more cent saves R$ 132,17.

### 2. The brackets leave uncovered gaps, and the fallback lands on 27,5%

Brackets end at `.34` and resume at `.35`. `findTaxBracket` tests
`base >= min && base <= max`, so a base between the two matches nothing, drops out
of the loop, and hits the "past every range (unlikely)" fallback — which returns
the **last** bracket: 27,5% with a deduction parcel of 10.432,32. Applied to a base
that small, `Math.max(…, 0)` then floors the result at zero.

```
calculateIrpf({ rendaBrutaAnual: 37225.94, … })
  →  baseImponivel 33.503,346  →  aliquotaMarginal "27.5%"  →  irpfCalculado 0,00
```

R$ 900 of tax becomes zero. The gap is not theoretical: `baseImponivel` is
`rendaBrutaAnual × 0.9`, so a base of `33503.3400006` already falls in it.

### 3. INSS is a flat 10% with no ceiling

`irpf.ts:69` computes `rendaBrutaAnual * 0.1`, with a comment conceding the rate is
"8-11%; 10% used as the average". Meanwhile `inss-constants.ts` — a module in the
same directory, already imported by `salarioLiquido.ts` and `inssAutonomo.ts` —
holds the real progressive brackets, `TETO_INSS = 8475.55`, and a
`calcularInssEmpregado` whose own docstring records the correct maximum of
R$ 988,09 per month.

```
rendaBrutaAnual 500.000  →  descInss 50.000,00
legal annual maximum     →  11.857,10
```

4,2x. The repo already contains the correct implementation; this module does not
call it.

### 4. The simplified discount has no cap

`irpf.ts:96` says "flat 20.5% deduction of gross income, **up to the allowed cap**".
There is no cap in the code — it is `rendaBrutaAnual * (1 - 0.205)`, unbounded.

```
rendaBrutaAnual   100.000  →  discount    20.500,00
rendaBrutaAnual 1.000.000  →  discount   205.000,00
```

### Found alongside, smaller

- **`MAX_DEDUCTION_HEALTH = 2666.67`** caps health deductions, and the code's own
  comment admits "no official cap exists". This is a deliberate choice recorded in
  a constant, not a bug — but it makes the estimate wrong for anyone with real
  medical expenses, and it needs a product decision rather than a fix.
- **`parcelasRestituicao` is dead.** `irpfCalculado` is `Math.max(…, 0)` and
  `irpfDevido` is assigned from it, so the `irpfDevido < 0` branch at `irpf.ts:119`
  can never be taken. The comment above it says "a negative value is a refund"; no
  negative value can reach it.

## Why it matters more than a test failure

`pnpm run check` runs `vitest run`, and until 2026-09-04 `vitest run` had nothing
to say about this file. All four defects have been live on a public page that
tells Brazilians what they owe.

The site's disclaimer covers "this is an estimate, the official figure is the
Receita's". It does not cover a table that charges less as you earn more.

## Scope

### In scope

- [x] ~~Establish the correct IRPF table in force for the 2026 calendar year.~~
      **Answered 2026-09-04:** `docs/research/2026-09-04-irpf-2026-table/research.md`.
- [ ] **Implement the Lei 15.270/2025 redutor.** Not anticipated when this pitch was
      written, and the single biggest item in it: the 2026 exemption is a reduction
      applied *on top of* the table, not a change to the brackets. A calculator with
      the right table and no redutor is wrong for everyone under R$ 88.200 a year —
      which is most of this site's audience.
- [ ] Fix the simplified regime completely: rate 20% (not 20,5%), ceiling
      R$ 17.640,00, and **no other deduction on top of it** — including dependants,
      which `irpf.ts:98` currently subtracts as well. That is a fifth defect, found
      during the research and not listed above.
- [ ] Dependant deduction R$ 2.275,08, not R$ 2.275,00.
- [ ] Replace `IRPF_TABLE_2026` with a representation that cannot have gaps —
      boundaries expressed once, not as a `max` and a `min` that must agree.
- [ ] Make `findTaxBracket` total: every non-negative base gets a bracket, and the
      "unlikely" fallback either becomes unreachable or throws.
- [ ] Replace the flat 10% INSS with `calcularInssEmpregado` from
      `inss-constants.ts`, applied against the ceiling.
- [ ] Cap the simplified discount, or delete the claim from the comment if the
      legislation has no cap.
- [ ] Delete the dead `parcelasRestituicao` branch, or make it reachable.
- [ ] Un-block `docs/plans/calculator-test-coverage/slice-01-irpf.md`: its 27 tests
      go green without any assertion being relaxed.

### Out of scope

- **`salarioLiquido.ts`**, even though `docs/pitches/calculator-test-coverage.md`
  records that it implements the same 2026 rules a second time. If this work
  produces a shared table, that is the moment to notice — but merging the two is a
  separate pitch, and doing it here doubles the surface under change while the
  numbers are still being established.
- **The health-deduction cap.** It is a declared product choice, not a defect.
- **The `regimeSimplificado` toggle semantics.** The function computes the regime
  it is handed and never picks the cheaper one. Whether it should is a product
  question about what the page promises, not a correctness bug in the arithmetic.
- **Any change to the page**, `src/routes/calculadora-irpf-2026.tsx`. If the
  corrected numbers change what the page must say, that is a follow-up.
- **Backfilling anything.** Nothing is persisted; there is no stored result to
  migrate.

## Research needed

- [x] ~~**What is the IRPF table actually in force for 2026, annual basis?**~~
      **Answered 2026-09-04** — `docs/research/2026-09-04-irpf-2026-table/research.md`.
      All four questions below are closed by it. Kept as written so the reasoning that
      motivated the search survives. The
      table in the code has not been traced to any source. Note for whoever picks
      this up: its parcels and its boundaries do not fail together — the parcels
      are internally consistent with **each other** at only one of four
      boundaries, which reads like a partial edit rather than a table copied whole
      from one place. Verify both halves against the Receita, not just the rates.
- [ ] **Does the 2026 reform raising the exemption change the annual table, the
      monthly one, or both?** The module's boundaries imply an annual exemption of
      R$ 21.503,34 — R$ 1.791,94 a month, which is **1,11x** the minimum wage of
      R$ 1.621,00 declared in `inss-constants.ts`. An exemption threshold that
      close to the floor is worth checking against the reform before anything is
      built on it.
- [ ] **Is the simplified discount capped in 2026, and at what figure?**
- [ ] Keep every source under `docs/research/<topic>/fetches/`. A rate cited with
      no fetch file was not read, and this is a number the site publishes.

⚠️ ~~**Do not start the fix before the first question is answered.**~~ Closed. The
research kept every source under `docs/research/2026-09-04-irpf-2026-table/fetches/`
and derived the law's own constants independently, to the centavo.

## Testing strategy

The tests already exist: `tests/calculators/irpf.test.ts`, 27 cases, 18 green and
9 red. **No assertion in that file may be relaxed to make it pass** — each red one
encodes a property the correct implementation must have.

Two of them are worth keeping whatever the table turns out to be, because they hold
for every valid progressive table and would have caught all of this on day one:

- tax never decreases as income rises, swept finely around each boundary;
- tax computed either side of a boundary agrees to within a cent.

Add, once the table is known: a value test per bracket against the published
figures, with the source cited in the test.

## Success criteria

- [ ] `pnpm exec vitest run tests/calculators/irpf.test.ts` reports
      `27 passed (27)`, no skips, no relaxed assertions.
- [ ] `pnpm run check` is green end to end.
- [ ] `docs/research/` holds the table with its sources fetched.
- [ ] The decision — which table, and why that one — is an entry in the
      `## Decisions` section of `docs/architecture/ARCHITECTURE.md`, dated.
- [ ] The four `Known gaps` entries this pitch answers are struck from that file.
- [ ] `docs/plans/calculator-test-coverage/slice-01-irpf.md` is back to
      `status: done`.

## Plan

`docs/plans/irpf-calculation-defects/` — four slices, written 2026-09-04 once the research
closed the blocking question. See its `README.md` for the order and the red-case count each
slice is expected to leave behind.

## Appetite

Research first, and it may be most of the work — the numbers have to come from the
Receita, not from a blog. The code change itself is small: one table, one
`findTaxBracket`, one import that already exists in the directory.
