import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { CalculatorLayout } from "@/components/calculator/CalculatorLayout";
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
import { RelatedPosts } from "@/components/calculator/RelatedPosts";
import { relatedPostsFor } from "@/data/calculators";
import { STREAMING_ANNUAL_PLANS } from "@/data/streaming-annual-plans";
import { Prose } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatBRL, formatLongDate } from "@/lib/format";
import {
  buildAnnualPlanTable,
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
// Every figure the FAQ and the table quote comes from the calculator or a service's own page.
const DEFAULT_RESULT = calculateSubscriptions(defaults());
const PLAN_TABLE = buildAnnualPlanTable(STREAMING_ANNUAL_PLANS.plans);
const PRICES_CHECKED = formatLongDate(STREAMING_ANNUAL_PLANS.checkedAt);

function plan(service: string, name: string) {
  const row = PLAN_TABLE.find(
    (candidate) => candidate.service === service && candidate.plan === name,
  );
  if (!row) throw new Error(`No plan ${service} ${name}`);
  return row;
}
const PRIME = plan("Amazon Prime", "");
const DISNEY_STANDARD = plan("Disney+", "Padrão");
const DISNEY_PREMIUM = plan("Disney+", "Premium");
const MAX_BASIC = plan("HBO Max", "Básico com anúncios");
const MAX_PLATINUM = plan("HBO Max", "Platinum");
const TRIO = [PRIME, DISNEY_STANDARD, MAX_BASIC];
const TRIO_MONTHLY = calculateSubscriptions(
  TRIO.map((row, index) => ({
    id: `trio-monthly-${index}`,
    name: row.service,
    category: "Streaming",
    value: row.monthly,
    cycle: "monthly" as const,
    keep: true,
  })),
);
const TRIO_ANNUAL = calculateSubscriptions(
  TRIO.map((row, index) => ({
    id: `trio-annual-${index}`,
    name: row.service,
    category: "Streaming",
    value: row.annual,
    cycle: "annual" as const,
    keep: true,
  })),
);

function months(value: number): string {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function percent(share: number): string {
  return `${Math.round(share * 100)}%`;
}

const FAQ: FAQItem[] = [
  {
    question: "Quanto custa ter streaming em casa?",
    answer: `Nas páginas oficiais, em ${PRICES_CHECKED}, o Amazon Prime custava ${formatBRL(PRIME.monthly)} por mês, o Disney+ de ${formatBRL(DISNEY_STANDARD.monthly)} (Padrão) a ${formatBRL(DISNEY_PREMIUM.monthly)} (Premium) e o HBO Max de ${formatBRL(MAX_BASIC.monthly)} (Básico com anúncios) a ${formatBRL(MAX_PLATINUM.monthly)} (Platinum). Prime, Disney+ Padrão e HBO Max Básico juntos dão ${formatBRL(TRIO_MONTHLY.monthlyTotal)} por mês, ${formatBRL(TRIO_MONTHLY.annualTotal)} no ano; nos planos anuais, ${formatBRL(TRIO_ANNUAL.annualTotal)}.`,
  },
  {
    question: "Como registrar assinatura anual?",
    answer:
      "Escolha a frequência 'Anual' e informe o valor total do ano. A calculadora divide por 12 para a média mensal: R$ 1.200 por ano viram R$ 100 por mês.",
  },
  {
    question: "Como simular cortes de assinaturas?",
    answer:
      "Desmarque 'Manter' na assinatura que quer cortar. O resultado recalcula na hora e mostra a economia.",
  },
  {
    question: "Plano anual ou mensal: qual vale mais a pena?",
    answer: `Depende de quantos meses você vai usar. O preço do plano anual equivale a um certo número de mensalidades: no Amazon Prime, ${months(PRIME.breakEvenMonths)}; no HBO Max Platinum, ${months(MAX_PLATINUM.breakEvenMonths)}. Se você vai manter o serviço pelo menos esse tempo, o anual sai mais barato; se pretende assinar só alguns meses e cancelar, o mensal custa menos. A tabela mostra o número de cada plano.`,
  },
  {
    question: "Quanto se gasta por ano com assinaturas?",
    answer: `Não há um número oficial: depende de quantas você tem. O exemplo da calculadora, com um streaming de R$ 39,90, uma academia de R$ 99,90 e um software de R$ 240 por ano, soma ${formatBRL(DEFAULT_RESULT.monthlyTotal)} por mês, ${formatBRL(DEFAULT_RESULT.annualTotal)} por ano e ${formatBRL(DEFAULT_RESULT.fiveYearTotal)} em cinco anos.`,
  },
  {
    question: "Como saber quais assinaturas estou pagando?",
    answer:
      "Revise a fatura do cartão e o extrato dos últimos meses e procure cobranças que se repetem. As assinaturas feitas pelo celular também aparecem na área de assinaturas da Google Play ou da App Store.",
  },
  {
    question: "É possível compartilhar uma assinatura?",
    answer: `Depende dos termos de cada serviço. A Netflix, por exemplo, diz que não é possível compartilhar a conta fora da residência: quem mora em outro lugar precisa de conta própria ou ser incluído como assinante extra, pago à parte (Central de Ajuda da Netflix, consultada em ${PRICES_CHECKED}). Planos família ou duo, quando existem, são a forma prevista de dividir.`,
  },
  {
    question: "Como economizar em assinaturas?",
    answer:
      "Cancele as que não usa, assine por temporada os serviços que você só usa em alguns meses, prefira o plano anual só para os que você usa o ano inteiro, e veja se há plano família, duo ou combo que substitua duas assinaturas.",
  },
  {
    question: "Assinatura de software vale a pena?",
    answer:
      "Vale quando o uso paga a mensalidade, como num programa que você usa para trabalhar. Para uso eventual, alternativas gratuitas costumam bastar.",
  },
  {
    question: "Qual é o custo de uma assinatura em cinco anos?",
    answer:
      "O valor mensal vezes 60. R$ 500 por mês viram R$ 30.000 em cinco anos; reduzir para R$ 200 economiza R$ 18.000 no período. A calculadora mostra essa projeção para a sua lista.",
  },
  {
    question: "Os preços são atualizados automaticamente?",
    answer: `Não. Você informa o valor que paga. Os preços da tabela de planos anuais foram consultados nas páginas oficiais em ${PRICES_CHECKED} e podem ter mudado.`,
  },
  {
    question: "Devo cancelar tudo para economizar?",
    answer:
      "Não necessariamente. Cancele o que você não usa e mantenha o que traz valor: um serviço usado todo dia vale mais que um usado uma vez por mês.",
  },
];

export const Route = createFileRoute("/calculadora-assinaturas")({
  head: () => ({
    meta: [
      { title: `${PAGE_TITLE} | Calcule Brasil` },
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
      <AnnualPlanSection />
      <div className="mx-auto max-w-6xl space-y-10 px-4 pb-16 sm:px-6">
        <FAQSection items={FAQ} />
        <RelatedCalculators slugs={["morar-sozinho", "conta-de-luz", "custo-pet"]} />
        <RelatedPosts slugs={relatedPostsFor("assinaturas")} />
      </div>
    </CalculatorLayout>
  );
}

function AnnualPlanSection() {
  return (
    <Prose>
      <h2>Plano anual ou mensal: a partir de quantos meses o anual compensa</h2>
      <p>
        Alguns serviços vendem o mesmo plano por mês ou por ano. O preço do anual equivale a um
        certo número de mensalidades: se você vai manter a assinatura pelo menos esse tempo, o anual
        sai mais barato; se pretende assinar só alguns meses e cancelar, o mensal custa menos. A
        tabela foi calculada pela própria calculadora com os preços das páginas oficiais em{" "}
        {PRICES_CHECKED}.
      </p>
      <div className="not-prose overflow-x-auto rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)]">
        <table className="w-full min-w-[620px] text-sm">
          <caption className="sr-only">
            Plano mensal e anual de serviços de streaming e a partir de quantos meses o anual
            compensa
          </caption>
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th scope="col" className="px-3 py-2.5">
                Serviço e plano
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Mensal
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Anual
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Economia no ano
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Anual compensa a partir de
              </th>
            </tr>
          </thead>
          <tbody>
            {PLAN_TABLE.map((row) => (
              <tr key={`${row.service}-${row.plan}`} className="border-t border-border/70">
                <th scope="row" className="px-3 py-2 text-left font-medium text-foreground">
                  {row.plan ? `${row.service} ${row.plan}` : row.service}
                </th>
                <td className="px-3 py-2 text-right">{formatBRL(row.monthly)}</td>
                <td className="px-3 py-2 text-right">{formatBRL(row.annual)}</td>
                <td className="px-3 py-2 text-right">
                  {formatBRL(row.yearlySaving)} ({percent(row.savingShare)})
                </td>
                <td className="px-3 py-2 text-right font-semibold text-foreground">
                  {months(row.breakEvenMonths)} meses
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        No Disney+, o plano anual é cobrado em 12 parcelas e a página avisa: "pagamento antecipado
        obrigatório". Os preços mudam; confira a página de cada serviço:{" "}
        {[...new Map(PLAN_TABLE.map((row) => [row.service, row.sourceUrl])).entries()].map(
          ([service, url], index, all) => (
            <span key={service}>
              <a href={url} target="_blank" rel="noreferrer">
                {service}
              </a>
              {index < all.length - 1 ? ", " : "."}
            </span>
          ),
        )}
      </p>
    </Prose>
  );
}
