import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { ComparisonChart } from "@/components/ComparisonChart";
import { FAQSection } from "@/components/calculator/FAQSection";
import { SourcesList } from "@/components/content/SourcesList";
import { absoluteUrl } from "@/lib/site";
import { comparisonStructuredData } from "@/lib/structured-data";

const REVIEWED_AT = "agosto de 2026";

const FAQ = [
  {
    question: "Academia é sempre mais cara que treinar em casa?",
    answer:
      "No custo mensal recorrente, quase sempre sim. Mas a comparação justa inclui o investimento inicial do treino em casa — halteres, barra, anilhas, colchonete e eventualmente um banco somam facilmente R$ 1.500 a R$ 3.000. Esse equipamento se paga em um a dois anos de mensalidade, desde que você mantenha a frequência.",
  },
  {
    question: "Quais custos além da mensalidade a academia tem?",
    answer:
      "Taxa de matrícula e taxa de anuidade cobradas uma vez por ano, transporte ou combustível e estacionamento, e às vezes armário e avaliação física. Em planos com fidelidade há ainda a multa por cancelamento antecipado. Some tudo antes de comparar com as outras modalidades: o custo real costuma ficar 20% a 30% acima da mensalidade anunciada.",
  },
  {
    question: "Vale a pena o plano anual com fidelidade?",
    answer:
      "O desconto é real, em geral de 20% a 40% sobre o plano mensal, mas ele transfere o risco para você: se parar de ir, continua pagando ou paga multa. Uma regra prática é começar no plano mensal e migrar para o anual só depois de sustentar três meses de frequência constante.",
  },
  {
    question: "Aulas online substituem o acompanhamento presencial?",
    answer:
      "Para condicionamento geral, mobilidade e treinos com peso corporal, funcionam bem e custam bem menos. Para treino de força com cargas altas, correção de técnica e reabilitação, o acompanhamento presencial faz diferença de segurança, não só de resultado. Muita gente combina as duas coisas: online na maior parte da semana e algumas sessões presenciais por mês.",
  },
  {
    question: "Como decidir sem errar muito?",
    answer:
      "Teste antes de assinar. A maioria das academias oferece aula experimental, e plataformas online costumam ter período gratuito. Acompanhe sua frequência real por um mês e escolha a modalidade que você conseguiu manter — o plano mais barato que você abandona é sempre mais caro que o plano usado.",
  },
];

const SOURCES = [
  {
    label: "Organização Mundial da Saúde — Diretrizes de atividade física",
    href: "https://www.who.int/publications/i/item/9789240015128",
    note: "recomendação de 150 a 300 minutos semanais de atividade moderada",
  },
  {
    label: "Ministério da Saúde — Guia de Atividade Física para a População Brasileira",
    href: "https://www.gov.br/saude/pt-br/composicao/saps/promocao-da-saude/guia-de-atividade-fisica",
    note: "orientações oficiais de prática de atividade física",
  },
  {
    label: "Código de Defesa do Consumidor (Lei 8.078/1990)",
    href: "https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm",
    note: "regras sobre contratos de fidelidade e cancelamento",
  },
];

const DESCRIPTION =
  "Academia, treino em casa ou aulas online: compare custo mensal, investimento inicial em equipamento, taxas escondidas e em que situação cada modalidade compensa.";

const comparisonData = {
  title: "Academia: Preço e Resultados",
  columns: ["Academia", "Treino em Casa", "Online"],
  rows: [
    { feature: "Custo mensal", items: ["R$ 80-200", "R$ 0-100", "R$ 50-100"] },
    { feature: "Equipamento", items: ["Completo", "Mínimo ou nenhum", "Online"] },
    {
      feature: "Variedade de exercícios",
      items: ["Máxima", "Limitada", "Média"],
    },
    {
      feature: "Motivação/Comunidade",
      items: ["Alta (ambiente)", "Baixa (sozinho)", "Média (virtual)"],
    },
    { feature: "Flexibilidade de horário", items: ["Fixa", "Total", "Total"] },
    { feature: "Privacidade", items: ["Baixa", "Alta", "Alta"] },
    {
      feature: "Acompanhamento personal",
      items: ["Extra R$ 50-100/aula", "Caro", "R$ 50-150/mês"],
    },
  ],
};

export const Route = createFileRoute("/comparar/academia")({
  head: () => ({
    meta: [
      { title: "Academia vs Treino em Casa vs Online | Calcule Brasil" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Academia vs Treino em Casa: Qual vale mais?" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: absoluteUrl("/comparar/academia") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/comparar/academia") }],
    scripts: comparisonStructuredData({
      name: "Academia vs Treino em Casa vs Online",
      description: DESCRIPTION,
      path: "/comparar/academia",
      faq: FAQ,
    }),
  }),
  component: AcademyComparison,
});

function AcademyComparison() {
  return (
    <PageShell>
      <article>
        <PageHeader
          eyebrow="Comparação de Resultados"
          title="Academia vs Treino em Casa vs Online"
          description="Qual modalidade compensa mais financeiramente?"
        />

        <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6">
          <Link
            to="/comparar"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Voltar para comparações
          </Link>
        </div>

        <Prose>
          <p>
            A comparação entre academia, treino em casa e aulas online raramente se resolve só no
            preço da mensalidade. O que determina o custo por treino efetivo é a combinação de três
            fatores: quanto você desembolsa por mês, quanto investiu de uma vez em equipamento e com
            que frequência você realmente treina. Uma mensalidade de R$ 100 usada quatro vezes por
            semana sai bem mais barata por sessão do que R$ 60 usados duas vezes por mês.
          </p>
          <p>
            As faixas de preço abaixo são referências de mercado em capitais brasileiras e variam
            bastante por região e por rede. Use-as como ponto de partida e substitua pelos valores
            que você encontrou perto de casa.
          </p>

          <h2>Tabela de Comparação</h2>
          <ComparisonChart {...comparisonData} />

          <h2>Academia (R$ 80-200/mês)</h2>
          <ul>
            <li>✅ Ambiente motiva</li>
            <li>✅ Equipamento completo</li>
            <li>✅ Comunidade forte</li>
            <li>❌ Horário fixo</li>
            <li>❌ Gasto com estacionamento/transporte</li>
            <li>❌ Menos privacidade</li>
          </ul>

          <h2>Treino em Casa (R$ 0-100/mês)</h2>
          <ul>
            <li>✅ Gratuito ou barato</li>
            <li>✅ Flexível 24/7</li>
            <li>✅ Privado</li>
            <li>❌ Difícil manter consistência</li>
            <li>❌ Precisa montar equipamento</li>
            <li>❌ Sem motivação externa</li>
          </ul>

          <h2>Aulas Online (R$ 50-150/mês)</h2>
          <ul>
            <li>✅ Preço intermediário</li>
            <li>✅ Flexível + Comunidade</li>
            <li>✅ Sem custo de deslocamento</li>
            <li>❌ Precisa equipamento mínimo</li>
            <li>❌ Menos personalizado</li>
          </ul>

          <h2>Os custos que não aparecem na mensalidade</h2>
          <p>
            Ao comparar propostas, some sempre os mesmos itens em cada modalidade. Na academia, além
            da mensalidade: taxa de matrícula, anuidade, transporte ou combustível, estacionamento e
            eventualmente armário. Em contratos com fidelidade, considere também a multa caso
            precise cancelar antes do prazo — ela transforma uma economia aparente em custo
            afundado.
          </p>
          <p>
            No treino em casa, o gasto relevante é o investimento inicial. Um conjunto básico
            funcional — colchonete, elásticos, um par de halteres ajustáveis e uma barra fixa — sai
            entre R$ 500 e R$ 1.500. Um setup mais completo, com banco e anilhas, passa dos R$
            3.000. Esse valor não se repete todo mês, mas precisa ser diluído no cálculo para a
            comparação ficar honesta.
          </p>
          <p>
            Nas aulas online, o custo costuma ser previsível, mas quase sempre exige algum
            equipamento mínimo em casa e uma conexão estável.
          </p>

          <h2>Custo anual e por treino</h2>
          <ul>
            <li>
              <strong>Academia:</strong> R$ 960 a R$ 2.400 por ano em mensalidades, mais R$ 100 a R$
              400 de taxas e deslocamento.
            </li>
            <li>
              <strong>Treino em casa:</strong> R$ 500 a R$ 3.000 de equipamento no primeiro ano, e
              perto de zero nos anos seguintes.
            </li>
            <li>
              <strong>Aulas online:</strong> R$ 600 a R$ 1.800 por ano, mais o equipamento mínimo.
            </li>
          </ul>
          <p>
            O número que realmente compara as três é o <strong>custo por treino</strong>: divida o
            gasto anual pelo número de sessões que você fez no ano. Quem treina três vezes por
            semana faz cerca de 150 sessões anuais; a mesma mensalidade de R$ 150 sai a R$ 12 por
            treino nesse ritmo e a R$ 60 por treino para quem vai uma vez por semana.
          </p>

          <h2>Em que situação cada uma compensa</h2>
          <p>
            <strong>Se está começando:</strong> a academia tende a ajudar, porque o ambiente, o
            horário definido e a presença de instrutores facilitam criar rotina — e o acesso a
            equipamento variado reduz a chance de você travar por não saber o que fazer.
          </p>
          <p>
            <strong>Se já treina de forma constante há mais de um ano:</strong> o treino em casa
            costuma ser o mais econômico no médio prazo, já que você conhece seus exercícios e o
            equipamento se paga.
          </p>
          <p>
            <strong>Se o problema é horário:</strong> aulas online resolvem a restrição de agenda e
            eliminam o deslocamento, com custo intermediário.
          </p>
          <p>
            <strong>Se o objetivo envolve carga alta ou reabilitação:</strong> vale priorizar o
            acompanhamento presencial, mesmo custando mais, por segurança de execução.
          </p>

          <h2>Limitações desta comparação</h2>
          <p>
            Esta página compara custo e conveniência, não resultado fisiológico — a modalidade mais
            eficaz é, em larga medida, a que você consegue manter. Os valores citados são
            estimativas de mercado e variam por cidade e por rede. Nada aqui substitui orientação de
            profissional de educação física, especialmente se você tem alguma condição de saúde ou
            está retomando os treinos depois de um período parado.
          </p>

          <SourcesList items={SOURCES} reviewedAt={REVIEWED_AT} />
        </Prose>

        <div className="mx-auto mt-12 max-w-3xl px-4 pb-12 sm:px-6">
          <FAQSection items={FAQ} />
        </div>
      </article>
    </PageShell>
  );
}
