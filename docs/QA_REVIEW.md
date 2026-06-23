# QA Review — Calculadoras Brasil

## Data da revisão

23 de junho de 2026.

## Resumo executivo

O MVP foi revisado para deploy no Cloudflare Pages. As seis calculadoras estão interativas, os
testes de fórmula passaram, todas as rotas conhecidas respondem diretamente, a rota desconhecida
retorna HTTP 404 e as Pages Functions compilam.

O projeto está pronto para um deploy de validação. Permanecem limitações conhecidas em dados
opcionais do Inmetro/IBGE, ausência de KV/Cron provisionados e falta de medição real de Core Web
Vitals neste ambiente.

## Comandos executados

- `npm install`
- `npm test`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run preview`
- `npm audit`
- `npx wrangler pages functions build`
- `npx wrangler pages dev dist --port 8788`
- `npm run check`

## Resultado dos comandos

| Comando               | Resultado                                           |
| --------------------- | --------------------------------------------------- |
| `npm install`         | Passou                                              |
| `npm test`            | 7 testes passaram                                   |
| `npm run typecheck`   | Passou sem erros                                    |
| `npm run lint`        | 0 erros, 6 avisos de Fast Refresh em componentes UI |
| `npm run build`       | Passou; `dist/` gerado                              |
| `npm run preview`     | Passou em `localhost:4173`                          |
| `npm audit`           | 0 vulnerabilidades                                  |
| Pages Functions build | Passou                                              |
| Wrangler Pages dev    | Passou em `127.0.0.1:8788`                          |
| `npm run check`       | Gate completo passou                                |

## Rotas testadas

| Rota                                | Status | Observações                        |
| ----------------------------------- | ------ | ---------------------------------- |
| `/`                                 | OK     | H1 único, metadata e footer        |
| `/calculadora-custo-carro`          | OK     | Rota direta HTTP 200               |
| `/calculadora-morar-sozinho`        | OK     | Rota direta HTTP 200               |
| `/calculadora-conta-de-luz`         | OK     | Rota direta HTTP 200               |
| `/calculadora-assinaturas`          | OK     | Rota direta HTTP 200               |
| `/calculadora-custo-mudanca`        | OK     | Rota direta HTTP 200               |
| `/calculadora-custo-pet`            | OK     | Rota direta HTTP 200               |
| `/sobre`                            | OK     | Conteúdo institucional             |
| `/metodologia`                      | OK     | Fontes, cache e limitações         |
| `/privacidade`                      | OK     | Conteúdo real                      |
| `/termos`                           | OK     | Conteúdo real                      |
| `/contato`                          | OK     | Conteúdo real                      |
| `/rota-inexistente-para-testar-404` | OK     | HTTP 404 após correção do soft 404 |

Todas as páginas principais apresentaram H1 único, título, description, canonical, idioma `pt-BR`
e conteúdo em português. Não foi encontrado texto “em construção”.

## Calculadoras testadas

| Calculadora    | Status | Cenários testados                                  | Observações                                        |
| -------------- | ------ | -------------------------------------------------- | -------------------------------------------------- |
| Custo de carro | OK     | Cenário padrão, km/consumo zero e flex             | Total padrão aproximado de R$ 1.582,85/mês         |
| Morar sozinho  | OK     | Cenário de R$ 4.400/mês e renda ausente            | Sobra de -R$ 900 e estado crítico                  |
| Conta de luz   | OK     | 1 e 2 aparelhos de 1.000 W                         | 30 kWh e 60 kWh corretamente                       |
| Assinaturas    | OK     | Mensal, anual, semanal, trimestral e cancelamento  | R$ 60/mês e R$ 3.600 em cinco anos no cenário base |
| Mudança        | OK     | Base de R$ 5.300 com 10%                           | Total de R$ 5.830                                  |
| Pet            | OK     | Pacote de ração, custos anuais e múltiplos animais | Ração de R$ 60/mês e pacote por 50 dias            |

Os testes automatizados estão em `tests/calculators.test.ts`.

## APIs testadas

| Endpoint                                          | Status | Observações                                                   |
| ------------------------------------------------- | ------ | ------------------------------------------------------------- |
| `/api/health`                                     | OK     | JSON e `no-store`                                             |
| `/api/public-data/sources`                        | OK     | Lista ANP, ANEEL, Inmetro e IBGE                              |
| `/api/fuel-prices?uf=RS&fuel=gasolina`            | OK     | ANP com média, período, amostra e cache                       |
| `/api/fuel-prices?uf=SP&fuel=etanol`              | OK     | ANP respondeu com dado vigente                                |
| `/api/fuel-prices` com parâmetros inválidos       | OK     | HTTP 400 controlado                                           |
| `/api/energy-tariffs?uf=CE&distributor=ENEL%20CE` | OK     | TUSD + TE; impostos e bandeiras explicitamente excluídos      |
| Distribuidora inexistente                         | OK     | `available: false`, sem stack trace                           |
| `/api/vehicle-efficiency`                         | OK     | HTTP 400 sem parâmetros; scaffold controlado com marca/modelo |
| `/api/locations/states`                           | OK     | 27 UFs                                                        |
| `/api/locations/cities?uf=RS`                     | OK     | Fallback `available: false`                                   |

As requisições externas possuem timeout e limite de tamanho. A planilha da ANP é processada apenas
no servidor.

## SEO

- Sitemap contém as 12 rotas principais.
- Robots aponta para o sitemap canônico.
- Canonical e metadata por rota.
- Open Graph global aponta para `/og-image.png`.
- Imagem social verificada: 1731 × 909 px, PNG, aproximadamente 1,6 MB.
- FAQ visível e JSON-LD nas calculadoras.
- Conteúdo editorial e links internos presentes.
- O projeto continua como SPA sem pré-renderização.

## Acessibilidade

- Inputs principais possuem labels.
- Botões de ícone possuem nome acessível ou texto.
- Existe link para pular ao conteúdo.
- Menu mobile informa `aria-expanded`.
- Avisos não dependem somente de cor.
- Tabelas acompanham os gráficos.
- Foco visível é fornecido pelos componentes.

## Responsividade

Foram testados 360, 390, 768, 1280 e 1440 px nas páginas inicial, carro, assinaturas e pet.
Não foi detectado overflow horizontal global. O menu móvel aparece em 360/390 px e a navegação
desktop aparece a partir do breakpoint correspondente.

## Performance

- Rotas são divididas em chunks pelo TanStack Router.
- Maior bundle JavaScript principal: aproximadamente 336 kB bruto e 105 kB gzip.
- CSS: aproximadamente 81 kB bruto e 14 kB gzip.
- APIs externas são acionadas por botão, não a cada tecla.
- Assets versionados recebem cache imutável.
- A imagem OG tem aproximadamente 1,6 MB, mas não é carregada no conteúdo normal das páginas.
- Core Web Vitals não foram medidos porque o servidor Chrome DevTools MCP de performance não está
  configurado neste ambiente.

## Segurança

- `npm audit`: 0 vulnerabilidades.
- Nenhum token real encontrado no frontend ou configuração.
- `.env.example` contém somente nomes e valores vazios.
- Parâmetros das APIs são validados.
- Respostas externas possuem timeout e limite de bytes.
- Erros externos não retornam stack trace.
- Headers de segurança básicos estão configurados.

## Bugs corrigidos

| Prioridade | Arquivo                 | Problema                                        | Correção                                                |
| ---------- | ----------------------- | ----------------------------------------------- | ------------------------------------------------------- |
| P1         | `src/routes/__root.tsx` | Imagem social existente não era referenciada    | Adicionadas tags Open Graph e Twitter                   |
| P2         | `functions/[[path]].ts` | Rotas inexistentes retornavam HTTP 200          | Catch-all devolve HTTP 404 sem afetar rotas/assets/APIs |
| P2         | Assinaturas             | Ciclos semanal e trimestral não eram suportados | Normalização mensal adicionada                          |
| P2         | Pet                     | Não calculava ração por pacote/peso/consumo     | Cálculo e campos adicionados com fallback manual        |
| P2         | Testes                  | Não havia suíte automatizada das fórmulas       | Vitest e 7 testes adicionados                           |
| P3         | Dependências            | Vitest 3 trouxe advisory baixo de esbuild       | Atualizado para Vitest 4.1.9                            |
| P3         | SEO                     | 404 e mensagens de erro estavam em inglês       | Textos traduzidos para português                        |
| P3         | Automação               | Não havia gate único nem CI                     | Adicionados `npm run check` e workflow de CI            |
| P3         | Artefatos               | `_worker.bundle` podia entrar no repositório    | Artefato removido e adicionado ao `.gitignore`          |

## Pendências

| Prioridade | Pendência                          | Impacto                                    | Sugestão                                          |
| ---------- | ---------------------------------- | ------------------------------------------ | ------------------------------------------------- |
| P2         | Inmetro/PBE ainda é scaffold       | Consumo de veículo continua manual         | Integrar apenas quando houver dataset estável     |
| P2         | Municípios IBGE ainda sem ingestão | Seletores municipais futuros indisponíveis | Adicionar cache sob demanda em fase posterior     |
| P2         | SPA sem pré-renderização           | HTML inicial possui pouco conteúdo         | Avaliar prerender das rotas editoriais após o MVP |
| P3         | KV e Cron não provisionados        | Primeiro acesso depende da fonte externa   | Provisionar quando houver operação Cloudflare     |
| P3         | Imagem OG com 1,6 MB               | Compartilhadores baixam asset maior        | Otimizar PNG/WebP mantendo compatibilidade        |
| P3         | 6 avisos ESLint de Fast Refresh    | Sem impacto em produção                    | Separar variantes/constants dos componentes UI    |

## Conclusão

Pronto para deploy de validação no Cloudflare Pages. Antes de produção pública, configure o domínio,
variáveis, teste Open Graph no domínio real e execute o checklist pós-deploy.
