# Achados técnicos

## Pontos fortes

- URLs descritivas e sem parâmetros de indexação.
- `lang="pt-BR"`, viewport e charset configurados.
- Sitemap e robots.txt públicos.
- Página desconhecida recebe status HTTP 404 por meio de Cloudflare Pages Functions.
- Headers de segurança e cache já definidos em `public/_headers`.
- Build, TypeScript, testes e auditoria de dependências fazem parte do comando de verificação.

## Risco crítico: renderização client-side

O arquivo `index.html` é um shell de SPA. O conteúdo principal, os metadados por rota e os dados estruturados são inseridos pelo React/TanStack Router.

Impactos:

- indexação pode depender de uma segunda etapa de renderização;
- crawlers sem JavaScript recebem pouco ou nenhum contexto;
- previews sociais podem usar apenas os metadados genéricos;
- falhas de bundle tornam todas as páginas semanticamente vazias.

Recomendação: pré-renderização estática das 12 URLs no build ou migração controlada para uma solução SSR/SSG compatível com Cloudflare.

## Desempenho

Não há dados de campo porque o domínio ainda precisa ser medido em produção. Não atribuir notas de Core Web Vitals sem Lighthouse/CrUX. A OG image de aproximadamente 1,6 MB é um alvo simples de otimização.

