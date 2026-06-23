import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";
import { CalculatorLayout, FormSection } from "@/components/calculator/CalculatorLayout";
import { NumberInput, SelectField } from "@/components/calculator/fields";
import {
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
import { getEnergyTariff } from "@/lib/public-data/client";
import { BRAZILIAN_STATES } from "@/lib/public-data/states";

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
  error?: string | null;
}

const FAQ: FAQItem[] = [
  {
    question: "Como sei a tarifa de energia da minha região?",
    answer:
      "A tarifa aparece na sua conta de luz, normalmente em R$ por kWh, e já inclui impostos como ICMS, PIS e Cofins. Cada distribuidora tem valores diferentes, e a bandeira tarifária do mês pode somar um adicional. Para uma estimativa rápida, use o valor médio que aparece no detalhamento da sua fatura.",
  },
  {
    question: "A calculadora considera a bandeira tarifária?",
    answer:
      "Indiretamente. Se você informar a tarifa total que aparece na fatura — já com bandeira amarela ou vermelha somada — o resultado refletirá esse adicional. Se preferir, use a tarifa base e some o adicional da bandeira manualmente depois.",
  },
  {
    question: "Por que o chuveiro elétrico consome tanto?",
    answer:
      "Porque a potência dele é muito alta: tipicamente entre 4.500 W e 7.500 W. Mesmo usado por poucos minutos, ele costuma ser um dos maiores responsáveis pela conta de luz, especialmente quando há vários banhos longos por dia em uma casa.",
  },
  {
    question: "Como reduzir a conta de luz sem perder conforto?",
    answer:
      "Trocar lâmpadas por LED, evitar deixar aparelhos em standby, reduzir o tempo do chuveiro elétrico no inverno, configurar o ar-condicionado em temperaturas mais altas (23–24 °C) e juntar roupas para lavar de uma vez são medidas que costumam render boa economia sem grande impacto na rotina.",
  },
  {
    question: "Onde encontro a potência (W) de um aparelho?",
    answer:
      "A potência aparece na etiqueta do produto, no manual ou na placa de identificação atrás/embaixo do aparelho. Em alguns casos vem em VA (volt-ampere) — para estimativa, dá para usar como aproximação dos watts. Use os valores da calculadora apenas como referência se não encontrar o número exato.",
  },
  {
    question: "O resultado serve para qualquer cidade do Brasil?",
    answer:
      "Sim, basta ajustar a tarifa em R$/kWh conforme sua distribuidora. O cálculo de kWh por aparelho não muda — o que muda é o preço final do kWh, que varia entre estados e bandeiras tarifárias.",
  },
];

export const Route = createFileRoute("/calculadora-conta-de-luz")({
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
          applicationCategory: "UtilitiesApplication",
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
  component: ElectricityPage,
});

function ElectricityPage() {
  const [tariff, setTariff] = useState<number>(DEFAULT_TARIFF);
  const [appliances, setAppliances] = useState<ApplianceInput[]>(DEFAULT_APPLIANCES);
  const [presetValue, setPresetValue] = useState<string>("");
  const [uf, setUf] = useState("SP");
  const [distributor, setDistributor] = useState("");
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
    setTariffState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const data = await getEnergyTariff(uf, distributor.trim() || undefined);
      if (!data.available) {
        setTariffState({
          isLoading: false,
          isManual: true,
          sourceName: data.source,
          sourceLastUpdated: data.lastUpdated,
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

  const chartRows: BreakdownRow[] = result.appliances.map((a) => ({
    key: a.id,
    label: a.name,
    monthly: a.costPerMonth,
    annual: a.costPerYear,
  }));

  const shareText = `Minha conta de luz estimada é ${formatBRL(result.totalCostPerMonth)} por mês (${formatNumber(result.totalKwhPerMonth, 1)} kWh), considerando ${result.appliances.length} aparelho(s) e tarifa de ${formatBRL(tariff)}/kWh.`;

  const form = (
    <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
      <FormSection title="Tarifa de energia">
        <SelectField
          label="Estado da unidade consumidora"
          value={uf}
          onChange={setUf}
          options={[...BRAZILIAN_STATES]}
        />
        <div className="space-y-1.5">
          <Label htmlFor="energy-distributor">Distribuidora</Label>
          <Input
            id="energy-distributor"
            value={distributor}
            onChange={(event) => setDistributor(event.target.value)}
            placeholder="Ex.: Enel, Neoenergia, CPFL"
          />
          <p className="text-xs text-muted-foreground">
            Informe a sigla como aparece na fatura, por exemplo ENEL CE, CEMIG-D ou COPEL-DIS.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={loadEnergyTariff}
          disabled={tariffState.isLoading || !distributor.trim()}
        >
          {tariffState.isLoading ? <LoaderCircle className="animate-spin" /> : null}
          Tentar carregar tarifa da ANEEL
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
          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full text-sm">
              <caption className="sr-only">Consumo e custo por aparelho</caption>
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Aparelho</th>
                  <th className="px-3 py-2 text-right font-medium">kWh/mês</th>
                  <th className="px-3 py-2 text-right font-medium">R$/mês</th>
                  <th className="px-3 py-2 text-right font-medium">%</th>
                </tr>
              </thead>
              <tbody>
                {result.appliances.map((a) => (
                  <tr key={a.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 text-foreground">{a.name}</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {formatNumber(a.kwhPerMonth, 1)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {formatBRL(a.costPerMonth)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                      {a.sharePercent.toFixed(1)}%
                    </td>
                  </tr>
                ))}
                <tr className="bg-muted/40 font-medium">
                  <td className="px-3 py-2">Total</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatNumber(result.totalKwhPerMonth, 1)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatBRL(result.totalCostPerMonth)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Prose>
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
