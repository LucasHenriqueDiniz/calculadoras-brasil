import { buildColorMap } from "@/lib/chart-colors";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, Plus, Table as TableIcon, Trash2 } from "lucide-react";
import { CalculatorLayout, FormSection } from "@/components/calculator/CalculatorLayout";
import { SearchableSelectField } from "@/components/calculator/SearchableSelectField";
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
import { RelatedPosts } from "@/components/calculator/RelatedPosts";
import { CopyResultButton, ResetButton, ShareResultButton } from "@/components/calculator/actions";
import { Prose } from "@/components/layout/PageShell";
import { PublicDataField } from "@/components/public-data/PublicDataField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCalculator, relatedPostsFor } from "@/data/calculators";
import { formatBRL, formatNumber, parseBRNumber } from "@/lib/format";
import {
  APPLIANCE_PRESETS,
  calculateApplianceConsumption,
  calculateElectricityBill,
  type ApplianceInput,
  type ElectricityResult,
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

/** Builds a list row from a preset-shaped source, defaulting to a single unit. */
function newAppliance(source: Omit<ApplianceInput, "id" | "quantity">): ApplianceInput {
  return { id: nextId(), ...source, quantity: 1 };
}

const DEFAULT_APPLIANCES: ApplianceInput[] = [
  {
    id: nextId(),
    name: "Geladeira duplex frost free",
    watts: 79,
    hoursPerDay: 24,
    daysPerMonth: 30,
    quantity: 1,
  },
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

/** Monthly kWh and cost of a catalogue appliance at its typical use, for the copy and the table. */
function presetUse(name: string) {
  const preset = APPLIANCE_PRESETS.find((p) => p.name === name);
  if (!preset) throw new Error(`no appliance preset named ${name}`);
  const { kwhPerMonth } = calculateApplianceConsumption({ id: name, quantity: 1, ...preset });
  return { ...preset, kwhPerMonth, cost: kwhPerMonth * DEFAULT_TARIFF };
}

const kwh = (value: number) => `${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} kWh`;

const FRIDGE = presetUse("Geladeira duplex frost free");
const FRIDGE_ONE_DOOR = presetUse("Geladeira 1 porta frost free");
const SHOWER = presetUse("Chuveiro elétrico");
const AC_9000 = presetUse("Ar-condicionado 9.000 BTUs");
const AC_12000 = presetUse("Ar-condicionado 12.000 BTUs");
const WASHER = presetUse("Máquina de lavar");

const PRESET_TABLE = APPLIANCE_PRESETS.map((preset) => presetUse(preset.name)).sort(
  (a, b) => b.kwhPerMonth - a.kwhPerMonth,
);

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
    question: "Qual é a tarifa de energia da minha região?",
    answer:
      "Varia por distribuidora. A calculadora sugere a tarifa residencial B1 da sua distribuidora a partir dos dados abertos da ANEEL, mas esse valor não inclui impostos nem bandeira tarifária, então a tarifa final da sua conta costuma ser maior. Para a estimativa mais fiel, use o valor por kWh que aparece na sua fatura.",
  },
  {
    question: "Como sei a tarifa da minha conta?",
    answer:
      "Ela aparece na fatura, em R$/kWh, já com ICMS, PIS e Cofins. Nos meses de bandeira amarela ou vermelha, há também um adicional por kWh. Uma forma simples de chegar à tarifa total é dividir o valor da conta pelo consumo do mês em kWh.",
  },
  {
    question: "Qual aparelho consome mais energia?",
    answer: `Com os usos típicos desta calculadora, o ar-condicionado lidera: um de 9.000 BTUs ligado 8 horas por dia consome ${kwh(AC_9000.kwhPerMonth)} por mês. Depois vêm a geladeira duplex frost free (${kwh(FRIDGE.kwhPerMonth)}) e o chuveiro elétrico (${kwh(SHOWER.kwhPerMonth)} com 15 minutos de banho por dia). O que pesa é potência vezes tempo de uso: o chuveiro tem a maior potência, mas fica pouco tempo ligado.`,
  },
  {
    question: "Quanto custa ligar o ar-condicionado 8 horas por dia?",
    answer: `Um aparelho de 9.000 BTUs (cerca de ${AC_9000.watts.toLocaleString("pt-BR")} W) consome ${kwh(AC_9000.kwhPerMonth)} por mês nesse uso, o que dá ${formatBRL(AC_9000.cost)} na tarifa de exemplo de ${formatBRL(DEFAULT_TARIFF)} por kWh. Um de 12.000 BTUs (cerca de ${AC_12000.watts.toLocaleString("pt-BR")} W) consome ${kwh(AC_12000.kwhPerMonth)}, ou ${formatBRL(AC_12000.cost)}. Modelos inverter costumam gastar menos depois que o ambiente atinge a temperatura.`,
  },
  {
    question: "Por que o chuveiro elétrico consome tanto?",
    answer: `Porque a potência é muito alta, em torno de ${SHOWER.watts.toLocaleString("pt-BR")} W. Com 15 minutos de uso por dia, são ${kwh(SHOWER.kwhPerMonth)} por mês. Banhos mais curtos e a chave na posição verão, que usa menos potência, reduzem o consumo na mesma proporção.`,
  },
  {
    question: "Geladeira consome muito?",
    answer: `Menos do que parece. O compressor liga e desliga, então a geladeira não consome a potência da etiqueta durante 24 horas. Pelos valores de consumo contínuo publicados pela Eletrobrás, uma geladeira de 1 porta frost free gasta cerca de ${kwh(FRIDGE_ONE_DOOR.kwhPerMonth)} por mês, e uma duplex frost free, cerca de ${kwh(FRIDGE.kwhPerMonth)}. Modelos antigos e com vedação gasta consomem mais.`,
  },
  {
    question: "Quanto gasta a máquina de lavar?",
    answer: `Uma máquina de cerca de ${WASHER.watts} W usada uma hora por ciclo, ${WASHER.daysPerMonth} vezes por mês, consome ${kwh(WASHER.kwhPerMonth)}. Máquinas que aquecem a água gastam bem mais, porque aquecer é o que mais consome energia.`,
  },
  {
    question: "Onde encontro a potência (W) de um aparelho?",
    answer:
      "Na etiqueta de trás ou embaixo, ou no manual. Às vezes aparece em VA (volt-ampere), que pode ser usado como aproximação. Para geladeira e freezer, a etiqueta do Inmetro informa o consumo em kWh por mês, que é melhor que a potência para essa conta.",
  },
  {
    question: "A bandeira tarifária afeta meu cálculo?",
    answer:
      "Sim. Nas bandeiras amarela e vermelha, a Aneel acrescenta um valor a cada kWh consumido, definido mês a mês. Se você usar a tarifa total da conta de um mês com bandeira, o adicional já está incluído.",
  },
  {
    question: "Como reduzir a conta de luz sem perder conforto?",
    answer:
      "Trocar lâmpadas antigas por LED, regular o ar-condicionado entre 23 °C e 24 °C, encurtar os banhos e usar a posição verão do chuveiro, juntar roupa para a máquina de lavar e desligar aparelhos em standby. A tabela desta página mostra onde está o maior consumo: é por ali que a economia rende mais.",
  },
  {
    question: "O resultado funciona para qualquer cidade?",
    answer:
      "Sim. O consumo em kWh não muda de cidade para cidade: muda a tarifa. Escolha sua distribuidora ou informe a tarifa da sua conta.",
  },
];

interface TariffSectionProps {
  uf: string;
  distributor: string;
  distributors: EnergyDistributorOption[];
  isLoadingDistributors: boolean;
  tariff: number;
  tariffState: PublicFieldState;
  onUfChange: (value: string) => void;
  onDistributorChange: (value: string) => void;
  onRefresh: () => void;
  onTariffChange: (value: string) => void;
}

function TariffSection({
  uf,
  distributor,
  distributors,
  isLoadingDistributors,
  tariff,
  tariffState,
  onUfChange,
  onDistributorChange,
  onRefresh,
  onTariffChange,
}: TariffSectionProps) {
  return (
    <FormSection
      title="Tarifa de energia"
      description="Selecione seu estado e distribuidora para buscar a tarifa pública da ANEEL — ou informe o valor da sua fatura manualmente."
    >
      <SelectField
        label="Estado da unidade consumidora"
        value={uf}
        onChange={onUfChange}
        options={[...BRAZILIAN_STATES]}
      />
      <SearchableSelectField
        label="Distribuidora"
        value={distributor}
        onChange={onDistributorChange}
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
      <div className="sm:col-span-2">
        <Button
          type="button"
          variant="outline"
          onClick={onRefresh}
          disabled={tariffState.isLoading || !distributor.trim()}
          className="w-full"
        >
          {tariffState.isLoading ? <LoaderCircle className="animate-spin" /> : null}
          Atualizar tarifa da ANEEL
        </Button>
      </div>
      <div className="sm:col-span-2">
        <PublicDataField
          label="Tarifa em R$/kWh"
          value={tariff}
          onManualChange={onTariffChange}
          {...tariffState}
          helperText="Prefira o valor total da sua fatura, já com impostos e bandeira."
        />
      </div>
    </FormSection>
  );
}

interface ApplianceRowProps {
  appliance: ApplianceInput;
  tariff: number;
  onPatch: (id: string, patch: Partial<ApplianceInput>) => void;
  onRemove: (id: string) => void;
}

function ApplianceRow({ appliance: a, tariff, onPatch, onRemove }: ApplianceRowProps) {
  return (
    <li className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor={`name-${a.id}`} className="text-sm font-medium">
            Nome do aparelho
          </Label>
          <Input
            id={`name-${a.id}`}
            value={a.name}
            onChange={(e) => onPatch(a.id, { name: e.target.value })}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(a.id)}
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
          onChange={(v) => onPatch(a.id, { watts: v })}
          suffix="W"
          step={10}
        />
        <NumberInput
          label="Horas/dia"
          value={a.hoursPerDay}
          onChange={(v) => onPatch(a.id, { hoursPerDay: v })}
          step={0.25}
          max={24}
        />
        <NumberInput
          label="Dias/mês"
          value={a.daysPerMonth}
          onChange={(v) => onPatch(a.id, { daysPerMonth: v })}
          step={1}
          max={31}
        />
        <NumberInput
          label="Quantidade"
          value={a.quantity}
          onChange={(v) => onPatch(a.id, { quantity: Math.max(1, Math.floor(v)) })}
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
  );
}

interface ApplianceSectionProps {
  appliances: ApplianceInput[];
  tariff: number;
  presetValue: string;
  onAdd: () => void;
  onAddPreset: (name: string) => void;
  onPatch: (id: string, patch: Partial<ApplianceInput>) => void;
  onRemove: (id: string) => void;
}

function ApplianceSection({
  appliances,
  tariff,
  presetValue,
  onAdd,
  onAddPreset,
  onPatch,
  onRemove,
}: ApplianceSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-lg text-foreground">Seus aparelhos</h3>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus className="mr-1 h-4 w-4" /> Adicionar
        </Button>
      </div>

      <SelectField
        label="Adicionar aparelho pré-configurado"
        value={presetValue}
        onChange={(v) => {
          if (v) onAddPreset(v);
        }}
        options={[
          { value: "", label: "Escolher da lista..." },
          ...APPLIANCE_PRESETS.map((p) => ({
            value: p.name,
            label: `${p.name} (${p.watts.toLocaleString("pt-BR")} W)`,
          })),
        ]}
        hint="Adiciona uma linha com potência e uso típicos. Edite depois."
      />

      {appliances.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-surface p-6 text-center text-sm text-muted-foreground">
          Nenhum aparelho ainda. Adicione um pré-configurado ou clique em "Adicionar".
        </p>
      ) : null}

      <ul className="space-y-3">
        {appliances.map((a) => (
          <ApplianceRow
            key={a.id}
            appliance={a}
            tariff={tariff}
            onPatch={onPatch}
            onRemove={onRemove}
          />
        ))}
      </ul>
    </div>
  );
}

interface ElectricityResultsProps {
  result: ElectricityResult;
  tariff: number;
  shareText: string;
}

function ElectricityResults({ result, tariff, shareText }: ElectricityResultsProps) {
  return (
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
}

interface ConsumptionTableProps {
  result: ElectricityResult;
  rows: BreakdownRow[];
  colorOf: (id: string) => string;
}

function ConsumptionTable({ result, rows, colorOf }: ConsumptionTableProps) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-6 sm:px-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <SimpleBarChart rows={rows} title="Custo mensal por aparelho" />
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
                          style={{ backgroundColor: colorOf(a.id) }}
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
                              backgroundColor: colorOf(a.id),
                            }}
                          />
                        </span>
                        <span className="w-12 text-right tabular-nums text-muted-foreground">
                          {a.sharePercent.toFixed(1).replace(".", ",")}%
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
  );
}

function ElectricityArticle() {
  return (
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
        em R$/kWh. Por exemplo, um ar-condicionado de 9.000 BTUs (
        {AC_9000.watts.toLocaleString("pt-BR")} W) ligado 8 horas por dia consome{" "}
        {kwh(AC_9000.kwhPerMonth)} por mês. Com uma tarifa de {formatBRL(DEFAULT_TARIFF)}/kWh, isso
        dá {formatBRL(AC_9000.cost)} por mês.
      </p>
      <p>
        Geladeira e freezer são a exceção à fórmula: o compressor liga e desliga ao longo do dia,
        então a potência da etiqueta vezes 24 horas superestima o consumo duas a quatro vezes. Por
        isso a calculadora usa para eles a potência média que reproduz os valores de consumo da
        Eletrobrás: {kwh(FRIDGE.kwhPerMonth)} por mês para uma geladeira duplex frost free.
      </p>

      <h2>Os campeões da conta de luz</h2>
      <p>Na maioria das casas, três grupos de aparelhos respondem pela maior parte da fatura:</p>
      <ul>
        <li>
          <strong>Chuveiro elétrico:</strong> potência muito alta (entre 4.500 W e 7.500 W). Banhos
          longos no inverno são o principal vilão sazonal.
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
        A tarifa que aparece na sua conta já inclui impostos (ICMS, PIS, Cofins) e pode variar mês a
        mês conforme a bandeira tarifária definida pela Aneel:
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
        Para uma estimativa fiel ao mês atual, use a tarifa total que aparece no detalhamento da sua
        fatura mais recente. Para uma média anual, considere uma tarifa intermediária.
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
        os hábitos de uso. Para medições precisas, existem medidores de consumo (watt-meter) que se
        conectam à tomada e mostram o gasto real do aparelho.
      </p>
    </Prose>
  );
}

export const Route = createFileRoute("/calculadora-conta-de-luz")({
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
    "calculadoras-brasil:conta-luz:appliances:v2",
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
      newAppliance({ name: "Novo aparelho", watts: 100, hoursPerDay: 1, daysPerMonth: 30 }),
    ]);
  }
  function addPreset(name: string) {
    const preset = APPLIANCE_PRESETS.find((p) => p.name === name);
    if (!preset) return;
    setAppliances((prev) => [...prev, newAppliance(preset)]);
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
    setTariffState((prev) => ({ ...prev, isLoading: false, isManual: true, error: null }));
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
      <TariffSection
        uf={uf}
        distributor={distributor}
        distributors={distributors}
        isLoadingDistributors={isLoadingDistributors}
        tariff={tariff}
        tariffState={tariffState}
        onUfChange={updateUf}
        onDistributorChange={setDistributor}
        onRefresh={loadEnergyTariff}
        onTariffChange={updateTariffManually}
      />

      <ApplianceSection
        appliances={appliances}
        tariff={tariff}
        presetValue={presetValue}
        onAdd={addAppliance}
        onAddPreset={addPreset}
        onPatch={updateAppliance}
        onRemove={removeAppliance}
      />

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

  return (
    <CalculatorLayout
      title="Calculadora de conta de luz por aparelho"
      description={PAGE_DESCRIPTION}
      form={form}
      result={<ElectricityResults result={result} tariff={tariff} shareText={shareText} />}
    >
      <ConsumptionTable result={result} rows={chartRows} colorOf={applianceColor} />

      <ApplianceTableSection />

      <ElectricityArticle />

      <div className="mx-auto max-w-6xl space-y-10 px-4 pb-16 sm:px-6">
        <FAQSection items={FAQ} />
        <RelatedCalculators
          slugs={["morar-sozinho", "custo-carro", "assinaturas", "custo-mudanca", "custo-pet"]}
        />
        <RelatedPosts slugs={relatedPostsFor("conta-de-luz")} />
      </div>
    </CalculatorLayout>
  );
}

function ApplianceTableSection() {
  return (
    <Prose>
      <h2>Quanto cada aparelho gasta por mês</h2>
      <p>
        A tabela abaixo foi calculada pela própria calculadora, com o uso típico de cada aparelho e
        a tarifa de exemplo de {formatBRL(DEFAULT_TARIFF)} por kWh. Ela está em ordem de consumo: os
        primeiros da lista são onde a economia rende mais.
      </p>
      <div className="not-prose overflow-x-auto rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)]">
        <table className="w-full min-w-[560px] text-sm">
          <caption className="sr-only">Consumo e custo mensal por aparelho, uso típico</caption>
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th scope="col" className="px-3 py-2.5">
                Aparelho
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Potência
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Uso típico
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Consumo por mês
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Custo por mês
              </th>
            </tr>
          </thead>
          <tbody>
            {PRESET_TABLE.map((row) => (
              <tr key={row.name} className="border-t border-border/70">
                <th scope="row" className="px-3 py-2 text-left font-medium text-foreground">
                  {row.name}
                </th>
                <td className="px-3 py-2 text-right">{row.watts.toLocaleString("pt-BR")} W</td>
                <td className="px-3 py-2 text-right">
                  {row.hoursPerDay.toLocaleString("pt-BR")} h × {row.daysPerMonth} dias
                </td>
                <td className="px-3 py-2 text-right">{kwh(row.kwhPerMonth)}</td>
                <td className="px-3 py-2 text-right font-semibold text-foreground">
                  {formatBRL(row.cost)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Geladeiras e freezer aparecem com a potência média, não a da etiqueta, porque o compressor
        não fica ligado o tempo todo. Os demais usam a potência típica do aparelho. Para o seu caso,
        adicione os aparelhos no formulário acima com a potência e o tempo de uso reais.
      </p>
    </Prose>
  );
}
