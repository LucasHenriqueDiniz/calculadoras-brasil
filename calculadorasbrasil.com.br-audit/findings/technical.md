# Achados técnicos

## Pontos fortes

- URLs descritivas e sem parâmetros de indexação.
- `lang="pt-BR"`, viewport e charset configurados.
- Sitemap e robots.txt públicos.
- Página desconhecida recebe status HTTP 404 pelo servidor do TanStack Start.
- Headers de segurança e cache já definidos em `public/_headers`.
- Build, TypeScript, testes e auditoria de dependências fazem parte do comando de verificação.

## Risco crítico: renderização client-side — resolvido

O projeto foi migrado para TanStack Start e Cloudflare Workers. As 12 rotas públicas são
pré-renderizadas e contêm conteúdo, metadados e dados estruturados no HTML inicial.

Impactos:

- indexação pode depender de uma segunda etapa de renderização;
- crawlers sem JavaScript recebem pouco ou nenhum contexto;
- previews sociais podem usar apenas os metadados genéricos;
- falhas de bundle tornam todas as páginas semanticamente vazias.

O smoke test SEO consulta todas as rotas sem executar JavaScript e bloqueia regressões no CI.

## Desempenho

O Lighthouse móvel local registrou SEO 100, acessibilidade 100 e performance 83. A imagem OG foi
reduzida para aproximadamente 320 KB. Core Web Vitals de campo ainda dependem do deploy e de
tráfego real.
