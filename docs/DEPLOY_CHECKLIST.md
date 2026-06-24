# Deploy Checklist — Cloudflare Workers

## Repositório

- [ ] `npm ci` concluído com Node.js 22.12+
- [ ] `npm run check` aprovado
- [ ] branch protegida e CI verde
- [ ] nenhum segredo presente no Git

## Preview

- [x] autenticar com `npx wrangler login` ou `CLOUDFLARE_API_TOKEN`
- [x] executar `npm run deploy:preview`
- [x] confirmar deployment ativo do Worker `calculadoras-brasil-preview`
- [ ] confirmar as 12 páginas com HTTP 200
- [ ] confirmar URL desconhecida com HTTP 404
- [ ] confirmar `/api/health`
- [ ] confirmar validações HTTP 400 das APIs
- [ ] testar consulta ANP e fallback manual
- [ ] testar consulta ANEEL e fallback manual
- [ ] testar hidratação e cálculos das seis ferramentas

## Produção

- [ ] configurar segredos com `wrangler secret put`
- [ ] executar `npm run deploy`
- [ ] vincular `calculadorasbrasil.com.br` ao Worker
- [ ] confirmar redirecionamento HTTPS e host canônico
- [ ] validar headers de segurança e cache
- [ ] confirmar `robots.txt`, `llms.txt` e `sitemap.xml`

## SEO pós-deploy

- [ ] Google Rich Results Test
- [ ] Schema Markup Validator
- [ ] PageSpeed Insights móvel
- [ ] Google Search Console: propriedade, sitemap e inspeção das rotas principais
- [ ] Bing Webmaster Tools: propriedade e sitemap
- [ ] registrar baseline de LCP, INP e CLS

## Monitoramento

- [ ] acompanhar erros e latência no Workers Observability
- [ ] acompanhar cobertura, consultas, CTR e posição no Search Console
- [ ] revisar falhas das fontes ANP e ANEEL
- [ ] atualizar `lastmod` e data editorial apenas quando houver revisão real
