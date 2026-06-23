# Deploy Checklist — Cloudflare Pages

## Antes do deploy

- [x] `npm run build` passou
- [x] `npm run typecheck` passou
- [x] `npm test` passou
- [x] `npm run lint` sem erros críticos
- [x] `npm audit` revisado: 0 vulnerabilidades
- [x] `og-image.png` existe
- [x] Metadata aponta para `og-image.png`
- [x] `sitemap.xml` revisado
- [x] `robots.txt` revisado
- [x] `_headers` revisado
- [x] `.env.example` sem segredos reais
- [x] README atualizado
- [x] Pages Functions compilam
- [x] `npm run check` executa o gate completo
- [x] Workflow de CI criada
- [x] Rotas diretas locais respondem
- [x] Rota inexistente retorna HTTP 404

## Cloudflare Pages

- [ ] Repositório Git conectado ao projeto
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Node version: `22`
- [ ] `PUBLIC_SITE_URL` configurada
- [ ] `PUBLIC_DATA_CACHE_TTL_HOURS` configurada
- [ ] Secrets configurados apenas no Cloudflare
- [ ] Domínio `calculadorasbrasil.com.br` vinculado
- [ ] HTTPS e redirecionamento canônico confirmados

## Depois do deploy

- [ ] Home abre
- [ ] Rotas diretas abrem
- [ ] Todas as calculadoras abrem
- [ ] Rota inexistente responde 404
- [ ] `/api/health` responde
- [ ] `/api/public-data/sources` responde
- [ ] ANP responde ou apresenta fallback controlado
- [ ] ANEEL responde ou apresenta fallback controlado
- [ ] Sitemap está acessível
- [ ] Robots está acessível
- [ ] Open Graph testado em validador social
- [ ] Canonicals usam o domínio final
- [ ] Console sem erros críticos
- [ ] Mobile testado em aparelho real
- [ ] Cache headers conferidos na edge
