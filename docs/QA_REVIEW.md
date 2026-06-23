# Revisão de qualidade

Data da revisão: 23 de junho de 2026.

## Arquitetura

- TanStack Start com Cloudflare Workers.
- 12 rotas públicas pré-renderizadas.
- hidratação React preservada nas seis calculadoras.
- APIs migradas para server routes.
- status HTTP 404 produzido pelo servidor para URLs desconhecidas.

## Gate automatizado

O comando `npm run check` valida:

- tipos do Wrangler;
- 7 testes de cálculo;
- TypeScript;
- lint;
- build client/Worker;
- pré-renderização e sitemap;
- HTML inicial, canonical, H1, JSON-LD e autoria;
- respostas 404 e 400;
- imagem OG;
- dry-run do Worker;
- vulnerabilidades npm.

## SEO

- HTML específico disponível sem JavaScript.
- title, description e canonical exclusivos.
- Schema global de site e organização.
- Schema de aplicação, breadcrumb e FAQ nas seis calculadoras.
- sitemap com 12 URLs e datas reais de revisão.
- OG image 1200×630, PNG otimizado.

## Lighthouse móvel local

- SEO: 100
- Acessibilidade: 100
- Performance: 83
- LCP de laboratório: 3,5 s
- CLS: 0,001
- TBT: 20 ms

As fontes foram movidas do Google Fonts para assets locais, reduzindo o bloqueio estimado de
renderização de 1,36 s para aproximadamente 300 ms. Core Web Vitals de campo serão medidos após o
deploy.

## Pendências externas

- Worker de preview publicado em `https://calculadoras-brasil-preview.lucas-hdo.workers.dev`;
- smoke HTTP externo bloqueado pela rede local com proxy 407; a publicação foi confirmada pelo
  deployment ativo no Wrangler;
- vínculo do domínio de produção;
- Rich Results Test e Schema Validator;
- Lighthouse e Core Web Vitals;
- Search Console e Bing Webmaster Tools.
