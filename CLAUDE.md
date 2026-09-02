# CLAUDE.md

This is the canonical instruction file for agents working in this repository. If another tool looks for `CODEX.md`, `AGENTS.md` or files under `.codex/`, it should read this file and follow these instructions.

## Project

Calcule Brasil is a hub of Brazilian calculators for day-to-day costs, taxes and personal finance. The main stack is React, TypeScript, TanStack Start, Vite and Cloudflare Workers.

## Main commands

- Install dependencies: `pnpm install --frozen-lockfile`
- Local development: `pnpm run dev`
- Unit tests: `pnpm test`
- Typecheck: `pnpm run typecheck`
- Lint: `pnpm run lint`
- Build: `pnpm run build`
- SEO smoke test: `pnpm run test:seo`
- Full gate: `pnpm run check`

Where possible, run at least `pnpm run typecheck`, `pnpm test`, `pnpm run build` and `pnpm run test:seo` after changing routes, SEO, calculators or structured data.

## Implementation conventions

- Routes live in `src/routes/` and use TanStack Start file-based routing.
- `src/routeTree.gen.ts` is generated. Do not edit it by hand.
- Every new calculator needs:
  - a pure formula in `src/lib/calculators/`;
  - metadata in `src/data/calculators.ts`;
  - a route in `src/routes/`;
  - editorial content, FAQ and JSON-LD;
  - an entry in `src/lib/seo-pages.ts`.
- The sitemap and the prerendering both depend on `src/lib/seo-pages.ts`.
- The SEO smoke test must cover any new public route, in `tests/seo-smoke.mjs`.
- Preserve the absolute canonical, Open Graph, `WebApplication`, `BreadcrumbList` and `FAQPage` on the calculators.
- For external public data, keep the timeout, the cache, the response-size limit and the manual fallback.

## Language: the repo is English, the product is Portuguese

These two rules point in opposite directions on purpose, and mixing them up is the one mistake here that reaches a visitor.

- **Everything written into the repo is English**: identifiers, comments, docstrings, test names, docs, README, commit messages and branch names. This comes from the `language` skill (see below).
- **Everything a visitor reads stays in Brazilian Portuguese**: page titles and descriptions, body and blog copy, form labels, user-facing error messages, SEO copy and JSON-LD. The audience is Brazilian. Translating any of it is a product regression, not a style fix.

A thrown or logged message that no component renders is code, so it is English. The hardcoded copy a `catch` block puts on screen is product text, so it stays Portuguese.

## Cautions

- Never commit secrets. Use Wrangler or the Cloudflare dashboard for secrets.
- Do not edit `dist/`, `.wrangler/`, `.tanstack/`, `node_modules/` or any other generated artefact.
- Do not switch the architecture to Next.js, Remix or `src/pages/`.
- Financial and tax content must stay educational, in plain language, and must never promise a final official figure.

## House style comes from the `hexagram` plugin, not from this repo

**There is no `.claude/rules/` directory here, and that is deliberate.** The conventions this repo follows are not stored on disk next to the code — they are skills in the `hexagram` plugin, installed per machine, at whatever version the person who cloned this repo has. Looking for a local rules directory, finding none, and concluding that the repo has no standard is the wrong conclusion.

What comes from the plugin rather than from this repository:

| skill | covers |
|---|---|
| `architecture` | the Deterministic Hexagon: ports, adapters, where a file goes |
| `naming` | what to call things, and which renames are a data migration |
| `git` | commit messages, branching, the commit-msg hook |
| `language` | English in the repo (the rule the section above applies) |
| `testing` | what to test at which layer, fakes vs real infrastructure |
| `clean-code` | naming, function and file size, error handling, readability |
| `diagrams` | C4 notation and Excalidraw inside an Obsidian vault |
| `workflow` | pitch → research → decision → plan → implement → postmortem |
| `terraform` | infrastructure-as-code layout and remote state |
| `setup-machine` | machine setup |
| `research` | resolving an unknown before a decision depends on it |
| `postmortem` | recording what something cost to learn |
| `lint` | formatting, lint and types across the stack |

Read the skill before following it: the copy that matters is in the plugin, and it changes there.

## Commit hook

`.githooks/commit-msg` strips AI attribution trailers from commit messages. Git does not version
`.git/hooks`, so what makes the hook run is one line of local config — and a fresh clone does not
have it. The root `prepare` script sets it on `pnpm install`, and only when nothing else claims it:

```
git config --get core.hooksPath >/dev/null 2>&1 || git config core.hooksPath .githooks
```

If you already point `core.hooksPath` somewhere else, the script leaves your value alone and this
repo's hook stays inert — wire it by hand, or move the file into whatever directory you do use.
