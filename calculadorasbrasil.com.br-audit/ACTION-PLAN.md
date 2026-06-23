# Plano de ação SEO

## Agora — concluído

- [x] Usar canonical absoluto em todas as rotas.
- [x] Usar `og:url` absoluto em todas as rotas.
- [x] Adicionar Schema `WebSite` e `Organization`.
- [x] Atualizar sitemap com `lastmod`.
- [x] Liberar crawlers de busca e IA no robots.txt.
- [x] Criar `llms.txt`.

## Próximo ciclo — prioridade alta

- [ ] Implementar pré-renderização estática das 12 rotas.
- [ ] Confirmar no HTML retornado que cada URL contém seu próprio title, description, canonical, H1, conteúdo e JSON-LD.
- [ ] Validar as rotas com Google Rich Results Test e Schema Markup Validator.
- [ ] Publicar o domínio e cadastrar o sitemap no Google Search Console e Bing Webmaster Tools.

Critério de aceite: `curl` ou `Invoke-WebRequest` em cada rota deve encontrar conteúdo específico sem executar JavaScript.

## Conteúdo e confiança — prioridade média

- [ ] Exibir data de revisão e fontes usadas nas calculadoras de combustível e energia.
- [ ] Criar uma identificação editorial responsável pelo projeto.
- [ ] Adicionar links para ANP, ANEEL e documentação metodológica nas áreas relevantes.
- [ ] Completar breadcrumbs estruturados nas três calculadoras mais novas.
- [ ] Revisar textos a cada mudança relevante de tarifa, fórmula ou API.

## Desempenho — após deploy

- [ ] Medir LCP, INP e CLS em dispositivos móveis.
- [ ] Comprimir `og-image.png` para menos de 500 KB.
- [ ] Avaliar hospedagem local ou redução das variantes das fontes.
- [ ] Verificar tamanho e divisão do bundle por rota.

## Monitoramento mensal

- [ ] Cobertura e indexação no Search Console.
- [ ] Consultas, impressões, CTR e posição por calculadora.
- [ ] Erros 404 e falhas das APIs públicas.
- [ ] Core Web Vitals e regressões no build.
- [ ] Atualização real das datas do sitemap somente quando a página mudar.

