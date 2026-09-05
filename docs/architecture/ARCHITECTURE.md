---
tags:
  - architecture
  - status/active
---

# Architecture — Calcule Brasil

> **This file records what already holds in the code, so nobody re-decides it per feature.**
>
> It is not a rules file and it is not aspirational. The house style lives in the `hexagram`
> plugin and in <https://imgabriel.dev/architecture/>. What goes here is this project: the shape
> that is actually built, when each piece was decided, where it diverges from the house style and
> why, and what is still wrong.

**Recorded 2026-09-04**, from the tree at commit `aaad430`. Every count below was measured, not
remembered; the commands that produce them are in the sections themselves.

## How to keep this file

- **Record, do not prescribe.** Present tense, about the code as it stands.
- **Date every decision.** `Decided YYYY-MM-DD.`
- **Declare divergence from the house style, with the reason.** A divergence stated is a decision.
  A divergence unstated is a bug somebody will helpfully fix.
- **End with your own gaps.** A file that lists its own violations gets trusted.

---

## The shape

```
src/
  lib/
    calculators/        THE DOMAIN. 12 calculators + inss-constants.ts. Pure.
    public-data/        browser-side client for the two public-data endpoints
    seo-pages.ts        49 paths. Drives BOTH the sitemap and the prerender
    schema-builders.ts  JSON-LD builders (WebApplication, BreadcrumbList, FAQPage)
    structured-data.ts  site.ts  format.ts  blog.ts  chart-colors.ts
    error-page.ts  utils.ts
  data/
    calculators.ts      metadata for the 12 calculators, keyed by slug
  routes/               THE DRIVING SIDE. TanStack Start file-based routing
    __root.tsx          the only root layout
    index.tsx           plus 12 calculator pages and 6 institutional pages
    api.*.ts            7 JSON endpoints, server-only
    blog/               26 articles
    comparar/           5 comparisons, under comparar.tsx
  server/               THE DRIVEN SIDE
    adapters/aneel.ts   ANEEL open data  -> energy tariffs
    adapters/anp.ts     ANP price survey -> fuel prices
    bounded-fetch.ts    timeout + response-size ceiling around fetch
    edge-cache.ts       Cloudflare Cache API, keyed on the request URL
    normalization.ts  responses.ts  validation.ts  states.ts
  components/
    calculator/         8 shared calculator components
    ui/                 46 shadcn primitives
    layout/  content/  public-data/
  hooks/
  routeTree.gen.ts      GENERATED. Never edited by hand
  router.tsx  styles.css
```

### The domain is pure, and that is measured

`src/lib/calculators/` is 13 modules and **1578 lines that do no I/O**. The whole directory contains
exactly three `import` lines, and all three are internal:

```
src/lib/calculators/inssAutonomo.ts:20    import { … } from "./inss-constants"
src/lib/calculators/salarioLiquido.ts:6   import { calcularInssEmpregado } from "./inss-constants"
```

No React, no `@tanstack/*`, no component, nothing from `src/server/`. The checks:

```bash
grep -rnE 'fetch\(|localStorage|Date\.now|new Date' src/lib/calculators/          # empty
grep -rnE 'Math\.random|process\.env|import\.meta|window\.|globalThis' src/lib/calculators/  # empty
```

Both returned nothing on 2026-09-04. **That property is why these functions test with no fixture,
no mock and no clock**, and it is the single thing this document exists to protect. A calculator
that grows a `fetch` stops being testable that way, and the cost does not show up as a failing
test — it shows up as a test nobody writes.

### The dependency graph is a tree, one direction only

12 route components import 12 calculators. **Nothing under `src/lib/calculators/` imports anything
outside itself.** There are no back-edges, so the house rule — source dependencies point inward —
holds here by construction rather than by discipline.

### How public data reaches a page

The two calculators that use live data never touch the network themselves. The path is:

```
route component
  -> src/lib/public-data/client.ts        fetch("/api/fuel-prices?…")   [browser]
    -> src/routes/api.fuel-prices.ts      validate, then edge-cache      [worker]
      -> src/server/adapters/anp.ts       parse the upstream survey
        -> src/server/bounded-fetch.ts    15s timeout, byte ceiling
```

Four properties the CLAUDE.md requires, and where each one lives:

| requirement | where |
|---|---|
| timeout | `bounded-fetch.ts`, `DEFAULT_TIMEOUT_MS = 15_000` |
| response-size limit | `bounded-fetch.ts`, `maxBytes` — checked on `content-length` **and** while streaming |
| cache | `edge-cache.ts` (Cloudflare Cache API) + `s-maxage=300, stale-while-revalidate=3600` in `responses.ts` |
| manual fallback | `unavailable()` in `responses.ts` returns **HTTP 200** with `available: false`; the page then renders `PUBLIC_DATA_FALLBACK_MESSAGE` and lets the visitor type the number |

⚠️ **The fallback answers 200, not an error status, on purpose.** An upstream outage is a normal
state for this site, not a failure of this site: the calculator still works, the visitor just fills
one field by hand. A 5xx here would make a working page look broken to a browser and to a crawler.

## Ports

There is one driven boundary in this codebase, and it is **not** modelled as a port. Stated plainly
so the omission is not read as an oversight — see Divergences below.

| conversation | what stands in for a port | adapters |
|---|---|---|
| "what does public data say" | the HTTP endpoints under `src/routes/api.*.ts`, whose JSON shape is typed in `src/lib/public-data/types.ts` | `server/adapters/aneel.ts`, `server/adapters/anp.ts` |

`PublicDataResult<T>` — a union of the data and `PublicDataUnavailable` — is the closest thing to a
port contract here: both adapters return it, the client consumes it, and the discriminant
(`available`) is what the components branch on.

## Decisions

*Context, decision, and what it rules out. Newest first. A superseded entry stays, marked.*

### D3 — IRPF 2026 is the official Receita table **plus** the Lei 15.270/2025 redutor

**Context.** `calculateIrpf` carries a bracket table that matches no published source, and its
first test found four defects in it. What the correct table is was the blocking question; the
answer turned out to have a second half nobody had asked about.

**Decision.** The domain implements the Receita's annual table for ano-calendário 2026
(exemption R$ 29.145,60; parcels 2.185,92 / 4.729,91 / 8.105,85 / 10.904,66) **and** the annual
redutor of Lei 15.270/2025 — up to R$ 2.694,15 below R$ 60.000, then
`8.429,73 − 0,095575 × rendimento` until it reaches zero at R$ 88.200, capped at the tax due.
Decided 2026-09-04. Research and sources:
`docs/research/2026-09-04-irpf-2026-table/research.md`.

**Rules out.** Modelling the 2026 exemption as a bracket change. The law left the brackets alone
and subtracts a separate reduction from the tax they produce, so a single table cannot express it
however the numbers are chosen. It also rules out the flat 10% INSS: the correct progressive
contribution already exists in `inss-constants.ts` in the same directory.

### D2 — `calculadoras-brasil` stays as the persisted-data prefix

**Context.** The project is `calcule-brasil` everywhere that crosses the repo boundary: the Worker
script, the preview Worker, `calculebrasil.com`, `package.json`, the product name. The git
directory and the GitHub slug are `calculadoras-brasil`, and so is a third thing that is not a
name at all — the prefix of **9 `localStorage` keys** across 4 route components
(`calculadoras-brasil:conta-luz:tariff:v1`, `calculadoras-brasil:custo-carro:uf:v1`,
`calculadoras-brasil:anp:${uf}:${fuel}`, and six more), plus the `service` field of
`/api/health` and the GitHub URL rendered at `src/routes/sobre.tsx:150`.

**Decision.** The split is left as it is, and `calculadoras-brasil` is recorded here as a
**documented exception** to the naming convention. Decided 2026-09-04.

**Rules out.** Renaming the prefix, which the `naming` skill classes as a data migration rather
than a `git mv`: those keys are state in the browser of every returning visitor, and changing the
prefix orphans all of it silently — no error, no log, just inputs that stopped being remembered.
The GitHub URL is a second cost: it is rendered on the live About page and was submitted to
AdSense as proof of author identity. Aligning the names buys nothing that is currently ambiguous.

**What would reverse this.** A key-versioning scheme that migrates old keys on read — at which
point the rename costs one migration function instead of every visitor's saved state.

### D1 — The Worker keeps the name `calcule-brasil`

**Context.** The `naming` skill asks for `<owner>-<project>-<resource>-<env>`. The production
Worker is `calcule-brasil` and its preview sibling is `calcule-brasil-preview`, so production
carries no `-env` segment and neither carries an owner prefix.

**Decision.** The Worker is **not** renamed. Decided 2026-09-03.

**Rules out.** The rename, on four measured grounds: the name is an address, not a label
(`calcule-brasil.lucas-hdo.workers.dev` answers 200 while an invented sibling answers 404);
changing `name` in `wrangler.jsonc` creates a *second* Worker rather than renaming the first;
deployment history — every rollback target the site currently has — belongs to the script and does
not follow; and the apex route is dashboard state, since `wrangler.jsonc` declares no `routes`
block.

**Evidence, in full:** `docs/architecture/worker-name-decision.md`, including the two facts that
could **not** be determined (whether the apex is a Custom Domain or a route pattern, and the
production deployment count) because the 1Password CLI was not signed in. Neither changes the
decision; both only raise the price of a rename.

## Divergences from the house style

| what | house style says | here | why |
|---|---|---|---|
| **No `ports/` and no `application/` layer** | four layers always — domain, ports, application, adapters | two: a pure domain (`lib/calculators/`) and a driven side (`server/`), with route components orchestrating directly | This is a site of pure functions plus **two read-only adapters**. There is no write path, no transaction, no second implementation of anything, and no use case shared by two entry points. A port here would be a contract with exactly one implementation and one caller. **Stated as a position, not an accident.** |
| **`server/` is not `adapters/driven/`** | driving and driven, everywhere, never mixed vocabularies | `src/server/` for the driven side, `src/routes/` for the driving side | The framework owns `src/routes/` — TanStack Start file-based routing is not negotiable without leaving the framework. Renaming only `server/` would put half the vocabulary in place and half not, which is worse than neither. |
| **Domain identifiers are in Portuguese** | everything that lands in the repo is English (`language` skill) | `calcularInssEmpregado`, `aliquota`, `deducao`, `salarioBruto` and ~47 more lines under `lib/calculators/` | **Not a position — a violation with a plan.** `docs/plans/english-domain-identifiers/` is four slices that close it. Recorded here so it is not mistaken for a deliberate carve-out of the product-is-Portuguese rule: this is code, not copy. |
| **No `.mcp.json`, no `docs/.obsidian/`** | the scaffold ships both; `docs/` is an Obsidian vault | neither is present | `docs/` here is plain markdown read in an editor and on GitHub. The two belong together — the `obsidian` MCP server exists to serve a vault — and neither is used. Recorded 2026-09-04 as deliberate, so the next audit finds a reason instead of an omission. |
| **No `.claude/statusline.sh`, no `statusLine` key** | the scaffold ships both | `.claude/settings.json` carries the `hooks` block only, byte-identical to the template | Per-machine cosmetics. The hooks are the half that does work. Recorded 2026-09-04 as deliberate. |
| **`docs/` has no `postmortem/`, `roadmap/`, `product/`, `diagrams/`** | the vault ships all of them | `architecture/`, `pitches/`, `plans/`, `research/` and `deploy.md` | Empty folders are maintenance surface. Each is created the first time it has a real document, not before — `research/` was created on 2026-09-04 when it got one. Recorded 2026-09-04. |

## What is not in the repository

Four build settings live in the Cloudflare dashboard, not here, and `docs/deploy.md` is the only
record of them. The Worker is published by **Workers Builds** on push; `.github/workflows/ci.yml`
runs typecheck, lint and tests and deliberately does **not** build, because Workers Builds already
does. `wrangler.jsonc` declares no `routes` block, so the mapping from `calculebrasil.com` to this
Worker is dashboard state too.

## Known gaps

The violations that exist right now.

- [ ] **`/calculadora-irpf-2026` calls a zero tax a refund.** `calculadora-irpf-2026.tsx:220` and
      `:223` branch on `irpfCalculado > 0` and fall through to "Você terá restituição". Zero tax was
      a rare outcome until the Lei 15.270/2025 reduction landed on 2026-09-04; it is now the normal
      one for anyone earning under R$ 60.000 a year. The page also does not show the reduction at
      all, so the figure it prints cannot be reconciled with the table. **The domain is correct and
      the page is not — this is the last thing between the IRPF work and shipping.** No plan covers
      it; `docs/plans/irpf-calculation-defects/slice-04-redutor.md` raises it.
- [ ] **4 of the 12 calculators have no test at all**: `salarioLiquido`, `beneficiosFiscais`,
      `cltVsPj`, `previdenciaComplementar` — 375 of the 1578 lines in the domain, all of it tax
      arithmetic. Plan: `docs/plans/calculator-test-coverage/`.
- [ ] **Two route components are past the hard 200-line limit by more than 3x**:
      `calculadora-conta-de-luz.tsx` (723) and `calculadora-custo-carro.tsx` (692). They hold form
      state, persistence, public-data fetching, editorial copy and JSON-LD in one file.
      `livingAlone.ts` (225) and `carCost.ts` (317) are over it in the domain.
      Plan: `docs/plans/oversized-functions/`.
- [ ] **Portuguese identifiers in the domain.** See Divergences.
      Plan: `docs/plans/english-domain-identifiers/`.
- [ ] **`README.md` says 38 prerendered public pages, in two places.** `SEO_PAGES` has **49**
      entries and `vite.config.ts` prerenders exactly that list. The README is stale; no plan
      covers it.
- [ ] **`ADSENSE-CHECKLIST.md` sits at the repo root**, dated 2026-06-26 with 3 of 7 fixes still
      open. It is a roadmap document living outside `docs/`, and it has not moved in two months.
- [ ] **No test covers the two adapters.** `aneel.ts` and `anp.ts` parse third-party formats — an
      upstream column rename is caught today only by a visitor seeing the fallback message.
