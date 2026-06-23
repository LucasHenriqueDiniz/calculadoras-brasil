import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/metodologia")({
  head: () => ({
    meta: [
      { title: "Metodologia — Calculadoras Brasil" },
      {
        name: "description",
        content:
          "Como o Calculadoras Brasil constrói cada estimativa: fórmulas, premissas e limites de cada cálculo.",
      },
      { property: "og:title", content: "Metodologia — Calculadoras Brasil" },
      {
        property: "og:description",
        content: "Fórmulas, premissas e limitações das nossas calculadoras.",
      },
      { property: "og:url", content: absoluteUrl("/metodologia") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/metodologia") }],
  }),
  component: MetodologiaPage,
});

function MetodologiaPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Metodologia"
        title="Como construímos cada estimativa"
        description="Transparência sobre as fórmulas, premissas e limites usados nas calculadoras."
      />
      <Prose>
        <h2>Princípios gerais</h2>
        <ul>
          <li>
            Toda calculadora trabalha com <strong>valores informados por você</strong> e médias
            públicas. Nenhum valor é “oficial” ou personalizado para a sua realidade individual.
          </li>
          <li>
            Quando usamos uma média, deixamos isso claro no campo e permitimos que você ajuste.
          </li>
          <li>
            Resultados são sempre tratados como <strong>estimativas mensais</strong>, salvo quando
            indicado.
          </li>
        </ul>

        <h2>Custo de carro</h2>
        <p>
          Combinamos quatro blocos: combustível (km rodados × consumo × preço do litro), custos
          anuais (IPVA + seguro + licenciamento) divididos por 12, manutenção e desgaste (revisões,
          pneus, óleo) e depreciação anual estimada do veículo.
        </p>

        <h2>Morar sozinho</h2>
        <p>
          Somamos custos fixos do imóvel (aluguel, condomínio, IPTU rateado), contas básicas (luz,
          água, gás, internet) e custos variáveis (mercado, transporte, lazer) a partir do perfil
          informado. Recomendamos manter o custo fixo abaixo de 35% da renda líquida.
        </p>

        <h2>Conta de luz</h2>
        <p>
          Para cada aparelho:{" "}
          <code>kWh/mês = (potência em watts × horas/dia × dias/mês) / 1000</code>. Em seguida
          multiplicamos por uma tarifa em R$/kWh informada por você (a partir da sua conta de luz)
          para obter o custo mensal.
        </p>

        <h2>Assinaturas</h2>
        <p>
          Normalizamos todas as assinaturas para uma base mensal (uma anual de R$ 240 vira R$ 20 por
          mês) e projetamos o gasto em 12, 36 e 60 meses, permitindo simular cortes.
        </p>

        <h2>Custo de mudança</h2>
        <p>
          Estimamos o frete a partir da distância e do volume aproximado, somamos materiais de
          embalagem, taxas do imóvel novo (caução, vistoria) e uma reserva para móveis e
          eletrodomésticos faltantes.
        </p>

        <h2>Custo de pet</h2>
        <p>
          Para cada animal, estimamos consumo mensal de ração por porte e idade, banho/tosa, vacinas
          anuais diluídas por mês, vermífugo, antipulgas e — opcional — plano de saúde pet.
        </p>

        <h2 id="fontes">Dados públicos e cache</h2>
        <p>
          Quando disponível, o site pode usar dados públicos para sugerir valores iniciais, como
          preços médios de combustíveis, tarifas de energia ou dados de eficiência veicular. Esses
          dados servem como ponto de partida e podem estar sujeitos a atraso, mudanças de
          metodologia, indisponibilidade ou diferenças regionais. Todos os campos continuam
          editáveis para que você use seus valores reais.
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Fonte</th>
                <th>Usada em</th>
                <th>Tipo de dado</th>
                <th>Atualização estimada</th>
                <th>Limitações</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>ANP</td>
                <td>Custo de carro</td>
                <td>Preços médios de combustíveis</td>
                <td>Planilha semanal, com cache diário no site</td>
                <td>Preços variam por posto e cidade</td>
              </tr>
              <tr>
                <td>ANEEL</td>
                <td>Conta de luz</td>
                <td>Tarifa B1 residencial convencional (TUSD + TE)</td>
                <td>Dataset oficial, com cache semanal no site</td>
                <td>Não inclui impostos, bandeiras, iluminação pública e regras locais</td>
              </tr>
              <tr>
                <td>Inmetro/PBE Veicular</td>
                <td>Custo de carro</td>
                <td>Consumo e eficiência veicular</td>
                <td>Mensal ou manual</td>
                <td>O consumo real varia com uso e manutenção</td>
              </tr>
              <tr>
                <td>IBGE/dados.gov.br</td>
                <td>Localização</td>
                <td>UF, município e datasets</td>
                <td>Eventual</td>
                <td>Fonte auxiliar para seleção e normalização</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Limitações</h2>
        <ul>
          <li>Preços variam por região, época e perfil de consumo.</li>
          <li>Não consideramos impostos pessoais nem situações tributárias específicas.</li>
          <li>Não substituem orçamentos formais nem consultoria profissional.</li>
        </ul>
      </Prose>
    </PageShell>
  );
}
