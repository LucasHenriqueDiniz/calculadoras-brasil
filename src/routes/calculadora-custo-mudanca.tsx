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
    question: "Quanto custa uma mudança de apartamento?",
    answer:
      "Mudança local (mesma cidade): R$ 1.500-3.000. Interestadual: R$ 5.000-25.000+. Depende de: distância, volume, 4x andar, serviços contratados.",
  },
  {
    question: "A caução é um custo definitivo?",
    answer:
      "Geralmente volta quando sai do imóvel (se sem danos). Mas precisa estar no caixa no momento da assinatura. Contar como custo inicial.",
  },
  {
    question: "Como estimar o frete?",
    answer:
      "Peça 3 orçamentos com: distância, volume total, andares, elevador, serviços (desmontagem/montagem). Preço varia 30-50% entre mudançadoras.",
  },
  {
    question: "Vale mais contratar mudançadora ou alugar caminhão?",
    answer:
      "Mudançadora: seguro, profissional, sem dor de cabeça. Caminhão + amigos: mais barato mas cansativo. Para apartamento/casa, contratar é melhor.",
  },
  {
    question: "Quanto custa aluguel de caminhão baú?",
    answer:
      "Pequeno (2,5m): R$ 250-400/dia. Médio (4m): R$ 400-700/dia. Grande (6m): R$ 700-1.200/dia + combustível. Motorista extra: +R$ 200-400/dia.",
  },
  {
    question: "Quais são as taxas do imóvel novo?",
    answer:
      "Caução: 1-2 meses aluguel. Vistoria: R$ 200-500. Cartório: R$ 300-600. Taxa condomínio: 1 mês. Total de taxas: R$ 1.000-5.000.",
  },
  {
    question: "Quanto gasto comprando móveis e eletrodomésticos?",
    answer:
      "Estúdio/1 quarto: R$ 3.000-5.000 (básico). 2 quartos: R$ 5.000-10.000. 3+ quartos: R$ 10.000+. Comprar usado = 50-70% off.",
  },
  {
    question: "Quanto custa embalagem para mudança?",
    answer:
      "Caixas: R$ 2-5 cada (precisa 30-100). Papel bolha, fita, filme plástico: R$ 50-150. Total: R$ 300-700 (se DIY) ou incluído na mudançadora.",
  },
  {
    question: "Mudança interestadual: quanto custa?",
    answer:
      "SP-RJ: R$ 5.000-10.000. SP-Brasília: R$ 8.000-15.000. SP-Nordeste: R$ 12.000-25.000+. Distância = 30-40% do custo.",
  },
  {
    question: "Como economizar na mudança?",
    answer:
      "1) Desfaça-se de coisas (menos volume = menos custo). 2) Peça múltiplos orçamentos. 3) Mude em dia de semana (desconto). 4) Compre móveis depois (economia).",
  },
  {
    question: "Quanto custa seguro de mudança?",
    answer:
      "Básico: geralmente incluído. Extra: 0,5-1% do valor dos bens. Se bens valem R$ 30.000, seguro = R$ 150-300. Vale para frágeis.",
  },
  {
    question: "Quanto preciso ter guardado para mudança?",
    answer:
      "Caução: 1-2 meses aluguel. Mudança: R$ 2.000-5.000. Móveis/eletros: R$ 3.000-5.000. Taxas: R$ 1.000-2.000. Total: R$ 8.000-20.000+",
  },
];

export const Route = createFileRoute("/calculadora-custo-mudanca")({
  head: () => ({
    meta: [
      { title: `${PAGE_TITLE} | Calcule Brasil` },
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
