---
status: active
epic: arch
---

# Write down the architecture that already exists

## The problem

There is no architecture document in this repository:

```
$ find . -path ./node_modules -prune -o -iname '*architect*' -print
$ ls docs
deploy.md  pitches  plans
```

And yet the shape is already there and already correct in the part that
matters. `src/lib/calculators/` is a pure domain: thirteen modules of input to
output with no I/O — no `fetch`, no `localStorage`, no clock. `src/server/`
holds the driven side: `adapters/aneel.ts` and `adapters/anp.ts` talk to
external data sources, with `bounded-fetch.ts`, `edge-cache.ts`,
`normalization.ts`, `responses.ts` and `validation.ts` around them.

Nothing states this, so nothing defends it. The next person who needs a price
inside a calculation will `fetch` from `src/lib/calculators/` because no file
says not to, and the purity that makes these thirteen modules trivially
testable will be gone before anyone notices it was a property.

## What this is and is not

It is a record, not a refactor. The point is to name what is true and date it,
including the honest gap: there are no explicit ports and no application layer,
and for a site of pure functions plus two read-only adapters that is a
deliberate position rather than an oversight. A document that describes the
hexagon this repo does not have would be worse than no document.

## Unresolved

The audit that produced this pitch proposed a second item alongside the
document. Its text is truncated in the record available to me — it ends at
"(b) adicio" and I could not recover the rest. I have not guessed at it. If it
was a lint rule pinning the dependency direction, note that `eslint.config.js`
currently contains no `boundaries`, `no-restricted-imports` or import-zone rule,
so whatever it was has not been done.

## Appetite

One slice.
