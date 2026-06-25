import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, Plus, Table as TableIcon, Trash2 } from "lucide-react";
import { CalculatorLayout, FormSection } from "@/components/calculator/CalculatorLayout";
import { SearchableSelectField } from "@/components/calculator/SearchableSelectField";
import { NumberInput, SelectField } from "@/components/calculator/fields";
import {
  buildColorMap,
  DisclaimerBox,
  ResultSummaryCard,
  SimpleBarChart,
  WarningList,
  type BreakdownRow,
} from "@/components/calculator/results";
import { FAQSection, type FAQItem } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { CopyResultButton, ResetButton, ShareResultButton } from "@/components/calculator/actions";
import { Prose } from "@/components/layout/PageShell";
import { PublicDataField } from "@/components/public-data/PublicDataField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCalculator } from "@/data/calculators";
import { formatBRL, formatNumber, parseBRNumber } from "@/lib/format";
import {
  APPLIANCE_PRESETS,
  calculateElectricityBill,
  type ApplianceInput,
} from "@/lib/calculators/electricityBill";
import { getEnergyDistributors, getEnergyTariff } from "@/lib/public-data/client";
import type { EnergyDistributorOption } from "@/lib/public-data/types";
import { BRAZILIAN_STATES } from "@/lib/public-data/states";
import { absoluteUrl } from "@/lib/site";
import { calculatorStructuredData } from "@/lib/structured-data";
import { usePersistedState } from "@/lib/usePersistedState";

const meta = getCalculator("conta-de-luz")!;
const PAGE_TITLE = "Calculadora de conta de luz por aparelho";
const PAGE_DESCRIPTION =
  "Calcule o consumo mensal em kWh e o custo aproximado de cada aparelho da sua casa usando potência, tempo de uso e tarifa.";

let _id = 0;
const nextId = () => `a${++_id}_${Date.now().toString(36)}`;

const DEFAULT_APPLIANCES: ApplianceInput[] = [
  { id: nextId(), name: "Geladeira", watts: 130, hoursPerDay: 24, daysPerMonth: 30, quantity: 1 },
  {
    id: nextId(),
    name: "Chuveiro elétrico",
    watts: 5500,
    hoursPerDay: 0.25,
    daysPerMonth: 30,
    quantity: 1,
  },
  {
    id: nextId(),
    name: "Ar-condicionado 9.000 BTUs",
    watts: 900,
    hoursPerDay: 8,
    daysPerMonth: 30,
    quantity: 1,
  },
  { id: nextId(), name: 'TV LED 50"', watts: 100, hoursPerDay: 5, daysPerMonth: 30, quantity: 1 },
  { id: nextId(), name: "Notebook", watts: 65, hoursPerDay: 6, daysPerMonth: 22, quantity: 1 },
  { id: nextId(), name: "Lâmpada LED", watts: 10, hoursPerDay: 5, daysPerMonth: 30, quantity: 6 },
];

const DEFAULT_TARIFF = 0.95;

interface PublicFieldState {
  isLoading: boolean;
  isManual: boolean;
  isStale: boolean;
  sourceName?: string;
  sourceLastUpdated?: string | null;
  sourceUrl?: string;
  error?: string | null;
}

const FAQ: FAQItem[] = [
  {
    question: "Qual é a tarifa média de energia no Brasil?",
    answer:
      "Varia bastante por estado: SP/RJ ~R$ 0,80-1,00/kWh. São mais caras: AM (R$ 0,90+), mais baratas: MA (R$ 0,60-0,70). Consulte sua fatura de luz para a tarifa exata.",
  },
  {
    question: "Como sei a tarifa de energia da minha região?",
    answer:
      "Aparece na sua conta de luz, normalmente em R$/kWh. Já inclui impostos (ICMS, PIS, Cofins). Bandeira tarifária pode somar 15-50% (amarela/vermelha). Use o valor total da fatura para estimativas realistas.",
  },
  {
    question: "Qual aparelho consome mais energia?",
    answer:
      "Ar-condicionado (3.000-5.000W), chuveiro elétrico (5.500W), máquina de lavar (2.000W), geladeira (500W 24h). Ar-condicionado é o maior vilão se ligado muito. Chuveiro elétrico é segundo porque usa muita potência rápido.",
  },
  {
    question: "Quanto custa ligar ar-condicionado 8 horas/dia?",
    answer:
      "Ar de 3.000W × 8h × 30 dias = 720 kWh. Preço: 720 kWh × R$ 0,80/kWh = R$ 576/mês (aprox). Ar de 5.000W pode custar R$ 1.000+/mês. É realmente o maior custo.",
  },
  {
    question: "Por que o chuveiro elétrico consome tanto?",
    answer:
      "Potência altíssima: 5.500W normalmente. Mesmo 5-10 minutos = 450-900Wh por banho. 2 banhos/dia × 30 dias = 27-54 kWh/mês (R$ 20-40). Chuveiro morno (40°C) consome metade.",
  },
  {
    question: "Como economizar na conta de luz?",
    answer:
      "1) Trocar lâmpadas por LED (80% economia). 2) Ar-condicionado: 24°C em vez de 18°C = 30% economia. 3) Desligar da tomada (reduz standby em 5%). 4) Banho morno (economia 50% do chuveiro). 5) Máquina com água fria.",
  },
  {
    question: "Geladeira consome muito?",
    answer:
      "Consome 24/7, mas menos que ar-condicionado. Uma geladeira média (500W) funciona ~4 horas/dia = 60 kWh/mês = R$ 48. Geladeiras velhas consomem 2-3x mais. Manutenção regular reduz consumo.",
  },
  {
    question: "Quanto custa manter máquina de lavar ligada?",
    answer:
      "Máquina de 2.000W por 1 hora = 2 kWh. Lavar 3x/semana = ~24 kWh/mês = R$ 19/mês. Água fria em vez de quente reduz em 30% (a maior parte do consumo é para aquecer água).",
  },
  {
    question: "Onde encontro a potência (W) de um aparelho?",
    answer:
      "Na etiqueta de trás ou embaixo. Manual do aparelho também. Às vezes tem VA (volt-ampere) — use como aproximação. Se não encontrar, busque o modelo online.",
  },
  {
    question: "A bandeira tarifária afeta meu cálculo?",
    answer:
      "Sim. Bandeira verde = tarifa normal. Amarela = +7,5%. Vermelha = +15% ou +25%. Se você informar a tarifa total com bandeira, o resultado já está incluído. Bandeiras mudam mensalmente.",
  },
  {
    question: "Como reduzir a conta de luz sem perder conforto?",
    answer:
      "LED em tudo (economia 80%). Ar-condicionado a 24-26°C (economia 30%). Banho morno (economia 50%). Desligar da tomada (economia 5%). Máquina com água fria (economia 30%). Juntas: redução 20-40%.",
  },
  {
    question: "O resultado funciona para qualquer cidade?",
    answer:
      "Sim, basta ajustar tarifa em R$/kWh conforme sua distribuidora. Cálculo de kWh não muda. Só muda o preço final. Bandeira tarifária também varia por região.",
  },
];

export const Route = createFileRoute("/calculadora-conta-de-luz")({
  head: () => ({
    meta: [
      { title: `${PAGE_TITLE} — Calcule Brasil` },
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
      applicationCategory: "UtilitiesApplication",
      faq: FAQ,
    }),
  }),
  component: ElectricityPage,
});

function ElectricityPage() {
  const [tariff, setTariff] = usePersistedState<number>(
    "calculadoras-brasil:conta-luz:tariff:v1",
    DEFAULT_TARIFF,
  );
  const [appliances, setAppliances] = usePersistedState<ApplianceInput[]>(
    "calculadoras-brasil:conta-luz:appliances:v1",
    DEFAULT_APPLIANCES,
  );
  const [presetValue, setPresetValue] = useState<string>("");
  const [uf, setUf] = usePersistedState("calculadoras-brasil:conta-luz:uf:v1", "SP");
  const [distributor, setDistributor] = usePersistedState(
    "calculadoras-brasil:conta-luz:distributor:v1",
    "",
  );
  const [distributors, setDistributors] = useState<EnergyDistributorOption[]>([]);
  const [isLoadingDistributors, setIsLoadingDistributors] = useState(false);
  const [tariffState, setTariffState] = useState<PublicFieldState>({
    isLoading: false,
    isManual: true,
    isStale: false,
  });

  const result = useMemo(
    () => calculateElectricityBill({ tariff, appliances }),
    [tariff, appliances],
  );

  function updateAppliance(id: string, patch: Partial<ApplianceInput>) {
    setAppliances((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }
  function removeAppliance(id: string) {
    setAppliances((prev) => prev.filter((a) => a.id !== id));
  }
  function addAppliance() {
    setAppliances((prev) => [
      ...prev,
      {
        id: nextId(),
        name: "Novo aparelho",
        watts: 100,
        hoursPerDay: 1,
        daysPerMonth: 30,
        quantity: 1,
      },
    ]);
  }
  function addPreset(name: string) {
    const preset = APPLIANCE_PRESETS.find((p) => p.name === name);
    if (!preset) return;
    setAppliances((prev) => [
      ...prev,
      {
        id: nextId(),
        name: preset.name,
        watts: preset.watts,
        hoursPerDay: preset.hoursPerDay,
        daysPerMonth: preset.daysPerMonth,
        quantity: 1,
      },
    ]);
    setPresetValue("");
  }
  function reset() {
    setTariff(DEFAULT_TARIFF);
    setAppliances(DEFAULT_APPLIANCES.map((a) => ({ ...a, id: nextId() })));
    setUf("SP");
    setDistributor("");
    setTariffState({ isLoading: false, isManual: true, isStale: false });
  }

  function updateUf(value: string) {
    setUf(value);
    setDistributor("");
    setTariffState({ isLoading: false, isManual: true, isStale: false });
  }

  function updateTariffManually(value: string) {
    setTariff(parseBRNumber(value));
    setTariffState((prev) => ({
      ...prev,
      isLoading: false,
      isManual: true,
      error: null,
    }));
  }

  async function loadEnergyTariff() {
    if (!distributor.trim()) return;
    setTariffState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const data = await getEnergyTariff(uf, distributor.trim() || undefined);
      if (!data.available) {
        setTariffState({
          isLoading: false,
          isManual: true,
          sourceName: data.source,
          sourceLastUpdated: data.lastUpdated,
          sourceUrl:
            "sourceUrl" in data && typeof data.sourceUrl === "string" ? data.sourceUrl : undefined,
          isStale: data.isStale ?? false,
          error: data.notes ?? data.error ?? "Tarifa pública indisponível.",
        });
        return;
      }

      setTariff(data.tariffKwh);
      setDistributor(data.distributor);
      setTariffState({
        isLoading: false,
        isManual: false,
        sourceName: data.source,
        sourceLastUpdated: data.lastUpdated,
        sourceUrl: data.sourceUrl,
        isStale: data.isStale,
        error: null,
      });
    } catch {
      setTariffState((prev) => ({
        ...prev,
        isLoading: false,
        isManual: true,
        error: "Não foi possível consultar a ANEEL agora.",
      }));
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    setIsLoadingDistributors(true);
    getEnergyDistributors(uf, controller.signal)
      .then((data) => {
        setDistributors(data.available ? data.distributors : []);
      })
      .catch(() => {
        if (!controller.signal.aborted) setDistributors([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingDistributors(false);
      });

    return () => controller.abort();
  }, [uf]);

  useEffect(() => {
    if (!distributor.trim()) return;
    void loadEnergyTariff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [distributor]);

  const chartRows: BreakdownRow[] = result.appliances.map((a) => ({
    key: a.id,
    label: a.name,
    monthly: a.costPerMonth,
    annual: a.costPerYear,
  }));
  const applianceColors = useMemo(() => buildColorMap(chartRows), [chartRows]);
  const applianceColor = (id: string) => applianceColors[id] ?? "var(--color-border)";

  const shareText = `Minha conta de luz estimada é ${formatBRL(result.totalCostPerMonth)} por mês (${formatNumber(result.totalKwhPerMonth, 1)} kWh), considerando ${result.appliances.length} aparelho(s) e tarifa de ${formatBRL(tariff)}/kWh.`;

  const form = (
    <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
      <FormSection title="Tarifa de energia">
        <SelectField
          label="Estado da unidade consumidora"
          value={uf}
          onChange={updateUf}
          options={[...BRAZILIAN_STATES]}
        />
        <SearchableSelectField
          label="Distribuidora"
          value={distributor}
          onChange={setDistributor}
          options={distributors.map((item) => ({
            value: item.distributor,
            label: item.distributor,
            description: item.uf,
          }))}
          placeholder={isLoadingDistributors ? "Carregando distribuidoras..." : "Selecionar"}
          searchPlaceholder="Buscar distribuidora..."
          emptyText="Nenhuma distribuidora encontrada."
          disabled={isLoadingDistributors}
          hint="A lista vem da API pública da ANEEL. A UF selecionada é usada na consulta da tarifa."
        />
        <Button
          type="button"
          variant="outline"
          onClick={loadEnergyTariff}
          disabled={tariffState.isLoading || !distributor.trim()}
        >
          {tariffState.isLoading ? <LoaderCircle className="animate-spin" /> : null}
          Atualizar tarifa da ANEEL
        </Button>
        <PublicDataField
          label="Tarifa em R$/kWh"
          value={tariff}
          onManualChange={updateTariffManually}
          {...tariffState}
          helperText="Prefira o valor total da sua fatura, já com impostos e bandeira."
        />
        <SelectField
          label="Adicionar aparelho pré-configurado"
          value={presetValue}
          onChange={(v) => {
            if (v) addPreset(v);
          }}
          options={[
            { value: "", label: "Escolher da lista..." },
            ...APPLIANCE_PRESETS.map((p) => ({
              value: p.name,
              label: `${p.name} (${p.watts} W)`,
            })),
          ]}
          hint="Adiciona uma linha com potência e uso típicos. Edite depois."
        />
      </FormSection>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg text-foreground">Seus aparelhos</h3>
          <Button type="button" variant="outline" size="sm" onClick={addAppliance}>
            <Plus className="mr-1 h-4 w-4" /> Adicionar
          </Button>
        </div>

        {appliances.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-surface p-6 text-center text-sm text-muted-foreground">
            Nenhum aparelho ainda. Adicione um pré-configurado ou clique em "Adicionar".
          </p>
        ) : null}

        <ul className="space-y-3">
          {appliances.map((a) => (
            <li key={a.id} className="space-y-3 rounded-xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor={`name-${a.id}`} className="text-sm font-medium">
                    Nome do aparelho
                  </Label>
                  <Input
                    id={`name-${a.id}`}
                    value={a.name}
                    onChange={(e) => updateAppliance(a.id, { name: e.target.value })}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAppliance(a.id)}
                  aria-label={`Remover ${a.name}`}
                  className="mt-6 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <NumberInput
                  label="Potência"
                  value={a.watts}
                  onChange={(v) => updateAppliance(a.id, { watts: v })}
                  suffix="W"
                  step={10}
                />
                <NumberInput
                  label="Horas/dia"
                  value={a.hoursPerDay}
                  onChange={(v) => updateAppliance(a.id, { hoursPerDay: v })}
                  step={0.25}
                  max={24}
                />
                <NumberInput
                  label="Dias/mês"
                  value={a.daysPerMonth}
                  onChange={(v) => updateAppliance(a.id, { daysPerMonth: v })}
                  step={1}
                  max={31}
                />
                <NumberInput
                  label="Quantidade"
                  value={a.quantity}
                  onChange={(v) => updateAppliance(a.id, { quantity: Math.max(1, Math.floor(v)) })}
                  step={1}
                  min={1}
                />
              </div>
              <p className="text-xs text-muted-foreground tabular-nums">
                Consumo:{" "}
                {formatNumber(
                  (a.watts *
                    Math.min(24, a.hoursPerDay) *
                    Math.min(31, a.daysPerMonth) *
                    Math.max(1, a.quantity)) /
                    1000,
                  1,
                )}{" "}
                kWh/mês ·{" "}
                {formatBRL(
                  ((a.watts *
                    Math.min(24, a.hoursPerDay) *
                    Math.min(31, a.daysPerMonth) *
                    Math.max(1, a.quantity)) /
                    1000) *
                    tariff,
                )}
                /mês
              </p>
            </li>
          ))}
        </ul>
      </div>

      <DisclaimerBox>
        Os valores padrão são exemplos editáveis. O consumo real varia conforme modelo, eficiência
        energética, idade do aparelho e hábitos de uso. Use a etiqueta do produto para o número mais
        preciso de potência.
      </DisclaimerBox>

      <div className="flex flex-wrap gap-2">
        <ResetButton onReset={reset} />
      </div>
    </form>
  );

  const resultBlock = (
    <div className="space-y-3">
      <ResultSummaryCard
        title="Custo mensal estimado"
        value={formatBRL(result.totalCostPerMonth)}
        description={`${formatNumber(result.totalKwhPerMonth, 1)} kWh/mês`}
        tone="primary"
      />
      <div className="grid grid-cols-2 gap-3">
        <ResultSummaryCard title="Custo anual" value={formatBRL(result.totalCostPerYear)} />
        <ResultSummaryCard title="Tarifa usada" value={`${formatBRL(tariff)}/kWh`} />
      </div>
      <ResultSummaryCard
        title="Maior consumidor"
        value={result.topAppliance ? result.topAppliance.name : "—"}
        description={
          result.topAppliance
            ? `${result.topAppliance.sharePercent.toFixed(1).replace(".", ",")}% do consumo`
            : "Adicione aparelhos para ver"
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
      title="Calculadora de conta de luz por aparelho"
      description={PAGE_DESCRIPTION}
      form={form}
      result={resultBlock}
    >
      <section className="mx-auto max-w-6xl px-4 pb-6 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <SimpleBarChart rows={chartRows} title="Custo mensal por aparelho" />
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-soft text-primary">
                <TableIcon className="h-4 w-4" aria-hidden />
              </span>
              <p className="text-sm font-semibold text-foreground">Consumo e custo por aparelho</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Consumo e custo por aparelho</caption>
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Aparelho</th>
                    <th className="px-4 py-3 text-right font-medium">kWh/mês</th>
                    <th className="px-4 py-3 text-right font-medium">R$/mês</th>
                    <th className="px-4 py-3 text-right font-medium">%</th>
                  </tr>
                </thead>
                <tbody>
                  {result.appliances.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b border-border/60 transition-colors last:border-0 odd:bg-muted/15 hover:bg-primary-soft/25"
                    >
                      <td className="px-4 py-2.5">
                        <span className="flex items-center gap-2.5 text-foreground">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: applianceColor(a.id) }}
                            aria-hidden
                          />
                          <span className="truncate">{a.name}</span>
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                        {formatNumber(a.kwhPerMonth, 1)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium tabular-nums">
                        {formatBRL(a.costPerMonth)}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className="inline-flex items-center justify-end gap-2">
                          <span className="hidden h-1.5 w-12 overflow-hidden rounded-full bg-muted sm:block">
                            <span
                              className="block h-full rounded-full"
                              style={{
                                width: `${Math.min(100, a.sharePercent)}%`,
                                backgroundColor: applianceColor(a.id),
                              }}
                            />
                          </span>
                          <span className="w-12 text-right tabular-nums text-muted-foreground">
                            {a.sharePercent.toFixed(1)}%
                          </span>
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-border bg-primary-soft/40 font-semibold text-foreground">
                    <td className="px-4 py-3">Total</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatNumber(result.totalKwhPerMonth, 1)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatBRL(result.totalCostPerMonth)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <Prose collapsibleTitle="Saiba mais sobre a conta de luz">
        <h2>Como funciona o cálculo</h2>
        <p>O consumo de qualquer aparelho elétrico segue uma fórmula simples:</p>
        <p>
          <strong>
            kWh por mês = (potência em watts × horas por dia × dias por mês × quantidade) ÷ 1.000
          </strong>
        </p>
        <p>
          O custo mensal é o consumo em kWh multiplicado pela tarifa da sua distribuidora, informada
          em R$/kWh. Por exemplo, uma geladeira de 130 W ligada 24 horas por dia consome
          aproximadamente 93,6 kWh por mês. Com uma tarifa de R$ 0,95/kWh, isso dá cerca de R$ 89
          por mês só com a geladeira.
        </p>

        <h2>Os campeões da conta de luz</h2>
        <p>Na maioria das casas, três grupos de aparelhos respondem pela maior parte da fatura:</p>
        <ul>
          <li>
            <strong>Chuveiro elétrico:</strong> potência muito alta (entre 4.500 W e 7.500 W).
            Banhos longos no inverno são o principal vilão sazonal.
          </li>
          <li>
            <strong>Geladeira e freezer:</strong> potência relativamente baixa, mas ficam ligados 24
            horas por dia, todos os dias do mês.
          </li>
          <li>
            <strong>Ar-condicionado:</strong> em regiões quentes, pode ser o item mais caro do mês,
            especialmente em quartos onde o aparelho fica ligado durante o sono.
          </li>
        </ul>
        <p>
          Outros aparelhos que pesam quando usados com frequência: secadora de roupas, ferro de
          passar, forno elétrico e secador/chapinha.
        </p>

        <h2>Como reduzir a conta sem perder conforto</h2>
        <ul>
          <li>Reduzir o tempo de banho no inverno e usar a chave em "verão" quando der.</li>
          <li>Configurar o ar-condicionado em 23–24 °C, com modo econômico ativado.</li>
          <li>Trocar lâmpadas incandescentes ou fluorescentes por LED.</li>
          <li>Juntar roupa suficiente para usar a máquina de lavar com a carga cheia.</li>
          <li>
            Desligar aparelhos em standby — TVs, vídeo-games e desktops consomem mesmo desligados.
          </li>
          <li>Verificar a vedação da geladeira (porta encaixando bem) e evitar abrir muito.</li>
          <li>Usar o ferro de passar com a maior quantidade de roupas de uma vez.</li>
        </ul>

        <h2>Sobre a tarifa e as bandeiras</h2>
        <p>
          A tarifa que aparece na sua conta já inclui impostos (ICMS, PIS, Cofins) e pode variar mês
          a mês conforme a bandeira tarifária definida pela Aneel:
        </p>
        <ul>
          <li>
            <strong>Verde:</strong> sem adicional.
          </li>
          <li>
            <strong>Amarela:</strong> pequeno adicional por kWh consumido.
          </li>
          <li>
            <strong>Vermelha (patamar 1 ou 2):</strong> adicional maior, comum em períodos de seca.
          </li>
        </ul>
        <p>
          Para uma estimativa fiel ao mês atual, use a tarifa total que aparece no detalhamento da
          sua fatura mais recente. Para uma média anual, considere uma tarifa intermediária.
        </p>

        <h2>Fonte da tarifa de energia</h2>
        <p>
          A sugestão automática consulta o{" "}
          <a href="https://dadosabertos.aneel.gov.br/" target="_blank" rel="noreferrer">
            portal de dados abertos da ANEEL
          </a>
          , usando a tarifa B1 residencial convencional vigente para a distribuidora informada. O
          valor público combina TUSD e TE, mas não inclui impostos, bandeiras tarifárias, iluminação
          pública nem regras específicas da sua fatura. O cache é atualizado semanalmente e o valor
          continua editável.
        </p>

        <h2>Limitações</h2>
        <p>
          A calculadora é uma estimativa educativa. O consumo real varia conforme o modelo, a
          eficiência energética (selo Procel/Inmetro), a idade do aparelho, a temperatura ambiente e
          os hábitos de uso. Para medições precisas, existem medidores de consumo (watt-meter) que
          se conectam à tomada e mostram o gasto real do aparelho.
        </p>
      </Prose>

      <div className="mx-auto max-w-6xl space-y-10 px-4 pb-16 sm:px-6">
        <FAQSection items={FAQ} />
        <RelatedCalculators
          slugs={["morar-sozinho", "custo-carro", "assinaturas", "custo-mudanca", "custo-pet"]}
        />
      </div>
    </CalculatorLayout>
  );
}
