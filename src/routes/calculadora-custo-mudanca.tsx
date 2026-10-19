import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalculatorLayout, FormSection } from "@/components/calculator/CalculatorLayout";
import {
  CurrencyInput,
  NumberInput,
  PercentageInput,
  SelectField,
} from "@/components/calculator/fields";
import {
  BreakdownTable,
  DisclaimerBox,
  ResultSummaryCard,
  SimpleBarChart,
} from "@/components/calculator/results";
import { CopyResultButton, ResetButton, ShareResultButton } from "@/components/calculator/actions";
import { FAQSection, type FAQItem } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { RelatedPosts } from "@/components/calculator/RelatedPosts";
import { relatedPostsFor } from "@/data/calculators";
import { Prose } from "@/components/layout/PageShell";
import { formatBRL, formatLongDate } from "@/lib/format";
import {
  ANTT_COEFFICIENTS_IN_FORCE_FROM,
  buildFreightFloorTable,
  minimumFreight,
  type TruckAxles,
} from "@/lib/calculators/antt-freight-floor";
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
  distanceKm: 0,
  truckAxles: 2,
};

// Every figure the FAQ and the table quote comes from the calculator or the ANTT's portaria.
const DEFAULT_RESULT = calculateMovingCost(DEFAULTS);
const FREIGHT_DISTANCES = [100, 300, 500, 1_000, 2_000, 3_000];
const FREIGHT_TABLE = buildFreightFloorTable(FREIGHT_DISTANCES, [2, 3]);
const COEFFICIENTS_FROM = formatLongDate(ANTT_COEFFICIENTS_IN_FORCE_FROM);

const TRUCKS: { value: TruckAxles; label: string }[] = [
  { value: 2, label: "2 eixos (caminhão 3/4 ou toco)" },
  { value: 3, label: "3 eixos (caminhão truck)" },
];

function km(value: number): string {
  return `${value.toLocaleString("pt-BR")} km`;
}
const FAQ: FAQItem[] = [
  {
    question: "Quanto custa uma mudança de apartamento?",
    answer: `Depende da distância, do volume, dos andares e dos serviços contratados, por isso o caminho é pedir orçamentos. A única referência oficial é o piso mínimo de frete da ANTT para o caminhão: ${formatBRL(minimumFreight(500, 2))} para 500 km num caminhão de 2 eixos, pela tabela em vigor desde ${COEFFICIENTS_FROM}. O preço de uma mudança soma a isso embalagem, carregamento, montagem e seguro.`,
  },
  {
    question: "A caução é um custo definitivo?",
    answer:
      "Não. A caução em dinheiro deve ser depositada em caderneta de poupança, e o rendimento fica com o inquilino quando ela é devolvida (Lei 8.245/1991, art. 38, § 2º). Ela não pode passar de três aluguéis. Por isso a calculadora mostra quanto você precisa ter em mãos e quanto disso volta.",
  },
  {
    question: "Como estimar o frete?",
    answer:
      "Peça orçamentos informando distância, volume, andares, elevador e serviços de desmontagem e montagem. Para mudanças entre cidades, compare com o piso mínimo de frete da ANTT, que esta página calcula pela distância e pelo tamanho do caminhão.",
  },
  {
    question: "Vale mais contratar uma empresa de mudança ou alugar um caminhão?",
    answer:
      "A empresa de mudança cuida de embalagem, carregamento e transporte, e costuma oferecer seguro. Alugar um caminhão e carregar por conta própria tende a sair mais barato, mas exige gente, tempo e cuidado com o que quebra. Compare o orçamento completo com o aluguel do caminhão somado a combustível, pedágio e ajuda.",
  },
  {
    question: "Quanto custa alugar um caminhão baú?",
    answer:
      "Varia por locadora, cidade e tamanho do baú, e o combustível e o pedágio ficam por sua conta. Cote em mais de uma locadora para a data da mudança.",
  },
  {
    question: "Quais são as taxas para entrar no imóvel novo?",
    answer:
      "Pela Lei do Inquilinato, as taxas de intermediação e de administração da imobiliária, e as despesas para checar o cadastro do inquilino e do fiador, são do proprietário (Lei 8.245/1991, art. 22, VII). Do inquilino, o contrato pode pedir uma garantia, só uma, e a caução em dinheiro vai até três aluguéis (arts. 37 e 38).",
  },
  {
    question: "Quanto gasto comprando móveis e eletrodomésticos?",
    answer: `Depende do que você já tem. Liste o essencial para a primeira semana e deixe o resto para depois. O exemplo da calculadora reserva ${formatBRL(DEFAULTS.furniture)} para móveis e ${formatBRL(DEFAULTS.appliances)} para eletrodomésticos.`,
  },
  {
    question: "Quanto custa a embalagem para mudança?",
    answer:
      "Depende do volume: caixas, fita, plástico-bolha e filme. Muitas empresas de mudança incluem a embalagem no orçamento; pergunte antes de comprar material.",
  },
  {
    question: "Quanto custa uma mudança interestadual?",
    answer: `O frete pesa mais quanto maior a distância. Pelo piso mínimo da ANTT, o caminhão de 2 eixos custa pelo menos ${formatBRL(minimumFreight(1_000, 2))} para 1.000 km e ${formatBRL(minimumFreight(3_000, 2))} para 3.000 km; o de 3 eixos, ${formatBRL(minimumFreight(1_000, 3))} e ${formatBRL(minimumFreight(3_000, 3))}. A tabela desta página mostra outras distâncias.`,
  },
  {
    question: "Como economizar na mudança?",
    answer:
      "Desfaça-se do que não vai usar, porque menos volume pede caminhão menor. Peça mais de um orçamento, pergunte se há preço diferente em dia de semana, e compre móveis depois de se instalar, quando souber o que falta.",
  },
  {
    question: "Quanto custa o seguro de mudança?",
    answer:
      "Depende do valor declarado dos bens e do que a apólice cobre. Peça que o orçamento diga se o seguro está incluído, até quanto cobre e o que fica de fora.",
  },
  {
    question: "Quanto preciso ter guardado para a mudança?",
    answer: `No exemplo da calculadora, ${formatBRL(DEFAULT_RESULT.total)}, já com a reserva para imprevistos. Desse valor, ${formatBRL(DEFAULT_RESULT.refundableDeposit)} são a caução, que volta ao fim do contrato; o custo que fica é ${formatBRL(DEFAULT_RESULT.nonRefundableTotal)}.`,
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
          hint="Aplicada ao transporte, às instalações e às compras; caução e aluguel são valores de contrato."
        />
      </FormSection>
      <FormSection title="Mudança para outra cidade (opcional)">
        <NumberInput
          label="Distância da viagem"
          value={input.distanceKm}
          onChange={(value) => update("distanceKm", value)}
          suffix="km"
          hint="Para ver o piso mínimo de frete da ANTT. Deixe 0 numa mudança na mesma cidade."
        />
        <SelectField
          label="Tamanho do caminhão"
          value={String(input.truckAxles)}
          onChange={(value) => update("truckAxles", Number(value) as TruckAxles)}
          options={TRUCKS.map(({ value, label }) => ({ value: String(value), label }))}
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
      <div className="grid grid-cols-2 gap-3">
        <ResultSummaryCard
          title="Caução que volta"
          value={formatBRL(result.refundableDeposit)}
          description="Depositada em poupança, com rendimento"
        />
        <ResultSummaryCard title="Custo que fica" value={formatBRL(result.nonRefundableTotal)} />
      </div>
      {result.freightFloor > 0 ? (
        <ResultSummaryCard
          title="Piso mínimo de frete (ANTT)"
          value={formatBRL(result.freightFloor)}
          description={`${km(input.distanceKm)}, caminhão de ${input.truckAxles} eixos. Referência para o orçamento do caminhão.`}
        />
      ) : null}
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
          Uma margem ajuda a absorver materiais extras, pequenos reparos e instalações descobertas
          durante a mudança. A calculadora aplica a reserva ao transporte, às instalações e às
          compras, não à caução e ao primeiro aluguel, que são valores fixados no contrato.
        </p>
        <h2>A caução volta</h2>
        <p>
          A caução em dinheiro não é custo: a lei manda depositá-la em caderneta de poupança e
          devolvê-la ao inquilino com o rendimento (Lei 8.245/1991, art. 38, § 2º), e ela não pode
          passar de três aluguéis. Por isso o resultado separa o dinheiro que você precisa ter em
          mãos do custo que fica.
        </p>
        <h2>Limitações</h2>
        <p>
          Distância, volume, escadas e regras do condomínio alteram bastante o preço. Confirme tudo
          em orçamento formal.
        </p>
      </Prose>
      <FreightFloorSection />
      <div className="mx-auto max-w-6xl space-y-10 px-4 pb-16 sm:px-6">
        <FAQSection items={FAQ} />
        <RelatedCalculators slugs={["morar-sozinho", "assinaturas", "conta-de-luz"]} />
        <RelatedPosts slugs={relatedPostsFor("custo-mudanca")} />
      </div>
    </CalculatorLayout>
  );
}

function FreightFloorSection() {
  return (
    <Prose>
      <h2>Piso mínimo de frete da ANTT por distância</h2>
      <p>
        Para o transporte rodoviário de carga, a ANTT fixa um piso: o frete de um caminhão inteiro,
        contratado por uma só pessoa, não pode ficar abaixo de distância × custo por km + custo de
        carga e descarga (Resolução ANTT 5.867/2020, art. 5º). O piso é vinculante: quem paga menos
        deve ao transportador o dobro da diferença (Lei 13.703/2018, art. 5º, § 4º). A tabela foi
        calculada pela própria calculadora com os coeficientes de carga geral da Portaria SUROC nº
        22/2026, em vigor desde {COEFFICIENTS_FROM}. É o piso do caminhão: o orçamento de uma
        mudança soma embalagem, carregamento, montagem e seguro.
      </p>
      <div className="not-prose overflow-x-auto rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)]">
        <table className="w-full min-w-[560px] text-sm">
          <caption className="sr-only">
            Piso mínimo de frete da ANTT para carga geral por distância e tamanho do caminhão
          </caption>
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th scope="col" className="px-3 py-2.5">
                Distância
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                2 eixos
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Por km
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                3 eixos
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Por km
              </th>
            </tr>
          </thead>
          <tbody>
            {FREIGHT_TABLE.map((row) => (
              <tr key={row.distanceKm} className="border-t border-border/70">
                <th scope="row" className="px-3 py-2 text-left font-medium text-foreground">
                  {km(row.distanceKm)}
                </th>
                {row.floors.map((cell) => [
                  <td
                    key={`${cell.axles}-floor`}
                    className="px-3 py-2 text-right font-semibold text-foreground"
                  >
                    {formatBRL(cell.floor)}
                  </td>,
                  <td key={`${cell.axles}-km`} className="px-3 py-2 text-right">
                    {formatBRL(cell.perKm)}
                  </td>,
                ])}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        O custo por km cai com a distância porque a carga e a descarga são pagas uma vez só. A ANTT
        revisa os coeficientes, e é obrigada a revisá-los sempre que o diesel varia mais de 5% (Lei
        13.703/2018, art. 5º, § 3º); confira o valor do dia na{" "}
        <a href="https://calculadorafrete.antt.gov.br" target="_blank" rel="noreferrer">
          calculadora oficial da ANTT
        </a>
        .
      </p>
    </Prose>
  );
}
