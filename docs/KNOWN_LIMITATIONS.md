# Limitações conhecidas

## Dados públicos

- **ANP:** o parser depende da estrutura da planilha semanal oficial e ativa fallback manual se a
  fonte mudar ou ficar indisponível.
- **ANEEL:** a tarifa B1 pública não inclui impostos, bandeiras, iluminação pública ou regras
  específicas da fatura.
- **Inmetro:** endpoint preparado, mas sem dataset veicular normalizado.
- **IBGE:** UFs possuem fallback local; municípios ainda retornam `available: false`.
- **Cache:** usa Cache API do Worker; KV e Cron não fazem parte deste pacote.

## Cálculos

- Os resultados são estimativas educativas e variam por região, período, perfil e fornecedor.
- Custo de carro depende de consumo, seguro, manutenção e depreciação reais.
- Conta de luz depende dos ciclos de uso e da tarifa completa da fatura.
- Assinaturas, mudança, moradia e pet não projetam inflação ou reajustes futuros.

## SEO e desempenho

- As 12 rotas são pré-renderizadas e hidratadas no cliente.
- Core Web Vitals de campo dependem de tráfego real e devem ser acompanhados após o deploy.
- As fontes principais são servidas localmente por pacotes versionados para evitar dependência de
  CSS externo no caminho crítico.
- `FAQPage` não gera expectativa de rich result no Google.

## Infraestrutura

- O domínio e os segredos de produção ainda precisam ser confirmados na conta Cloudflare.
- O ambiente de preview está configurado, mas depende de autenticação para deploy.
- Search Console e Bing Webmaster Tools exigem configuração externa após a publicação.
