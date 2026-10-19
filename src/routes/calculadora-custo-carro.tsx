import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
import { RelatedPosts } from "@/components/calculator/RelatedPosts";
import { CopyResultButton, ResetButton, ShareResultButton } from "@/components/calculator/actions";
import { Prose } from "@/components/layout/PageShell";
import { PublicDataField } from "@/components/public-data/PublicDataField";
import { Button } from "@/components/ui/button";
import { ANP_WEEKLY_SNAPSHOT } from "@/data/anp-weekly-snapshot";
import { getCalculator, relatedPostsFor } from "@/data/calculators";
import { formatBRL, formatLongDate, parseBRNumber } from "@/lib/format";
import {
  ETHANOL_YIELD_PERCENT,
  buildFuelByStateTable,
  calculateCarCost,
  type CarCostInput,
  type CarCostResult,
  type FuelType,
} from "@/lib/calculators/carCost";
import { getFuelPrice } from "@/lib/public-data/client";
import type { FuelPriceData, PublicDataUnavailable } from "@/lib/public-data/types";
import { BRAZILIAN_STATES } from "@/lib/public-data/states";
import { absoluteUrl } from "@/lib/site";
import { calculatorStructuredData } from "@/lib/structured-data";
import { usePersistedState } from "@/lib/usePersistedState";

const meta = getCalculator("custo-carro")!;
const PAGE_TITLE = "Calculadora de Custo de Carro no Brasil";
const PAGE_DESCRIPTION =
  "Estime quanto custa manter um carro por mês, incluindo combustível, IPVA, seguro, manutenção, estacionamento e depreciação.";

const DEFAULTS: CarCostInput = {
  monthlyKm: 800,
  cityConsumptionKmL: 10,
  highwayConsumptionKmL: 13,
  ethanolYieldPercent: ETHANOL_YIELD_PERCENT,
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

// Every figure the FAQ and the article quote comes from the calculator itself.
const DEFAULT_RESULT = calculateCarCost(DEFAULTS);
const FUEL_NAME: Record<FuelType, string> = {
  gasoline: "gasolina",
  flex: "gasolina",
  ethanol: "etanol",
  diesel: "diesel",
};
const DEFAULT_LITERS =
  (DEFAULTS.monthlyKm * DEFAULTS.cityUsePercent) / 100 / DEFAULTS.cityConsumptionKmL +
  (DEFAULTS.monthlyKm * (100 - DEFAULTS.cityUsePercent)) / 100 / DEFAULTS.highwayConsumptionKmL;
const DEFAULT_DEPRECIATION_SHARE = DEFAULT_RESULT.monthlyDepreciation / DEFAULT_RESULT.monthlyTotal;
const DEFAULT_DEPRECIATION_RANK =
  [...DEFAULT_RESULT.breakdown]
    .sort((a, b) => b.monthly - a.monthly)
    .findIndex((row) => row.key === "depreciation") + 1;

const STATE_NAME = new Map<string, string>(
  BRAZILIAN_STATES.map(({ value, label }) => [value, label]),
);
const FUEL_BY_STATE = buildFuelByStateTable(ANP_WEEKLY_SNAPSHOT.states, DEFAULTS).sort(
  (a, b) => (a.priceRatio ?? Infinity) - (b.priceRatio ?? Infinity),
);
const ETHANOL_STATES = FUEL_BY_STATE.filter((row) => row.cheaper === "ethanol");

/** "4 a 10 de outubro de 2026", or both dates in full across a month. */
function surveyWeek(start: string, end: string): string {
  return start.slice(0, 7) === end.slice(0, 7)
    ? `${Number(start.slice(8))} a ${formatLongDate(end)}`
    : `${formatLongDate(start)} a ${formatLongDate(end)}`;
}
const SURVEY_WEEK = surveyWeek(ANP_WEEKLY_SNAPSHOT.periodStart, ANP_WEEKLY_SNAPSHOT.periodEnd);

function percent(value: number, digits = 1): string {
  return `${(value * 100).toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}%`;
}

function liters(value: number): string {
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} litros`;
}

type FuelPriceKey = "gasolinePrice" | "ethanolPrice" | "dieselPrice";

interface PublicFieldState {
  isLoading: boolean;
  isManual: boolean;
  isStale: boolean;
  sourceName?: string;
  sourceLastUpdated?: string | null;
  sourceUrl?: string;
  sourcePeriod?: string;
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
  label: string;
}> = [
  { key: "gasolinePrice", apiFuel: "gasolina", label: "Preço da gasolina por litro" },
  { key: "ethanolPrice", apiFuel: "etanol", label: "Preço do etanol por litro" },
  { key: "dieselPrice", apiFuel: "diesel", label: "Preço do diesel por litro" },
];

const FUEL_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

type FuelRequest = (typeof FUEL_REQUESTS)[number];
type CachedFuelPrice = {
  averagePrice: number;
  field: Omit<PublicFieldState, "isLoading">;
  cachedAt: number;
};

function fuelRequestsFor(type: FuelType): FuelRequest[] {
  if (type === "flex") return FUEL_REQUESTS.filter(({ key }) => key !== "dieselPrice");
  if (type === "ethanol") return FUEL_REQUESTS.filter(({ key }) => key === "ethanolPrice");
  if (type === "diesel") return FUEL_REQUESTS.filter(({ key }) => key === "dieselPrice");
  return FUEL_REQUESTS.filter(({ key }) => key === "gasolinePrice");
}

function readFuelCache(uf: string, fuel: string): CachedFuelPrice | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(`calculadoras-brasil:anp:${uf}:${fuel}`);
    if (!raw) return null;
    const cached = JSON.parse(raw) as CachedFuelPrice;
    if (Date.now() - cached.cachedAt > FUEL_CACHE_TTL_MS) return null;
    return cached;
  } catch {
    return null;
  }
}

function writeFuelCache(uf: string, fuel: string, value: CachedFuelPrice) {
  try {
    window.localStorage.setItem(`calculadoras-brasil:anp:${uf}:${fuel}`, JSON.stringify(value));
  } catch {
    /* localStorage may be unavailable */
  }
}

type FuelFields = Record<FuelPriceKey, PublicFieldState>;

function emptyFuelFields(): FuelFields {
  return {
    gasolinePrice: { ...EMPTY_PUBLIC_FIELD },
    ethanolPrice: { ...EMPTY_PUBLIC_FIELD },
    dieselPrice: { ...EMPTY_PUBLIC_FIELD },
  };
}

function fieldFromPrice(data: FuelPriceData): Omit<PublicFieldState, "isLoading"> {
  return {
    isManual: false,
    sourceName: data.source,
    sourceLastUpdated: data.lastUpdated,
    sourceUrl: data.sourceUrl,
    sourcePeriod: data.period,
    isStale: data.isStale,
    error: null,
  };
}

function fieldFromUnavailable(
  previous: PublicFieldState,
  data: PublicDataUnavailable,
): PublicFieldState {
  return {
    ...previous,
    isLoading: false,
    isManual: true,
    sourceName: data.source,
    sourceLastUpdated: data.lastUpdated,
    sourceUrl:
      "sourceUrl" in data && typeof data.sourceUrl === "string" ? data.sourceUrl : undefined,
    isStale: data.isStale ?? false,
    error: data.notes ?? data.error ?? "Preço público indisponível.",
  };
}

function fieldFromNetworkError(previous: PublicFieldState): PublicFieldState {
  return {
    ...previous,
    isLoading: false,
    isManual: true,
    error: "Não foi possível consultar a ANP agora.",
  };
}

/**
 * Owns the ANP fuel-price lookup for the page: the per-fuel field states, the
 * 24h localStorage cache in front of the adapter, and the reload triggered when
 * the state or the fuel type changes. The UF and the fuel type are arguments
 * because they live in the page's persisted form state, and nothing loads until
 * `isRestored` says that state is the visitor's rather than the defaults; the
 * loaded price is handed back through `onPriceLoaded` rather than written here.
 */
function useFuelPrices(
  uf: string,
  fuelType: FuelType,
  isRestored: boolean,
  onPriceLoaded: (key: FuelPriceKey, price: number) => void,
) {
  const [fuelFields, setFuelFields] = useState<FuelFields>(emptyFuelFields);
  const activeFuelRequests = useMemo(() => fuelRequestsFor(fuelType), [fuelType]);

  function patchField(key: FuelPriceKey, next: (previous: PublicFieldState) => PublicFieldState) {
    setFuelFields((prev) => ({ ...prev, [key]: next(prev[key]) }));
  }

  /** Serves whatever the cache already holds and returns the requests still needing the network. */
  function serveFromCache(requests: FuelRequest[]): FuelRequest[] {
    return requests.filter(({ key, apiFuel }) => {
      const cached = readFuelCache(uf, apiFuel);
      if (!cached) return true;

      onPriceLoaded(key, cached.averagePrice);
      patchField(key, () => ({ ...cached.field, isLoading: false }));
      return false;
    });
  }

  async function fetchPrice({ key, apiFuel }: FuelRequest) {
    try {
      const data = await getFuelPrice(uf, apiFuel);
      if (!data.available) {
        patchField(key, (previous) => fieldFromUnavailable(previous, data));
        return;
      }

      onPriceLoaded(key, data.averagePrice);
      const field = fieldFromPrice(data);
      writeFuelCache(uf, apiFuel, {
        averagePrice: data.averagePrice,
        field,
        cachedAt: Date.now(),
      });
      patchField(key, () => ({ ...field, isLoading: false }));
    } catch {
      patchField(key, fieldFromNetworkError);
    }
  }

  async function loadFuelPrices(requests = activeFuelRequests) {
    const pending = serveFromCache(requests);
    if (pending.length === 0) return;

    setFuelFields((prev) => ({
      ...prev,
      ...Object.fromEntries(
        pending.map(({ key }) => [key, { ...prev[key], isLoading: true, error: null }]),
      ),
    }));

    await Promise.all(pending.map((request) => fetchPrice(request)));
  }

  useEffect(() => {
    // A lookup for the default UF would not be cancelled, and could land after the visitor's.
    if (!isRestored) return;
    void loadFuelPrices(activeFuelRequests);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uf, fuelType, isRestored]);

  function markFuelManual(key: FuelPriceKey) {
    patchField(key, (previous) => ({
      ...previous,
      isLoading: false,
      isManual: true,
      error: null,
    }));
  }

  function resetFuelFields() {
    setFuelFields(emptyFuelFields());
  }

  return {
    fuelFields,
    activeFuelRequests,
    loadFuelPrices,
    markFuelManual,
    resetFuelFields,
  };
}

const FAQ: FAQItem[] = [
  {
    question: "Quanto custa manter um carro por mês?",
    answer: `Depende do carro, do uso e da cidade, por isso a calculadora pede os seus números. No exemplo dela, um carro de ${formatBRL(DEFAULTS.carValue)} que roda ${DEFAULTS.monthlyKm} km por mês custa ${formatBRL(DEFAULT_RESULT.monthlyTotal)} por mês, ${formatBRL(DEFAULT_RESULT.annualTotal)} por ano, somando combustível, IPVA, seguro, licenciamento, manutenção, pneus, lavagem e depreciação.`,
  },
  {
    question: "Como calcular o custo por km de um carro?",
    answer: `Divida o custo mensal total pelos quilômetros rodados no mês. No exemplo da calculadora, ${formatBRL(DEFAULT_RESULT.monthlyTotal)} por ${DEFAULTS.monthlyKm} km dão ${formatBRL(DEFAULT_RESULT.costPerKm ?? 0)} por km. Como IPVA, seguro e depreciação não mudam com a quilometragem, o custo por km cai quando o carro roda mais.`,
  },
  {
    question: "A calculadora considera IPVA?",
    answer: `Sim, como valor anual dividido por 12. O IPVA é um imposto estadual sobre o valor venal do carro, e cada estado define a sua alíquota: confira a do seu no site da Secretaria da Fazenda. No exemplo, ${formatBRL(DEFAULTS.ipvaAnnual)} por ano dão ${formatBRL(DEFAULTS.ipvaAnnual / 12)} por mês.`,
  },
  {
    question: "A calculadora considera depreciação?",
    answer: `Sim. Depreciação é a perda de valor do carro, mesmo parado na garagem. A calculadora aplica o percentual anual que você informar sobre o valor do carro: no exemplo, ${DEFAULTS.depreciationAnnualPercent}% de ${formatBRL(DEFAULTS.carValue)} são ${formatBRL(DEFAULT_RESULT.monthlyDepreciation)} por mês, ${percent(DEFAULT_DEPRECIATION_SHARE, 0)} do custo total. Para estimar a do seu carro, compare o preço dele na Tabela Fipe com o de um ano antes.`,
  },
  {
    question: "Gasolina ou etanol: qual vale mais a pena?",
    answer: `Depende de quanto o etanol rende no seu carro. Na tabela de consumo do Inmetro de 2026, o etanol rende em mediana ${ETHANOL_YIELD_PERCENT}% da gasolina nos 261 carros flex a combustão, entre 66% e 73%. Daí a regra dos 70%: o etanol compensa quando custa menos de 70% do preço da gasolina. Na média de cada estado no levantamento da ANP de ${SURVEY_WEEK}, isso acontecia em ${ETHANOL_STATES.length} das ${FUEL_BY_STATE.filter((row) => row.ethanolPrice !== null).length} unidades da federação com preço dos dois combustíveis.`,
  },
  {
    question: "Quanto custa o seguro de um carro?",
    answer:
      "Depende do perfil do motorista, do modelo, da região e da cobertura, por isso a calculadora pede o valor anual da sua apólice ou cotação. Não há mais seguro obrigatório a pagar: o DPVAT foi extinto pela Lei Complementar 207/2024, e o SPVAT, que o substituiria, foi revogado pela Lei Complementar 211/2024.",
  },
  {
    question: "Quanto gasto com combustível por mês?",
    answer: `Some os litros da cidade e da estrada: quilômetros na cidade ÷ consumo na cidade + quilômetros na estrada ÷ consumo na estrada. Com ${DEFAULTS.monthlyKm} km por mês, ${DEFAULTS.cityUsePercent}% na cidade, num carro que faz ${DEFAULTS.cityConsumptionKmL} km/l na cidade e ${DEFAULTS.highwayConsumptionKmL} km/l na estrada, são ${liters(DEFAULT_LITERS)}. A ${formatBRL(DEFAULTS.gasolinePrice)} o litro, ${formatBRL(DEFAULT_RESULT.monthlyFuelCost)} por mês.`,
  },
  {
    question: "Qual é o custo de manutenção de um carro?",
    answer: `Varia com a idade do carro, a quilometragem e o plano de revisões do fabricante. O jeito mais fiel é somar o que você gastou no último ano com revisões, óleo, filtros, freios e reparos e dividir por 12. O exemplo da calculadora usa ${formatBRL(DEFAULTS.maintenanceMonthly)} por mês.`,
  },
  {
    question: "Vale a pena comprar carro à vista ou financiar?",
    answer:
      "A calculadora não simula financiamento. Financiado, o carro custa também os juros, que o Custo Efetivo Total (CET) do contrato resume. À vista, o custo é o rendimento que o dinheiro deixa de ter. Compare o CET com o que o dinheiro renderia aplicado.",
  },
  {
    question: "Como reduzir o custo do carro?",
    answer:
      "Veja no resultado quais itens pesam mais e comece por eles. Em geral ajuda: fazer as revisões no prazo, manter os pneus calibrados, cotar o seguro todo ano, abastecer com o combustível mais barato por quilômetro, e não só por litro, e rodar menos quando houver alternativa.",
  },
  {
    question: "O resultado da calculadora é garantido?",
    answer:
      "Não. É uma estimativa educativa feita com os valores que você informa. Custos reais variam por cidade, marca, modelo, seguradora, oficina e hábitos. Use como ponto de partida, não como orçamento oficial.",
  },
];

export const Route = createFileRoute("/calculadora-custo-carro")({
  head: () => ({
    meta: [
      { title: `${PAGE_TITLE} | Calcule Brasil` },
      { name: "description", content: PAGE_DESCRIPTION },
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: PAGE_DESCRIPTION },
      { property: "og:url", content: absoluteUrl(meta.path) },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl(meta.path) }],
    scripts: calculatorStructuredData({
      name: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      path: meta.path,
      applicationCategory: "FinanceApplication",
      faq: FAQ,
    }),
  }),
  component: CarCostPage,
});

function CarCostPage() {
  const [input, setInput] = usePersistedState<CarCostInput>(
    "calculadoras-brasil:custo-carro:input:v2",
    DEFAULTS,
  );
  // Both persisted values restore in the same layout pass, so this flag covers the input too.
  const [uf, setUf, isRestored] = usePersistedState("calculadoras-brasil:custo-carro:uf:v1", "SP");

  function update<K extends keyof CarCostInput>(key: K, value: CarCostInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  const fuelPrices = useFuelPrices(uf, input.fuelType, isRestored, (key, price) =>
    update(key, price),
  );
  const result = useMemo(() => calculateCarCost(input), [input]);

  function updateFuelManually(key: FuelPriceKey, value: string) {
    update(key, parseBRNumber(value));
    fuelPrices.markFuelManual(key);
  }

  function reset() {
    setInput(DEFAULTS);
    setUf("SP");
    fuelPrices.resetFuelFields();
  }

  const shareText = `Custo mensal estimado do carro: ${formatBRL(result.monthlyTotal)} (anual: ${formatBRL(result.annualTotal)})${
    result.costPerKm !== null ? ` — ${formatBRL(result.costPerKm)}/km` : ""
  }`;

  return (
    <CalculatorLayout
      title="Calculadora de custo de carro no Brasil"
      description={PAGE_DESCRIPTION}
      form={
        <CarCostForm
          input={input}
          uf={uf}
          fuelFields={fuelPrices.fuelFields}
          activeFuelRequests={fuelPrices.activeFuelRequests}
          onUpdate={update}
          onUfChange={setUf}
          onFuelManualChange={updateFuelManually}
          onRefreshFuel={() => fuelPrices.loadFuelPrices()}
          onReset={reset}
        />
      }
      result={<CarCostResults result={result} shareText={shareText} />}
    >
      <section className="mx-auto max-w-6xl px-4 pb-6 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <SimpleBarChart rows={result.breakdown} title="Composição do custo mensal" />
          <BreakdownTable rows={result.breakdown} caption="Breakdown de custos mensais e anuais" />
        </div>
      </section>

      <FuelByStateSection />

      <CarCostArticle />

      <div className="mx-auto max-w-6xl space-y-10 px-4 pb-16 sm:px-6">
        <FAQSection items={FAQ} />
        <RelatedCalculators
          slugs={["morar-sozinho", "conta-de-luz", "assinaturas", "custo-mudanca"]}
        />
        <RelatedPosts slugs={relatedPostsFor("custo-carro")} />
      </div>
    </CalculatorLayout>
  );
}

interface CarCostFormProps {
  input: CarCostInput;
  uf: string;
  fuelFields: FuelFields;
  activeFuelRequests: FuelRequest[];
  onUpdate: <K extends keyof CarCostInput>(key: K, value: CarCostInput[K]) => void;
  onUfChange: (uf: string) => void;
  onFuelManualChange: (key: FuelPriceKey, value: string) => void;
  onRefreshFuel: () => void;
  onReset: () => void;
}

function CarCostForm({
  input,
  uf,
  fuelFields,
  activeFuelRequests,
  onUpdate,
  onUfChange,
  onFuelManualChange,
  onRefreshFuel,
  onReset,
}: CarCostFormProps) {
  return (
    <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
      <UsageSection input={input} onUpdate={onUpdate} />

      <FuelSection
        input={input}
        uf={uf}
        fuelFields={fuelFields}
        activeFuelRequests={activeFuelRequests}
        onUpdate={onUpdate}
        onUfChange={onUfChange}
        onFuelManualChange={onFuelManualChange}
        onRefreshFuel={onRefreshFuel}
      />

      <VehicleCostsSection input={input} onUpdate={onUpdate} />

      <RunningCostsSection input={input} onUpdate={onUpdate} />

      <DisclaimerBox>
        Os valores padrão acima são apenas exemplos editáveis — não representam dados oficiais.
        Substitua pelos seus próprios números para uma estimativa mais próxima da realidade.
      </DisclaimerBox>

      <div className="flex flex-wrap gap-2">
        <ResetButton onReset={onReset} />
      </div>
    </form>
  );
}

interface SectionProps {
  input: CarCostInput;
  onUpdate: CarCostFormProps["onUpdate"];
}

function UsageSection({ input, onUpdate }: SectionProps) {
  return (
    <FormSection title="Uso do carro">
      <NumberInput
        label="Quilômetros rodados por mês"
        value={input.monthlyKm}
        onChange={(v) => onUpdate("monthlyKm", v)}
        suffix="km"
      />
      <PercentageInput
        label="Percentual de uso na cidade"
        value={input.cityUsePercent}
        onChange={(v) => onUpdate("cityUsePercent", v)}
        hint="O restante é considerado uso em estrada."
      />
      <NumberInput
        label={`Consumo na cidade com ${FUEL_NAME[input.fuelType]} (km/l)`}
        value={input.cityConsumptionKmL}
        onChange={(v) => onUpdate("cityConsumptionKmL", v)}
        step={0.1}
        suffix="km/l"
      />
      <NumberInput
        label={`Consumo na estrada com ${FUEL_NAME[input.fuelType]} (km/l)`}
        value={input.highwayConsumptionKmL}
        onChange={(v) => onUpdate("highwayConsumptionKmL", v)}
        step={0.1}
        suffix="km/l"
      />
    </FormSection>
  );
}

type FuelSectionProps = SectionProps &
  Pick<
    CarCostFormProps,
    | "uf"
    | "fuelFields"
    | "activeFuelRequests"
    | "onUfChange"
    | "onFuelManualChange"
    | "onRefreshFuel"
  >;

function FuelSection({
  input,
  uf,
  fuelFields,
  activeFuelRequests,
  onUpdate,
  onUfChange,
  onFuelManualChange,
  onRefreshFuel,
}: FuelSectionProps) {
  const isLoading = activeFuelRequests.some(({ key }) => fuelFields[key].isLoading);

  return (
    <FormSection
      title="Combustível"
      description="No modo Flex, comparamos gasolina e etanol para indicar o mais barato no seu cenário."
    >
      <SelectField
        label="Estado para consultar preços médios"
        value={uf}
        onChange={onUfChange}
        options={[...BRAZILIAN_STATES]}
        hint="A consulta usa médias públicas quando disponíveis. O preço do seu posto pode ser diferente."
      />
      <SelectField
        label="Tipo de combustível"
        value={input.fuelType}
        onChange={(v) => onUpdate("fuelType", v as FuelType)}
        options={[
          { value: "gasoline", label: "Gasolina" },
          { value: "ethanol", label: "Etanol" },
          { value: "diesel", label: "Diesel" },
          { value: "flex", label: "Flex automático (compara gasolina x etanol)" },
        ]}
      />
      {input.fuelType === "flex" ? (
        <PercentageInput
          label="Rendimento do etanol"
          value={input.ethanolYieldPercent}
          onChange={(v) => onUpdate("ethanolYieldPercent", v)}
          hint={`Quanto o etanol rende, em % do consumo com gasolina. A mediana dos carros flex na tabela do Inmetro de 2026 é ${ETHANOL_YIELD_PERCENT}%; a etiqueta do seu carro traz os dois consumos.`}
        />
      ) : null}
      <div className="sm:col-span-2">
        <Button
          type="button"
          variant="outline"
          onClick={onRefreshFuel}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? <LoaderCircle className="animate-spin" /> : null}
          Atualizar preço da ANP
        </Button>
      </div>
      {activeFuelRequests.map(({ key, label }) => (
        <div key={key} className="sm:col-span-2">
          <PublicDataField
            label={label}
            value={input[key]}
            onManualChange={(value) => onFuelManualChange(key, value)}
            {...fuelFields[key]}
            helperText="Valor em R$/litro; você pode editar mesmo após carregar."
          />
        </div>
      ))}
    </FormSection>
  );
}

function VehicleCostsSection({ input, onUpdate }: SectionProps) {
  return (
    <FormSection title="Custos do veículo">
      <CurrencyInput
        label="Valor aproximado do carro"
        value={input.carValue}
        onChange={(v) => onUpdate("carValue", v)}
      />
      <PercentageInput
        label="Depreciação anual estimada"
        value={input.depreciationAnnualPercent}
        onChange={(v) => onUpdate("depreciationAnnualPercent", v)}
        hint="Carros novos costumam depreciar entre 8% e 15% ao ano."
        step={0.5}
      />
      <CurrencyInput
        label="IPVA anual"
        value={input.ipvaAnnual}
        onChange={(v) => onUpdate("ipvaAnnual", v)}
      />
      <CurrencyInput
        label="Seguro anual"
        value={input.insuranceAnnual}
        onChange={(v) => onUpdate("insuranceAnnual", v)}
      />
      <CurrencyInput
        label="Licenciamento anual"
        value={input.licensingAnnual}
        onChange={(v) => onUpdate("licensingAnnual", v)}
      />
    </FormSection>
  );
}

function RunningCostsSection({ input, onUpdate }: SectionProps) {
  return (
    <FormSection title="Custos de uso">
      <CurrencyInput
        label="Manutenção mensal"
        value={input.maintenanceMonthly}
        onChange={(v) => onUpdate("maintenanceMonthly", v)}
        hint="Inclui revisões, óleo, peças e mão de obra diluídos por mês."
      />
      <CurrencyInput
        label="Pneus por ano"
        value={input.tiresAnnual}
        onChange={(v) => onUpdate("tiresAnnual", v)}
      />
      <CurrencyInput
        label="Estacionamento mensal"
        value={input.parkingMonthly}
        onChange={(v) => onUpdate("parkingMonthly", v)}
      />
      <CurrencyInput
        label="Pedágios mensais"
        value={input.tollsMonthly}
        onChange={(v) => onUpdate("tollsMonthly", v)}
      />
      <CurrencyInput
        label="Lavagem mensal"
        value={input.washingMonthly}
        onChange={(v) => onUpdate("washingMonthly", v)}
      />
      <CurrencyInput
        label="Multas e outros custos mensais"
        value={input.finesAndOthersMonthly}
        onChange={(v) => onUpdate("finesAndOthersMonthly", v)}
      />
    </FormSection>
  );
}

function CarCostResults({ result, shareText }: { result: CarCostResult; shareText: string }) {
  return (
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
}

function FuelByStateSection() {
  const noEthanol = FUEL_BY_STATE.filter((row) => row.ethanolPrice === null);

  return (
    <Prose>
      <h2>Etanol ou gasolina em cada estado</h2>
      <p>
        A tabela foi calculada pela própria calculadora no modo Flex, para o carro do exemplo:{" "}
        {DEFAULTS.monthlyKm} km por mês, {DEFAULTS.cityConsumptionKmL} km/l na cidade e{" "}
        {DEFAULTS.highwayConsumptionKmL} km/l na estrada com gasolina, e o etanol rendendo{" "}
        {ETHANOL_YIELD_PERCENT}% disso. Os preços são a média de cada estado no levantamento semanal
        da ANP de {SURVEY_WEEK}. O etanol saía mais barato em {ETHANOL_STATES.length} estados, os
        primeiros da lista.
      </p>
      <div className="not-prose overflow-x-auto rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)]">
        <table className="w-full min-w-[640px] text-sm">
          <caption className="sr-only">
            Preço médio da gasolina e do etanol por estado e qual sai mais barato por mês
          </caption>
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th scope="col" className="px-3 py-2.5">
                Estado
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Gasolina
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Etanol
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Etanol ÷ gasolina
              </th>
              <th scope="col" className="px-3 py-2.5">
                Mais barato
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Economia por mês
              </th>
            </tr>
          </thead>
          <tbody>
            {FUEL_BY_STATE.map((row) => (
              <tr key={row.uf} className="border-t border-border/70">
                <th scope="row" className="px-3 py-2 text-left font-medium text-foreground">
                  {STATE_NAME.get(row.uf) ?? row.uf}
                </th>
                <td className="px-3 py-2 text-right">{formatBRL(row.gasolinePrice)}</td>
                <td className="px-3 py-2 text-right">
                  {row.ethanolPrice === null ? "—" : formatBRL(row.ethanolPrice)}
                </td>
                <td className="px-3 py-2 text-right">
                  {row.priceRatio === null ? "—" : percent(row.priceRatio)}
                </td>
                <td className="px-3 py-2">
                  {row.cheaper === null
                    ? "sem preço de etanol"
                    : row.cheaper === "ethanol"
                      ? "Etanol"
                      : row.cheaper === "gasoline"
                        ? "Gasolina"
                        : "Empate"}
                </td>
                <td className="px-3 py-2 text-right font-semibold text-foreground">
                  {row.cheaper === null ? "—" : formatBRL(row.monthlySaving)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Fonte:{" "}
        <a href={ANP_WEEKLY_SNAPSHOT.sourceUrl} target="_blank" rel="noreferrer">
          planilha do levantamento semanal da ANP
        </a>
        , semana de {SURVEY_WEEK}.
        {noEthanol.length > 0
          ? ` A ANP não publicou preço de etanol naquela semana em: ${noEthanol
              .map((row) => STATE_NAME.get(row.uf) ?? row.uf)
              .join(", ")}.`
          : null}{" "}
        Os preços mudam toda semana e de posto para posto: para o seu caso, escolha o estado no
        formulário, que consulta o levantamento mais recente, ou informe o preço que você paga.
      </p>
    </Prose>
  );
}

function CarCostArticle() {
  return (
    <Prose collapsibleTitle="Saiba mais sobre o custo de um carro">
      <h2>O que entra no custo mensal de um carro?</h2>
      <p>
        Ter carro envolve muito mais do que abastecer. O custo mensal real inclui combustível, IPVA,
        seguro, licenciamento, manutenção preventiva, troca de pneus, estacionamento, pedágios e a
        depreciação — a perda de valor natural do veículo com o tempo.
      </p>
      <ul>
        <li>
          <strong>Combustível:</strong> varia conforme consumo do carro, preço local e perfil de uso
          (cidade x estrada).
        </li>
        <li>
          <strong>IPVA:</strong> imposto estadual anual sobre o valor venal do veículo, com alíquota
          definida por cada estado.
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
          <strong>Pneus:</strong> troca conforme o desgaste e a indicação do fabricante.
        </li>
        <li>
          <strong>Estacionamento:</strong> mensalidade fixa ou avulsos no trabalho e em viagens.
        </li>
        <li>
          <strong>Pedágios:</strong> relevantes para quem usa rodovias com frequência.
        </li>
        <li>
          <strong>Depreciação:</strong> perda silenciosa de valor, mas que faz parte do custo real.
        </li>
      </ul>

      <h2>Como calcular o custo por km?</h2>
      <p>
        A conta é simples: divida o custo mensal total pelo número de quilômetros rodados no mês. No
        exemplo da calculadora, {formatBRL(DEFAULT_RESULT.monthlyTotal)} por mês e{" "}
        {DEFAULTS.monthlyKm} km dão {formatBRL(DEFAULT_RESULT.costPerKm ?? 0)} por km. Esse número
        ajuda a comparar usar o carro com alternativas como aplicativos, transporte público ou
        aluguel por viagem.
      </p>

      <h2>Gasolina ou etanol: como comparar?</h2>
      <p>
        A regra dos 70% diz que o etanol vale a pena quando custa menos de 70% do preço da gasolina,
        porque um litro de etanol leva o carro menos longe. Na tabela de consumo do Inmetro de 2026,
        o etanol rende em mediana {ETHANOL_YIELD_PERCENT}% da gasolina nos 261 carros flex a
        combustão, de 66% no que rende menos a 73% no que rende mais. A regra vale na média, e o seu
        carro pode ficar alguns pontos acima ou abaixo: a etiqueta do Inmetro, ou o consumo que você
        anota abastecendo com cada um, dá o número dele. No modo Flex, a calculadora aplica esse
        rendimento ao consumo com gasolina e mostra qual combustível sai mais barato por mês.
      </p>

      <h2>Por que considerar depreciação?</h2>
      <p>
        A depreciação não sai do seu bolso todo mês, mas é custo: um veículo de{" "}
        {formatBRL(DEFAULTS.carValue)} que perde {DEFAULTS.depreciationAnnualPercent}% ao ano vale{" "}
        {formatBRL((DEFAULTS.carValue * DEFAULTS.depreciationAnnualPercent) / 100)} a menos depois
        de 12 meses, mesmo sem rodar muito. No exemplo da calculadora, ela é o{" "}
        {DEFAULT_DEPRECIATION_RANK}º maior custo do mês. Ignorá-la dá a falsa sensação de que o
        carro é mais barato do que realmente é.
      </p>

      <h2>Exemplo prático</h2>
      <p>
        Imagine um motorista que roda {DEFAULTS.monthlyKm} km por mês ({DEFAULTS.cityUsePercent}% na
        cidade), em um carro que faz {DEFAULTS.cityConsumptionKmL} km/l na cidade e{" "}
        {DEFAULTS.highwayConsumptionKmL} km/l na estrada, abastecendo com gasolina a{" "}
        {formatBRL(DEFAULTS.gasolinePrice)} o litro. Só de combustível, ele gasta{" "}
        {formatBRL(DEFAULT_RESULT.monthlyFuelCost)} por mês. Somando IPVA, seguro, licenciamento,
        manutenção, pneus, lavagem e depreciação de um carro de {formatBRL(DEFAULTS.carValue)} a{" "}
        {DEFAULTS.depreciationAnnualPercent}% ao ano, o custo mensal fica em{" "}
        {formatBRL(DEFAULT_RESULT.monthlyTotal)}:{" "}
        {(DEFAULT_RESULT.monthlyTotal / DEFAULT_RESULT.monthlyFuelCost).toLocaleString("pt-BR", {
          maximumFractionDigits: 1,
        })}{" "}
        vezes o que ele paga só na bomba.
      </p>

      <h2>Fonte dos preços de combustível</h2>
      <p>
        O preenchimento automático consulta o{" "}
        <a
          href="https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/levantamento-de-precos-de-combustiveis-ultimas-semanas-pesquisadas"
          target="_blank"
          rel="noreferrer"
        >
          levantamento semanal oficial da ANP
        </a>
        . Quando a consulta funciona, mostramos o período pesquisado, a data de atualização do cache
        e um link para a fonte utilizada. A média estadual não representa necessariamente o preço da
        sua cidade ou do seu posto; por isso, o campo permanece editável.
      </p>

      <h2>Limitações</h2>
      <p>
        Esta calculadora gera estimativas educativas. Os valores variam por cidade, modelo, oficina,
        seguradora, perfil do motorista e preço do combustível. O resultado não é oficial e não
        substitui orçamento, contrato, cotação de seguradora ou consulta com um especialista. Use
        como ponto de partida para conversar sobre o orçamento do seu carro.
      </p>
    </Prose>
  );
}
