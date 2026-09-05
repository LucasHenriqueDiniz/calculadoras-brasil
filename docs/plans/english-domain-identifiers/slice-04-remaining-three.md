---
status: done
kanban: 0225dd88-288d-489a-9f61-78b1471fabd5
---

# Slice 4 — English identifiers in the last three calculators

`cltVsPj.ts` (17 matching lines), `beneficiosFiscais.ts` (18) and
`previdenciaComplementar.ts` (12). Together because each is a thin function over
arithmetic, and together they are smaller than slice 2's larger file.

## Delivers

The last 47 Portuguese-identifier lines under `src/lib/calculators/` gone, which
is what closes this feature:

```
$ grep -rniE 'aliquota|deducao|salario|contribuicao|beneficio' src/lib/calculators/
$ echo $?
1
```

Two of the renames also fix names that are wrong in **both** languages, which is
the cheapest evidence that nobody has been reading them:

- `CltVsPjInput.despesasDedutivelsPj` (`src/lib/calculators/cltVsPj.ts:6`) —
  `Dedutivels` is not a word
- `PrevidenciaComplementarInput.tasaRetornoAnual`
  (`src/lib/calculators/previdenciaComplementar.ts:4`) — `tasa` is Spanish

## Needs

- Slices 1-3 merged. This slice's `Done when` greps the whole directory, so it
  only passes once the earlier files are already clean.
- The three persisted keys to bump, same reasoning as slice 2:
  `"clt-vs-pj-input"` (`src/routes/calculadora-clt-vs-pj.tsx:76`),
  `"beneficios-input"` (`src/routes/calculadora-beneficios-fiscais.tsx:73`),
  `"previdencia-input"` (`src/routes/calculadora-previdencia-complementar.tsx:80`).

## Tests

- Before/after value tests for all three functions, three inputs each: the
  numbers must be identical across the rename.
- If slice 3 of `[tests]` has landed, these three already have test files —
  extend them instead of adding new ones, and the value-identity check is then
  just "the existing expected numbers did not need editing".

## Done when

Two separate blocks, because chaining them lets a failing test print the
passing string. Run the suite first:

```
pnpm run typecheck && pnpm test && echo "checks-ok"
```

`checks-ok` is only reached when both exit 0: typecheck clean, vitest summary
all passing. Then, as its own command, so `$?` is the grep's:

```
grep -rniE 'aliquota|deducao|salario|contribuicao|beneficio' src/lib/calculators/
echo "grep-exit=$?"
```

Must end with `grep-exit=1` and **no matching lines printed at all** — this is
the directory-wide check, down from the 154 lines across 7 files that match
today.

## If stuck

If bumping three storage keys in one slice feels like three chances to get it
wrong, split by file — `slice-04b`, `slice-04c` — and keep the directory-wide
grep as the last one's `Done when`. Fractional slice numbers are cheaper than a
slice that half-lands.

---

## What actually happened — 2026-09-05

`checks-ok`, and the directory-wide grep prints nothing and exits 1. **That closes the feature**:
all seven modules under `src/lib/calculators/` are in English.

The two names wrong in both languages are gone: `despesasDedutivelsPj` → `pjDeductibleExpenses`,
and **`tasaRetornoAnual` → `annualReturnRate`**.

`taxFromTable`, `reductionLei15270`, `inssWithheld` and `dependantAllowance` now read the same in
`irpf.ts`, `salarioLiquido.ts` and `cltVsPj.ts` — the three modules that touch the 2026 rules share
one vocabulary, which is what makes their remaining duplication legible in a diff.

**Three keys bumped**, all to `-v2`: `clt-vs-pj-input`, `beneficios-input`, `previdencia-input`.
Every field of all three interfaces was renamed, so without the bump a returning visitor's stored
object would have made each one read `undefined`.

⚠️ **`CltVsPjResult.analysis.rationale` holds prose the page renders.** The field renamed; every
Portuguese string it can hold is byte-identical, and the four regex assertions over it were not
touched.

**No literal union in these three modules** — every field is `number`, `boolean` or free-form
`string`, so slice 3's conservative half had nothing to apply to.

**No expected value moved.** Numeric-literal multiset byte-identical to `HEAD` in all nine files,
extracted with a lookbehind so digits inside identifiers (`balanceAt10Years`, `reductionLei15270`)
cannot mask a moved figure. 149 `expect` lines removed, 149 added.

### A hole the slice exposed, closed here

`tests/usePersistedState.test.ts` guards that each route's source contains its bumped key — but it
listed only slice 2's two routes. The four keys bumped in slices 3 and 4 had no guard, so a revert
to an unbumped key would have passed the suite and handed a returning visitor a form of
`undefined`s. All six routes are listed now. Verified by reverting `previdencia-input-v2` and
watching the guard fail.
