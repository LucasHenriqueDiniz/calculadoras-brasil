import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalculatorLayout, FormSection } from "@/components/calculator/CalculatorLayout";
import { CurrencyInput, PercentageInput } from "@/components/calculator/fields";
import {
  BreakdownTable,
  DisclaimerBox,
  ResultSummaryCard,
  SimpleBarChart,
} from "@/components/calculator/results";
import { CopyResultButton, ResetButton, ShareResultButton } from "@/components/calculator/actions";
import { FAQSection, type FAQItem } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { Prose } from "@/components/layout/PageShell";
import { formatBRL } from "@/lib/format";
import { calculateMovingCost, type MovingCostInput } from "@/lib/calculators/movingCost";
import { absoluteUrl } from "@/lib/site";
import { calculatorStructuredData } from "@/lib/structured-data";

const PAGE_TITLE = "Calculadora de custo de mudança residencial";
const DESCRIPTION =
  "Planeje transporte, embalagem, taxas do imóvel, móveis, eletrodomésticos e reserva para imprevistos.";
const DEFAULTS: MovingCostInput = {
  truckAndLabor: 1800,
  packingMaterials: 300,
  insurance: 100,
  buildingFees: 0,
  cleaning: 250,
  assembly: 400,
  deposit: 3000,
  firstRent: 1500,
  utilitySetup: 200,
  furniture: 2000,
  appliances: 1000,
  other: 300,
  contingencyPercent: 10,
};
const FAQ: FAQItem[] = [
  {
    question: "A caução é um custo definitivo?",
    answer:
      "Nem sempre. Ela pode ser devolvida no fim do contrato, mas precisa estar disponível no caixa no momento da mudança.",
  },
  {
    question: "Como estimar o frete?",
    answer:
      "Solicite orçamentos considerando distância, volume, escadas, elevador, desmontagem e montagem. Informe aqui o orçamento total escolhido.",
  },
  {
    question: "Por que incluir uma reserva?",
    answer:
      "Mudanças costumam gerar compras e taxas não previstas. A reserva reduz o risco de depender de crédito caro.",
  },
];

export const Route = createFileRoute("/calculadora-custo-mudanca")({
  head: () => ({
    meta: [
      { title: `${PAGE_TITLE} — Calcule Brasil` },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: absoluteUrl("/calculadora-custo-mudanca") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/calculadora-custo-mudanca") }],
    scripts: calculatorStructuredData({
      name: PAGE_TITLE,
      description: DESCRIPTION,
      path: "/calculadora-custo-mudanca",
      applicationCategory: "FinanceApplication",
      faq: FAQ,
    }),
  }),
  component: MovingPage,
});

function MovingPage() {
  const [input, setInput] = useState(DEFAULTS);
  const result = useMemo(() => calculateMovingCost(input), [input]);
  const update = <K extends keyof MovingCostInput>(key: K, value: MovingCostInput[K]) =>
    setInput((current) => ({ ...current, [key]: value }));
  const money = (key: keyof MovingCostInput, label: string) => (
    <CurrencyInput label={label} value={input[key]} onChange={(value) => update(key, value)} />
  );
  const shareText = `Custo estimado da mudança: ${formatBRL(result.total)}, incluindo ${formatBRL(result.contingency)} de reserva.`;
  const form = (
    <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
      <FormSection title="Transporte e operação">
        {money("truckAndLabor", "Caminhão e equipe")}
        {money("packingMaterials", "Materiais de embalagem")}
        {money("insurance", "Seguro da mudança")}
        {money("buildingFees", "Taxas de condomínio")}
        {money("cleaning", "Limpeza")}
        {money("assembly", "Montagem e instalação")}
      </FormSection>
      <FormSection title="Entrada no novo imóvel">
        {money("deposit", "Caução ou garantia")}
        {money("firstRent", "Primeiro aluguel")}
        {money("utilitySetup", "Ligações e instalações")}
      </FormSection>
      <FormSection title="Compras iniciais">
        {money("furniture", "Móveis")}
        {money("appliances", "Eletrodomésticos")}
        {money("other", "Outros itens")}
        <PercentageInput
          label="Reserva para imprevistos"
          value={input.contingencyPercent}
          onChange={(value) => update("contingencyPercent", value)}
        />
      </FormSection>
      <DisclaimerBox>
        Informe orçamentos reais sempre que possível. A calculadora não consulta fretes, mapas ou
        preços externos.
      </DisclaimerBox>
      <ResetButton onReset={() => setInput(DEFAULTS)} />
    </form>
  );
  const resultBlock = (
    <div className="space-y-3">
      <ResultSummaryCard title="Total necessário" value={formatBRL(result.total)} tone="primary" />
      <ResultSummaryCard title="Subtotal planejado" value={formatBRL(result.subtotal)} />
      <ResultSummaryCard title="Reserva para imprevistos" value={formatBRL(result.contingency)} />
      <div className="flex flex-wrap gap-2">
        <CopyResultButton text={shareText} />
        <ShareResultButton title={PAGE_TITLE} text={shareText} />
      </div>
    </div>
  );
  return (
    <CalculatorLayout title={PAGE_TITLE} description={DESCRIPTION} form={form} result={resultBlock}>
      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <SimpleBarChart rows={result.breakdown} title="Composição do custo" />
          <BreakdownTable rows={result.breakdown} caption="Custos da mudança" />
        </div>
      </section>
      <Prose collapsibleTitle="Saiba mais sobre o custo de mudança">
        <h2>O que considerar em uma mudança</h2>
        <p>
          Além do caminhão, considere embalagem, desmontagem, taxas de acesso, limpeza, caução,
          primeiro aluguel e compras necessárias para a casa nova.
        </p>
        <h2>Reserva de segurança</h2>
        <p>
          Uma margem de 5% a 15% ajuda a absorver materiais extras, pequenos reparos e instalações
          descobertas durante a mudança.
        </p>
        <h2>Limitações</h2>
        <p>
          Distância, volume, escadas e regras do condomínio alteram bastante o preço. Confirme tudo
          em orçamento formal.
        </p>
      </Prose>
      <div className="mx-auto max-w-6xl space-y-10 px-4 pb-16 sm:px-6">
        <FAQSection items={FAQ} />
        <RelatedCalculators slugs={["morar-sozinho", "assinaturas", "conta-de-luz"]} />
      </div>
    </CalculatorLayout>
  );
}
