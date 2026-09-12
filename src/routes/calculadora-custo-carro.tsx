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
import { getCalculator, relatedPostsFor } from "@/data/calculators";
import { formatBRL, parseBRNumber } from "@/lib/format";
import {
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
 * because they live in the page's persisted form state; the loaded price is
 * handed back through `onPriceLoaded` rather than written here.
 */
function useFuelPrices(
  uf: string,
  fuelType: FuelType,
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
    void loadFuelPrices(activeFuelRequests);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uf, fuelType]);

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
    answer:
      "Depende do carro, do uso e da cidade. Em média, um carro popular custa entre R$ 1.200-1.500/mês. Carros intermediários custam R$ 1.800-2.500/mês. Carros premium podem ultrapassar R$ 3.000/mês. Use a calculadora com seus números para estimativa personalizada.",
  },
  {
    question: "Qual é o custo anual total de ter um carro?",
    answer:
      "Um carro popular custa R$ 14.400-18.000/ano. Um carro intermediário custa R$ 21.600-30.000/ano. Carros premium custam R$ 36.000+/ano. O carro mais barato não é o mais econômico. Considere custo total, não só preço.",
  },
  {
    question: "Como calcular o custo por km de um carro?",
    answer:
      "Divida o custo mensal total pelos quilômetros rodados no mês. Exemplo: se gasta R$ 2.000/mês e roda 1.000 km, o custo é R$ 2,00 por km. Carros populares custam R$ 1,50-2,50/km. Carros premium custam R$ 3,00-4,00+/km.",
  },
  {
    question: "A calculadora considera IPVA?",
    answer:
      "Sim. O IPVA varia por estado (2-4%) e valor do carro. Uma calculadora divide o valor anual por 12 para distribuir mensalmente. Exemplo: carro de R$ 50.000 com alíquota de 3% = R$ 1.500/ano = R$ 125/mês.",
  },
  {
    question: "A calculadora considera depreciação?",
    answer:
      "Sim. Depreciação é a perda de valor do veículo (mesmo parado na garagem). Um carro novo perde 15-20% no primeiro ano. Isso é custo real que muitos ignoram. A depreciação representa 30-40% do custo total.",
  },
  {
    question: "Gasolina ou etanol: qual vale mais a pena?",
    answer:
      "Regra dos 70%: etanol vale a pena se custar até 70% do preço da gasolina. Mas depende do consumo específico do seu carro. Carros flex modernos costumam rodar mais com gasolina.",
  },
  {
    question: "Quanto custa o seguro de um carro?",
    answer:
      "DPVAT (obrigatório) custa R$ 150-200/ano. Seguro completo varia bastante: carros populares custam R$ 80-150/mês. Carros intermediários custam R$ 120-250/mês. Preço depende de idade, perfil, histórico e região.",
  },
  {
    question: "Quanto gasto com combustível por mês?",
    answer:
      "Depende de 3 fatores: quilometragem mensal, consumo do carro (km/l) e preço do combustível. Exemplo: 800 km/mês, carro que faz 10 km/l, gasolina a R$ 6,00 = 80 litros × R$ 6 = R$ 480/mês.",
  },
  {
    question: "Qual é o custo de manutenção de um carro?",
    answer:
      "Carros novos (até 3 anos) custam R$ 100-200/mês em manutenção preventiva. Carros com 5-7 anos custam R$ 150-300/mês. Carros com 10+ anos custam R$ 300-500+/mês. Manutenção preventiva é mais barata que reparos de emergência.",
  },
  {
    question: "Quanto custa estacionamento de carro?",
    answer:
      "Em grandes cidades (SP, RJ, BH) estacionamento custa R$ 50-300/mês. Em cidades menores, pode ser zero. Se usar metrô/ônibus, economiza R$ 50-150/mês apenas em estacionamento. Considere essa despesa na sua decisão.",
  },
  {
    question: "Vale a pena comprar carro à vista ou financiar?",
    answer:
      "Depende do juros e da sua situação financeira. Com juros altos (12%+/ano), financiar fica caro. À vista você economiza em juros, mas imobiliza capital. Use a calculadora com diferentes cenários para ver o impacto real.",
  },
  {
    question: "Como reduzir o custo de manutenção do carro?",
    answer:
      "1) Respeite prazos de revisão. 2) Use óleo de qualidade. 3) Mantenha pneus calibrados (reduz consumo 3-5%). 4) Dirija de forma suave (menos desgaste). 5) Evite multas (são custo real). Um carro bem mantido custa 30-40% menos.",
  },
  {
    question: "O resultado da calculadora é garantido?",
    answer:
      "Não. Esta é uma estimativa educativa baseada em médias nacionais e valores que você informa. Custos reais variam por cidade, marca, modelo, seguradora, oficina e seus hábitos. Use como ponto de partida, não como orçamento oficial.",
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
    "calculadoras-brasil:custo-carro:input:v1",
    DEFAULTS,
  );
  const [uf, setUf] = usePersistedState("calculadoras-brasil:custo-carro:uf:v1", "SP");

  function update<K extends keyof CarCostInput>(key: K, value: CarCostInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  const fuelPrices = useFuelPrices(uf, input.fuelType, (key, price) => update(key, price));
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
        label="Consumo na cidade (km/l)"
        value={input.cityConsumptionKmL}
        onChange={(v) => onUpdate("cityConsumptionKmL", v)}
        step={0.1}
        suffix="km/l"
      />
      <NumberInput
        label="Consumo na estrada (km/l)"
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
          <strong>IPVA:</strong> imposto estadual anual, em geral 2% a 4% do valor venal do veículo.
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
          <strong>Depreciação:</strong> perda silenciosa de valor, mas que faz parte do custo real.
        </li>
      </ul>

      <h2>Como calcular o custo por km?</h2>
      <p>
        A conta é simples: divida o custo mensal total pelo número de quilômetros rodados no mês.
        Por exemplo, se o carro custa R$ 1.600 por mês e roda 800 km, o custo por km é R$ 2,00. Esse
        número ajuda a comparar usar o carro com alternativas como aplicativos, transporte público
        ou aluguel por viagem.
      </p>

      <h2>Gasolina ou etanol: como comparar?</h2>
      <p>
        A famosa regra dos 70% diz que o etanol vale a pena quando custa até 70% do preço da
        gasolina. É uma referência útil, mas imprecisa: o consumo do seu carro com cada combustível
        pode ser diferente da média. O ideal é abastecer com cada um, anotar o consumo real (km/l) e
        usar esses valores na calculadora. No modo Flex, simulamos os dois cenários e mostramos qual
        sai mais barato com os preços e o consumo que você informou.
      </p>

      <h2>Por que considerar depreciação?</h2>
      <p>
        A depreciação não sai do seu bolso todo mês — mas é o custo mais alto e silencioso de ter um
        carro. Um veículo de R$ 50.000 que perde 8% ao ano vale cerca de R$ 4.000 a menos depois de
        12 meses, mesmo sem rodar muito. Ignorar isso dá a falsa sensação de que o carro é mais
        barato do que realmente é, principalmente em carros novos.
      </p>

      <h2>Exemplo prático</h2>
      <p>
        Imagine um motorista que roda 800 km por mês (80% na cidade), em um carro popular que faz 10
        km/l na cidade e 13 km/l na estrada, abastecendo com gasolina a R$ 6,00 o litro. Só de
        combustível, ele gasta cerca de R$ 460 por mês. Somando IPVA, seguro, licenciamento,
        manutenção, pneus, lavagem e depreciação de um carro de R$ 50.000 a 8% ao ano, o custo
        mensal real fica próximo de R$ 1.500 — quase o triplo do que ele paga só na bomba.
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
