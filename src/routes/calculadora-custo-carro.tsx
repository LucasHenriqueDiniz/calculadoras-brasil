import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { LoaderCircle } from "lucide-react";
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
  WarningList,
} from "@/components/calculator/results";
import { FAQSection, type FAQItem } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { CopyResultButton, ResetButton, ShareResultButton } from "@/components/calculator/actions";
import { Prose } from "@/components/layout/PageShell";
import { PublicDataField } from "@/components/public-data/PublicDataField";
import { Button } from "@/components/ui/button";
import { getCalculator } from "@/data/calculators";
import { formatBRL, parseBRNumber } from "@/lib/format";
import { calculateCarCost, type CarCostInput, type FuelType } from "@/lib/calculators/carCost";
import { getFuelPrice } from "@/lib/public-data/client";
import { BRAZILIAN_STATES } from "@/lib/public-data/states";

const meta = getCalculator("custo-carro")!;
const PAGE_TITLE = "Calculadora de Custo de Carro no Brasil";
const PAGE_DESCRIPTION =
  "Estime quanto custa manter um carro por mês, incluindo combustível, IPVA, seguro, manutenção, estacionamento e depreciação.";

const DEFAULTS: CarCostInput = {
  monthlyKm: 800,
  cityConsumptionKmL: 10,
  highwayConsumptionKmL: 13,
  cityUsePercent: 80,
  gasolinePrice: 6.0,
  ethanolPrice: 4.2,
  dieselPrice: 6.1,
  fuelType: "gasoline",
  carValue: 50000,
  ipvaAnnual: 2000,
  insuranceAnnual: 2500,
  licensingAnnual: 200,
  maintenanceMonthly: 250,
  tiresAnnual: 1200,
  parkingMonthly: 0,
  tollsMonthly: 0,
  washingMonthly: 50,
  finesAndOthersMonthly: 0,
  depreciationAnnualPercent: 8,
};

type FuelPriceKey = "gasolinePrice" | "ethanolPrice" | "dieselPrice";

interface PublicFieldState {
  isLoading: boolean;
  isManual: boolean;
  isStale: boolean;
  sourceName?: string;
  sourceLastUpdated?: string | null;
  error?: string | null;
}

const EMPTY_PUBLIC_FIELD: PublicFieldState = {
  isLoading: false,
  isManual: true,
  isStale: false,
};

const FUEL_REQUESTS: Array<{
  key: FuelPriceKey;
  apiFuel: "gasolina" | "etanol" | "diesel";
}> = [
  { key: "gasolinePrice", apiFuel: "gasolina" },
  { key: "ethanolPrice", apiFuel: "etanol" },
  { key: "dieselPrice", apiFuel: "diesel" },
];

const FAQ: FAQItem[] = [
  {
    question: "Quanto custa manter um carro por mês?",
    answer:
      "Depende do carro, do uso e da cidade. Em média, somando combustível, IPVA, seguro, licenciamento, manutenção e depreciação, um carro popular usado para deslocamentos urbanos costuma custar entre R$ 1.200 e R$ 2.500 por mês. Use a calculadora com os seus números para ter uma estimativa personalizada.",
  },
  {
    question: "Como calcular o custo por km de um carro?",
    answer:
      "Some todos os custos mensais do carro (combustível, IPVA proporcional, seguro, manutenção, estacionamento, depreciação etc.) e divida pelos quilômetros rodados no mês. A fórmula é: custo por km = custo mensal total / quilômetros rodados no mês.",
  },
  {
    question: "A calculadora considera IPVA?",
    answer:
      "Sim. Você informa o valor anual do IPVA e a calculadora divide por 12 para diluir esse custo dentro da estimativa mensal, junto com seguro e licenciamento.",
  },
  {
    question: "A calculadora considera depreciação?",
    answer:
      "Sim. A depreciação é a perda anual de valor do carro. Você informa um percentual estimado (por padrão 8% ao ano) sobre o valor atual do veículo. Esse valor é diluído mensalmente, porque mesmo sem sair dinheiro do bolso, o carro vale menos a cada mês.",
  },
  {
    question: "Gasolina ou etanol: qual vale mais a pena?",
    answer:
      "A regra dos 70% (etanol vale a pena se custar até 70% do preço da gasolina) é só uma referência. O ideal é comparar o custo real, considerando o consumo do seu carro com cada combustível. No modo Flex, a calculadora simula os dois cenários e mostra qual é mais barato com os preços e consumos que você informou.",
  },
  {
    question: "O resultado é oficial?",
    answer:
      "Não. Esta calculadora gera uma estimativa educativa baseada nos valores que você informa. Os custos reais variam por cidade, modelo do carro, perfil de uso, seguradora e oficina. Use o resultado como ponto de partida, não como orçamento oficial.",
  },
];

export const Route = createFileRoute("/calculadora-custo-carro")({
  head: () => ({
    meta: [
      { title: `${PAGE_TITLE} — Calculadoras Brasil` },
      { name: "description", content: PAGE_DESCRIPTION },
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: PAGE_DESCRIPTION },
      { property: "og:url", content: meta.path },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: meta.path }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: PAGE_TITLE,
          description: PAGE_DESCRIPTION,
          applicationCategory: "FinanceApplication",
          operatingSystem: "Web",
          inLanguage: "pt-BR",
          offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Início", item: "/" },
            { "@type": "ListItem", position: 2, name: PAGE_TITLE, item: meta.path },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }),
      },
    ],
  }),
  component: CarCostPage,
});

function CarCostPage() {
  const [input, setInput] = useState<CarCostInput>(DEFAULTS);
  const [uf, setUf] = useState("SP");
  const [fuelFields, setFuelFields] = useState<Record<FuelPriceKey, PublicFieldState>>({
    gasolinePrice: { ...EMPTY_PUBLIC_FIELD },
    ethanolPrice: { ...EMPTY_PUBLIC_FIELD },
    dieselPrice: { ...EMPTY_PUBLIC_FIELD },
  });
  const result = useMemo(() => calculateCarCost(input), [input]);

  function update<K extends keyof CarCostInput>(key: K, value: CarCostInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  function updateFuelManually(key: FuelPriceKey, value: string) {
    update(key, parseBRNumber(value));
    setFuelFields((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        isLoading: false,
        isManual: true,
        error: null,
      },
    }));
  }

  async function loadFuelPrices() {
    setFuelFields(
      (prev) =>
        Object.fromEntries(
          FUEL_REQUESTS.map(({ key }) => [key, { ...prev[key], isLoading: true, error: null }]),
        ) as Record<FuelPriceKey, PublicFieldState>,
    );

    await Promise.all(
      FUEL_REQUESTS.map(async ({ key, apiFuel }) => {
        try {
          const data = await getFuelPrice(uf, apiFuel);
          if (!data.available) {
            setFuelFields((prev) => ({
              ...prev,
              [key]: {
                ...prev[key],
                isLoading: false,
                isManual: true,
                sourceName: data.source,
                sourceLastUpdated: data.lastUpdated,
                isStale: data.isStale ?? false,
                error: data.notes ?? data.error ?? "Preço público indisponível.",
              },
            }));
            return;
          }

          update(key, data.averagePrice);
          setFuelFields((prev) => ({
            ...prev,
            [key]: {
              isLoading: false,
              isManual: false,
              sourceName: data.source,
              sourceLastUpdated: data.lastUpdated,
              isStale: data.isStale,
              error: null,
            },
          }));
        } catch {
          setFuelFields((prev) => ({
            ...prev,
            [key]: {
              ...prev[key],
              isLoading: false,
              isManual: true,
              error: "Não foi possível consultar a ANP agora.",
            },
          }));
        }
      }),
    );
  }

  function reset() {
    setInput(DEFAULTS);
    setUf("SP");
    setFuelFields({
      gasolinePrice: { ...EMPTY_PUBLIC_FIELD },
      ethanolPrice: { ...EMPTY_PUBLIC_FIELD },
      dieselPrice: { ...EMPTY_PUBLIC_FIELD },
    });
  }

  const shareText = `Custo mensal estimado do carro: ${formatBRL(result.monthlyTotal)} (anual: ${formatBRL(result.annualTotal)})${
    result.costPerKm !== null ? ` — ${formatBRL(result.costPerKm)}/km` : ""
  }`;

  const form = (
    <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
      <FormSection title="Uso do carro">
        <NumberInput
          label="Quilômetros rodados por mês"
          value={input.monthlyKm}
          onChange={(v) => update("monthlyKm", v)}
          suffix="km"
        />
        <PercentageInput
          label="Percentual de uso na cidade"
          value={input.cityUsePercent}
          onChange={(v) => update("cityUsePercent", v)}
          hint="O restante é considerado uso em estrada."
        />
        <NumberInput
          label="Consumo na cidade (km/l)"
          value={input.cityConsumptionKmL}
          onChange={(v) => update("cityConsumptionKmL", v)}
          step={0.1}
          suffix="km/l"
        />
        <NumberInput
          label="Consumo na estrada (km/l)"
          value={input.highwayConsumptionKmL}
          onChange={(v) => update("highwayConsumptionKmL", v)}
          step={0.1}
          suffix="km/l"
        />
      </FormSection>

      <FormSection
        title="Combustível"
        description="No modo Flex, comparamos gasolina e etanol para indicar o mais barato no seu cenário."
      >
        <SelectField
          label="Estado para consultar preços médios"
          value={uf}
          onChange={setUf}
          options={[...BRAZILIAN_STATES]}
          hint="A consulta usa médias públicas quando disponíveis. O preço do seu posto pode ser diferente."
        />
        <Button
          type="button"
          variant="outline"
          onClick={loadFuelPrices}
          disabled={FUEL_REQUESTS.some(({ key }) => fuelFields[key].isLoading)}
        >
          {FUEL_REQUESTS.some(({ key }) => fuelFields[key].isLoading) ? (
            <LoaderCircle className="animate-spin" />
          ) : null}
          Tentar carregar preços da ANP
        </Button>
        <SelectField
          label="Tipo de combustível"
          value={input.fuelType}
          onChange={(v) => update("fuelType", v as FuelType)}
          options={[
            { value: "gasoline", label: "Gasolina" },
            { value: "ethanol", label: "Etanol" },
            { value: "diesel", label: "Diesel" },
            { value: "flex", label: "Flex automático (compara gasolina x etanol)" },
          ]}
        />
        <PublicDataField
          label="Preço da gasolina por litro"
          value={input.gasolinePrice}
          onManualChange={(value) => updateFuelManually("gasolinePrice", value)}
          {...fuelFields.gasolinePrice}
          helperText="Valor em R$/litro; você pode editar mesmo após carregar."
        />
        <PublicDataField
          label="Preço do etanol por litro"
          value={input.ethanolPrice}
          onManualChange={(value) => updateFuelManually("ethanolPrice", value)}
          {...fuelFields.ethanolPrice}
          helperText="Valor em R$/litro; você pode editar mesmo após carregar."
        />
        <PublicDataField
          label="Preço do diesel por litro"
          value={input.dieselPrice}
          onManualChange={(value) => updateFuelManually("dieselPrice", value)}
          {...fuelFields.dieselPrice}
          helperText="Valor em R$/litro; você pode editar mesmo após carregar."
        />
      </FormSection>

      <FormSection title="Custos do veículo">
        <CurrencyInput
          label="Valor aproximado do carro"
          value={input.carValue}
          onChange={(v) => update("carValue", v)}
        />
        <PercentageInput
          label="Depreciação anual estimada"
          value={input.depreciationAnnualPercent}
          onChange={(v) => update("depreciationAnnualPercent", v)}
          hint="Carros novos costumam depreciar entre 8% e 15% ao ano."
          step={0.5}
        />
        <CurrencyInput
          label="IPVA anual"
          value={input.ipvaAnnual}
          onChange={(v) => update("ipvaAnnual", v)}
        />
        <CurrencyInput
          label="Seguro anual"
          value={input.insuranceAnnual}
          onChange={(v) => update("insuranceAnnual", v)}
        />
        <CurrencyInput
          label="Licenciamento anual"
          value={input.licensingAnnual}
          onChange={(v) => update("licensingAnnual", v)}
        />
      </FormSection>

      <FormSection title="Custos de uso">
        <CurrencyInput
          label="Manutenção mensal"
          value={input.maintenanceMonthly}
          onChange={(v) => update("maintenanceMonthly", v)}
          hint="Inclui revisões, óleo, peças e mão de obra diluídos por mês."
        />
        <CurrencyInput
          label="Pneus por ano"
          value={input.tiresAnnual}
          onChange={(v) => update("tiresAnnual", v)}
        />
        <CurrencyInput
          label="Estacionamento mensal"
          value={input.parkingMonthly}
          onChange={(v) => update("parkingMonthly", v)}
        />
        <CurrencyInput
          label="Pedágios mensais"
          value={input.tollsMonthly}
          onChange={(v) => update("tollsMonthly", v)}
        />
        <CurrencyInput
          label="Lavagem mensal"
          value={input.washingMonthly}
          onChange={(v) => update("washingMonthly", v)}
        />
        <CurrencyInput
          label="Multas e outros custos mensais"
          value={input.finesAndOthersMonthly}
          onChange={(v) => update("finesAndOthersMonthly", v)}
        />
      </FormSection>

      <DisclaimerBox>
        Os valores padrão acima são apenas exemplos editáveis — não representam dados oficiais.
        Substitua pelos seus próprios números para uma estimativa mais próxima da realidade.
      </DisclaimerBox>

      <div className="flex flex-wrap gap-2">
        <ResetButton onReset={reset} />
      </div>
    </form>
  );

  const resultBlock = (
    <div className="space-y-3">
      <ResultSummaryCard
        title="Custo mensal total"
        value={formatBRL(result.monthlyTotal)}
        description={`${result.selectedFuelLabel}`}
        tone="primary"
      />
      <div className="grid grid-cols-2 gap-3">
        <ResultSummaryCard title="Custo anual" value={formatBRL(result.annualTotal)} />
        <ResultSummaryCard
          title="Custo por km"
          value={result.costPerKm !== null ? formatBRL(result.costPerKm) : "—"}
          description={result.costPerKm === null ? "Informe a quilometragem" : undefined}
        />
      </div>
      <ResultSummaryCard
        title="Combustível mensal"
        value={formatBRL(result.monthlyFuelCost)}
        description={
          result.fuelComparison
            ? `Gasolina ${formatBRL(result.fuelComparison.gasolineMonthly)} · Etanol ${formatBRL(result.fuelComparison.ethanolMonthly)}`
            : undefined
        }
      />

      {result.highlights.length > 0 ? (
        <ul className="space-y-2 rounded-xl border border-border bg-surface p-4 text-sm text-foreground/85">
          {result.highlights.map((h) => (
            <li key={h}>• {h}</li>
          ))}
        </ul>
      ) : null}

      <WarningList warnings={result.warnings} />

      <div className="flex flex-wrap gap-2">
        <CopyResultButton text={shareText} />
        <ShareResultButton title={PAGE_TITLE} text={shareText} />
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Calculadora de custo de carro no Brasil"
      description={PAGE_DESCRIPTION}
      form={form}
      result={resultBlock}
    >
      <section className="mx-auto max-w-6xl px-4 pb-6 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <SimpleBarChart rows={result.breakdown} title="Composição do custo mensal" />
          <BreakdownTable rows={result.breakdown} caption="Breakdown de custos mensais e anuais" />
        </div>
      </section>

      <Prose>
        <h2>O que entra no custo mensal de um carro?</h2>
        <p>
          Ter carro envolve muito mais do que abastecer. O custo mensal real inclui combustível,
          IPVA, seguro, licenciamento, manutenção preventiva, troca de pneus, estacionamento,
          pedágios e a depreciação — a perda de valor natural do veículo com o tempo.
        </p>
        <ul>
          <li>
            <strong>Combustível:</strong> varia conforme consumo do carro, preço local e perfil de
            uso (cidade x estrada).
          </li>
          <li>
            <strong>IPVA:</strong> imposto estadual anual, em geral 2% a 4% do valor venal do
            veículo.
          </li>
          <li>
            <strong>Seguro:</strong> depende do perfil do motorista, da região e do modelo.
          </li>
          <li>
            <strong>Licenciamento:</strong> taxa anual obrigatória para manter o carro regularizado.
          </li>
          <li>
            <strong>Manutenção:</strong> revisões, troca de óleo, filtros, pastilhas, alinhamento.
          </li>
          <li>
            <strong>Pneus:</strong> troca a cada 40–60 mil km, dependendo do uso.
          </li>
          <li>
            <strong>Estacionamento:</strong> mensalidade fixa ou avulsos no trabalho e em viagens.
          </li>
          <li>
            <strong>Pedágios:</strong> relevantes para quem usa rodovias com frequência.
          </li>
          <li>
            <strong>Depreciação:</strong> perda silenciosa de valor, mas que faz parte do custo
            real.
          </li>
        </ul>

        <h2>Como calcular o custo por km?</h2>
        <p>
          A conta é simples: divida o custo mensal total pelo número de quilômetros rodados no mês.
          Por exemplo, se o carro custa R$ 1.600 por mês e roda 800 km, o custo por km é R$ 2,00.
          Esse número ajuda a comparar usar o carro com alternativas como aplicativos, transporte
          público ou aluguel por viagem.
        </p>

        <h2>Gasolina ou etanol: como comparar?</h2>
        <p>
          A famosa regra dos 70% diz que o etanol vale a pena quando custa até 70% do preço da
          gasolina. É uma referência útil, mas imprecisa: o consumo do seu carro com cada
          combustível pode ser diferente da média. O ideal é abastecer com cada um, anotar o consumo
          real (km/l) e usar esses valores na calculadora. No modo Flex, simulamos os dois cenários
          e mostramos qual sai mais barato com os preços e o consumo que você informou.
        </p>

        <h2>Por que considerar depreciação?</h2>
        <p>
          A depreciação não sai do seu bolso todo mês — mas é o custo mais alto e silencioso de ter
          um carro. Um veículo de R$ 50.000 que perde 8% ao ano vale cerca de R$ 4.000 a menos
          depois de 12 meses, mesmo sem rodar muito. Ignorar isso dá a falsa sensação de que o carro
          é mais barato do que realmente é, principalmente em carros novos.
        </p>

        <h2>Exemplo prático</h2>
        <p>
          Imagine um motorista que roda 800 km por mês (80% na cidade), em um carro popular que faz
          10 km/l na cidade e 13 km/l na estrada, abastecendo com gasolina a R$ 6,00 o litro. Só de
          combustível, ele gasta cerca de R$ 460 por mês. Somando IPVA, seguro, licenciamento,
          manutenção, pneus, lavagem e depreciação de um carro de R$ 50.000 a 8% ao ano, o custo
          mensal real fica próximo de R$ 1.500 — quase o triplo do que ele paga só na bomba.
        </p>

        <h2>Limitações</h2>
        <p>
          Esta calculadora gera estimativas educativas. Os valores variam por cidade, modelo,
          oficina, seguradora, perfil do motorista e preço do combustível. O resultado não é oficial
          e não substitui orçamento, contrato, cotação de seguradora ou consulta com um
          especialista. Use como ponto de partida para conversar sobre o orçamento do seu carro.
        </p>
      </Prose>

      <div className="mx-auto max-w-6xl space-y-10 px-4 pb-16 sm:px-6">
        <FAQSection items={FAQ} />
        <RelatedCalculators
          slugs={["morar-sozinho", "conta-de-luz", "assinaturas", "custo-mudanca"]}
        />
      </div>
    </CalculatorLayout>
  );
}
