import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { CalculatorLayout, FormSection } from "@/components/calculator/CalculatorLayout";
import { CurrencyInput, NumberInput } from "@/components/calculator/fields";
import { ResultSummaryCard, BreakdownTable } from "@/components/calculator/results";
import { FAQSection } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { formatBRL } from "@/lib/format";
import {
  calculatePrevidenciaComplementar,
  type PrevidenciaComplementarInput,
} from "@/lib/calculators/previdenciaComplementar";
import { absoluteUrl } from "@/lib/site";
import { usePersistedState } from "@/lib/usePersistedState";

const DEFAULTS: PrevidenciaComplementarInput = {
  contribuicaoMensalPgbl: 1000,
  tasaRetornoAnual: 8,
  anosAteAposentadoria: 20,
  aliquotaIrpfAtual: 22.5,
};

export const Route = createFileRoute("/calculadora-previdencia-complementar")({
  head: () => ({
    meta: [
      { title: "Calculadora Previdência Complementar | Calcule Brasil" },
      {
        name: "description",
        content:
          "Simule contribuição PGBL/VGBL. Reduza IRPF agora e acumule para aposentadoria complementar. Projete seu saldo em 10, 20, 30 anos.",
      },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/calculadora-previdencia-complementar") }],
  }),
  component: Calculator,
});

function Calculator() {
  const [input, setInput] = usePersistedState<PrevidenciaComplementarInput>(
    "previdencia-input",
    DEFAULTS
  );
  const result = useMemo(() => calculatePrevidenciaComplementar(input), [input]);

  return (
    <CalculatorLayout
      title="Calculadora Previdência Complementar"
      description="Reduza IRPF e acumule para aposentadoria complementar"
    >
      <FormSection title="Contribuição" description="Quanto você quer contribuir mensalmente">
        <CurrencyInput
          label="Contribuição mensal (PGBL/VGBL)"
          value={input.contribuicaoMensalPgbl}
          onChange={(v) => setInput({ ...input, contribuicaoMensalPgbl: v })}
          hint="Limite até R$ 63.454/ano (13% da renda bruta)"
        />
      </FormSection>

      <FormSection title="Projeção" description="Taxa de retorno e tempo até aposentadoria">
        <NumberInput
          label="Taxa de retorno anual esperada (%)"
          value={input.tasaRetornoAnual}
          onChange={(v) => setInput({ ...input, tasaRetornoAnual: v })}
          min={0}
          max={20}
          hint="Histórico médio: 8-10% a.a."
        />
        <NumberInput
          label="Anos até aposentadoria"
          value={input.anosAteAposentadoria}
          onChange={(v) => setInput({ ...input, anosAteAposentadoria: v })}
          min={1}
          max={40}
          hint="Quanto tempo até parar de trabalhar"
        />
      </FormSection>

      <ResultSummaryCard
        title="Saldo Projetado"
        mainValue={formatBRL(
          input.anosAteAposentadoria <= 10
            ? result.montanteFinal10anos
            : input.anosAteAposentadoria <= 20
              ? result.montanteFinal20anos
              : result.montanteFinal30anos
        )}
        mainLabel={`em ${input.anosAteAposentadoria} anos`}
        secondaryValue={formatBRL(result.economiaIrpfAnual)}
        secondaryLabel="Economia IRPF/ano"
        resultColor="positive"
      />

      <BreakdownTable
        title="Projeção"
        items={[
          {
            label: "Contribuição mensal",
            value: formatBRL(input.contribuicaoMensalPgbl),
          },
          {
            label: "Contribuição anual",
            value: formatBRL(result.contribuicaoAnualPgbl),
          },
          {
            label: "Economia IRPF mensal",
            value: formatBRL(result.economiaIrpfMensal),
            subtext: "Desconto sobre sua contribuição",
          },
          {
            label: "Saldo em 10 anos",
            value: formatBRL(result.montanteFinal10anos),
          },
          {
            label: "Saldo em 20 anos",
            value: formatBRL(result.montanteFinal20anos),
          },
          {
            label: "Saldo em 30 anos",
            value: formatBRL(result.montanteFinal30anos),
            isFinal: true,
          },
        ]}
      />

      <FAQSection
        items={[
          {
            question: "Qual é a diferença entre PGBL e VGBL?",
            answer:
              "PGBL: você deduz contribuições do IRPF (bom para quem declara completo). VGBL: não deduz, mas a tributação é menor no resgate.",
          },
          {
            question: "Até quanto posso contribuir?",
            answer: "Até 13% da sua renda bruta ou R$ 63.454/ano (o que for menor).",
          },
          {
            question: "Posso sacar antes de me aposentar?",
            answer:
              "Sim, mas haverá tributação. Recomenda-se deixar aplicado até a aposentadoria para maximizar ganho.",
          },
        ]}
      />

      <RelatedCalculators excludeSlug="previdencia-complementar" />
    </CalculatorLayout>
  );
}
