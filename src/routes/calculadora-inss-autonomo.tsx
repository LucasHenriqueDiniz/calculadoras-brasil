import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { CalculatorLayout, FormSection } from "@/components/calculator/CalculatorLayout";
import { CurrencyInput, NumberInput } from "@/components/calculator/fields";
import { ResultSummaryCard, BreakdownTable } from "@/components/calculator/results";
import { FAQSection } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { formatBRL } from "@/lib/format";
import { calculateInssAutonomi, type InssAutonomiInput } from "@/lib/calculators/inssAutonomo";
import { absoluteUrl } from "@/lib/site";
import { calculatorStructuredData } from "@/lib/structured-data";
import { usePersistedState } from "@/lib/usePersistedState";

const DEFAULTS: InssAutonomiInput = {
  ganhoMensalBruto: 3000,
  regimeSimplificado: false,
  mesesContribuidos: 0,
  taxaRetornoEstimada: 6,
};

export const Route = createFileRoute("/calculadora-inss-autonomo")({
  head: () => ({
    meta: [
      { title: "Calculadora INSS Autônomo 2026 | Calcule Brasil" },
      {
        name: "description",
        content:
          "Simule sua contribuição INSS como autônomo: 20% vs 11% simplificado. Veja quanto contribuir e impacto na aposentadoria.",
      },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/calculadora-inss-autonomo") }],
    scripts: calculatorStructuredData({
      name: "Calculadora INSS Autônomo 2026",
      description:
        "Simule sua contribuição INSS como autônomo: 20% vs 11% simplificado. Veja quanto contribuir e impacto na aposentadoria.",
      path: "/calculadora-inss-autonomo",
      applicationCategory: "FinanceApplication",
      faq: [],
    }),
  }),
  component: Calculator,
});

function Calculator() {
  const [input, setInput] = usePersistedState<InssAutonomiInput>("inss-autonomo-input", DEFAULTS);
  const result = useMemo(() => calculateInssAutonomi(input), [input]);

  return (
    <CalculatorLayout
      title="Calculadora INSS Autônomo"
      description="Simule sua contribuição INSS como autônomo e impacto na aposentadoria"
    >
      <FormSection title="Dados de ganho" description="Informe seu ganho mensal como autônomo">
        <CurrencyInput
          label="Ganho mensal bruto"
          value={input.ganhoMensalBruto}
          onChange={(v) => setInput({ ...input, ganhoMensalBruto: v })}
          hint="Sua renda mensal como autônomo"
        />
        <NumberInput
          label="Meses já contribuindo"
          value={input.mesesContribuidos}
          onChange={(v) => setInput({ ...input, mesesContribuidos: v })}
          min={0}
          hint="Para calcular tempo até aposentadoria"
        />
      </FormSection>

      <ResultSummaryCard
        title="Sua Contribuição INSS"
        mainValue={formatBRL(
          result.escolhaOtima === "simplificada"
            ? result.contribuicaoInssSimplificada
            : result.contribuicaoInssContributinte,
        )}
        mainLabel="Contribuição anual recomendada"
        secondaryValue={result.escolhaOtima}
        secondaryLabel="Regime indicado"
        resultColor="neutral"
      />

      <BreakdownTable
        title="Comparação de Regimes"
        items={[
          {
            label: "Ganho mensal bruto",
            value: formatBRL(result.ganhoMensalBruto),
          },
          {
            label: "Contributinte (20% anual)",
            value: formatBRL(result.contribuicaoInssContributinte),
            subtext: "Alíquota maior, benefício maior",
          },
          {
            label: "Simplificado (11% anual)",
            value: formatBRL(result.contribuicaoInssSimplificada),
            subtext: "Alíquota menor, mais simples",
          },
          {
            label: "Economia potencial",
            value: formatBRL(result.economiaAnual),
            isFinal: true,
          },
        ]}
      />

      <FAQSection
        items={[
          {
            question: "Qual regime é melhor para mim?",
            answer:
              "Depende de sua perspectiva de ganhos futuros. Contributinte (20%) oferece benefício maior. Simplificado (11%) é mais fácil. Nós indicamos o melhor automaticamente.",
          },
          {
            question: "Como faço para contribuir?",
            answer:
              "Acesse o site do INSS (meu.inss.gov.br) ou vá a uma agência e faça o registro como contribuinte individual. Pode pagar via boleto ou PIX.",
          },
          {
            question: "Quanto vou receber de aposentadoria?",
            answer:
              "Depende do tempo de contribuição. Com 35 anos contribuindo, você pode receber aproximadamente 70% do seu último salário médio.",
          },
        ]}
      />

      <RelatedCalculators excludeSlug="inss-autonomo" />
    </CalculatorLayout>
  );
}
