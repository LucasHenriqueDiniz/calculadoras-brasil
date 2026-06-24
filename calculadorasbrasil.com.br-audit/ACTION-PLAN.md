# Plano de ação SEO

## Agora — concluído

- [x] Usar canonical absoluto em todas as rotas.
- [x] Usar `og:url` absoluto em todas as rotas.
- [x] Adicionar Schema `WebSite` e `Organization`.
- [x] Atualizar sitemap com `lastmod`.
- [x] Liberar crawlers de busca e IA no robots.txt.
- [x] Criar `llms.txt`.

## Correção estrutural — concluída

- [x] Implementar pré-renderização estática das 12 rotas.
- [x] Confirmar no HTML retornado que cada URL contém seu próprio title, description, canonical, H1, conteúdo e JSON-LD.
- [x] Migrar Cloudflare Pages para TanStack Start em Cloudflare Workers.
- [ ] Validar as rotas com Google Rich Results Test e Schema Markup Validator.
- [ ] Publicar o domínio e cadastrar o sitemap no Google Search Console e Bing Webmaster Tools.

Critério de aceite: `curl` ou `Invoke-WebRequest` em cada rota deve encontrar conteúdo específico sem executar JavaScript.

## Conteúdo e confiança — prioridade média

- [x] Exibir data de revisão e fontes usadas nas calculadoras de combustível e energia.
- [x] Criar uma identificação editorial responsável pelo projeto.
- [x] Adicionar links para ANP, ANEEL e documentação metodológica nas áreas relevantes.
- [x] Completar breadcrumbs estruturados nas três calculadoras mais novas.
- [ ] Revisar textos a cada mudança relevante de tarifa, fórmula ou API.

## Desempenho — após deploy

- [ ] Medir LCP, INP e CLS em dispositivos móveis.
- [x] Comprimir `og-image.png` para menos de 500 KB.
- [x] Hospedar localmente as fontes após confirmação de bloqueio no Lighthouse.
- [x] Verificar tamanho e divisão do bundle por rota.

## Monitoramento mensal

- [ ] Cobertura e indexação no Search Console.
- [ ] Consultas, impressões, CTR e posição por calculadora.
- [ ] Erros 404 e falhas das APIs públicas.
- [ ] Core Web Vitals e regressões no build.
- [ ] Atualização real das datas do sitemap somente quando a página mudar.
