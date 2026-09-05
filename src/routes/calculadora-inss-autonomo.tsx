import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { CalculatorLayout, FormSection } from "@/components/calculator/CalculatorLayout";
import { CurrencyInput, NumberInput, SelectField } from "@/components/calculator/fields";
import {
  ResultSummaryCard,
  BreakdownTable,
  DisclaimerBox,
  WarningList,
} from "@/components/calculator/results";
import { FAQSection } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { formatBRL } from "@/lib/format";
import { calculateInssAutonomo, type InssAutonomoInput } from "@/lib/calculators/inssAutonomo";
import { MINIMUM_WAGE, INSS_CEILING } from "@/lib/calculators/inss-constants";
import { absoluteUrl } from "@/lib/site";
import { calculatorStructuredData } from "@/lib/structured-data";
import { usePersistedState } from "@/lib/usePersistedState";

const DEFAULTS: InssAutonomoInput = {
  grossMonthlyIncome: 3000,
  contributedMonths: 0,
  contributorSex: "masculino",
};

const DESCRIPTION =
  "Compare os dois planos do contribuinte individual: 20% sobre o salário de contribuição e 11% sobre o salário mínimo. Veja o custo mensal de cada um e o que muda na aposentadoria.";

const FAQ = [
  {
    question: "Qual é a diferença entre o plano de 20% e o de 11%?",
    answer:
      "No plano normal você recolhe 20% sobre o salário de contribuição, que é a sua renda declarada limitada ao salário mínimo por baixo e ao teto do INSS por cima. No plano simplificado você recolhe 11% sempre sobre o salário mínimo, não sobre a sua renda — por isso ele é mais barato para quem ganha acima do mínimo.",
  },
  {
    question: "O plano simplificado de 11% vale a pena?",
    answer:
      "Ele custa menos, mas dá direito a benefícios limitados a um salário mínimo e não conta tempo para a aposentadoria por tempo de contribuição, apenas para a aposentadoria por idade. Se depois você quiser aproveitar esse período como tempo de contribuição, precisa complementar os 9% de diferença acrescidos de juros. É uma escolha de cobertura, não só de preço.",
  },
  {
    question: "Existe um valor mínimo e um máximo de contribuição?",
    answer:
      "Sim. O salário de contribuição não pode ser menor que o salário mínimo nem maior que o teto do RGPS. Quem ganha acima do teto contribui sobre o teto, e quem ganha abaixo do mínimo contribui sobre o mínimo. A calculadora aplica os dois limites automaticamente.",
  },
  {
    question: "Quanto vou receber de aposentadoria?",
    answer:
      "A estimativa aqui é apenas educativa. Pela regra geral da Emenda Constitucional 103/2019, o benefício parte de 60% da média de todos os salários de contribuição desde julho de 1994, somando 2% por ano que exceder 20 anos de contribuição para homens e 15 anos para mulheres. Como não temos seu histórico completo, usamos a renda atual no lugar da média. O valor oficial é o apurado pelo INSS no seu extrato do CNIS.",
  },
  {
    question: "Presto serviço para empresas. Muda alguma coisa?",
    answer:
      "Sim. Quando o autônomo presta serviço a uma pessoa jurídica, a empresa retém 11% na fonte e recolhe a parte patronal. Nesse caso você não recolhe os 20% integralmente sobre aquela renda, e pode haver dedução da contribuição patronal. Esta calculadora considera o cenário de quem recolhe por conta própria, via GPS ou carnê.",
  },
  {
    question: "Como faço para começar a contribuir?",
    answer:
      "É preciso ter NIT/PIS e se inscrever como contribuinte individual pelo Meu INSS (meu.inss.gov.br) ou pela central 135. O recolhimento é feito por GPS ou pelo carnê, com o código de pagamento correspondente ao plano escolhido — 1007 para o plano normal e 1163 para o plano simplificado.",
  },
];

export const Route = createFileRoute("/calculadora-inss-autonomo")({
  head: () => ({
    meta: [
      { title: "Calculadora INSS Autônomo: 20% ou 11%? | Calcule Brasil" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Calculadora INSS Autônomo: 20% ou 11%?" },
      { property: "og:url", content: absoluteUrl("/calculadora-inss-autonomo") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/calculadora-inss-autonomo") }],
    scripts: calculatorStructuredData({
      name: "Calculadora INSS Autônomo",
      description: DESCRIPTION,
      path: "/calculadora-inss-autonomo",
      applicationCategory: "FinanceApplication",
      faq: FAQ,
    }),
  }),
  component: Calculator,
});

function Calculator() {
  const [input, setInput] = usePersistedState<InssAutonomoInput>(
    "inss-autonomo-input-v2",
    DEFAULTS,
  );
  const result = useMemo(() => calculateInssAutonomo(input), [input]);

  const avisos: string[] = [];
  if (result.cappedByCeiling) {
    avisos.push(
      `Sua renda está acima do teto do INSS (${formatBRL(INSS_CEILING)}). A contribuição do plano normal é calculada sobre o teto, e o benefício também fica limitado a ele.`,
    );
  }
  if (result.raisedToFloor) {
    avisos.push(
      `Sua renda está abaixo do salário mínimo (${formatBRL(MINIMUM_WAGE)}). O salário de contribuição não pode ser menor que o mínimo, então a base foi elevada a esse piso.`,
    );
  }
  if (!result.minimumTimeReached) {
    avisos.push(
      `Com ${result.contributedYears.toFixed(1)} ano(s) de contribuição, você ainda não atingiu o tempo mínimo de ${result.minimumContributionYears} anos exigido para a aposentadoria por tempo de contribuição. Por isso a estimativa de benefício aparece zerada.`,
    );
  }

  return (
    <CalculatorLayout
      title="Calculadora INSS Autônomo"
      description="Compare o plano de 20% e o simplificado de 11% e veja o que cada um garante"
    >
      <FormSection
        title="Seus dados"
        description="A renda declarada define o salário de contribuição do plano normal"
      >
        <CurrencyInput
          label="Renda mensal bruta"
          value={input.grossMonthlyIncome}
          onChange={(v) => setInput({ ...input, grossMonthlyIncome: v })}
          hint={`Limitada entre ${formatBRL(MINIMUM_WAGE)} e ${formatBRL(INSS_CEILING)} para fins de contribuição`}
        />
        <NumberInput
          label="Meses já contribuídos"
          value={input.contributedMonths}
          onChange={(v) => setInput({ ...input, contributedMonths: v })}
          min={0}
          hint="Consulte o total no seu extrato do CNIS, no Meu INSS"
        />
        <SelectField
          label="Sexo"
          value={input.contributorSex}
          onChange={(v) =>
            setInput({ ...input, contributorSex: v as InssAutonomoInput["contributorSex"] })
          }
          options={[
            { value: "masculino", label: "Masculino (mínimo de 20 anos)" },
            { value: "feminino", label: "Feminino (mínimo de 15 anos)" },
          ]}
          hint="Define o tempo mínimo de contribuição da regra geral"
        />
      </FormSection>

      <ResultSummaryCard
        title="Plano normal (20%)"
        mainValue={formatBRL(result.standardPlan.monthlyContribution)}
        mainLabel={`Por mês sobre um salário de contribuição de ${formatBRL(result.contributionBase)}`}
        secondaryValue={formatBRL(result.simplifiedPlan.monthlyContribution)}
        secondaryLabel="Plano simplificado (11% sobre o salário mínimo)"
        resultColor="neutral"
      />

      <WarningList warnings={avisos} />

      <BreakdownTable
        title="Custo dos dois planos"
        items={[
          {
            label: "Renda mensal informada",
            value: formatBRL(result.grossMonthlyIncome),
          },
          {
            label: "Salário de contribuição (plano normal)",
            value: formatBRL(result.contributionBase),
            subtext: "Renda limitada ao piso do salário mínimo e ao teto do INSS",
          },
          {
            label: "Plano normal — 20% ao mês",
            value: formatBRL(result.standardPlan.monthlyContribution),
            subtext: `${formatBRL(result.standardPlan.annualContribution)} por ano · conta tempo de contribuição`,
          },
          {
            label: "Plano simplificado — 11% ao mês",
            value: formatBRL(result.simplifiedPlan.monthlyContribution),
            subtext: `${formatBRL(result.simplifiedPlan.annualContribution)} por ano · sempre sobre o salário mínimo`,
          },
          {
            label: "Diferença de custo por ano",
            value: formatBRL(result.annualCostDifference),
            isFinal: true,
          },
        ]}
      />

      <BreakdownTable
        title="O que cada plano garante"
        items={[
          {
            label: "Teto do benefício — plano normal",
            value: formatBRL(INSS_CEILING),
            subtext: "Benefícios proporcionais à média das contribuições, até o teto do INSS",
          },
          {
            label: "Teto do benefício — plano simplificado",
            value: formatBRL(result.simplifiedPlanBenefitEstimate),
            subtext: "Benefícios limitados a um salário mínimo, qualquer que seja sua renda",
          },
          {
            label: "Estimativa de benefício no plano normal",
            value: result.minimumTimeReached
              ? formatBRL(result.standardPlanBenefitEstimate)
              : "Tempo mínimo não atingido",
            subtext: result.minimumTimeReached
              ? `${result.appliedAveragePercentage}% da média, pela regra da EC 103/2019`
              : `Faltam ${(result.minimumContributionYears - result.contributedYears).toFixed(1)} ano(s) de contribuição`,
            isFinal: true,
          },
        ]}
      />

      <DisclaimerBox>
        <p>
          <strong>Como ler estes números.</strong> A comparação de custo é direta: 20% sobre o
          salário de contribuição contra 11% sobre o salário mínimo. Já a estimativa de benefício é
          uma simplificação — a regra oficial usa a média de <em>todos</em> os seus salários de
          contribuição desde julho de 1994, e aqui usamos a renda atual no lugar dessa média porque
          não temos seu histórico. Regras de transição, tempo rural, contribuições em atraso e
          atividades concomitantes também não são consideradas.
        </p>
        <p className="mt-3">
          O plano mais barato não é automaticamente o melhor: o simplificado limita seus benefícios
          a um salário mínimo e não conta tempo para a aposentadoria por tempo de contribuição.
          Confirme sua situação no extrato do CNIS, no Meu INSS, e consulte um profissional de
          previdência antes de decidir. Valores de referência do ano-base {result.referenceYear}.
        </p>
      </DisclaimerBox>

      <FAQSection items={FAQ} />

      <RelatedCalculators excludeSlug="inss-autonomo" />
    </CalculatorLayout>
  );
}
