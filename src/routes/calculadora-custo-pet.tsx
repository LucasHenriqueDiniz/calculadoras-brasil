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
    question: "Quanto custa ter um cachorro por mês?",
    answer:
      "Pequeno (< 10kg): R$ 300-600/mês. Médio (10-25kg): R$ 400-800/mês. Grande (> 25kg): R$ 600-1.500+/mês. Inclui ração, veterinário, banho. Pode crescer com emergências.",
  },
  {
    question: "Quanto custa ter um gato por mês?",
    answer:
      "Gato é mais barato: R$ 200-400/mês. Ração mais barata que cachorro. Veterinário e vacinas são similares. Maior economia se usar areia caseira.",
  },
  {
    question: "Qual é o custo veterinário anual de um pet?",
    answer:
      "Consulta: R$ 100-200. Vacinação (1x/ano): R$ 200-400. Vermífugo: R$ 100-200. Antiparasitário: R$ 100-200. Limpeza dental: R$ 300-800. Emergência: imprevisível (R$ 500-5.000).",
  },
  {
    question: "A calculadora usa preço médio?",
    answer:
      "Não. Você informa seu preço real de ração, banho, veterinário. Preços variam bastante por marca, porte e cidade. Use seus números para estimativa real.",
  },
  {
    question: "Vale a pena plano de saúde pet?",
    answer:
      "Plano custa R$ 50-200/mês. Se pet é idoso ou tem problemas, vale. Se jovem e saudável, guarde R$ 100/mês na reserva e pague emergências quando ocorrer.",
  },
  {
    question: "Como economizar com ração para pet?",
    answer:
      "1) Compre ração em grande volume (desconto). 2) Compare marcas (mesma nutrição, preço diferente). 3) Ração premium vs padrão: premium pode durar mais. 4) Alimente correto (porção exata evita desperdício).",
  },
  {
    question: "Quanto custa adotar um pet?",
    answer:
      "Adoção em ONG: R$ 100-500 (vacinado, castrado). Criador: R$ 2.000-10.000+ (depende da raça). Custo inicial também inclui cama, comedouro, brinquedos = R$ 500-1.000. Prepare esse valor antes.",
  },
  {
    question: "Banho e tosa é despesa fixa?",
    answer:
      "Banho: R$ 50-100 por sessão. Tosa (cachorro): R$ 80-150. Frequência: 1-2x/mês. Se em casa = economia. Se em pet shop = custo fixo. Contas bem: +R$ 100-300/mês.",
  },
  {
    question: "Como considerar emergências veterinárias?",
    answer:
      "Use campo de reserva mensal. Ideal: R$ 200-300/mês que fica guardado. Emergências hapcedem: cirurgia = R$ 2.000-5.000. Ter reserva evita dívida.",
  },
  {
    question: "Posso calcular mais de um animal?",
    answer:
      "Sim. A quantidade multiplica custos. Se tem 2 cachorros = custos similares × 2. Se animais diferentes (cachorro + gato) = valores diferentes, faça simulações separadas.",
  },
  {
    question: "Pet causa aumento do aluguel?",
    answer:
      "Sim, muitos proprietários cobram taxa (R$ 100-300/mês extra). Negocie incluindo isso no orçamento de morar sozinho ou com pet.",
  },
  {
    question: "O resultado é realista?",
    answer:
      "Sim, se você informar valores reais. É estimativa educativa — emergências não previstas podem aumentar custos. Sempre deixe margem de segurança no orçamento.",
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
