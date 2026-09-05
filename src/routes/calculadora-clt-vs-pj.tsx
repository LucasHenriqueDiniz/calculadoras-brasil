import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { CalculatorLayout, FormSection } from "@/components/calculator/CalculatorLayout";
import { CurrencyInput } from "@/components/calculator/fields";
import { ResultSummaryCard, BreakdownTable, DisclaimerBox } from "@/components/calculator/results";
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

const DESCRIPTION =
  "Compare ganho líquido entre CLT e PJ. Descubra quanto você precisa faturar como PJ para igualar sua CLT depois de somar FGTS, 13º, férias e benefícios.";

const FAQ = [
  {
    question: "Quanto preciso ganhar como PJ para igualar a CLT?",
    answer:
      "Depende do seu salário e dos benefícios que você recebe hoje. Como regra de ordem de grandeza, é comum ser preciso faturar entre 25% e 40% a mais como PJ para chegar ao mesmo padrão, porque FGTS, 13º, férias com um terço, benefícios e a contribuição previdenciária passam a sair do seu bolso. A calculadora faz essa conta com os seus números.",
  },
  {
    question: "O que a CLT garante e o PJ não tem?",
    answer:
      "FGTS e a multa de 40% na demissão sem justa causa, 13º salário, férias remuneradas com adicional de um terço, aviso prévio, seguro-desemprego, licenças remuneradas e estabilidade em algumas situações. Nada disso é automático no PJ: precisa virar reserva financeira construída por você.",
  },
  {
    question: "E os benefícios como vale-refeição e plano de saúde?",
    answer:
      "Também deixam de existir como benefício. Você passa a contratar plano de saúde por conta própria, geralmente mais caro do que o plano coletivo empresarial, e recebe o equivalente ao vale em faturamento tributável. Ao comparar propostas, converta cada benefício em valor mensal e some ao lado da CLT.",
  },
  {
    question: "Quais custos o PJ tem que a calculadora considera?",
    answer:
      "A simulação considera a tributação sobre o faturamento, o custo de contabilidade e a contribuição previdenciária do pró-labore. Não considera despesas específicas do seu negócio, como equipamentos, coworking, certificado digital, seguros ou honorários de abertura da empresa — inclua esses valores à parte antes de decidir.",
  },
  {
    question: "PJ paga menos imposto que CLT?",
    answer:
      "Em faixas de renda mais altas, a carga tributária no Simples Nacional costuma ser menor que a do IRPF na fonte. Mas a comparação só é honesta depois de somar os direitos que você deixa de receber e os custos que passa a ter. Um líquido maior no mês pode significar um pacote pior no ano.",
  },
  {
    question: "Existe risco jurídico em virar PJ?",
    answer:
      "Sim, quando a relação mantém as características de emprego — subordinação, pessoalidade, habitualidade e horário fixo. Nesses casos pode haver reconhecimento de vínculo, com consequências para as duas partes. Se a rotina proposta é idêntica à de um empregado, vale consultar um advogado trabalhista antes de aceitar.",
  },
];

export const Route = createFileRoute("/calculadora-clt-vs-pj")({
  head: () => ({
    meta: [
      { title: "Calculadora CLT vs PJ | Calcule Brasil" },
      { name: "description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/calculadora-clt-vs-pj") }],
    scripts: calculatorStructuredData({
      name: "Calculadora CLT vs PJ",
      description: DESCRIPTION,
      path: "/calculadora-clt-vs-pj",
      applicationCategory: "FinanceApplication",
      faq: FAQ,
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
        mainLabel={
          result.analise.empate
            ? "Empate técnico"
            : result.analise.cltMelhor
              ? "CLT é melhor"
              : "PJ é melhor"
        }
        secondaryValue={formatBRL(Math.abs(result.diferenca))}
        secondaryLabel={
          result.analise.temBaseParaPercentual
            ? `Diferença: ${Math.abs(result.percentualDiferenca)}%`
            : "Diferença"
        }
        resultColor={
          result.analise.empate ? "neutral" : result.analise.cltMelhor ? "positive" : "warning"
        }
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
            subtext:
              input.salarioCltBruto > 0
                ? `${((result.pjNecessaria / input.salarioCltBruto - 1) * 100).toFixed(0)}% a mais que CLT`
                : "Informe o salário CLT para comparar",
          },
        ]}
      />

      <DisclaimerBox>
        <p>
          Para o seu cenário, a simulação indica que seria preciso faturar cerca de{" "}
          <strong>{formatBRL(result.pjNecessaria)}</strong> por mês como PJ para chegar ao mesmo
          ganho líquido de <strong>{formatBRL(result.cltComBeneficios)}</strong> por mês em CLT, já
          somados FGTS, 13º e férias.
        </p>
        <p className="mt-3">
          É uma estimativa educativa. Ela não considera despesas próprias do seu negócio
          (equipamentos, coworking, certificado digital, seguros), variações de anexo e alíquota no
          Simples Nacional ao longo do ano, nem o risco de reconhecimento de vínculo quando a
          relação mantém as características de emprego. Consulte um contador antes de decidir.
        </p>
      </DisclaimerBox>

      <FAQSection items={FAQ} />

      <RelatedCalculators excludeSlug="clt-vs-pj" />
    </CalculatorLayout>
  );
}
