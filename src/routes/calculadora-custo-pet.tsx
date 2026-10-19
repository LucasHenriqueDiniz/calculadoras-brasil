import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalculatorLayout, FormSection } from "@/components/calculator/CalculatorLayout";
import { CurrencyInput, NumberInput, SelectField } from "@/components/calculator/fields";
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
import { RelatedPosts } from "@/components/calculator/RelatedPosts";
import { relatedPostsFor } from "@/data/calculators";
import { Prose } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/format";
import {
  buildFeedingTable,
  calculatePetCost,
  dailyFoodGrams,
  type PetCostInput,
  type PetProfile,
} from "@/lib/calculators/petCost";
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

// Every figure the FAQ and the table quote comes from the calculator or the FEDIAF guidelines.
const DEFAULT_RESULT = calculatePetCost(DEFAULTS);

/** The example food: energy as a bag declares it, and the default R$ 100 for 10 kg. */
const EXAMPLE_KCAL_PER_KG = 3500;
const EXAMPLE_PRICE_PER_KG = DEFAULTS.foodPackagePrice / DEFAULTS.foodPackageWeightKg;

const PROFILES: { value: PetProfile; label: string }[] = [
  { value: "dog-young", label: "Cão de 1 a 2 anos" },
  { value: "dog-adult", label: "Cão de 3 a 7 anos" },
  { value: "dog-senior", label: "Cão com mais de 7 anos" },
  { value: "cat-indoor", label: "Gato castrado ou que não sai de casa" },
  { value: "cat-active", label: "Gato ativo" },
];
const PROFILE_LABEL = new Map(PROFILES.map(({ value, label }) => [value, label]));

const FEEDING_TABLE = buildFeedingTable(
  [
    { profile: "dog-adult", weightKg: 5 },
    { profile: "dog-adult", weightKg: 10 },
    { profile: "dog-adult", weightKg: 20 },
    { profile: "dog-adult", weightKg: 30 },
    { profile: "dog-adult", weightKg: 40 },
    { profile: "dog-senior", weightKg: 20 },
    { profile: "cat-indoor", weightKg: 4 },
    { profile: "cat-active", weightKg: 4 },
  ],
  EXAMPLE_KCAL_PER_KG,
  EXAMPLE_PRICE_PER_KG,
);

function feeding(profile: PetProfile, weightKg: number) {
  const row = FEEDING_TABLE.find((r) => r.profile === profile && r.weightKg === weightKg);
  if (!row) throw new Error(`No feeding row for ${profile} ${weightKg}`);
  return row;
}
const DOG_10 = feeding("dog-adult", 10);
const DOG_30 = feeding("dog-adult", 30);
const CAT_4 = feeding("cat-indoor", 4);

function grams(value: number): string {
  return `${Math.round(value).toLocaleString("pt-BR")} g`;
}

function kilos(value: number): string {
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} kg`;
}
const FAQ: FAQItem[] = [
  {
    question: "Quanto custa ter um cachorro por mês?",
    answer: `Depende do porte, da ração e dos cuidados. A ração é o que mais muda com o porte: pelas recomendações da FEDIAF, um cão adulto de 10 kg come cerca de ${grams(DOG_10.gramsPerDay)} por dia de uma ração de ${EXAMPLE_KCAL_PER_KG.toLocaleString("pt-BR")} kcal/kg, ${formatBRL(DOG_10.monthlyFoodCost)} por mês a ${formatBRL(EXAMPLE_PRICE_PER_KG)} o quilo; um de 30 kg, ${grams(DOG_30.gramsPerDay)} e ${formatBRL(DOG_30.monthlyFoodCost)}. No exemplo da calculadora, somando higiene, saúde e reserva, o total é ${formatBRL(DEFAULT_RESULT.monthlyTotal)} por mês.`,
  },
  {
    question: "Quanto custa ter um gato por mês?",
    answer: `Um gato castrado de 4 kg precisa de cerca de ${Math.round(CAT_4.kcalPerDay)} kcal por dia (FEDIAF), uns ${grams(CAT_4.gramsPerDay)} de uma ração de ${EXAMPLE_KCAL_PER_KG.toLocaleString("pt-BR")} kcal/kg: ${formatBRL(CAT_4.monthlyFoodCost)} por mês a ${formatBRL(EXAMPLE_PRICE_PER_KG)} o quilo. Some areia, vacinas e consultas para o total.`,
  },
  {
    question: "Qual é o custo veterinário anual de um pet?",
    answer: `Varia por cidade, clínica e saúde do animal. O exemplo da calculadora usa ${formatBRL(DEFAULTS.vaccinesAnnual)} de vacinas, ${formatBRL(DEFAULTS.checkupsAnnual)} de consultas e ${formatBRL(DEFAULTS.fleaAndWormAnnual)} de antipulgas e vermífugo por ano: ${formatBRL((DEFAULTS.vaccinesAnnual + DEFAULTS.checkupsAnnual + DEFAULTS.fleaAndWormAnnual) / 12)} por mês.`,
  },
  {
    question: "A calculadora usa preço médio?",
    answer:
      "Não. Você informa o preço que paga pela ração, pelo banho e pelo veterinário, porque os preços variam muito por marca, porte e cidade. O que a calculadora estima é a porção diária, pelas recomendações da FEDIAF.",
  },
  {
    question: "Vale a pena plano de saúde pet?",
    answer:
      "Compare a mensalidade com o que você guardaria por mês numa reserva, e leia carências, coberturas e limites de reembolso.",
  },
  {
    question: "Como economizar com ração?",
    answer:
      "Compare o custo por dia, não por quilo. Uma ração com mais energia por quilo pede porções menores: a calculadora estima a porção pela energia que a embalagem declara e pelo peso do animal. Compre embalagens maiores se o animal consumir antes do vencimento, e sirva a porção medida para não desperdiçar.",
  },
  {
    question: "Quanto custa adotar um pet?",
    answer:
      "Pergunte à ONG ou ao abrigo se há taxa e o que está incluído: vacinas, castração, microchip. Some o enxoval: cama, comedouro, bebedouro e caixa de transporte.",
  },
  {
    question: "Banho e tosa é despesa fixa?",
    answer:
      "Se for feito em pet shop com frequência, sim. Informe no campo de banho e tosa o valor por sessão vezes as sessões do mês.",
  },
  {
    question: "Como considerar emergências veterinárias?",
    answer: `Use o campo de reserva mensal: um valor guardado todo mês evita dívida quando a emergência aparece. O exemplo da calculadora guarda ${formatBRL(DEFAULTS.emergencyReserveMonthly)} por mês.`,
  },
  {
    question: "Posso calcular mais de um animal?",
    answer:
      "Sim. A quantidade multiplica os custos de animais parecidos. Para animais diferentes, como um cão e um gato, faça uma simulação para cada um.",
  },
  {
    question: "O proprietário pode cobrar taxa por ter pet no aluguel?",
    answer:
      "A Lei do Inquilinato não prevê taxa por animal, e exigir valores além do aluguel e dos encargos permitidos é contravenção penal (Lei 8.245/1991, art. 43, I). Confira o que o contrato e a convenção do condomínio dizem sobre animais.",
  },
  {
    question: "O resultado é realista?",
    answer:
      "É tão realista quanto os valores que você informa. É uma estimativa educativa: emergências e mudanças de saúde podem aumentar os custos, por isso deixe uma margem no orçamento.",
  },
];

export const Route = createFileRoute("/calculadora-custo-pet")({
  head: () => ({
    meta: [
      { title: `${PAGE_TITLE} | Calcule Brasil` },
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
        <PortionHelper onUse={(value) => update("dailyFoodGrams", value)} />
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
      <FeedingSection />
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
        <RelatedPosts slugs={relatedPostsFor("custo-pet")} />
      </div>
    </CalculatorLayout>
  );
}

function PortionHelper({ onUse }: { onUse: (grams: number) => void }) {
  const [weightKg, setWeightKg] = useState(10);
  const [profile, setProfile] = useState<PetProfile>("dog-adult");
  const [kcalPerKg, setKcalPerKg] = useState(EXAMPLE_KCAL_PER_KG);
  const suggestion = Math.round(dailyFoodGrams(profile, weightKg, kcalPerKg));

  return (
    <div className="space-y-3 rounded-xl border border-border bg-muted/40 p-4 sm:col-span-2">
      <p className="text-sm font-medium text-foreground">Quanto o seu pet come por dia?</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <SelectField
          label="Animal"
          value={profile}
          onChange={(value) => setProfile(value as PetProfile)}
          options={PROFILES}
        />
        <NumberInput
          label="Peso do animal"
          value={weightKg}
          onChange={setWeightKg}
          suffix="kg"
          step={0.5}
        />
        <NumberInput
          label="Energia da ração"
          value={kcalPerKg}
          onChange={setKcalPerKg}
          suffix="kcal/kg"
          step={50}
          hint="Energia metabolizável, na embalagem."
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Pelas recomendações da FEDIAF: cerca de{" "}
          <strong className="text-foreground">{grams(suggestion)} por dia</strong>.
        </p>
        <Button type="button" variant="outline" size="sm" onClick={() => onUse(suggestion)}>
          Usar no consumo diário
        </Button>
      </div>
    </div>
  );
}

function FeedingSection() {
  return (
    <Prose>
      <h2>Quanto ração um cão ou um gato come por mês</h2>
      <p>
        A porção depende da energia de que o animal precisa e da energia da ração. A FEDIAF, a
        federação europeia da indústria de alimentos para animais, recomenda para um cão adulto
        cerca de 110 kcal por quilo de peso elevado a 0,75 por dia, e para um gato castrado ou que
        não sai de casa, cerca de 75 kcal por quilo elevado a 0,67. A tabela foi calculada pela
        própria calculadora com uma ração de exemplo de{" "}
        {EXAMPLE_KCAL_PER_KG.toLocaleString("pt-BR")} kcal/kg a {formatBRL(EXAMPLE_PRICE_PER_KG)} o
        quilo.
      </p>
      <div className="not-prose overflow-x-auto rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)]">
        <table className="w-full min-w-[600px] text-sm">
          <caption className="sr-only">
            Energia, porção diária e custo mensal de ração por peso do animal
          </caption>
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th scope="col" className="px-3 py-2.5">
                Animal
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Energia por dia
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Ração por dia
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Ração por mês
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Custo por mês
              </th>
            </tr>
          </thead>
          <tbody>
            {FEEDING_TABLE.map((row) => (
              <tr key={`${row.profile}-${row.weightKg}`} className="border-t border-border/70">
                <th scope="row" className="px-3 py-2 text-left font-medium text-foreground">
                  {PROFILE_LABEL.get(row.profile)}, {kilos(row.weightKg)}
                </th>
                <td className="px-3 py-2 text-right">
                  {Math.round(row.kcalPerDay).toLocaleString("pt-BR")} kcal
                </td>
                <td className="px-3 py-2 text-right">{grams(row.gramsPerDay)}</td>
                <td className="px-3 py-2 text-right">{kilos(row.kgPerMonth)}</td>
                <td className="px-3 py-2 text-right font-semibold text-foreground">
                  {formatBRL(row.monthlyFoodCost)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        São médias: a FEDIAF chama esses valores de ponto de partida, e cada animal pode precisar de
        mais ou de menos conforme atividade, raça e saúde. Com uma ração de mais energia por quilo,
        a porção cai na mesma proporção, por isso vale comparar o custo por dia, não o preço do
        quilo. Ajuste a porção com o veterinário pelo peso do animal ao longo do tempo. Fonte:{" "}
        <a
          href="https://europeanpetfood.org/self-regulation/nutritional-guidelines/"
          target="_blank"
          rel="noreferrer"
        >
          FEDIAF, Nutritional Guidelines, setembro de 2025
        </a>
        , tabelas VII-6 e VII-9.
      </p>
    </Prose>
  );
}
