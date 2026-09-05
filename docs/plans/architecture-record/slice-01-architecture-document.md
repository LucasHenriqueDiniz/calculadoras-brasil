---
status: done
kanban: 3a214232-1f71-44a1-ae01-6af802a5ac16
---

# Slice 1 — Write docs/architecture/ARCHITECTURE.md

Name and date what is already true, so it can be defended. Not a refactor: this
slice must not change a single file under `src/`.

## Delivers

`docs/architecture/ARCHITECTURE.md`, in English like the rest of `docs/`,
recording:

- **`src/lib/calculators/` is the domain.** Thirteen modules, pure — input to
  output, no `fetch`, no `localStorage`, no clock. That property is what makes
  them testable with no fixture, and it is the thing the document exists to
  protect.
- **`src/server/` is the driven side.** `adapters/aneel.ts` and
  `adapters/anp.ts` reach external data sources; `bounded-fetch.ts`,
  `edge-cache.ts`, `normalization.ts`, `responses.ts`, `validation.ts` are the
  machinery around them.
- **`src/routes/` is the driving side** — TanStack Start route components,
  prerendered at build time, interactive after hydration.
- **The divergence, stated rather than hidden.** There are no explicit ports and
  no application layer. For a site that is pure functions plus two read-only
  adapters, that is a position; write down that it is a position, and what would
  change it (a third adapter, or a calculation that needs remote data mid-flight).
- **A date**, so a future reader can tell how stale it is.

## Needs

- Nothing outside `docs/`. All the facts above are readable from the tree.
- ~20 min reading `src/server/` and three of the calculator modules, to make
  sure the claim of purity is stated as measured rather than assumed.

## Tests

- The purity claim must be verified, not asserted. Run it before writing it:
  `grep -rnE 'fetch\(|localStorage|Date\.now|new Date' src/lib/calculators/`
  If that returns anything, the document says so — an ARCHITECTURE.md that
  describes a purity the code does not have is worse than no document, and this
  is the one check that stops it.
- The document names real paths only. Every path it mentions must exist.

## Done when

```
grep -rnE 'fetch\(|localStorage|Date\.now|new Date' src/lib/calculators/; echo "purity-exit=$?"
test -f docs/architecture/ARCHITECTURE.md && \
  grep -c 'src/lib/calculators\|src/server/adapters' docs/architecture/ARCHITECTURE.md
git status --porcelain src/ | wc -l
```

The first must end `purity-exit=1` (no I/O found in the domain) — or, if it
finds something, the document must name that exception explicitly. The second
must print a count of at least 2. The third must print `0`: this slice changed
no source file.

## If stuck

If the purity grep finds a hit, do not fix it here. Record it in the document as
a known exception with its file and line, and raise the fix separately — a
refactor smuggled into a documentation slice is how a documentation slice stops
being reviewable.

If the question of ports turns into a redesign discussion, write the current
state and stop. This slice records; it does not decide.
