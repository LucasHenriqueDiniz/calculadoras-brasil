import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { CalculatorLayout, FormSection } from "@/components/calculator/CalculatorLayout";
import { CurrencyInput, NumberInput } from "@/components/calculator/fields";
import { ResultSummaryCard, BreakdownTable } from "@/components/calculator/results";
import { FAQSection } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { formatBRL } from "@/lib/format";
import { calculateCltVsPj, type CltVsPjInput } from "@/lib/calculators/cltVsPj";
import { absoluteUrl } from "@/lib/site";
import { calculatorStructuredData } from "@/lib/structured-data";
import { usePersistedState } from "@/lib/usePersistedState";

const DEFAULTS: CltVsPjInput = {
  salarioCltBruto: 5000,
  propostaPjMensal: 6000,
  dependentes: 0,
  despesasDedutivelsPj: 0,
};

export const Route = createFileRoute("/calculadora-clt-vs-pj")({
  head: () => ({
    meta: [
      { title: "Calculadora CLT vs PJ 2026 | Calcule Brasil" },
      {
        name: "description",
        content:
          "Compare ganho líquido: CLT vs PJ. Descubra quanto você precisa ganhar como PJ para igualar sua CLT com benefícios.",
      },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/calculadora-clt-vs-pj") }],
    scripts: calculatorStructuredData({
      name: "Calculadora CLT vs PJ 2026",
      description:
        "Compare ganho líquido: CLT vs PJ. Descubra quanto você precisa ganhar como PJ para igualar sua CLT com benefícios.",
      path: "/calculadora-clt-vs-pj",
      applicationCategory: "FinanceApplication",
      faq: [],
    }),
  }),
  component: Calculator,
});

function Calculator() {
  const [input, setInput] = usePersistedState<CltVsPjInput>("clt-vs-pj-input", DEFAULTS);
  const result = useMemo(() => calculateCltVsPj(input), [input]);

  return (
    <CalculatorLayout
      title="Calculadora CLT vs PJ"
      description="Compare ganho líquido entre regime CLT e PJ"
    >
      <FormSection title="Cenário CLT" description="Seu salário bruto em regime CLT">
        <CurrencyInput
          label="Salário bruto CLT mensal"
          value={input.salarioCltBruto}
          onChange={(v) => setInput({ ...input, salarioCltBruto: v })}
          hint="Valor antes de INSS e IRPF"
        />
      </FormSection>

      <FormSection title="Proposta PJ" description="Valor que você receberia como PJ">
        <CurrencyInput
          label="Proposta PJ mensal"
          value={input.propostaPjMensal}
          onChange={(v) => setInput({ ...input, propostaPjMensal: v })}
          hint="Quanto está oferecendo como PJ"
        />
        <CurrencyInput
          label="Despesas dedutíveis PJ"
          value={input.despesasDedutivelsPj}
          onChange={(v) => setInput({ ...input, despesasDedutivelsPj: v })}
          hint="Equipamentos, combustível, aluguel do espaço"
        />
      </FormSection>

      <ResultSummaryCard
        title="Comparação"
        mainValue={formatBRL(result.cltComBeneficios)}
        mainLabel={result.analise.cltMelhor ? "CLT é melhor" : "PJ é melhor"}
        secondaryValue={formatBRL(Math.abs(result.diferenca))}
        secondaryLabel={`Diferença: ${result.percentualDiferenca}%`}
        resultColor={result.analise.cltMelhor ? "positive" : "warning"}
      />

      <BreakdownTable
        title="Ganho Líquido Mensal"
        items={[
          {
            label: "CLT - Salário líquido",
            value: formatBRL(result.cltLiquido),
          },
          {
            label: "CLT - Benefícios (13º, FGTS, vale)",
            value: `+ ${formatBRL(result.cltComBeneficios - result.cltLiquido)}`,
            subtext: "Diluído mensalmente",
          },
          {
            label: "CLT Total",
            value: formatBRL(result.cltComBeneficios),
            isFinal: true,
          },
          {
            label: "PJ - Proposta",
            value: formatBRL(result.propostaPjMensal),
          },
          {
            label: "PJ - Líquido (após INSS, IRPF, contador)",
            value: formatBRL(result.pjLiquido),
            isFinal: true,
          },
          {
            label: "PJ Necessária para igualar CLT",
            value: formatBRL(result.pjNecessaria),
            subtext: `${((result.pjNecessaria / input.salarioCltBruto - 1) * 100).toFixed(0)}% a mais que CLT`,
          },
        ]}
      />

      <FAQSection
        items={[
          {
            question: "Quanto de PJ preciso ganhar para igualar CLT?",
            answer: `Nossa simulação mostra que você precisa de R$ ${formatBRL(result.pjNecessaria)}/mês em PJ para ter o mesmo ganho líquido que R$ ${formatBRL(result.salarioCltBruto)}/mês em CLT.`,
          },
          {
            question: "O que PJ não tem que CLT tem?",
            answer:
              "PJ não tem FGTS, 13º salário, férias remuneradas, seguro desemprego. PJ precisa guardar dinheiro para essas situações.",
          },
          {
            question: "E os benefícios? Vale refeição, transporte?",
            answer:
              "Também desaparecem em PJ. Você recebe o valor em dinheiro e precisa pagar imposto sobre.",
          },
        ]}
      />

      <RelatedCalculators excludeSlug="clt-vs-pj" />
    </CalculatorLayout>
  );
}
