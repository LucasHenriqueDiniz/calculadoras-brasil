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

**Recorded 2026-09-04**, from the tree at commit `aaad430`, and kept current through the
IRPF correction work that followed on the same day. Every count below was measured, not
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
    calculators/        THE DOMAIN. 12 calculators + inss-constants, irpf-constants, money. Pure.
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

`src/lib/calculators/` is 15 modules and **2041 lines that do no I/O**. Every `import` line in the
whole directory is internal — the four calculators that need a shared rule reach for one of the
three constant modules and for nothing else:

```
src/lib/calculators/inssAutonomo.ts    -> ./inss-constants
src/lib/calculators/irpf.ts            -> ./inss-constants, ./irpf-constants
src/lib/calculators/salarioLiquido.ts  -> ./inss-constants, ./irpf-constants, ./money
src/lib/calculators/cltVsPj.ts         -> ./inss-constants, ./irpf-constants, ./money
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

- [ ] **`/calculadora-irpf-2026` tells the visitor health expenses have no limit, and then caps
      them.** The form hint says "Sem limite legal. Mantenha comprovantes." and the FAQ says "Sim,
      completamente. Sem limite legal" — while `MAX_DEDUCTION_HEALTH = 2666.67` silently truncates
      the figure they typed. The law agrees with the copy; the module does not. This is the most
      visible contradiction left on the page, and it is a product decision rather than a defect:
      the constant's own comment already says "no official cap exists". Out of scope in
      `docs/pitches/irpf-calculation-defects.md`; no plan covers it.
- [ ] **`PrevidenciaComplementarInput.tasaRetornoAnual` is Spanish, and renaming it is a data
      migration.** `previdenciaComplementar.ts:3` — `tasa` should be `taxa`. The field is persisted
      verbatim in the visitor's `localStorage` under `previdencia-input`
      (`calculadora-previdencia-complementar.tsx:80`), so a rename orphans the stored value of every
      returning visitor. The `naming` skill's test for which class a rename falls into puts this in
      the expensive one; it needs a key version bump alongside, the same way
      `docs/plans/english-domain-identifiers/` handles the others.
- [ ] **The site states three different figures for the same rule, in three places.** None was
      researched and none can be settled from
      `docs/research/2026-09-04-irpf-2026-table/research.md`, which covers the tables and the
      Lei 15.270/2025 reduction only:
      | rule | figures found |
      |---|---|
      | obligation to file | R$ 28.559,70 (calculator page, `guia-irpf-2026`, blog `calculadora-irpf-2026`) vs **R$ 33.888** (`tabela-irpf-2026-completa`, `blog.ts`) |
      | assets requiring a return | R$ 300 mil (two articles) vs **R$ 800 mil** (`blog.ts`) |
      | supplementary-pension ceiling | R$ 63.454/ano "13% da renda" (three files) vs **12% da renda bruta** (two others) |
      A visitor comparing two of this site's own pages gets contradictory tax advice. Each needs its
      own research note before any of them is edited — correcting one to match another would be
      guessing which is right. No plan covers it.
- [x] **Three calculators implemented the 2026 IRPF rules independently, and each was wrong in its
      own way.** `irpf.ts`, `salarioLiquido.ts` and `cltVsPj.ts` each carried their own copy of the
      progressive table — `grep -l '0\.275' src/lib/calculators/` found all three. They never
      agreed. `cltVsPj.ts:33-37` was the starkest: it implemented **only** the 22,5% and 27,5%
      branches, so tax was zero below an annual base of 44.693,60 and R$ 201,86 immediately above —
      one real more of gross salary cost the visitor R$ 201 of net.
      **The duplication was the defect; the wrong figures were its symptom.** Closed 2026-09-05:
      `irpf-constants.ts` owns both incidence tables, both Lei 15.270/2025 reductions and every
      published deduction ceiling, and the three calculators import from it — the shape
      `inss-constants.ts` already had for INSS. Each figure is declared exactly once. The monthly
      and annual halves stay separate symbols on purpose: they are separate publications, not one
      table over twelve. `MAX_DEDUCTION_HEALTH` deliberately stayed in `irpf.ts`, because no
      official ceiling for it was ever found and it is not one of the published figures.
- [ ] **Two route components are past the hard 200-line limit by more than 3x**:
      `calculadora-conta-de-luz.tsx` (723) and `calculadora-custo-carro.tsx` (692). They hold form
      state, persistence, public-data fetching, editorial copy and JSON-LD in one file.
      `livingAlone.ts` (225) and `carCost.ts` (317) are over it in the domain.
      Plan: `docs/plans/oversized-functions/`.
- [ ] **Portuguese identifiers in the domain.** See Divergences.
      Plan: `docs/plans/english-domain-identifiers/`.
- [ ] **`/calculadora-clt-vs-pj` overstates what a PJ must invoice, and its FAQ was right all
      along.** Researched 2026-09-05: `docs/research/2026-09-05-pj-tax-model/research.md`. The
      module charges `INSS_RATE_PJ = 0.2` uncapped on the whole invoice. The sócio's contribution
      is **11%**, **capped at the RGPS ceiling** (`0,11 × 8.475,55 = R$ 932,31/month`), and levied
      on the **pró-labore**, not the invoice — the 20% is the *patronal* contribution, owed by the
      company, and only outside Simples Nacional. At a CLT gross of R$ 10.000 the module invents
      R$ 2.413,72 a month of contribution nobody owes, and answers +67% where the source's worked
      case is +30% to +40%. **The FAQ's "25% a 40%" needs no change; the arithmetic does.** The
      module also models no Simples Nacional at all, while the page's own FAQ and disclaimer
      describe one. Which of the four options to take is a product decision the research
      deliberately leaves open — they range from capping the contribution to modelling the Fator R.
- [ ] **`/calculadora-salario-liquido` labels annual inputs as monthly.** The fields read "Gastos
      **mensais** com educação/saúde" and "Previdência complementar **mensal**", and the module
      consumes them as annual amounts — a 12x error for anyone who fills them. The education hint
      contradicts its own label in one line: "Gastos mensais… (limite: R$ 3.561,50/**ano**)".
      Pre-existing, and entangled with the open question of whether those deductions belong in a
      monthly withholding at all (in law they belong to the annual adjustment).
- [ ] **Result fields nothing renders.** `cltVsPj.detalhesClt`/`detalhesPj`,
      `salarioLiquido.irpfPelaTabela`/`reducaoLei15270`/`baseImponivelMensal`,
      `previdencia.projecao`/`rendimentoTotal`. Two whole input paths are unreachable from the UI
      too: `CltVsPjInput.dependentes` and `SalarioLiquidoInput.regimeSimplificado` — the latter is
      a branch this work built, tested and justified for a path no route can reach. Each wants a
      decision: render it or remove it.
- [ ] **`previdenciaComplementar` headlines a saving from a rate the visitor cannot set.**
      `aliquotaIrpfAtual` is hardcoded at 22,5% with no control, yet "Economia IRPF/ano" is shown
      as though it were the visitor's own figure.
- [ ] **`ADSENSE-CHECKLIST.md` sits at the repo root**, dated 2026-06-26 with 3 of 7 fixes still
      open. It is a roadmap document living outside `docs/`, and it has not moved in two months.
- [ ] **No test covers the two adapters.** `aneel.ts` and `anp.ts` parse third-party formats — an
      upstream column rename is caught today only by a visitor seeing the fallback message.
