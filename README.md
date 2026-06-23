# Calculadoras Brasil

Hub de calculadoras brasileiras para estimar custos do dia a dia. O frontend é
uma SPA Vite + React + TypeScript e o alvo principal de produção é Cloudflare
Pages, com Pages Functions para a camada `/api/*`.

As seis calculadoras estão interativas:

- custo mensal e anual de carro;
- orçamento para morar sozinho;
- consumo e custo de energia por aparelho;
- gastos recorrentes com assinaturas;
- orçamento completo de mudança residencial;
- custo mensal e anual de pets.

## Requisitos

- Node.js 22
- npm

## Desenvolvimento local

```bash
npm install
npm run dev
```

O Vite inicia em `http://localhost:8080`.

Para testar o build e as Pages Functions no mesmo ambiente:

```bash
npm run pages:dev
```

Para executar todo o gate local antes de publicar:

```bash
npm run check
```

A workflow em `.github/workflows/ci.yml` executa o mesmo gate em pushes e pull requests.

## Build

```bash
npm run typecheck
npm test
npm run build
npm run preview
```

O build estático é gerado em `dist/`.

O asset social está em `public/og-image.png` e é referenciado pelas tags Open Graph e Twitter.

Não há `public/_redirects`: o Cloudflare Pages aplica automaticamente o fallback
de SPA quando o projeto possui `index.html` e não possui um `404.html` de nível
superior. Uma regra global manual foi evitada porque o Wrangler a identifica
como loop.

## Cloudflare Pages

Conecte o repositório a um projeto Cloudflare Pages com:

- Build command: `npm run build`
- Build output directory: `dist`
- Node version: `22`

O arquivo `wrangler.jsonc` contém apenas configuração não sensível. Não invente
IDs de KV e não grave tokens no repositório.

## Variáveis

Copie `.env.example` apenas para desenvolvimento local. No Cloudflare, configure:

- `PUBLIC_SITE_URL`: URL canônica do site.
- `PUBLIC_DATA_CACHE_TTL_HOURS`: duração padrão do cache.
- `ADSENSE_CLIENT_ID`: opcional.
- `DADOS_GOV_BR_TOKEN`: segredo opcional, configurado no painel/CLI.

## APIs internas

As integrações públicas nunca são chamadas diretamente pelo navegador:

- `GET /api/health`
- `GET /api/public-data/sources`
- `GET /api/fuel-prices?uf=RS&fuel=gasolina`
- `GET /api/energy-tariffs?uf=RS&distributor=...`
- `GET /api/vehicle-efficiency?brand=...&model=...`
- `GET /api/locations/states`
- `GET /api/locations/cities?uf=RS`

Os adaptadores ANP e ANEEL estão habilitados no servidor:

- ANP: lê a planilha semanal oficial, extrai apenas os agregados por UF e mantém cache HTTP diário.
- ANEEL: consulta o DataStore oficial para a tarifa B1 residencial convencional vigente e mantém
  cache HTTP semanal.
- Inmetro: permanece desabilitado e retorna `available: false` até existir um dataset normalizado
  adequado.

Todas as falhas externas retornam uma resposta controlada e preservam o preenchimento manual.

## Cache e atualização

As Pages Functions enviam `Cache-Control` adequado ao tipo de dado. Uma futura
binding KV chamada `PUBLIC_DATA_CACHE` pode armazenar apenas agregados pequenos.
O esqueleto em `worker/scheduled.ts` reserva a atualização periódica sem exigir
Cron ou KV no MVP.

## Adicionar uma calculadora

1. Crie a fórmula pura em `src/lib/calculators/`.
2. Adicione os metadados em `src/data/calculators.ts`.
3. Crie a rota em `src/routes/`.
4. Inclua texto editorial, metodologia, FAQ, canonical e JSON-LD.
5. Atualize `public/sitemap.xml`.
6. Valide com `npm run typecheck`, `npm run lint` e `npm run build`.

## Adicionar uma fonte pública

1. Valide licença, formato, frequência e estabilidade da fonte.
2. Implemente o adaptador somente no servidor em `functions/api/`.
3. Normalize e cacheie uma resposta pequena; não entregue CSV bruto ao cliente.
4. Retorne `source`, `lastUpdated`, `isStale` e notas de limitação.
5. Preserve sempre o campo manual e o fallback offline no frontend.
6. Documente a fonte em `/metodologia#fontes`.
