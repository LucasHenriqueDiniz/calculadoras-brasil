import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalculatorLayout, FormSection } from "@/components/calculator/CalculatorLayout";
import { CurrencyInput, NumberInput } from "@/components/calculator/fields";
import {
  BreakdownTable,
  DisclaimerBox,
  ResultSummaryCard,
  SimpleBarChart,
  WarningList,
} from "@/components/calculator/results";
import { CopyResultButton, ResetButton, ShareResultButton } from "@/components/calculator/actions";
import { FAQSection, type FAQItem } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { Prose } from "@/components/layout/PageShell";
import { formatBRL } from "@/lib/format";
import { calculatePetCost, type PetCostInput } from "@/lib/calculators/petCost";
import { absoluteUrl } from "@/lib/site";
import { calculatorStructuredData } from "@/lib/structured-data";

const PAGE_TITLE = "Calculadora de custo de pet";
const DESCRIPTION =
  "Estime alimentação, higiene, banho, vacinas, consultas, medicamentos e reserva para emergências.";
const DEFAULTS: PetCostInput = {
  foodPackagePrice: 100,
  foodPackageWeightKg: 10,
  dailyFoodGrams: 200,
  foodMonthly: 180,
  litterAndHygieneMonthly: 50,
  groomingMonthly: 60,
  healthPlanMonthly: 0,
  toysMonthly: 30,
  medicationMonthly: 20,
  vaccinesAnnual: 300,
  checkupsAnnual: 250,
  fleaAndWormAnnual: 240,
  emergencyReserveMonthly: 100,
  quantity: 1,
};
const FAQ: FAQItem[] = [
  {
    question: "A calculadora usa preço médio de ração?",
    answer:
      "Não. O valor deve ser informado com base na marca, quantidade e frequência compradas por você.",
  },
  {
    question: "Como considerar gastos veterinários inesperados?",
    answer:
      "Use o campo de reserva mensal para formar um fundo ou informe o custo do plano de saúde pet.",
  },
  {
    question: "Posso calcular mais de um animal?",
    answer:
      "Sim. A quantidade multiplica os valores informados. Se os animais tiverem custos muito diferentes, faça simulações separadas.",
  },
];

export const Route = createFileRoute("/calculadora-custo-pet")({
  head: () => ({
    meta: [
      { title: `${PAGE_TITLE} — Calcule Brasil` },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: absoluteUrl("/calculadora-custo-pet") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/calculadora-custo-pet") }],
    scripts: calculatorStructuredData({
      name: PAGE_TITLE,
      description: DESCRIPTION,
      path: "/calculadora-custo-pet",
      applicationCategory: "FinanceApplication",
      faq: FAQ,
    }),
  }),
  component: PetPage,
});

function PetPage() {
  const [input, setInput] = useState(DEFAULTS);
  const result = useMemo(() => calculatePetCost(input), [input]);
  const update = <K extends keyof PetCostInput>(key: K, value: PetCostInput[K]) =>
    setInput((current) => ({ ...current, [key]: value }));
  const money = (key: keyof PetCostInput, label: string, hint?: string) => (
    <CurrencyInput
      label={label}
      value={input[key]}
      onChange={(value) => update(key, value)}
      hint={hint}
    />
  );
  const shareText = `Custo estimado com ${result.quantity} pet(s): ${formatBRL(result.monthlyTotal)} por mês e ${formatBRL(result.annualTotal)} por ano.`;
  const form = (
    <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
      <FormSection title="Perfil">
        <NumberInput
          label="Quantidade de pets"
          value={input.quantity}
          onChange={(value) => update("quantity", Math.max(1, Math.floor(value)))}
          min={1}
          step={1}
        />
      </FormSection>
      <FormSection
        title="Alimentação"
        description="Se preço, peso e consumo forem preenchidos, o custo da ração é calculado automaticamente."
      >
        {money("foodPackagePrice", "Preço do pacote")}
        <NumberInput
          label="Peso do pacote"
          value={input.foodPackageWeightKg}
          onChange={(value) => update("foodPackageWeightKg", value)}
          suffix="kg"
          step={0.1}
        />
        <NumberInput
          label="Consumo diário"
          value={input.dailyFoodGrams}
          onChange={(value) => update("dailyFoodGrams", value)}
          suffix="g"
          step={10}
        />
        {money(
          "foodMonthly",
          "Alimentação mensal manual",
          "Usado como fallback quando os dados do pacote não estiverem completos.",
        )}
      </FormSection>
      <FormSection title="Custos mensais">
        {money("litterAndHygieneMonthly", "Areia e higiene")}
        {money("groomingMonthly", "Banho e tosa")}
        {money("healthPlanMonthly", "Plano de saúde")}
        {money("toysMonthly", "Brinquedos e acessórios")}
        {money("medicationMonthly", "Medicamentos recorrentes")}
        {money("emergencyReserveMonthly", "Reserva para emergências")}
      </FormSection>
      <FormSection title="Custos anuais">
        {money("vaccinesAnnual", "Vacinas por ano")}
        {money("checkupsAnnual", "Consultas por ano")}
        {money("fleaAndWormAnnual", "Antipulgas e vermífugo por ano")}
      </FormSection>
      <DisclaimerBox>
        Use preços e quantidades reais. Necessidades variam por espécie, porte, idade, saúde e
        orientação veterinária.
      </DisclaimerBox>
      <ResetButton onReset={() => setInput(DEFAULTS)} />
    </form>
  );
  const warnings =
    input.emergencyReserveMonthly === 0 && input.healthPlanMonthly === 0
      ? ["Considere um plano ou uma reserva para emergências veterinárias."]
      : [];
  const resultBlock = (
    <div className="space-y-3">
      <ResultSummaryCard
        title="Custo mensal"
        value={formatBRL(result.monthlyTotal)}
        tone="primary"
      />
      <ResultSummaryCard title="Custo anual" value={formatBRL(result.annualTotal)} />
      <ResultSummaryCard
        title="Ração por mês"
        value={formatBRL(result.calculatedFoodMonthly * result.quantity)}
        description={
          result.foodPackageDurationDays
            ? `${result.monthlyFoodKg.toFixed(1).replace(".", ",")} kg/mês · pacote dura cerca de ${Math.round(result.foodPackageDurationDays)} dias`
            : "Usando o valor mensal manual"
        }
      />
      <ResultSummaryCard
        title="Média por pet/mês"
        value={formatBRL(result.monthlyTotal / result.quantity)}
      />
      <WarningList warnings={warnings} />
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
          <SimpleBarChart rows={result.breakdown} title="Composição mensal" />
          <BreakdownTable rows={result.breakdown} caption="Custos mensais e anuais do pet" />
        </div>
      </section>
      <Prose collapsibleTitle="Saiba mais sobre o custo de um pet">
        <h2>Planejamento responsável</h2>
        <p>
          O custo de um animal inclui rotina e saúde preventiva. Vacinas e consultas anuais são
          diluídas por mês para mostrar o compromisso financeiro real.
        </p>
        <h2>Emergências veterinárias</h2>
        <p>
          Mesmo animais saudáveis podem precisar de atendimento inesperado. Um plano ou fundo
          reservado reduz o impacto no orçamento.
        </p>
        <h2>Limitações</h2>
        <p>
          Não existem preços oficiais únicos. Alimentação e cuidados variam conforme espécie, porte,
          idade, localização e recomendação veterinária.
        </p>
      </Prose>
      <div className="mx-auto max-w-6xl space-y-10 px-4 pb-16 sm:px-6">
        <FAQSection items={FAQ} />
        <RelatedCalculators slugs={["morar-sozinho", "assinaturas", "custo-carro"]} />
      </div>
    </CalculatorLayout>
  );
}
