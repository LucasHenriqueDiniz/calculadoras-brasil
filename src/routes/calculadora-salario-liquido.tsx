import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { CalculatorLayout, FormSection } from "@/components/calculator/CalculatorLayout";
import { CurrencyInput, NumberInput } from "@/components/calculator/fields";
import { DisclaimerBox, ResultSummaryCard, BreakdownTable } from "@/components/calculator/results";
import { CopyResultButton, ResetButton, ShareResultButton } from "@/components/calculator/actions";
import { FAQSection, type FAQItem } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { RelatedPosts } from "@/components/calculator/RelatedPosts";
import { relatedPostsFor } from "@/data/calculators";
import { Prose } from "@/components/layout/PageShell";
import { formatBRL } from "@/lib/format";
import { MINIMUM_WAGE } from "@/lib/calculators/inss-constants";
import {
  buildNetSalaryTable,
  calculateNetSalary,
  simplifiedRouteCeiling,
  type NetSalaryInput,
} from "@/lib/calculators/salarioLiquido";
import { absoluteUrl } from "@/lib/site";
import { calculatorStructuredData } from "@/lib/structured-data";
import { usePersistedState } from "@/lib/usePersistedState";

const PAGE_TITLE = "Calculadora de Salário Líquido 2026";
const PAGE_DESCRIPTION =
  "Descubra quanto você realmente recebe. Calcule seu salário líquido descontando IRPF, INSS, sindicato e outros descontos automáticos.";

const DEFAULTS: NetSalaryInput = {
  monthlyGrossSalary: 5000,
  dependants: 0,
  monthlyPrivatePension: 0,
  monthlyMealAllowance: 0,
  monthlyTransportCost: 0,
  hasUnionDue: false,
};

const FAQ: FAQItem[] = [
  {
    question: "Qual é a diferença entre salário bruto e líquido?",
    answer:
      "Salário bruto é o valor antes dos descontos. Salário líquido é o que você recebe depois do INSS, do imposto de renda e de descontos como o vale-transporte. A diferença depende do salário: a tabela desta página mostra o líquido de cada faixa.",
  },
  {
    question: "Como funciona a retenção de IRPF na folha?",
    answer:
      "Seu empregador calcula e desconta o IRPF mensalmente (retenção na fonte). No final do ano, você declara e acerta: se reteve demais, recebe restituição; se reteve pouco, paga diferença.",
  },
  {
    question: "O INSS é obrigatório?",
    answer:
      "Sim. Empregados CLT pagam INSS de 7,5% a 14%, com cada alíquota aplicada só sobre a parte do salário dentro da sua faixa. É obrigatório para ter direito a benefícios (auxílio-doença, maternidade, aposentadoria).",
  },
  {
    question: "Vale refeição reduz meu imposto?",
    answer:
      "Não reduz o imposto do salário. O que acontece é que ele mesmo não é tributado: dentro do Programa de Alimentação do Trabalhador, não entra no salário de contribuição do INSS (Lei 6.321/1976, art. 3º), e a alimentação fornecida pelo empregador é isenta de imposto de renda (Lei 7.713/1988, art. 6º, I). Para saber quanto ele vale em salário, use a calculadora de benefícios fiscais.",
  },
  {
    question: "Dependentes reduzem meu desconto de IRPF?",
    answer:
      "Sim. Cada dependente reduz a base de cálculo do IRPF em R$ 2.275/ano (~R$ 189/mês). Filhos, cônjuge, pais a seu cargo contam como dependentes.",
  },
  {
    question: "Como reduzir meu desconto de IRPF?",
    answer:
      "Na folha, só reduzem a retenção os dependentes, a contribuição a previdência complementar do tipo PGBL e a pensão alimentícia judicial. Gastos com saúde e educação não entram no desconto mensal: eles reduzem o imposto no ajuste anual da declaração.",
  },
  {
    question: "Posso negociar um salário bruto maior?",
    answer:
      "Sim. Conhecendo a diferença bruto→líquido, você pode negociar melhor. Peça o salário bruto que resulta no líquido desejado, não ao contrário.",
  },
  {
    question: "O que é o desconto simplificado mensal?",
    answer:
      "É um desconto fixo de R$ 607,20 que a fonte pagadora pode usar no lugar das deduções legais (INSS, dependentes, previdência) quando ele for mais vantajoso para você, como prevê o art. 4º, § 2º, da Lei 9.250/1995. Em 2026 isso acontece, sem dependentes, para salários até cerca de R$ 5.755: abaixo disso o INSS é menor que R$ 607,20. A calculadora aplica sozinha o que for mais vantajoso.",
  },
  {
    question: "O resultado da calculadora é garantido?",
    answer:
      "É uma estimativa educativa. Seu IRPF real pode variar conforme dependentes adicionados na declaração, deduções, e outras particularidades. Use como referência.",
  },
];

/** Gross salaries shown in the reference table, from the 2026 minimum wage up. */
const TABLE_GROSS_SALARIES = [
  MINIMUM_WAGE,
  2000,
  2500,
  3000,
  3500,
  4000,
  4500,
  5000,
  5500,
  6000,
  7000,
  8000,
  10_000,
  12_000,
  15_000,
  20_000,
];

const TABLE_ROWS = buildNetSalaryTable(TABLE_GROSS_SALARIES);
const EXAMPLE = calculateNetSalary({
  monthlyGrossSalary: 6000,
  dependants: 0,
  monthlyPrivatePension: 0,
  monthlyMealAllowance: 0,
  monthlyTransportCost: 0,
  hasUnionDue: false,
});
const AT_EXEMPTION_LIMIT = TABLE_ROWS.find((row) => row.monthlyGrossSalary === 5000);
const SIMPLIFIED_CEILING = simplifiedRouteCeiling(0);

function formatPercent(share: number): string {
  return `${(share * 100).toFixed(1).replace(".", ",")}%`;
}

function SalaryTableSection() {
  return (
    <section aria-labelledby="tabela-salario-liquido" className="space-y-5">
      <h2 id="tabela-salario-liquido" className="font-display text-2xl text-foreground">
        Quanto sobra do salário em 2026, faixa a faixa
      </h2>
      <p className="leading-relaxed text-foreground/85">
        A tabela abaixo foi calculada pela própria calculadora desta página, para quem não tem
        dependentes, previdência complementar, vale-transporte nem contribuição sindical. Cada linha
        é exatamente o que você veria digitando aquele salário bruto no formulário acima.
      </p>

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)]">
        <table className="w-full min-w-[720px] text-sm">
          <caption className="sr-only">
            Salário líquido mensal em 2026 por salário bruto, sem dependentes
          </caption>
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th scope="col" className="px-3 py-2.5">
                Salário bruto
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                INSS
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Abatimento na base
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                IR pela tabela
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Redução 2026
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                IR retido
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Salário líquido
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Fica com você
              </th>
            </tr>
          </thead>
          <tbody>
            {TABLE_ROWS.map((row) => (
              <tr key={row.monthlyGrossSalary} className="border-t border-border/70">
                <th scope="row" className="px-3 py-2 text-left font-medium text-foreground">
                  {formatBRL(row.monthlyGrossSalary)}
                </th>
                <td className="px-3 py-2 text-right">{formatBRL(row.inssWithheld)}</td>
                <td className="px-3 py-2 text-right">
                  {formatBRL(row.baseDeduction)}{" "}
                  <abbr
                    title={
                      row.deductionApplied === "simplified"
                        ? "desconto simplificado"
                        : "deduções legais"
                    }
                    className="text-xs text-muted-foreground no-underline"
                  >
                    {row.deductionApplied === "simplified" ? "S" : "L"}
                  </abbr>
                </td>
                <td className="px-3 py-2 text-right">{formatBRL(row.taxFromTable)}</td>
                <td className="px-3 py-2 text-right">{formatBRL(row.reductionLei15270)}</td>
                <td className="px-3 py-2 text-right">{formatBRL(row.estimatedIrpfWithheld)}</td>
                <td className="px-3 py-2 text-right font-semibold text-foreground">
                  {formatBRL(row.monthlyNetSalary)}
                </td>
                <td className="px-3 py-2 text-right">{formatPercent(row.netShare)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        Valores mensais. S: desconto simplificado de R$ 607,20. L: deduções legais (INSS,
        dependentes e previdência). Em cada linha vale o que for mais vantajoso.
      </p>

      <Prose>
        <h3>O que a tabela mostra</h3>
        <p>
          <strong>Até R$ 5.000, o imposto retido é zero.</strong> Não porque a tabela progressiva
          mudou: ela continua cobrando a partir de R$ 2.428,80 de base. É a redução mensal criada
          pela Lei 15.270/2025, de até R$ 312,89, que anula o imposto de quem ganha até R$ 5.000.
          {AT_EXEMPTION_LIMIT && (
            <>
              {" "}
              Na linha de R$ 5.000, a tabela produz {formatBRL(AT_EXEMPTION_LIMIT.taxFromTable)} e a
              redução tira exatamente {formatBRL(AT_EXEMPTION_LIMIT.reductionLei15270)}.
            </>
          )}
        </p>
        <p>
          <strong>Entre R$ 5.000 e R$ 7.350, a redução diminui aos poucos.</strong> Ela é calculada
          sobre o salário bruto, não sobre a base, e chega a zero em R$ 7.350. É por isso que a
          coluna "Fica com você" cai mais depressa nessa faixa do que acima dela: a cada aumento, a
          alíquota sobe e a redução encolhe ao mesmo tempo. Acima de R$ 7.350, vale só a tabela
          progressiva.
        </p>
        <p>
          <strong>
            Sem dependentes, o desconto simplificado vence até {formatBRL(SIMPLIFIED_CEILING)}.
          </strong>{" "}
          A lei deixa abater da base mensal as deduções legais (INSS, dependentes e previdência
          complementar) ou um desconto fixo de R$ 607,20, o que for mais vantajoso para você (Lei
          9.250/1995, art. 4º, § 2º). Sem dependentes, o INSS só passa de R$ 607,20 a partir de{" "}
          {formatBRL(SIMPLIFIED_CEILING)}; abaixo disso, o desconto simplificado retém menos
          imposto. Em R$ 5.000, é essa escolha que zera o imposto: só com o INSS como dedução, ainda
          sobraria imposto a reter. Com um dependente ou mais, as deduções legais já passam de R$
          607,20 em toda a faixa em que há imposto a pagar.
        </p>

        <h3>Exemplo: R$ 6.000 de salário bruto, sem dependentes</h3>
        <ol>
          <li>
            INSS: {formatBRL(EXAMPLE.inssWithheld)}, com cada alíquota aplicada só sobre a parte do
            salário dentro da sua faixa.
          </li>
          <li>
            Abatimento na base: o INSS ({formatBRL(EXAMPLE.legalDeductions)}) já é maior que o
            desconto simplificado de R$ 607,20, então valem as deduções legais. Base do imposto:{" "}
            {formatBRL(EXAMPLE.monthlyAssessableBase)}.
          </li>
          <li>
            Imposto pela tabela progressiva: {formatBRL(EXAMPLE.taxFromTable)} (alíquota de 27,5%
            menos a parcela de R$ 908,73).
          </li>
          <li>
            Redução de 2026: R$ 978,62 − 0,133145 × R$ 6.000 ={" "}
            {formatBRL(EXAMPLE.reductionLei15270)}.
          </li>
          <li>
            Imposto retido: {formatBRL(EXAMPLE.estimatedIrpfWithheld)}. Salário líquido:{" "}
            {formatBRL(EXAMPLE.monthlyNetSalary)}, ou{" "}
            {formatPercent(EXAMPLE.monthlyNetSalary / 6000)} do bruto.
          </li>
        </ol>
      </Prose>
    </section>
  );
}

export const Route = createFileRoute("/calculadora-salario-liquido")({
  head: () => ({
    meta: [
      { title: `${PAGE_TITLE} | Calcule Brasil` },
      { name: "description", content: PAGE_DESCRIPTION },
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: PAGE_DESCRIPTION },
      { property: "og:url", content: absoluteUrl("/calculadora-salario-liquido") },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/calculadora-salario-liquido") }],
    scripts: calculatorStructuredData({
      name: "Calculadora de Salário Líquido",
      description: PAGE_DESCRIPTION,
      url: absoluteUrl("/calculadora-salario-liquido"),
      applicationCategory: "FinanceApplication",
      faq: FAQ,
    }),
  }),
  component: SalarioLiquidoCalculator,
});

function SalarioLiquidoCalculator() {
  const [input, setInput] = usePersistedState<NetSalaryInput>("salario-liquido-input-v4", DEFAULTS);
  const result = useMemo(() => calculateNetSalary(input), [input]);

  const handleReset = () => setInput(DEFAULTS);

  return (
    <CalculatorLayout
      title="Calculadora de Salário Líquido"
      description="Descubra quanto você realmente recebe após todos os descontos"
    >
      <FormSection
        title="Dados salariais"
        description="Informe seu salário bruto e situação pessoal"
      >
        <CurrencyInput
          label="Salário bruto mensal"
          placeholder="Ex: 5000"
          value={input.monthlyGrossSalary}
          onChange={(value) => setInput({ ...input, monthlyGrossSalary: value })}
          hint="Valor antes de qualquer desconto"
        />
        <NumberInput
          label="Número de dependentes"
          placeholder="0"
          value={input.dependants}
          onChange={(value) => setInput({ ...input, dependants: value })}
          min={0}
          max={10}
          hint="Filhos até 21 anos (ou 24 se estudante), cônjuge, pais"
        />
      </FormSection>

      <FormSection
        title="Deduções da retenção mensal (opcional)"
        description="O que a lei deixa abater da base do imposto retido na folha"
      >
        <CurrencyInput
          label="Previdência complementar mensal (PGBL)"
          placeholder="0"
          value={input.monthlyPrivatePension}
          onChange={(value) => setInput({ ...input, monthlyPrivatePension: value })}
          hint="Contribuição mensal a PGBL. VGBL não reduz o imposto."
        />
        <p className="text-sm text-muted-foreground">
          Gastos com saúde e educação não entram no desconto mensal da folha: eles reduzem o imposto
          no ajuste anual. Para simular esse efeito, use a{" "}
          <a
            href="/calculadora-irpf-2026"
            className="text-primary underline-offset-2 hover:underline"
          >
            calculadora de IRPF
          </a>
          .
        </p>
      </FormSection>

      <FormSection
        title="Benefícios e descontos"
        description="Vale refeição, transporte, sindicato"
      >
        <CurrencyInput
          label="Vale-refeição ou alimentação por mês"
          value={input.monthlyMealAllowance}
          onChange={(value) => setInput({ ...input, monthlyMealAllowance: value })}
          hint="O valor creditado. Não sai do salário e não entra no imposto."
        />
        <CurrencyInput
          label="Custo mensal do transporte (vale-transporte)"
          value={input.monthlyTransportCost}
          onChange={(value) => setInput({ ...input, monthlyTransportCost: value })}
          hint="O desconto é de até 6% do salário, sem passar desse custo (Lei 7.418/1985). Deixe 0 se não recebe."
        />
        <label className="flex items-center gap-2 sm:col-span-2">
          <input
            type="checkbox"
            checked={input.hasUnionDue}
            onChange={(e) => setInput({ ...input, hasUnionDue: e.target.checked })}
            className="h-4 w-4"
          />
          <span>Autorizei a contribuição sindical (um dia de salário, descontado só em março)</span>
        </label>
      </FormSection>

      <ResultSummaryCard
        title="Seu Salário Líquido"
        mainValue={formatBRL(result.monthlyNetSalary)}
        mainLabel="Salário líquido mensal"
        secondaryValue={
          result.nonTaxableBenefits > 0
            ? formatBRL(result.totalMonthlyIncome)
            : `${result.effectiveIrpfRate.toFixed(2).replace(".", ",")}%`
        }
        secondaryLabel={
          result.nonTaxableBenefits > 0
            ? "Total com benefícios não tributáveis"
            : "Alíquota efetiva de IRPF"
        }
        resultColor="positive"
      />

      <BreakdownTable
        title="Detalhamento mensal"
        items={[
          {
            label: "Salário bruto",
            value: formatBRL(result.monthlyGrossSalary),
          },
          {
            label: "Desconto INSS (7,5% a 14%)",
            value: `- ${formatBRL(result.inssWithheld)}`,
            subtext: "Contribuição para seguridade social",
          },
          {
            label: "Abatimento na base do IR",
            value: formatBRL(
              result.deductionApplied === "simplified"
                ? result.simplifiedDeduction
                : result.legalDeductions,
            ),
            subtext:
              result.deductionApplied === "simplified"
                ? `Desconto simplificado, mais vantajoso que as deduções legais (${formatBRL(result.legalDeductions)}). Reduz só a base do imposto, não sai do salário.`
                : `Deduções legais (INSS, dependentes e previdência), mais vantajosas que o desconto simplificado (${formatBRL(result.simplifiedDeduction)}). Reduzem só a base do imposto.`,
          },
          {
            label: "Desconto IRPF (retenção)",
            value: `- ${formatBRL(result.estimatedIrpfWithheld)}`,
            subtext: `Alíquota efetiva: ${result.effectiveIrpfRate.toFixed(1).replace(".", ",")}%`,
          },
          {
            label: "Desconto vale transporte",
            value:
              result.transportAllowanceDeduction > 0
                ? `- ${formatBRL(result.transportAllowanceDeduction)}`
                : "R$ 0",
          },
          {
            label: "Salário líquido",
            value: formatBRL(result.monthlyNetSalary),
            isFinal: true,
          },
          ...(result.unionDueInMarch > 0
            ? [
                {
                  label: "Contribuição sindical (só em março)",
                  value: `- ${formatBRL(result.unionDueInMarch)}`,
                  subtext:
                    "Um dia de salário, descontado uma vez por ano da folha de março (CLT, arts. 580 e 582).",
                },
              ]
            : []),
          {
            label: "Benefícios não tributáveis (vale refeição)",
            value: formatBRL(result.nonTaxableBenefits),
            subtext: "Não entra no imposto de renda",
          },
          {
            label: "Ganho total mensal",
            value: formatBRL(result.totalMonthlyIncome),
            isFinal: true,
          },
        ]}
      />

      <DisclaimerBox>
        <Prose>
          <p>
            Esta calculadora estima seu salário líquido baseado nas tabelas de 2026. Seu valor real
            pode variar conforme:
          </p>
          <ul>
            <li>Ajustes de IRPF na declaração anual (dependentes, deduções reais)</li>
            <li>Vale transporte individual (varia por cidade)</li>
            <li>Contribuições adicionais (Vale Refeição, Convênios)</li>
            <li>Bônus e complementos salariais</li>
          </ul>
          <p>
            Esta página calcula a <strong>retenção mensal na folha</strong>, com a tabela mensal e a
            redução mensal da Lei 15.270/2025. A{" "}
            <a href="/calculadora-irpf-2026">calculadora de IRPF</a> faz a conta anual, que tem
            tabela e redução próprias — por isso os dois resultados não batem exatamente para a
            mesma pessoa. A diferença é acertada no ajuste da declaração.
          </p>
          <p>Use como referência. Verifique seu contracheque para valores exatos.</p>
        </Prose>
      </DisclaimerBox>

      <div className="flex gap-2">
        <CopyResultButton value={`Salário líquido: ${formatBRL(result.monthlyNetSalary)}`} />
        <ShareResultButton
          title="Meu salário líquido 2026"
          text={`Calculei que meu salário líquido é ${formatBRL(result.monthlyNetSalary)} (bruto de ${formatBRL(result.monthlyGrossSalary)})`}
        />
        <ResetButton onClick={handleReset} />
      </div>

      <SalaryTableSection />

      <FAQSection items={FAQ} />

      <RelatedCalculators excludeSlug="salario-liquido" />
      <RelatedPosts slugs={relatedPostsFor("salario-liquido")} />
    </CalculatorLayout>
  );
}
