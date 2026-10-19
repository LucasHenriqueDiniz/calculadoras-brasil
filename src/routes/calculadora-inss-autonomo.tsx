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
import { RelatedPosts } from "@/components/calculator/RelatedPosts";
import { relatedPostsFor } from "@/data/calculators";
import { formatBRL } from "@/lib/format";
import {
  buildPlanComparisonTable,
  calculateInssAutonomo,
  type InssAutonomoInput,
} from "@/lib/calculators/inssAutonomo";
import { Prose } from "@/components/layout/PageShell";
import { MINIMUM_WAGE, INSS_CEILING } from "@/lib/calculators/inss-constants";
import { absoluteUrl } from "@/lib/site";
import { calculatorStructuredData } from "@/lib/structured-data";
import { usePersistedState } from "@/lib/usePersistedState";

const DEFAULTS: InssAutonomoInput = {
  grossMonthlyIncome: 3000,
  contributedMonths: 0,
  contributorSex: "masculino",
  affiliatedBeforeReform: true,
};

/** The plan table: a man affiliated before the reform, with 30 years of contribution. */
const TABLE_YEARS = 30;
const PLAN_ROWS = buildPlanComparisonTable(
  [MINIMUM_WAGE, 2500, 3500, 5000, INSS_CEILING],
  TABLE_YEARS,
  "masculino",
  true,
);

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
      "A estimativa aqui é apenas educativa. Pela Emenda Constitucional 103/2019 (art. 26), o benefício parte de 60% da média de todos os salários de contribuição desde julho de 1994, somando 2% por ano que exceder 20 anos de contribuição, para homens, ou 15 anos, para mulheres. Como não temos seu histórico completo, usamos a renda atual no lugar da média. O valor oficial é o apurado pelo INSS no seu extrato do CNIS.",
  },
  {
    question: "Quantos anos de contribuição preciso para me aposentar?",
    answer:
      "Depende de quando você começou a contribuir. Quem já era filiado ao INSS antes de 13 de novembro de 2019 precisa de 15 anos de contribuição, homem ou mulher (EC 103/2019, art. 18). Quem se filiou depois precisa de 15 anos, se mulher, e 20 anos, se homem (art. 19). Nos dois casos, a idade mínima é de 65 anos para homens e 62 para mulheres.",
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
    "inss-autonomo-input-v3",
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
      `Com ${result.contributedYears.toFixed(1).replace(".", ",")} ano(s) de contribuição, você ainda não atingiu o tempo mínimo de ${result.minimumContributionYears} anos para se aposentar, que também exige ${result.minimumRetirementAge} anos de idade. Por isso a estimativa de benefício aparece zerada.`,
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
            { value: "masculino", label: "Masculino" },
            { value: "feminino", label: "Feminino" },
          ]}
          hint="Define a idade mínima e, para quem começou depois de 2019, o tempo mínimo"
        />
        <SelectField
          label="Já contribuía para o INSS antes de 13/11/2019?"
          value={input.affiliatedBeforeReform ? "sim" : "nao"}
          onChange={(v) => setInput({ ...input, affiliatedBeforeReform: v === "sim" })}
          options={[
            { value: "sim", label: "Sim: 15 anos de contribuição bastam" },
            { value: "nao", label: "Não: 15 anos para mulheres, 20 para homens" },
          ]}
          hint="A data em que a reforma da previdência entrou em vigor"
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
              : `Faltam ${(result.minimumContributionYears - result.contributedYears).toFixed(1).replace(".", ",")} ano(s) de contribuição`,
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
          não temos seu histórico. O tempo mínimo segue a EC 103/2019: 15 anos para quem já
          contribuía antes de 13/11/2019, e 20 anos para homens que começaram depois. As demais
          regras de transição (pontos, pedágio), tempo rural, contribuições em atraso e atividades
          concomitantes não são consideradas.
        </p>
        <p className="mt-3">
          O plano mais barato não é automaticamente o melhor: o simplificado limita seus benefícios
          a um salário mínimo e não conta tempo para a aposentadoria por tempo de contribuição.
          Confirme sua situação no extrato do CNIS, no Meu INSS, e consulte um profissional de
          previdência antes de decidir. Valores de referência do ano-base {result.referenceYear}.
        </p>
      </DisclaimerBox>

      <PlanTableSection />

      <FAQSection items={FAQ} />

      <RelatedCalculators excludeSlug="inss-autonomo" />
      <RelatedPosts slugs={relatedPostsFor("inss-autonomo")} />
    </CalculatorLayout>
  );
}

function PlanTableSection() {
  return (
    <Prose>
      <h2>Quanto custa a mais o plano de 20%, e quanto ele paga a mais</h2>
      <p>
        A tabela abaixo foi calculada pela própria calculadora, para um homem que já contribuía
        antes da reforma e chega a {TABLE_YEARS} anos de contribuição. Ela compara o custo mensal
        dos dois planos com o benefício estimado de cada um.
      </p>
      <div className="not-prose overflow-x-auto rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)]">
        <table className="w-full min-w-[640px] text-sm">
          <caption className="sr-only">
            Contribuição mensal e benefício estimado nos planos de 20% e 11%, em 2026
          </caption>
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th scope="col" className="px-3 py-2.5">
                Renda mensal
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Plano de 20%
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Plano de 11%
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Custa a mais por mês
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Benefício estimado (20%)
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Benefício (11%)
              </th>
            </tr>
          </thead>
          <tbody>
            {PLAN_ROWS.map((row) => (
              <tr key={row.grossMonthlyIncome} className="border-t border-border/70">
                <th scope="row" className="px-3 py-2 text-left font-medium text-foreground">
                  {formatBRL(row.grossMonthlyIncome)}
                </th>
                <td className="px-3 py-2 text-right">{formatBRL(row.standardMonthly)}</td>
                <td className="px-3 py-2 text-right">{formatBRL(row.simplifiedMonthly)}</td>
                <td className="px-3 py-2 text-right">{formatBRL(row.extraMonthlyCost)}</td>
                <td className="px-3 py-2 text-right font-semibold text-foreground">
                  {formatBRL(row.standardBenefit)}
                </td>
                <td className="px-3 py-2 text-right">{formatBRL(row.simplifiedBenefit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Na linha do salário mínimo, os dois planos dão o mesmo benefício, e o de 20% só custa mais.
        A partir daí, o plano de 20% passa a comprar uma aposentadoria maior que um salário mínimo,
        e a diferença cresce com a renda até o teto do INSS. Com {TABLE_YEARS} anos de contribuição,
        o benefício estimado é de 80% da média, porque a EC 103/2019 soma 2 pontos para cada ano
        além dos 20.
      </p>
      <p>
        A estimativa usa a renda informada no lugar da média de todos os seus salários de
        contribuição desde 1994, que é o que o INSS usa de fato. Se a sua renda variou muito ao
        longo da carreira, o benefício real será diferente. O valor oficial está no seu extrato do
        CNIS, no Meu INSS.
      </p>
    </Prose>
  );
}
