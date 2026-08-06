import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { CalculatorLayout, FormSection } from "@/components/calculator/CalculatorLayout";
import { CurrencyInput, NumberInput } from "@/components/calculator/fields";
import { ResultSummaryCard, BreakdownTable, DisclaimerBox } from "@/components/calculator/results";
import { FAQSection } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { formatBRL } from "@/lib/format";
import {
  calculateBeneficiosFiscais,
  type BeneficiosFiscaisInput,
} from "@/lib/calculators/beneficiosFiscais";
import { absoluteUrl } from "@/lib/site";
import { calculatorStructuredData } from "@/lib/structured-data";
import { usePersistedState } from "@/lib/usePersistedState";

const DEFAULTS: BeneficiosFiscaisInput = {
  valeRefeicaoMensal: 360,
  valeTransporteMensal: 0,
  aliquotaIrpfEstimada: 15,
};

const DESCRIPTION =
  "Quanto valem de verdade vale-refeição, vale-alimentação e vale-transporte: veja o equivalente em salário bruto necessário para chegar ao mesmo líquido.";

const FAQ = [
  {
    question: "Vale-refeição e vale-transporte reduzem o IRPF?",
    answer:
      "Eles não entram na base de cálculo do IRPF nem do INSS quando concedidos nas condições previstas na legislação, então o efeito prático é o mesmo de uma renda isenta. Não é uma dedução na declaração: é um valor que simplesmente não é tributado, por isso um benefício de R$ 500 costuma valer mais que R$ 500 de aumento salarial.",
  },
  {
    question: "Existe um limite de valor para o vale-refeição?",
    answer:
      "Não há um teto em reais fixado em lei para a concessão. O que a legislação define são as condições de natureza não salarial do benefício, hoje concentradas nas regras do Programa de Alimentação do Trabalhador e nas alterações trazidas pela Lei 14.442/2022 — entre elas a exigência de que o valor seja usado apenas para alimentação. Valores muito acima do padrão de mercado da função podem ser questionados como salário disfarçado.",
  },
  {
    question: "Como funciona o desconto do vale-transporte?",
    answer:
      "A empresa pode descontar do empregado até 6% do salário-base a título de vale-transporte, e arca com o que exceder esse percentual. Se o custo total do deslocamento for menor que 6% do salário, o desconto fica limitado ao custo real. O benefício é de adesão opcional: o empregado pode recusá-lo.",
  },
  {
    question: "Vale-refeição e vale-alimentação são a mesma coisa?",
    answer:
      "Não. O vale-refeição destina-se a refeições prontas em restaurantes e similares, e o vale-alimentação à compra de gêneros em supermercados. Desde a Lei 14.442/2022 os valores não podem ser desviados para outras finalidades, e a portabilidade entre operadoras de cartão foi facilitada.",
  },
  {
    question: "Vale a pena trocar benefício por aumento de salário?",
    answer:
      "Quase nunca em valores equivalentes. Como o benefício não sofre incidência de INSS nem de IRPF, seria preciso um aumento bruto consideravelmente maior para chegar ao mesmo líquido — é exatamente esse número que a calculadora mostra. Por outro lado, salário maior aumenta a base de FGTS, 13º, férias e da futura aposentadoria, o que o benefício não faz.",
  },
];

export const Route = createFileRoute("/calculadora-beneficios-fiscais")({
  head: () => ({
    meta: [
      { title: "Calculadora Benefícios Fiscais | Calcule Brasil" },
      { name: "description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/calculadora-beneficios-fiscais") }],
    scripts: calculatorStructuredData({
      name: "Calculadora Benefícios Fiscais",
      description: DESCRIPTION,
      path: "/calculadora-beneficios-fiscais",
      applicationCategory: "FinanceApplication",
      faq: FAQ,
    }),
  }),
  component: Calculator,
});

function Calculator() {
  const [input, setInput] = usePersistedState<BeneficiosFiscaisInput>("beneficios-input", DEFAULTS);
  const result = useMemo(() => calculateBeneficiosFiscais(input), [input]);

  return (
    <CalculatorLayout
      title="Calculadora Benefícios Fiscais"
      description="Simule economia com vale refeição, transporte e outros benefícios"
    >
      <FormSection title="Benefícios" description="Valores que você recebe">
        <CurrencyInput
          label="Vale refeição mensal"
          value={input.valeRefeicaoMensal}
          onChange={(v) => setInput({ ...input, valeRefeicaoMensal: v })}
          hint="Informe o valor que consta no seu holerite"
        />
        <CurrencyInput
          label="Vale transporte mensal"
          value={input.valeTransporteMensal}
          onChange={(v) => setInput({ ...input, valeTransporteMensal: v })}
          hint="A empresa pode descontar até 6% do salário-base a esse título"
        />
      </FormSection>

      <FormSection title="Imposto" description="Sua alíquota IRPF estimada">
        <NumberInput
          label="Alíquota IRPF (%)"
          value={input.aliquotaIrpfEstimada}
          onChange={(v) => setInput({ ...input, aliquotaIrpfEstimada: v })}
          min={0}
          max={27.5}
          hint="Alíquota marginal do seu IRPF"
        />
      </FormSection>

      <ResultSummaryCard
        title="Economia Fiscal"
        mainValue={formatBRL(result.economiaIrpfMensal)}
        mainLabel="Economia IRPF mensal"
        secondaryValue={formatBRL(result.economiaIrpfAnual)}
        secondaryLabel="Economia IRPF anual"
        resultColor="positive"
      />

      <BreakdownTable
        title="Detalhes"
        items={[
          {
            label: "Vale refeição mensal",
            value: formatBRL(result.valeRefeicaoMensal),
            subtext: "Não tributável",
          },
          {
            label: "Vale transporte mensal",
            value: formatBRL(result.valeTransporteMensal),
            subtext: "Não tributável",
          },
          {
            label: "Total de benefícios",
            value: formatBRL(result.beneficiosTotalMensal),
          },
          {
            label: "Economia de IRPF mensal",
            value: formatBRL(result.economiaIrpfMensal),
            subtext: "Se recebesse em dinheiro, pagaria IRPF",
          },
          {
            label: "Economia de IRPF anual",
            value: formatBRL(result.economiaIrpfAnual),
            isFinal: true,
          },
          {
            label: "Salário bruto necessário para igualar",
            value: formatBRL(result.comparacao.emDinheiro),
            subtext: "Quanto teria que receber a mais em salário para ter o mesmo em líquido",
          },
        ]}
      />

      <DisclaimerBox>
        <p>
          A estimativa considera que os benefícios informados são concedidos nas condições que
          afastam a incidência de INSS e IRPF. Regras específicas de convenção coletiva, benefícios
          pagos em dinheiro e situações em que a verba é considerada de natureza salarial podem
          mudar o resultado. Trata-se de conteúdo educativo, não de orientação tributária
          individual.
        </p>
      </DisclaimerBox>

      <FAQSection items={FAQ} />

      <RelatedCalculators excludeSlug="beneficios-fiscais" />
    </CalculatorLayout>
  );
}
