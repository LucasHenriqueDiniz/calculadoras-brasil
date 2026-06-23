# Auditoria SEO — Calculadoras Brasil

Data: 23 de junho de 2026  
Escopo: código-fonte, build de produção, 12 URLs indexáveis, metadados, conteúdo, dados estruturados, sitemap, GEO e experiência de busca.

## Resumo executivo

**Pontuação estimada após as correções: 76/100.**

O projeto possui uma base sólida: URLs limpas, títulos e descrições exclusivos, uma única intenção por página, conteúdo útil, calculadoras funcionais, navegação interna, HTTPS planejado no Cloudflare, sitemap, robots.txt e respostas 404 reais.

O principal risco é arquitetural: o site é uma SPA Vite. O HTML inicial contém apenas o contêiner da aplicação; títulos específicos, canonical, conteúdo e JSON-LD entram depois que o JavaScript executa. O Google normalmente renderiza JavaScript, mas isso aumenta atraso e fragilidade de indexação. Muitos crawlers de IA e alguns robôs sociais não executam JavaScript. Pré-renderizar as 12 rotas é a ação de maior impacto.

## Pontuação por área

| Área | Nota | Situação |
|---|---:|---|
| SEO técnico | 68 | Boa infraestrutura, limitada pela renderização client-side |
| On-page | 90 | Metadados únicos e canônicas absolutas |
| Conteúdo e E-E-A-T | 74 | Ferramentas úteis e metodologia; autoria e referências podem melhorar |
| Dados estruturados | 84 | WebSite, Organization, WebApplication, Breadcrumb e FAQ |
| Sitemap e descoberta | 94 | 12 URLs, URLs absolutas e `lastmod` |
| GEO / busca por IA | 63 | `llms.txt` e acesso liberado; HTML inicial ainda vazio |
| Experiência de busca | 84 | Intenção, UX e ferramentas bem alinhadas |
| Imagens | 82 | OG image presente e dimensionada; arquivo pode ser otimizado |

## Achados prioritários

### Alta prioridade

1. **Pré-renderizar as 12 rotas públicas.** O build atual entrega um shell HTML de aproximadamente 0,5 KB, sem o conteúdo específico da URL.
2. **Colocar metadados críticos no HTML inicial de cada rota.** Isso deve ser consequência da pré-renderização, não uma duplicação manual.
3. **Adicionar fontes e data de revisão nas páginas que dependem de dados públicos**, especialmente combustível e energia.

### Média prioridade

1. Adicionar autoria editorial ou uma página de responsáveis pelo conteúdo.
2. Incluir breadcrumbs estruturados também nas páginas de assinaturas, mudança e pet.
3. Expandir o conteúdo introdutório da página inicial e das páginas institucionais com respostas diretas às dúvidas principais.
4. Otimizar `public/og-image.png`, atualmente com aproximadamente 1,6 MB, preferencialmente para menos de 500 KB sem perda visual perceptível.
5. Medir Core Web Vitals em produção com PageSpeed Insights e CrUX após o primeiro deploy.

### Baixa prioridade

1. Adicionar `dateModified` ao conteúdo estruturado quando houver um processo real de revisão.
2. Criar imagens sociais específicas para calculadoras prioritárias.
3. Avaliar `HowTo` somente em páginas que apresentem passos editoriais visíveis e completos.

## Correções realizadas nesta auditoria

- Canônicas e `og:url` convertidos para URLs absolutas.
- Schema global `WebSite` e `Organization`.
- URLs absolutas nos breadcrumbs existentes.
- `lastmod` adicionado às 12 entradas do sitemap.
- Regras explícitas de acesso para OAI-SearchBot, ChatGPT-User, GPTBot, ClaudeBot e PerplexityBot.
- Arquivo `llms.txt` com as páginas principais.

## Observações sobre Schema

As páginas de calculadora usam `WebApplication`, uma escolha coerente com ferramentas interativas. O `FAQPage` continua semanticamente válido para mecanismos e sistemas de IA, mas não deve ser tratado como oportunidade de rich result do Google: a exibição ampla de FAQ rich results foi descontinuada.

## Próxima meta

Com pré-renderização, fontes editoriais, autoria e validação de desempenho em produção, o projeto pode alcançar uma faixa estimada de **88–92/100** sem alterar o produto.

