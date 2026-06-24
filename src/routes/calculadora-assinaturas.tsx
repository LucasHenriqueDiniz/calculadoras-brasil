import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { CalculatorLayout, FormSection } from "@/components/calculator/CalculatorLayout";
import { CurrencyInput, SelectField } from "@/components/calculator/fields";
import {
  DisclaimerBox,
  ResultSummaryCard,
  SimpleBarChart,
  WarningList,
} from "@/components/calculator/results";
import { CopyResultButton, ResetButton, ShareResultButton } from "@/components/calculator/actions";
import { FAQSection, type FAQItem } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { Prose } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatBRL } from "@/lib/format";
import {
  calculateSubscriptions,
  type BillingCycle,
  type SubscriptionInput,
} from "@/lib/calculators/subscriptions";
import { absoluteUrl } from "@/lib/site";
import { calculatorStructuredData } from "@/lib/structured-data";

const PAGE_TITLE = "Calculadora de gasto com assinaturas";
const DESCRIPTION =
  "Some streaming, aplicativos, academia, software e cursos para visualizar o gasto mensal, anual e a economia possível.";
let id = 0;
const nextId = () => `subscription-${++id}`;
const defaults = (): SubscriptionInput[] => [
  {
    id: nextId(),
    name: "Streaming",
    category: "Entretenimento",
    value: 39.9,
    cycle: "monthly",
    keep: true,
  },
  { id: nextId(), name: "Academia", category: "Saúde", value: 99.9, cycle: "monthly", keep: true },
  {
    id: nextId(),
    name: "Software",
    category: "Produtividade",
    value: 240,
    cycle: "annual",
    keep: true,
  },
];
const FAQ: FAQItem[] = [
  {
    question: "Como registrar uma assinatura anual?",
    answer:
      "Escolha a frequência anual e informe o valor total pago no ano. A calculadora converte para uma média mensal.",
  },
  {
    question: "Os preços são atualizados automaticamente?",
    answer:
      "Não. Todos os valores são informados por você para evitar preços desatualizados ou diferentes do seu plano.",
  },
  {
    question: "Como simular cancelamentos?",
    answer:
      "Desmarque a opção Manter na assinatura. O resultado mostra o novo total e a economia projetada.",
  },
];

export const Route = createFileRoute("/calculadora-assinaturas")({
  head: () => ({
    meta: [
      { title: `${PAGE_TITLE} — Calculadoras Brasil` },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: absoluteUrl("/calculadora-assinaturas") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/calculadora-assinaturas") }],
    scripts: calculatorStructuredData({
      name: PAGE_TITLE,
      description: DESCRIPTION,
      path: "/calculadora-assinaturas",
      applicationCategory: "FinanceApplication",
      faq: FAQ,
    }),
  }),
  component: SubscriptionsPage,
});

function SubscriptionsPage() {
  const [items, setItems] = useState(defaults);
  const result = useMemo(() => calculateSubscriptions(items), [items]);
  const update = (itemId: string, patch: Partial<SubscriptionInput>) =>
    setItems((current) =>
      current.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
    );
  const shareText = `Minhas assinaturas somam ${formatBRL(result.monthlyTotal)} por mês e ${formatBRL(result.annualTotal)} por ano.`;

  const form = (
    <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg">Suas assinaturas</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setItems((current) => [
              ...current,
              {
                id: nextId(),
                name: "Nova assinatura",
                category: "Outros",
                value: 0,
                cycle: "monthly",
                keep: true,
              },
            ])
          }
        >
          <Plus /> Adicionar
        </Button>
      </div>
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.id} className="space-y-4 rounded-xl border border-border p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor={`name-${item.id}`}>Nome</Label>
                <Input
                  id={`name-${item.id}`}
                  value={item.name}
                  onChange={(e) => update(item.id, { name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`category-${item.id}`}>Categoria</Label>
                <Input
                  id={`category-${item.id}`}
                  value={item.category}
                  onChange={(e) => update(item.id, { category: e.target.value })}
                />
              </div>
              <CurrencyInput
                label="Valor cobrado"
                value={item.value}
                onChange={(value) => update(item.id, { value })}
              />
              <SelectField
                label="Frequência"
                value={item.cycle}
                onChange={(value) => update(item.id, { cycle: value as BillingCycle })}
                options={[
                  { value: "weekly", label: "Semanal" },
                  { value: "monthly", label: "Mensal" },
                  { value: "quarterly", label: "Trimestral" },
                  { value: "annual", label: "Anual" },
                ]}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={item.keep}
                  onChange={(e) => update(item.id, { keep: e.target.checked })}
                />
                Manter esta assinatura
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setItems((current) => current.filter((candidate) => candidate.id !== item.id))
                }
              >
                <Trash2 /> Remover
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <DisclaimerBox>
        Os valores são fornecidos por você. Não usamos preços externos de serviços ou plataformas.
      </DisclaimerBox>
      <ResetButton onReset={() => setItems(defaults())} />
    </form>
  );

  const resultBlock = (
    <div className="space-y-3">
      <ResultSummaryCard
        title="Total mensal"
        value={formatBRL(result.monthlyTotal)}
        tone="primary"
      />
      <div className="grid grid-cols-2 gap-3">
        <ResultSummaryCard title="Total anual" value={formatBRL(result.annualTotal)} />
        <ResultSummaryCard title="Economia anual" value={formatBRL(result.annualSavings)} />
      </div>
      <ResultSummaryCard title="Projeção em 5 anos" value={formatBRL(result.fiveYearTotal)} />
      <WarningList warnings={items.length ? [] : ["Adicione pelo menos uma assinatura."]} />
      <div className="flex flex-wrap gap-2">
        <CopyResultButton text={shareText} />
        <ShareResultButton title={PAGE_TITLE} text={shareText} />
      </div>
    </div>
  );

  return (
    <CalculatorLayout title={PAGE_TITLE} description={DESCRIPTION} form={form} result={resultBlock}>
      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <SimpleBarChart
          rows={result.items
            .filter((item) => item.keep)
            .map((item) => ({
              key: item.id,
              label: item.name || "Assinatura sem nome",
              monthly: item.monthly,
              annual: item.annual,
            }))}
          title="Custo mensal por assinatura"
        />
      </section>
      <Prose collapsibleTitle="Saiba mais sobre assinaturas">
        <h2>Por que acompanhar assinaturas?</h2>
        <p>
          Débitos recorrentes pequenos podem passar despercebidos. A projeção anual e de cinco anos
          torna o compromisso financeiro mais visível e ajuda a identificar serviços pouco usados.
        </p>
        <h2>Como usar</h2>
        <p>
          Cadastre cada serviço com o valor efetivamente pago. Para testar um corte, desmarque
          “Manter esta assinatura” e compare a economia mensal e anual.
        </p>
        <h2>Limitações</h2>
        <p>
          A calculadora não consulta preços comerciais e não considera reajustes futuros. Use os
          valores atuais da sua fatura ou cartão.
        </p>
      </Prose>
      <div className="mx-auto max-w-6xl space-y-10 px-4 pb-16 sm:px-6">
        <FAQSection items={FAQ} />
        <RelatedCalculators slugs={["morar-sozinho", "conta-de-luz", "custo-pet"]} />
      </div>
    </CalculatorLayout>
  );
}
