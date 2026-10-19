import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { CalculatorLayout, FormSection } from "@/components/calculator/CalculatorLayout";
import { CurrencyInput } from "@/components/calculator/fields";
import { ResultSummaryCard, BreakdownTable, DisclaimerBox } from "@/components/calculator/results";
import { FAQSection } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { RelatedPosts } from "@/components/calculator/RelatedPosts";
import { relatedPostsFor } from "@/data/calculators";
import { formatBRL } from "@/lib/format";
import {
  buildBenefitEquivalenceTable,
  calculateTaxFreeBenefits,
  type TaxFreeBenefitsInput,
} from "@/lib/calculators/beneficiosFiscais";
import { Prose } from "@/components/layout/PageShell";
import { absoluteUrl } from "@/lib/site";
import { calculatorStructuredData } from "@/lib/structured-data";
import { usePersistedState } from "@/lib/usePersistedState";

const DEFAULTS: TaxFreeBenefitsInput = {
  monthlyGrossSalary: 5000,
  monthlyMealAllowance: 800,
  monthlyTransportCost: 0,
};

/** The page's table: R$ 800 of meal benefit, at each salary. */
const TABLE_BENEFIT = 800;
const EQUIVALENCE_ROWS = buildBenefitEquivalenceTable(
  [1621, 3000, 5000, 6500, 8000, 12_000, 20_000],
  TABLE_BENEFIT,
);

const AT_5000 = EQUIVALENCE_ROWS.find((row) => row.monthlyGrossSalary === 5000);

function percent(share: number): string {
  return `${(share * 100).toFixed(0)}%`;
}

const DESCRIPTION =
  "Quanto valem de verdade vale-refeição, vale-alimentação e vale-transporte: veja o equivalente em salário bruto necessário para chegar ao mesmo líquido.";

const FAQ = [
  {
    question: "Vale-refeição e vale-transporte reduzem o IRPF?",
    answer:
      "Eles não entram na base de cálculo do IRPF nem do INSS quando concedidos nas condições previstas na legislação, então o efeito prático é o mesmo de uma renda isenta. Não é uma dedução na declaração: é um valor que simplesmente não é tributado, por isso um benefício de R$ 500 costuma valer mais que R$ 500 de aumento salarial.",
  },
  {
    question: "Existe um limite de valor para o vale-refeição?",
    answer:
      "Não há um teto em reais fixado em lei para a concessão. O que a legislação define são as condições de natureza não salarial do benefício, hoje concentradas nas regras do Programa de Alimentação do Trabalhador e nas alterações trazidas pela Lei 14.442/2022 — entre elas a exigência de que o valor seja usado apenas para alimentação. Valores muito acima do padrão de mercado da função podem ser questionados como salário disfarçado.",
  },
  {
    question: "Como funciona o desconto do vale-transporte?",
    answer:
      "A empresa pode descontar do empregado até 6% do salário-base a título de vale-transporte, e arca com o que exceder esse percentual. Se o custo total do deslocamento for menor que 6% do salário, o desconto fica limitado ao custo real. O benefício é de adesão opcional: o empregado pode recusá-lo.",
  },
  {
    question: "Vale-refeição e vale-alimentação são a mesma coisa?",
    answer:
      "Não. O vale-refeição destina-se a refeições prontas em restaurantes e similares, e o vale-alimentação à compra de gêneros em supermercados. Desde a Lei 14.442/2022 os valores não podem ser desviados para outras finalidades, e a portabilidade entre operadoras de cartão foi facilitada.",
  },
  {
    question: "Vale a pena trocar benefício por aumento de salário?",
    answer:
      "Quase nunca em valores equivalentes. Como o benefício não sofre incidência de INSS nem de IRPF, seria preciso um aumento bruto consideravelmente maior para chegar ao mesmo líquido — é exatamente esse número que a calculadora mostra. Por outro lado, salário maior aumenta a base de FGTS, 13º, férias e da futura aposentadoria, o que o benefício não faz.",
  },
];

export const Route = createFileRoute("/calculadora-beneficios-fiscais")({
  head: () => ({
    meta: [
      { title: "Calculadora Benefícios Fiscais | Calcule Brasil" },
      { name: "description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/calculadora-beneficios-fiscais") }],
    scripts: calculatorStructuredData({
      name: "Calculadora Benefícios Fiscais",
      description: DESCRIPTION,
      path: "/calculadora-beneficios-fiscais",
      applicationCategory: "FinanceApplication",
      faq: FAQ,
    }),
  }),
  component: Calculator,
});

function Calculator() {
  const [input, setInput] = usePersistedState<TaxFreeBenefitsInput>(
    "beneficios-input-v3",
    DEFAULTS,
  );
  const result = useMemo(() => calculateTaxFreeBenefits(input), [input]);

  return (
    <CalculatorLayout
      title="Calculadora Benefícios Fiscais"
      description="Simule economia com vale refeição, transporte e outros benefícios"
    >
      <FormSection title="Salário e benefícios" description="Valores mensais">
        <CurrencyInput
          label="Salário bruto mensal"
          value={input.monthlyGrossSalary}
          onChange={(v) => setInput({ ...input, monthlyGrossSalary: v })}
          hint="Define os 6% do vale-transporte e quanto um aumento pagaria de INSS e IR"
        />
        <CurrencyInput
          label="Vale-refeição ou vale-alimentação mensal"
          value={input.monthlyMealAllowance}
          onChange={(v) => setInput({ ...input, monthlyMealAllowance: v })}
          hint="O valor que a empresa credita no cartão por mês"
        />
        <CurrencyInput
          label="Custo mensal do transporte público até o trabalho"
          value={input.monthlyTransportCost}
          onChange={(v) => setInput({ ...input, monthlyTransportCost: v })}
          hint="O total das passagens do mês, antes do vale-transporte"
        />
      </FormSection>

      <ResultSummaryCard
        title="Quanto os benefícios valem em salário"
        mainValue={formatBRL(result.equivalentGrossRaise)}
        mainLabel="De aumento bruto para ter o mesmo dinheiro"
        secondaryValue={formatBRL(result.monthlyBenefitTotal)}
        secondaryLabel="Valor dos benefícios por mês, sem desconto"
        resultColor="positive"
      />

      <BreakdownTable
        title="Detalhes"
        items={[
          {
            label: "Vale-refeição ou alimentação",
            value: formatBRL(result.monthlyMealAllowance),
            subtext: "Sem INSS nem imposto de renda",
          },
          {
            label: "Vale-transporte: parte da empresa",
            value: formatBRL(result.transportEmployerShare),
            subtext: `Você paga ${formatBRL(result.transportEmployeeShare)}, até 6% do salário`,
          },
          {
            label: "Total que os benefícios valem",
            value: formatBRL(result.monthlyBenefitTotal),
            subtext: `${formatBRL(result.annualBenefitTotal)} por ano`,
          },
          {
            label: "INSS e IR que um aumento pagaria",
            value: formatBRL(result.taxesOnEquivalentRaise),
            subtext: "Na sua faixa de salário",
          },
          {
            label: "Aumento bruto equivalente",
            value: formatBRL(result.equivalentGrossRaise),
            subtext: "Quanto o salário teria de subir para sobrar o mesmo",
            isFinal: true,
          },
        ]}
      />

      <DisclaimerBox>
        <p>
          A estimativa considera que os benefícios são concedidos nas condições que afastam INSS e
          imposto de renda: o vale-refeição dentro do Programa de Alimentação do Trabalhador (Lei
          6.321/1976) e o vale-transporte pela Lei 7.418/1985. O aumento equivalente é calculado
          pela calculadora de salário líquido, sem dependentes. Regras específicas de convenção
          coletiva, benefícios pagos em dinheiro e situações em que a verba é considerada de
          natureza salarial podem mudar o resultado. Trata-se de conteúdo educativo, não de
          orientação tributária individual.
        </p>
      </DisclaimerBox>

      <EquivalenceSection />

      <FAQSection items={FAQ} />

      <RelatedCalculators excludeSlug="beneficios-fiscais" />
      <RelatedPosts slugs={relatedPostsFor("beneficios-fiscais")} />
    </CalculatorLayout>
  );
}

function EquivalenceSection() {
  return (
    <Prose>
      <h2>Quanto aumento vale um vale-refeição, em cada salário</h2>
      <p>
        A tabela abaixo foi calculada pela própria calculadora para {formatBRL(TABLE_BENEFIT)} por
        mês de vale-refeição. A coluna do aumento mostra quanto o salário bruto teria de subir para
        sobrar a mesma quantia depois do INSS e do imposto de renda.
      </p>
      <div className="not-prose overflow-x-auto rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)]">
        <table className="w-full min-w-[520px] text-sm">
          <caption className="sr-only">
            Aumento bruto equivalente a R$ 800 de vale-refeição, por salário, em 2026
          </caption>
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th scope="col" className="px-3 py-2.5">
                Salário bruto
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Benefício
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Aumento equivalente
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                A mais que o benefício
              </th>
            </tr>
          </thead>
          <tbody>
            {EQUIVALENCE_ROWS.map((row) => (
              <tr key={row.monthlyGrossSalary} className="border-t border-border/70">
                <th scope="row" className="px-3 py-2 text-left font-medium text-foreground">
                  {formatBRL(row.monthlyGrossSalary)}
                </th>
                <td className="px-3 py-2 text-right">{formatBRL(row.monthlyBenefitTotal)}</td>
                <td className="px-3 py-2 text-right font-semibold text-foreground">
                  {formatBRL(row.equivalentGrossRaise)}
                </td>
                <td className="px-3 py-2 text-right">{percent(row.premium)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        A diferença depende da faixa. Até cerca de R$ 5.000, a redução de 2026 isenta o salário do
        imposto de renda, e o aumento só paga INSS. Logo acima, cada real de aumento paga INSS e
        imposto de renda e ainda encolhe a redução de 2026, que vai sumindo até R$ 7.350. Por isso,
        para quem ganha {formatBRL(AT_5000?.monthlyGrossSalary ?? 5000)}, {formatBRL(TABLE_BENEFIT)}
        de vale-refeição valem {formatBRL(AT_5000?.equivalentGrossRaise ?? 0)} de aumento. Acima do
        teto do INSS, só o imposto de renda incide. Em contrapartida, salário maior aumenta também o
        FGTS, o 13º e as férias, o que o benefício não faz.
      </p>
    </Prose>
  );
}
