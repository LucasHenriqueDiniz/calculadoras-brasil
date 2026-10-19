import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { CalculatorLayout, FormSection } from "@/components/calculator/CalculatorLayout";
import { CurrencyInput, NumberInput } from "@/components/calculator/fields";
import { ResultSummaryCard, BreakdownTable, DisclaimerBox } from "@/components/calculator/results";
import { FAQSection } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { RelatedPosts } from "@/components/calculator/RelatedPosts";
import { relatedPostsFor } from "@/data/calculators";
import { formatBRL } from "@/lib/format";
import {
  buildPgblSavingTable,
  calculateSupplementaryPension,
  type SupplementaryPensionInput,
} from "@/lib/calculators/previdenciaComplementar";
import { Prose } from "@/components/layout/PageShell";
import { absoluteUrl } from "@/lib/site";
import { calculatorStructuredData } from "@/lib/structured-data";
import { usePersistedState } from "@/lib/usePersistedState";

const DEFAULTS: SupplementaryPensionInput = {
  monthlyPgblContribution: 1000,
  annualReturnRate: 8,
  yearsToRetirement: 20,
  grossAnnualIncome: 120_000,
};

const SAVING_ROWS = buildPgblSavingTable([
  60_000, 72_000, 90_000, 120_000, 180_000, 240_000, 400_000,
]);

function percent(share: number): string {
  return `${(share * 100).toFixed(1).replace(".", ",")}%`;
}

const DESCRIPTION =
  "Simule contribuições em PGBL ou VGBL: projeção de saldo em 10, 20 e 30 anos, efeito da dedução no IRPF e diferença entre as tabelas de tributação progressiva e regressiva.";

const FAQ = [
  {
    question: "Qual é a diferença entre PGBL e VGBL?",
    answer:
      "No PGBL você pode deduzir as contribuições da base do IRPF, mas na hora do resgate o imposto incide sobre o valor total, principal mais rendimento. Ele só faz sentido para quem declara no modelo completo e contribui para o INSS. No VGBL não há dedução, porém o imposto no resgate incide apenas sobre o rendimento — é a opção usual para quem declara no simplificado ou já usou todo o limite de dedução.",
  },
  {
    question: "Qual é o limite de dedução do PGBL?",
    answer:
      "A dedução é limitada a 12% da sua renda bruta anual tributável, e só vale para quem declara no modelo completo e contribui para o Regime Geral de Previdência Social. Contribuições acima desse percentual não deixam de existir, mas não geram dedução adicional. Não existe um teto em reais fixo: o limite é sempre proporcional à sua renda.",
  },
  {
    question: "A dedução do PGBL é um desconto definitivo no imposto?",
    answer:
      "Não. É um diferimento: você adia o imposto, não o elimina. O valor deduzido hoje volta a ser tributado no resgate, sobre o montante total. A vantagem real vem de investir por mais tempo o dinheiro que ficaria com o Fisco e, em muitos casos, de cair numa alíquota menor no futuro — não de deixar de pagar.",
  },
  {
    question: "Devo escolher a tabela progressiva ou a regressiva?",
    answer:
      "A regressiva parte de 35% e cai até 10% para recursos aplicados por mais de dez anos, o que favorece quem tem horizonte longo e não pretende resgatar antes. A progressiva segue a tabela do IRPF e costuma ser melhor para quem pode resgatar em prazo curto ou espera receber um benefício mensal baixo. A escolha da regressiva é irreversível em muitos planos — confirme antes de assinar.",
  },
  {
    question: "Posso sacar antes de me aposentar?",
    answer:
      "Pode, respeitado o prazo de carência do plano, mas o resgate antecipado costuma ser caro. Na tabela regressiva, saques nos primeiros anos são tributados em 35% ou 30%, o que pode consumir boa parte do rendimento acumulado. Previdência complementar não substitui reserva de emergência em investimento de liquidez diária.",
  },
  {
    question: "Que custos devo comparar entre planos?",
    answer:
      "Taxa de administração, cobrada sobre o patrimônio todo ano, e taxa de carregamento, cobrada na entrada ou na saída em alguns planos. Diferenças de um ponto percentual na taxa de administração alteram bastante o saldo em horizontes de vinte ou trinta anos. Também vale olhar a política de investimento do fundo e a possibilidade de portabilidade para outra instituição.",
  },
];

export const Route = createFileRoute("/calculadora-previdencia-complementar")({
  head: () => ({
    meta: [
      { title: "Calculadora Previdência Complementar | Calcule Brasil" },
      { name: "description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/calculadora-previdencia-complementar") }],
    scripts: calculatorStructuredData({
      name: "Calculadora Previdência Complementar",
      description: DESCRIPTION,
      path: "/calculadora-previdencia-complementar",
      applicationCategory: "FinanceApplication",
      faq: FAQ,
    }),
  }),
  component: Calculator,
});

function Calculator() {
  const [input, setInput] = usePersistedState<SupplementaryPensionInput>(
    "previdencia-input-v3",
    DEFAULTS,
  );
  const result = useMemo(() => calculateSupplementaryPension(input), [input]);

  return (
    <CalculatorLayout
      title="Calculadora Previdência Complementar"
      description="Reduza IRPF e acumule para aposentadoria complementar"
    >
      <FormSection title="Contribuição" description="Quanto você quer contribuir mensalmente">
        <CurrencyInput
          label="Contribuição mensal (PGBL/VGBL)"
          value={input.monthlyPgblContribution}
          onChange={(v) => setInput({ ...input, monthlyPgblContribution: v })}
          hint="A dedução do PGBL é limitada a 12% da renda bruta anual tributável"
        />
        <CurrencyInput
          label="Renda bruta anual tributável"
          value={input.grossAnnualIncome}
          onChange={(v) => setInput({ ...input, grossAnnualIncome: v })}
          hint="Define o limite de 12% e quanto imposto a dedução economiza"
        />
      </FormSection>

      <FormSection title="Projeção" description="Taxa de retorno e tempo até aposentadoria">
        <NumberInput
          label="Taxa de retorno anual esperada (%)"
          value={input.annualReturnRate}
          onChange={(v) => setInput({ ...input, annualReturnRate: v })}
          min={0}
          max={20}
          hint="Use uma taxa líquida de taxas e realista para o seu plano"
        />
        <NumberInput
          label="Anos até aposentadoria"
          value={input.yearsToRetirement}
          onChange={(v) => setInput({ ...input, yearsToRetirement: v })}
          min={1}
          max={40}
          hint="Quanto tempo até parar de trabalhar"
        />
      </FormSection>

      <ResultSummaryCard
        title="Saldo Projetado"
        mainValue={formatBRL(result.balanceAtHorizon)}
        mainLabel={`em ${input.yearsToRetirement} anos`}
        secondaryValue={formatBRL(result.annualIrpfSaving)}
        secondaryLabel="Imposto a menos no ano com o PGBL"
        resultColor="positive"
      />

      <BreakdownTable
        title="Projeção"
        items={[
          {
            label: "Contribuição mensal",
            value: formatBRL(input.monthlyPgblContribution),
          },
          {
            label: "Contribuição anual",
            value: formatBRL(result.annualPgblContribution),
          },
          {
            label: "Parte dedutível da contribuição",
            value: formatBRL(result.deductibleAnnualContribution),
            subtext: "Até 12% da renda, só na declaração completa",
          },
          {
            label: "IRPF do ano sem o PGBL",
            value: formatBRL(result.taxWithoutPgbl),
            subtext: "Na declaração mais vantajosa",
          },
          {
            label: "IRPF do ano com o PGBL",
            value: formatBRL(result.taxWithPgbl),
            subtext: `Na declaração ${result.regimeWithPgbl === "legal" ? "completa" : "simplificada"}`,
          },
          {
            label: "Imposto a menos no ano",
            value: formatBRL(result.annualIrpfSaving),
            subtext: "Adiado para o resgate, não eliminado",
          },
          {
            label: "Saldo em 10 anos",
            value: formatBRL(result.balanceAt10Years),
          },
          {
            label: "Saldo em 20 anos",
            value: formatBRL(result.balanceAt20Years),
          },
          {
            label: "Saldo em 30 anos",
            value: formatBRL(result.balanceAt30Years),
            isFinal: true,
          },
        ]}
      />

      <DisclaimerBox>
        <p>
          <strong>Como ler a projeção.</strong> Os saldos futuros assumem uma taxa de retorno
          constante e aportes ininterruptos, o que não acontece na prática: rentabilidade varia ano
          a ano e resultado passado não garante resultado futuro. A projeção também não desconta a
          taxa de administração do plano, o imposto devido no resgate nem o efeito da inflação sobre
          o poder de compra do montante final.
        </p>
        <p className="mt-3">
          A dedução do PGBL é um <strong>diferimento</strong> de imposto, não um desconto
          definitivo: o valor volta a ser tributado no resgate. Esta calculadora é educativa e não
          constitui recomendação de investimento. Compare taxas entre instituições e, se possível,
          consulte um profissional certificado antes de contratar.
        </p>
      </DisclaimerBox>

      <PgblSavingSection />

      <FAQSection items={FAQ} />

      <RelatedCalculators excludeSlug="previdencia-complementar" />
      <RelatedPosts slugs={relatedPostsFor("previdencia-complementar")} />
    </CalculatorLayout>
  );
}

function PgblSavingSection() {
  return (
    <Prose>
      <h2>Quanto um PGBL reduz o imposto de verdade</h2>
      <p>
        É comum ouvir que o PGBL devolve 27,5% do que você aplica. Isso só vale para rendas altas, e
        só depois de a declaração completa passar o desconto simplificado. A tabela abaixo foi
        calculada pela calculadora de IRPF do próprio site, com um aporte no limite de 12% da renda,
        sem dependentes nem outras deduções.
      </p>
      <div className="not-prose overflow-x-auto rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)]">
        <table className="w-full min-w-[640px] text-sm">
          <caption className="sr-only">
            Economia de IRPF com um PGBL de 12% da renda, por renda anual, em 2026
          </caption>
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th scope="col" className="px-3 py-2.5">
                Renda anual
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Aporte de 12%
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                IR sem PGBL
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                IR com PGBL
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Imposto a menos
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Volta do aporte
              </th>
            </tr>
          </thead>
          <tbody>
            {SAVING_ROWS.map((row) => (
              <tr key={row.grossAnnualIncome} className="border-t border-border/70">
                <th scope="row" className="px-3 py-2 text-left font-medium text-foreground">
                  {formatBRL(row.grossAnnualIncome)}
                </th>
                <td className="px-3 py-2 text-right">{formatBRL(row.annualContribution)}</td>
                <td className="px-3 py-2 text-right">{formatBRL(row.taxWithout)}</td>
                <td className="px-3 py-2 text-right">{formatBRL(row.taxWith)}</td>
                <td className="px-3 py-2 text-right font-semibold text-foreground">
                  {formatBRL(row.saving)}
                </td>
                <td className="px-3 py-2 text-right">{percent(row.savingShare)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        A coluna "Volta do aporte" é o imposto a menos dividido pelo aporte. Ela fica abaixo de
        27,5% porque, sem o PGBL, a declaração simplificada já desconta até R$ 17.640 da renda: o
        PGBL só reduz imposto na parte em que leva as deduções da completa além desse valor. Até R$
        60 mil por ano, a redução da Lei 15.270/2025 já zera o imposto e o PGBL não economiza nada.
        O valor deduzido volta a ser tributado no resgate: é imposto adiado, não eliminado.
      </p>
    </Prose>
  );
}
