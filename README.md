# Calculadoras Brasil

Hub de calculadoras brasileiras para estimar custos do dia a dia. A aplicação usa React,
TypeScript, TanStack Start e Cloudflare Workers.

As 12 páginas públicas são pré-renderizadas no build para entregar conteúdo, metadados e JSON-LD
sem depender da execução de JavaScript. As seis calculadoras continuam interativas após hidratação.

## Requisitos

- Node.js 22.12 ou superior
- npm

## Desenvolvimento

```bash
npm ci
npm run dev
```

O servidor local inicia em `http://localhost:8080`.

## Validação

```bash
npm run check
```

O gate executa:

- tipos gerados pelo Wrangler;
- testes das fórmulas;
- TypeScript e ESLint;
- build client e Worker;
- pré-renderização das 12 rotas;
- smoke test SEO sem JavaScript;
- dry-run do deploy;
- auditoria de dependências.

## Build e deploy

```bash
npm run build
npm run preview
npm run deploy:preview
npm run deploy
```

O build gera:

- `dist/client`: assets e HTML pré-renderizado;
- `dist/server`: Worker do TanStack Start;
- `dist/client/sitemap.xml`: sitemap gerado da lista central em `src/lib/seo-pages.ts`.

O alvo de produção é Cloudflare Workers. O ambiente `preview` usa o Worker
`calculadoras-brasil-preview`; produção usa `calculadoras-brasil`.

`npm run preview` sobe uma prévia local do build para validação antes do deploy. O primeiro deploy
remoto deve ser feito com `npm run deploy:preview`; use `npm run deploy` apenas após validar o
Worker de preview, APIs, sitemap, 404 e headers.

## Variáveis e segredos

Variáveis não sensíveis ficam em `wrangler.jsonc`:

- `PUBLIC_SITE_URL`;
- `PUBLIC_DATA_CACHE_TTL_HOURS`.

Segredos devem ser configurados pelo Wrangler ou painel da Cloudflare e nunca versionados:

```bash
npx wrangler secret put DADOS_GOV_BR_TOKEN
```

## APIs

As integrações públicas são rotas de servidor do TanStack Start:

- `GET /api/health`
- `GET /api/public-data/sources`
- `GET /api/fuel-prices?uf=RS&fuel=gasolina`
- `GET /api/energy-tariffs?uf=RS&distributor=...`
- `GET /api/vehicle-efficiency?brand=...&model=...`
- `GET /api/locations/states`
- `GET /api/locations/cities?uf=RS`

ANP e ANEEL possuem timeout, limite de resposta, cache no edge e fallback manual. Inmetro e
municípios do IBGE permanecem fora do escopo atual.

## SEO

- canonical e Open Graph absolutos;
- Schema `WebSite`, `Organization`, `WebApplication`, `BreadcrumbList` e `FAQPage`;
- sitemap gerado durante o build;
- `robots.txt` e `llms.txt`;
- imagem social 1200×630 com menos de 500 KB;
- autoria institucional e data de revisão visíveis.

O `FAQPage` é mantido por organização semântica e consumo por sistemas de IA, não como promessa de
rich result do Google.

## Adicionar uma calculadora

1. Implemente a fórmula pura em `src/lib/calculators/`.
2. Adicione os metadados em `src/data/calculators.ts`.
3. Crie a rota em `src/routes/`.
4. Inclua conteúdo editorial, FAQ e dados estruturados.
5. Registre a URL em `src/lib/seo-pages.ts`.
6. Execute `npm run check`.
