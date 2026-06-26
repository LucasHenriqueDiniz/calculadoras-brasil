import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { CalculatorLayout, FormSection } from "@/components/calculator/CalculatorLayout";
import { CurrencyInput, NumberInput } from "@/components/calculator/fields";
import { ResultSummaryCard, BreakdownTable } from "@/components/calculator/results";
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

export const Route = createFileRoute("/calculadora-beneficios-fiscais")({
  head: () => ({
    meta: [
      { title: "Calculadora Benefícios Fiscais | Calcule Brasil" },
      {
        name: "description",
        content:
          "Veja economia com vale refeição e vale transporte. Simule impacto fiscal de benefícios não tributáveis.",
      },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/calculadora-beneficios-fiscais") }],
    scripts: calculatorStructuredData({
      name: "Calculadora Benefícios Fiscais",
      description:
        "Veja economia com vale refeição e vale transporte. Simule impacto fiscal de benefícios não tributáveis.",
      path: "/calculadora-beneficios-fiscais",
      applicationCategory: "FinanceApplication",
      faq: [],
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
          hint="Média brasileira: ~R$ 360/mês"
        />
        <CurrencyInput
          label="Vale transporte mensal"
          value={input.valeTransporteMensal}
          onChange={(v) => setInput({ ...input, valeTransporteMensal: v })}
          hint="Geralmente até 6% do salário"
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

      <FAQSection
        items={[
          {
            question: "Vale refeição e transporte reduzem IRPF?",
            answer:
              "Indiretamente. São benefícios não tributáveis, então não entram na base de cálculo do IRPF. É como se você economizasse imposto.",
          },
          {
            question: "Qual é o limite de vale refeição?",
            answer:
              "Não há limite legal, mas a Receita considera comum até R$ 360/mês. Acima disso, pode haver questionamento.",
          },
          {
            question: "Vale transporte tem limite?",
            answer: "Até 6% do seu salário bruto. Empresa pode descontar se exceder esse valor.",
          },
        ]}
      />

      <RelatedCalculators excludeSlug="beneficios-fiscais" />
    </CalculatorLayout>
  );
}
