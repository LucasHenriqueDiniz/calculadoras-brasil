# Limitações conhecidas

## Dados públicos

- **ANP:** depende da estrutura da planilha semanal oficial. O parser valida domínio, formato,
  tamanho e aba, mas uma mudança estrutural pode ativar o fallback manual.
- **ANEEL:** retorna tarifa B1 residencial convencional de aplicação. Não inclui impostos,
  bandeiras, contribuição de iluminação pública ou particularidades da fatura.
- **Inmetro:** endpoint preparado, porém o dataset veicular normalizado ainda não foi integrado.
- **IBGE:** UFs possuem fallback local; municípios ainda retornam `available: false`.
- **Cache:** cache HTTP está ativo. KV e Cron ainda não foram provisionados.

## Cálculos

- **Custo de carro:** consumo real, seguro, manutenção e depreciação variam por veículo e motorista.
- **Morar sozinho:** não utiliza médias automáticas por cidade; todos os valores devem ser ajustados.
- **Conta de luz:** potência nominal e tempo informado não reproduzem ciclos reais dos aparelhos.
- **Assinaturas:** projeções não incluem inflação, reajustes ou promoções futuras.
- **Mudança:** não calcula automaticamente distância, volume, escadas ou regras de condomínio.
- **Pet:** o cálculo de ração assume 30 dias e consumo diário constante; custos veterinários variam.

## SEO

- O site é uma SPA. Metadata é atualizada no cliente, mas as rotas não possuem HTML pré-renderizado.
- A imagem Open Graph tem 1731 × 909 px e aproximadamente 1,6 MB; pode ser otimizada futuramente.
- A rota desconhecida retorna HTTP 404 por uma Pages Function catch-all.

## Infraestrutura

- O workspace atual não possui diretório `.git`.
- KV, Cron e ambientes separados de staging/produção não estão provisionados.
- O domínio e variáveis de produção precisam ser confirmados no painel Cloudflare.
- Core Web Vitals não foram medidos nesta revisão por ausência da integração Chrome DevTools MCP.

## Futuras melhorias

- Pré-renderização das páginas principais.
- Ingestão normalizada do Inmetro.
- Lista de municípios IBGE com cache.
- KV para último resultado válido das fontes públicas.
- Cron para aquecimento periódico dos agregados.
- Otimização adicional da imagem social.
- Separação de exports auxiliares dos componentes UI para eliminar avisos de Fast Refresh.
