import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { CalculatorLayout, FormSection } from "@/components/calculator/CalculatorLayout";
import { CurrencyInput, NumberInput } from "@/components/calculator/fields";
import {
  DisclaimerBox,
  ResultSummaryCard,
  BreakdownTable,
  WarningList,
} from "@/components/calculator/results";
import { CopyResultButton, ResetButton, ShareResultButton } from "@/components/calculator/actions";
import { FAQSection, type FAQItem } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { RelatedPosts } from "@/components/calculator/RelatedPosts";
import { relatedPostsFor } from "@/data/calculators";
import { Prose } from "@/components/layout/PageShell";
import { formatBRL } from "@/lib/format";
import {
  buildRegimeThresholdTable,
  compareIrpfRegimes,
  type IrpfInput,
} from "@/lib/calculators/irpf";
import { absoluteUrl } from "@/lib/site";
import { calculatorStructuredData } from "@/lib/structured-data";
import { usePersistedState } from "@/lib/usePersistedState";

const meta = {
  slug: "irpf-2026",
  path: "/calculadora-irpf-2026",
};
const PAGE_TITLE = "Calculadora IRPF 2026 - Declaração completa ou simplificada";
const PAGE_DESCRIPTION =
  "Simule o imposto de renda do ano-calendário 2026 nos dois regimes, completo e simplificado, com dependentes, saúde, educação e previdência, e a redução que isenta quem recebe até R$ 5.000 por mês.";

/** The form no longer picks a regime: both are computed, so the stored flag is ignored. */
type IrpfFormInput = Omit<IrpfInput, "simplifiedRegime">;

const DEFAULTS: IrpfFormInput = {
  grossAnnualIncome: 48000,
  dependants: 0,
  educationDeduction: 0,
  healthDeduction: 0,
  supplementaryPensionDeduction: 0,
};

const THRESHOLD_INCOMES = [
  36_000, 48_000, 60_000, 72_000, 90_000, 120_000, 180_000, 240_000, 360_000,
];
const THRESHOLD_ROWS = buildRegimeThresholdTable(THRESHOLD_INCOMES);

const FAQ: FAQItem[] = [
  {
    question: "Como funciona o cálculo do IRPF 2026?",
    answer:
      "O IRPF segue uma tabela progressiva: quanto mais você ganha, maior a alíquota. Em 2026 há duas etapas. Primeiro a tabela anual: até R$ 29.145,60 isento, depois 7,5%, 15%, 22,5% e 27,5% nas faixas seguintes. Depois a redução da Lei 15.270/2025, que abate o imposto de quem ganha menos e pode zerá-lo.",
  },
  {
    question: "Qual é a alíquota IRPF para cada faixa salarial?",
    answer:
      "Na tabela anual de 2026: até R$ 29.145,60 é isento; de R$ 29.145,61 a R$ 33.919,80 são 7,5%; até R$ 45.012,60 são 15%; até R$ 55.976,16 são 22,5%; acima disso, 27,5%. Sobre o resultado ainda incide a redução da Lei 15.270/2025, então a alíquota da faixa não é o que você paga de fato.",
  },
  {
    question: "Dependentes reduzem meu IRPF?",
    answer:
      "Sim, cada dependente reduz R$ 2.275,08 da base imponível em 2026. Cônjuge, filhos até 21 anos (ou 24 se estudante), pais, irmãos menores contam. A redução é significativa se tiver vários dependentes.",
  },
  {
    question: "Educação é dedutível no IRPF?",
    answer:
      "Sim, as mensalidades pagas a estabelecimentos de ensino: educação infantil, ensino fundamental e médio, graduação, pós-graduação e cursos técnicos. O limite é de R$ 3.561,50 por ano para cada pessoa, você e cada dependente (Lei 9.250/1995, art. 8º). Uniforme, material escolar, transporte e cursos livres, como idiomas, não entram.",
  },
  {
    question: "Saúde é dedutível no IRPF?",
    answer:
      "Sim, sem limite de valor: consultas com médicos, dentistas, psicólogos, fisioterapeutas e fonoaudiólogos, hospitais, exames, plano de saúde e próteses. Medicamentos comprados em farmácia não entram, a não ser que estejam na conta do hospital. Guarde os comprovantes de todas as despesas.",
  },
  {
    question: "Vale a pena usar o regime simplificado?",
    answer:
      "Depende das suas deduções. O simplificado desconta 20% da renda bruta, até R$ 17.640,00 por ano, no lugar de todas as outras deduções, inclusive INSS e dependentes. O completo soma INSS, dependentes, saúde, educação e previdência. Esta calculadora faz as duas contas e mostra qual paga menos, e a tabela da página mostra, para cada renda, quanto de deduções é preciso para o completo compensar.",
  },
  {
    question: "Quando devo declarar IRPF?",
    answer:
      "A declaração do ano-calendário 2026 é feita em 2027, entre março e abril. Os limites de obrigatoriedade desse ano ainda não foram publicados pela Receita. Como referência, na declaração entregue em 2026 — referente a 2025 — era obrigado a declarar quem teve mais de R$ 35.584,00 de rendimentos tributáveis ou bens acima de R$ 800.000,00. Confirme o valor vigente no site da Receita Federal.",
  },
  {
    question: "Como funciona o desconto INSS na calculadora?",
    answer:
      "Se você é CLT, o INSS é retido na folha automaticamente. A calculadora aplica as faixas progressivas de 2026 sobre o salário mensal e limita a contribuição ao teto do RGPS, em vez de usar um percentual único. Autônomos pagam diretamente, com alíquota conforme a categoria.",
  },
  {
    question: "Previdência complementar é dedutível?",
    answer:
      "Sim, até o limite de 12% do seu rendimento tributável no ano — a regra é uma proporção da renda, não um valor fixo em reais. Vale para o PGBL; o VGBL não é dedutível.",
  },
  {
    question: "O que é a redução da Lei 15.270/2025?",
    answer:
      "É o mecanismo que criou a isenção efetiva de 2026. A lei não mudou as faixas da tabela: ela abate um valor do imposto que a tabela calculou. Quem tem renda tributável anual de até R$ 60.000 tem o imposto zerado; entre R$ 60.000 e R$ 88.200 o abatimento diminui aos poucos; acima disso não há redução. Por isso o detalhamento mostra o imposto pela tabela e a redução em linhas separadas.",
  },
  {
    question: "Preciso pagar imposto se ganho pouco?",
    answer:
      "Na prática, não. A tabela de 2026 isenta até R$ 29.145,60 por ano, e a redução da Lei 15.270/2025 zera o imposto de quem tem renda tributável de até R$ 60.000 por ano — cerca de R$ 5.000 por mês. Se a empresa reteve na folha ao longo do ano, a diferença é acertada na declaração.",
  },
  {
    question: "Como funciona o desconto na fonte?",
    answer:
      "Seu empregador calcula e desconta o IRPF direto do seu salário (retenção mensal na folha). No final do ano, você declara e acerta: se foi retido demais, recebe restituição; se foi pouco, paga a diferença.",
  },
  {
    question: "A alíquota efetiva é diferente da marginal?",
    answer:
      "Sim! Alíquota marginal é a da última faixa (27,5% se ganha muito). Alíquota efetiva é o imposto total dividido pela renda bruta (sempre menor). A efetiva é o que realmente você paga em proporção.",
  },
  {
    question: "O resultado da calculadora é garantido?",
    answer:
      "Esta é uma estimativa educativa seguindo as regras oficiais de 2026. Seu IRPF real depende de detalhes: atividade profissional, bens no exterior, ganho de capital, etc. Use como referência, não como valor final.",
  },
  {
    question: "Onde obtenho meus comprovantes de dedução?",
    answer:
      "Educação: recibos e declarações da escola ou universidade. Saúde: recibos de médicos e outros profissionais com CPF ou CNPJ, notas do hospital e o informe do plano de saúde. Previdência: o informe do PGBL. Guarde tudo por 5 anos para uma possível fiscalização.",
  },
];

export const Route = createFileRoute("/calculadora-irpf-2026")({
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
      name: "Calculadora IRPF 2026",
      description: PAGE_DESCRIPTION,
      url: absoluteUrl(meta.path),
      applicationCategory: "FinanceApplication",
      faq: FAQ,
    }),
  }),
  component: IrpfCalculator,
});

function IrpfCalculator() {
  const [input, setInput] = usePersistedState<IrpfFormInput>("irpf-2026-input-v2", DEFAULTS);
  const comparison = useMemo(() => compareIrpfRegimes(input), [input]);
  const isSimplified = comparison.better === "simplified";
  const result = comparison[comparison.better];
  const other = isSimplified ? comparison.legal : comparison.simplified;

  const handleReset = () => setInput(DEFAULTS);

  return (
    <CalculatorLayout
      title="Calculadora IRPF 2026"
      description="Imposto de renda do ano-calendário 2026, nos regimes completo e simplificado"
    >
      <p className="rounded-xl border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-muted-foreground">
        Esta calculadora usa as regras do <strong>ano-calendário 2026</strong>: a renda recebida em
        2026, declarada em 2027. Se você está fazendo a declaração entregue em 2026, sobre a renda
        de 2025, as tabelas são outras. Para ela, use o{" "}
        <a
          href="https://www27.receita.fazenda.gov.br/simulador-irpf/"
          className="text-primary underline-offset-2 hover:underline"
          rel="noopener noreferrer"
        >
          simulador da Receita Federal
        </a>
        .
      </p>

      <FormSection
        title="Dados pessoais e renda"
        description="Informe sua renda bruta anual e situação familiar"
      >
        <CurrencyInput
          label="Renda bruta anual"
          placeholder="Salário + 13º + bônus + rendimentos"
          value={input.grossAnnualIncome}
          onChange={(value) => setInput({ ...input, grossAnnualIncome: value })}
          hint="Valor total que você recebe por ano (antes de descontos)"
        />
        <NumberInput
          label="Número de dependentes"
          placeholder="0"
          value={input.dependants}
          onChange={(value) => setInput({ ...input, dependants: value })}
          min={0}
          max={10}
          hint="Cônjuge, filhos até 21 anos (ou 24 se estudante), pais e irmãos menores"
        />
      </FormSection>

      <FormSection
        title="Deduções da declaração completa"
        description="Usadas no regime completo; o simplificado substitui todas por um desconto fixo"
      >
        <CurrencyInput
          label="Gastos com educação (anual)"
          placeholder="Mensalidades escolares e de faculdade"
          value={input.educationDeduction}
          onChange={(value) => setInput({ ...input, educationDeduction: value })}
          hint={`Até ${formatBRL(3561.5)} por pessoa: você e cada dependente.`}
        />
        <CurrencyInput
          label="Gastos com saúde (anual)"
          placeholder="Consultas, exames, hospital, plano"
          value={input.healthDeduction}
          onChange={(value) => setInput({ ...input, healthDeduction: value })}
          hint="Sem limite de valor. Remédio de farmácia não entra."
        />
        <CurrencyInput
          label="Contribuição previdência complementar (anual)"
          placeholder="PGBL"
          value={input.supplementaryPensionDeduction}
          onChange={(value) => setInput({ ...input, supplementaryPensionDeduction: value })}
          hint="Até 12% do rendimento tributável do ano. Só o PGBL é dedutível; o VGBL não."
        />
      </FormSection>

      <ResultSummaryCard
        title={`Seu IRPF 2026, na declaração ${isSimplified ? "simplificada" : "completa"}`}
        mainValue={formatBRL(result.calculatedTax)}
        mainLabel={result.calculatedTax > 0 ? "Você deve pagar" : "Nada a pagar"}
        secondaryValue={
          comparison.saving > 0
            ? `${formatBRL(comparison.saving)} a menos`
            : `Alíquota efetiva: ${result.effectiveRate.toFixed(2).replace(".", ",")}%`
        }
        secondaryLabel={
          comparison.saving > 0
            ? `que na declaração ${isSimplified ? "completa" : "simplificada"}`
            : "Os dois regimes dão o mesmo resultado"
        }
        resultColor={result.calculatedTax > 0 ? "negative" : "positive"}
      />

      <BreakdownTable
        title="Completa ou simplificada"
        items={[
          {
            label: "Declaração completa",
            value: formatBRL(comparison.legal.calculatedTax),
            subtext: "INSS, dependentes, saúde, educação e previdência",
          },
          {
            label: "Declaração simplificada",
            value: formatBRL(comparison.simplified.calculatedTax),
            subtext: `Desconto de ${formatBRL(
              comparison.simplified.grossAnnualIncome -
                comparison.simplified.simplifiedCalculationBase,
            )}: 20% da renda, até R$ 17.640,00`,
          },
          {
            label: "Mais vantajosa",
            value: isSimplified ? "Simplificada" : "Completa",
            isFinal: true,
          },
        ]}
      />

      <WarningList
        items={[
          `Alíquota marginal: ${result.marginalRate}`,
          `Alíquota efetiva: ${result.effectiveRate.toFixed(2).replace(".", ",")}%`,
          `Desconto INSS (aprox.): ${formatBRL(result.inssWithheld)}`,
        ]}
      />

      <BreakdownTable
        title={`Detalhamento da declaração ${isSimplified ? "simplificada" : "completa"}`}
        items={[
          {
            label: "Renda bruta anual",
            value: formatBRL(result.grossAnnualIncome),
          },
          // The simplified regime replaces every other deduction — INSS, dependants
          // and the itemised three. Listing them under it would show a chain that
          // does not produce the tax printed below it.
          ...(isSimplified
            ? [
                {
                  label: "Desconto simplificado",
                  value: `- ${formatBRL(result.grossAnnualIncome - result.simplifiedCalculationBase)}`,
                  subtext: "20% da renda bruta, até R$ 17.640,00, no lugar de todas as deduções",
                },
                {
                  label: "Base de cálculo",
                  value: formatBRL(result.simplifiedCalculationBase),
                },
              ]
            : [
                {
                  label: "Desconto INSS",
                  value: `- ${formatBRL(result.inssWithheld)}`,
                  subtext: "Faixas progressivas, limitado ao teto do RGPS",
                },
                {
                  label: "Base após INSS",
                  value: formatBRL(result.grossAnnualIncome - result.inssWithheld),
                },
                {
                  label: "Deduções (educação, saúde, previdência)",
                  value: `- ${formatBRL(result.totalDeductions)}`,
                  subtext: `Educação: ${formatBRL(result.educationDeduction)} | Saúde: ${formatBRL(
                    result.healthDeduction,
                  )} | Previdência: ${formatBRL(result.supplementaryPensionDeduction)}`,
                },
                {
                  label: "Base de cálculo",
                  value: formatBRL(result.fullCalculationBase),
                },
                {
                  label: `Desconto por ${input.dependants} dependente(s)`,
                  value: `- ${formatBRL(result.dependantAllowance)}`,
                  subtext: `R$ 2.275,08 por dependente`,
                },
                {
                  label: "Base imponível",
                  value: formatBRL(result.assessableBase),
                },
              ]),
          {
            label: "IRPF pela tabela",
            value: formatBRL(result.taxFromTable),
          },
          ...(result.reductionLei15270 > 0
            ? [
                {
                  label: "Redução (Lei 15.270/2025)",
                  value: `- ${formatBRL(result.reductionLei15270)}`,
                  subtext: "Isenção efetiva para quem recebe até R$ 5.000 por mês",
                },
              ]
            : []),
          {
            label: "IRPF devido",
            value: formatBRL(result.calculatedTax),
            isFinal: true,
          },
        ]}
      />

      <DisclaimerBox>
        <Prose>
          <p>
            Esta calculadora segue as alíquotas e valores do IRPF do ano-calendário 2026. O
            resultado é uma estimativa educativa. Seu imposto real pode variar se você tiver:
          </p>
          <ul>
            <li>Ganho de capital (venda de ações, imóveis)</li>
            <li>Atividade profissional autônoma ou PJ</li>
            <li>Bens e direitos no exterior</li>
            <li>Isenções específicas (ex: aposentado com 65 anos ou mais)</li>
          </ul>
          <p>
            Esta página faz a <strong>conta anual</strong> — a do ajuste da declaração. A{" "}
            <a href="/calculadora-salario-liquido">calculadora de salário líquido</a> calcula a
            retenção mensal na folha, que segue tabela e redução próprias. Os dois resultados não
            batem exatamente para a mesma pessoa, e é justamente essa diferença que a declaração
            acerta.
          </p>
          <p>
            A comparação entre {formatBRL(comparison.legal.calculatedTax)} na completa e{" "}
            {formatBRL(comparison.simplified.calculatedTax)} na simplificada usa as mesmas regras do
            programa da Receita. A declaração oficial é sempre a do programa.
          </p>
        </Prose>
      </DisclaimerBox>

      <div className="flex gap-2">
        <CopyResultButton value={`IRPF 2026: ${formatBRL(result.calculatedTax)}`} />
        <ShareResultButton
          title="Meu IRPF 2026"
          text={`Calculei meu IRPF 2026 em ${formatBRL(
            result.calculatedTax,
          )} na declaração ${isSimplified ? "simplificada" : "completa"} (alíquota efetiva: ${result.effectiveRate.toFixed(2).replace(".", ",")}%)`}
        />
        <ResetButton onClick={handleReset} />
      </div>

      <RegimeThresholdSection />

      <FAQSection items={FAQ} />

      <RelatedCalculators excludeSlug="irpf-2026" />
      <RelatedPosts slugs={relatedPostsFor("irpf-2026")} />
    </CalculatorLayout>
  );
}

function RegimeThresholdSection() {
  return (
    <Prose>
      <h2>Quando a declaração completa compensa</h2>
      <p>
        A declaração completa paga menos imposto quando as suas deduções somadas passam do desconto
        simplificado. O INSS já entra nessa soma, então a pergunta prática é: quanto de deduções{" "}
        <em>além do INSS</em> você precisa ter? A tabela abaixo foi calculada pela própria
        calculadora, com as regras do ano-calendário 2026.
      </p>
      <div className="not-prose overflow-x-auto rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)]">
        <table className="w-full min-w-[640px] text-sm">
          <caption className="sr-only">
            Deduções necessárias para a declaração completa compensar, por renda anual, em 2026
          </caption>
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th scope="col" className="px-3 py-2.5">
                Renda anual
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                INSS no ano
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Desconto simplificado
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Deduções além do INSS para a completa compensar
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                IR na simplificada
              </th>
            </tr>
          </thead>
          <tbody>
            {THRESHOLD_ROWS.map((row) => (
              <tr key={row.grossAnnualIncome} className="border-t border-border/70">
                <th scope="row" className="px-3 py-2 text-left font-medium text-foreground">
                  {formatBRL(row.grossAnnualIncome)}
                </th>
                <td className="px-3 py-2 text-right">{formatBRL(row.inssWithheld)}</td>
                <td className="px-3 py-2 text-right">{formatBRL(row.simplifiedDiscount)}</td>
                <td className="px-3 py-2 text-right font-semibold text-foreground">
                  {row.deductionsToBeatSimplified === null
                    ? "A simplificada já não paga imposto"
                    : `mais de ${formatBRL(row.deductionsToBeatSimplified)}`}
                </td>
                <td className="px-3 py-2 text-right">{formatBRL(row.taxSimplified)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Para chegar a esse valor, some o que você pode deduzir: R$ 2.275,08 por dependente, as
        despesas de saúde (sem limite), a educação (até R$ 3.561,50 por pessoa) e o PGBL (até 12% da
        renda). Até R$ 60 mil por ano, a declaração simplificada já não paga imposto, por causa da
        redução da Lei 15.270/2025, e não há o que a completa possa ganhar. Acima disso, cada real
        de dedução além do valor da tabela vira imposto a menos, na alíquota da sua faixa.
      </p>
    </Prose>
  );
}
