---
status: active
epic: identifiers
---

# Portuguese identifiers in the calculator domain

## The problem

The `language` skill says identifiers are English. Seven modules under
`src/lib/calculators/` are not:

```
$ grep -rniE 'aliquota|deducao|salario|contribuicao|beneficio' src/lib/calculators/ | wc -l
     154
```

Spread over the seven files that still carry them:

| file | matching lines |
|---|---|
| `inssAutonomo.ts` | 40 |
| `salarioLiquido.ts` | 34 |
| `irpf.ts` | 21 |
| `beneficiosFiscais.ts` | 18 |
| `cltVsPj.ts` | 17 |
| `previdenciaComplementar.ts` | 12 |
| `inss-constants.ts` | 12 |

Every one of those matches is an identifier. None is a string literal — this
returns nothing:

```
$ grep -rnEi '"[^"]*(aliquota|deducao|salario|contribuicao|beneficio)[^"]*"' src/lib/calculators/
```

The six calculators that were written later (`carCost`, `electricityBill`,
`livingAlone`, `movingCost`, `petCost`, `subscriptions`) have zero matches, so
the repo already disagrees with itself about which language a field name is in.

## Why it is safe, and where it is not

These names are **not a public contract**. `src/server/` — the only code that
produces HTTP responses — has no match at all:

```
$ grep -rniE 'aliquota|deducao|salario|contribuicao|beneficio' src/server/
$ echo $?
1
```

The Portuguese that *is* a contract lives elsewhere and this pitch does not
touch it: the URL slugs in `src/data/calculators.ts` and `src/lib/seo-pages.ts`
(`/calculadora-salario-liquido` and 37 siblings) are indexed public URLs, and
the site copy is written for a Brazilian audience on purpose. The README already
states the split: the site is Portuguese, the repository is English.

There is one place where a rename is **not** free. `usePersistedState` serialises
the `*Input` interface straight into `localStorage`:

```ts
const [input, setInput] = usePersistedState<IrpfInput>("irpf-2026-input", DEFAULTS);
```

Renaming `deducaoSaude` to `healthDeduction` does not migrate a returning
visitor's stored object — `JSON.parse` hands back the old keys and the new code
reads `undefined` from every one of them. Six calculators persist a Portuguese
`*Input`: `salarioLiquido`, `irpf`, `inssAutonomo`, `cltVsPj`,
`beneficiosFiscais`, `previdenciaComplementar`. That is why the persisted
interfaces are their own slice, with a storage-key bump, rather than being
swept along with the locals.

## What the rename also fixes

Two field names are simply wrong and nobody noticed because nobody reads a
field name in a language the file is not written in:

- `CltVsPjInput.despesasDedutivelsPj` — `Dedutivels` is not a word in either
  language (`src/lib/calculators/cltVsPj.ts:6`)
- `PrevidenciaComplementarInput.tasaRetornoAnual` — `tasa` is Spanish; the
  Portuguese is `taxa` (`src/lib/calculators/previdenciaComplementar.ts:4`)

## Appetite

Three slices, ordered by blast radius: internals first (nothing outside the file
can see them), exported symbols second (the type checker finds every caller),
persisted fields last (the type checker cannot find a returning visitor's
browser).
