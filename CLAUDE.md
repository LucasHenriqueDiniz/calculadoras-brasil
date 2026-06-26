# CLAUDE.md

Este é o arquivo canônico de instruções para agentes neste repositório. Se outra ferramenta procurar `CODEX.md`, `AGENTS.md` ou arquivos em `.codex/`, ela deve ler este arquivo e seguir estas instruções.

## Projeto

Calcule Brasil é um hub de calculadoras brasileiras para custos do dia a dia, impostos e finanças pessoais. O stack principal é React, TypeScript, TanStack Start, Vite e Cloudflare Workers.

## Comandos principais

- Instalar dependências: `npm ci`
- Desenvolvimento local: `npm run dev`
- Testes unitários: `npm test`
- Typecheck: `npm run typecheck`
- Lint: `npm run lint`
- Build: `npm run build`
- Smoke SEO: `npm run test:seo`
- Gate completo: `npm run check`

Quando possível, rode pelo menos `npm run typecheck`, `npm test`, `npm run build` e `npm run test:seo` após mudanças em rotas, SEO, calculadoras ou dados estruturados.

## Convenções de implementação

- Rotas vivem em `src/routes/` e usam TanStack Start file-based routing.
- `src/routeTree.gen.ts` é gerado automaticamente. Não edite manualmente.
- Toda calculadora nova precisa de:
  - fórmula pura em `src/lib/calculators/`;
  - metadados em `src/data/calculators.ts`;
  - rota em `src/routes/`;
  - conteúdo editorial, FAQ e JSON-LD;
  - registro em `src/lib/seo-pages.ts`.
- O sitemap e a pré-renderização dependem de `src/lib/seo-pages.ts`.
- SEO smoke deve cobrir rotas públicas novas em `tests/seo-smoke.mjs`.
- Preserve canonical absoluto, Open Graph, `WebApplication`, `BreadcrumbList` e `FAQPage` nas calculadoras.
- Para dados públicos externos, mantenha timeout, cache, limite de resposta e fallback manual.

## Cuidados

- Não versionar segredos. Use Wrangler ou painel da Cloudflare para secrets.
- Não editar `dist/`, `.wrangler/`, `.tanstack/`, `node_modules/` ou outros artefatos gerados.
- Não trocar a arquitetura para Next.js, Remix ou `src/pages/`.
- Mantenha textos e UX em português do Brasil.
- Conteúdo financeiro/tributário deve ser educativo, com linguagem clara e sem promessa de valor oficial final.