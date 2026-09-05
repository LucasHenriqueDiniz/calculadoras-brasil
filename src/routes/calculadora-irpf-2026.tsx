import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { CalculatorLayout, FormSection } from "@/components/calculator/CalculatorLayout";
import { CurrencyInput, NumberInput, SelectField } from "@/components/calculator/fields";
import {
  DisclaimerBox,
  ResultSummaryCard,
  BreakdownTable,
  WarningList,
} from "@/components/calculator/results";
import { CopyResultButton, ResetButton, ShareResultButton } from "@/components/calculator/actions";
import { FAQSection, type FAQItem } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { Prose } from "@/components/layout/PageShell";
import { formatBRL } from "@/lib/format";
import { calculateIrpf, type IrpfInput } from "@/lib/calculators/irpf";
import { absoluteUrl } from "@/lib/site";
import { calculatorStructuredData } from "@/lib/structured-data";
import { usePersistedState } from "@/lib/usePersistedState";

const meta = {
  slug: "irpf-2026",
  path: "/calculadora-irpf-2026",
};
const PAGE_TITLE = "Calculadora IRPF 2026 - Simule seu Imposto de Renda";
const PAGE_DESCRIPTION =
  "Calcule seu IRPF 2026 de forma fácil. Inclua dependentes, deduções com educação e saúde, e veja o efeito da redução que isenta quem recebe até R$ 5.000 por mês.";

const DEFAULTS: IrpfInput = {
  rendaBrutaAnual: 48000,
  dependentes: 0,
  deducaoEducacao: 0,
  deducaoSaude: 0,
  deducaoPrevidenciaComplementar: 0,
  regimeSimplificado: false,
};

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
      "Sim. Gastos com educação (pública, privada, uniforme, transporte escolar) são dedutíveis até o limite de R$ 3.561,50/ano em 2026. Inclua sua educação e de dependentes.",
  },
  {
    question: "Saúde é dedutível no IRPF?",
    answer:
      "Sim, completamente. Sem limite legal: consultas, exames, medicamentos, hospitais, plano de saúde, dentista — tudo entra. Mantenha comprovantes de todas as despesas.",
  },
  {
    question: "Vale a pena usar o regime simplificado?",
    answer:
      "Depende. O regime simplificado desconta 20% da renda bruta, até o limite de R$ 17.640,00 por ano, e substitui todas as outras deduções — inclusive dependentes. O regime completo usa as deduções reais (educação, saúde, previdência). Se você tem muitos gastos dedutíveis, o completo tende a valer mais. Simule os dois: a calculadora mostra o resultado do regime que você escolher, não escolhe por você.",
  },
  {
    question: "Quando devo declarar IRPF?",
    answer:
      "A declaração de 2026 é feita em 2027 (entre março e abril). Precisa declarar se teve renda > R$ 28.559,70 (em 2026) ou atividade profissional. Fique atento aos prazos divulgados pela Receita Federal.",
  },
  {
    question: "Como funciona o desconto INSS na calculadora?",
    answer:
      "Se você é CLT, o INSS é retido na folha automaticamente. A calculadora aplica as faixas progressivas de 2026 sobre o salário mensal e limita a contribuição ao teto do RGPS, em vez de usar um percentual único. Autônomos pagam diretamente, com alíquota conforme a categoria.",
  },
  {
    question: "Previdência complementar é dedutível?",
    answer:
      "Sim, até o limite de R$ 63.454/ano em 2026 (aproximadamente 13% da renda bruta). Contribuições a PGBL, VGBL, fundos de pensão entram como deduções.",
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
      "Educação: recibos da escola, universidade, livros. Saúde: recibos de médico, farmácia, hospital, plano de saúde. Previdência: extrato do fundo/PGBL. Guarde tudo por 5 anos para possível fiscalização.",
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
  const [input, setInput] = usePersistedState<IrpfInput>("irpf-2026-input", DEFAULTS);
  const result = useMemo(() => calculateIrpf(input), [input]);

  const handleReset = () => setInput(DEFAULTS);

  return (
    <CalculatorLayout
      title="Calculadora IRPF 2026"
      description="Simule seu imposto de renda pessoa física conforme as alíquotas progressivas de 2026"
    >
      <FormSection
        title="Dados pessoais e renda"
        description="Informe sua renda bruta anual e situação familiar"
      >
        <CurrencyInput
          label="Renda bruta anual"
          placeholder="Salário + 13º + bônus + rendimentos"
          value={input.rendaBrutaAnual}
          onChange={(value) => setInput({ ...input, rendaBrutaAnual: value })}
          hint="Valor total que você recebe por ano (antes de descontos)"
        />
        <NumberInput
          label="Número de dependentes"
          placeholder="0"
          value={input.dependentes}
          onChange={(value) => setInput({ ...input, dependentes: value })}
          min={0}
          max={10}
          hint="Cônjuge, filhos até 21 anos (ou 24 se estudante), pais e irmãos menores"
        />
      </FormSection>

      <FormSection title="Deduções permitidas" description="Gastos que reduzem sua base de cálculo">
        <CurrencyInput
          label="Gastos com educação (anual)"
          placeholder="Escola, universidade, material"
          value={input.deducaoEducacao}
          onChange={(value) => setInput({ ...input, deducaoEducacao: value })}
          hint={`Até ${formatBRL(3561.5)}/ano. Inclua sua educação e de dependentes.`}
        />
        <CurrencyInput
          label="Gastos com saúde (anual)"
          placeholder="Consultas, exames, medicamentos, plano"
          value={input.deducaoSaude}
          onChange={(value) => setInput({ ...input, deducaoSaude: value })}
          hint="Sem limite legal. Mantenha comprovantes."
        />
        <CurrencyInput
          label="Contribuição previdência complementar (anual)"
          placeholder="PGBL, VGBL, fundo de pensão"
          value={input.deducaoPrevidenciaComplementar}
          onChange={(value) => setInput({ ...input, deducaoPrevidenciaComplementar: value })}
          hint={`Até ${formatBRL(63454)}/ano (13% da renda bruta).`}
        />
      </FormSection>

      <FormSection
        title="Regime tributário"
        description="Escolha o que gera menor imposto para seu perfil"
      >
        <SelectField
          label="Regime de tributação"
          value={input.regimeSimplificado ? "simplificado" : "completo"}
          onChange={(value) => setInput({ ...input, regimeSimplificado: value === "simplificado" })}
          options={[
            {
              label: "Regime Completo (deduções reais)",
              value: "completo",
            },
            {
              label: "Regime Simplificado (20% dedução fixa)",
              value: "simplificado",
            },
          ]}
          hint="Regime completo é melhor se tem muitas deduções. Simplifcado é mais fácil se tem poucas."
        />
      </FormSection>

      <ResultSummaryCard
        title="Seu IRPF 2026"
        mainValue={formatBRL(result.irpfCalculado)}
        mainLabel={result.irpfCalculado > 0 ? "Você deve pagar" : "Nada a pagar"}
        secondaryValue={`Alíquota efetiva: ${result.aliquotaEfetiva.toFixed(2)}%`}
        secondaryLabel="Do seu rendimento total"
        resultColor={result.irpfCalculado > 0 ? "negative" : "positive"}
      />

      <WarningList
        items={[
          `Alíquota marginal: ${result.aliquotaMarginal}`,
          `Renda bruta anual: ${formatBRL(result.rendaBrutaAnual)}`,
          `Desconto INSS (aprox.): ${formatBRL(result.descInss)}`,
        ]}
      />

      <BreakdownTable
        title="Detalhamento do cálculo"
        items={[
          {
            label: "Renda bruta anual",
            value: formatBRL(result.rendaBrutaAnual),
          },
          {
            label: "Desconto INSS",
            value: `- ${formatBRL(result.descInss)}`,
            subtext: "Faixas progressivas, limitado ao teto do RGPS",
          },
          {
            label: "Base após INSS",
            value: formatBRL(result.rendaBrutaAnual - result.descInss),
          },
          {
            label: "Deduções (educação, saúde, previdência)",
            value: `- ${formatBRL(result.totalDeducoes)}`,
            subtext: `Educação: ${formatBRL(result.deducaoEducacao)} | Saúde: ${formatBRL(
              result.deducaoSaude,
            )} | Previdência: ${formatBRL(result.deducaoPrevidenciaComplementar)}`,
          },
          {
            label: "Base de cálculo",
            value: formatBRL(result.baseCalculoCompleta),
          },
          {
            label: `Desconto por ${input.dependentes} dependente(s)`,
            value: `- ${formatBRL(result.descDependentes)}`,
            subtext: `R$ 2.275,08 por dependente`,
          },
          {
            label: "Base imponível",
            value: formatBRL(result.baseImponivel),
          },
          {
            label: "IRPF pela tabela",
            value: formatBRL(result.irpfPelaTabela),
          },
          ...(result.reducaoLei15270 > 0
            ? [
                {
                  label: "Redução (Lei 15.270/2025)",
                  value: `- ${formatBRL(result.reducaoLei15270)}`,
                  subtext: "Isenção efetiva para quem recebe até R$ 5.000 por mês",
                },
              ]
            : []),
          {
            label: "IRPF devido",
            value: formatBRL(result.irpfCalculado),
            isFinal: true,
          },
        ]}
      />

      <DisclaimerBox>
        <Prose>
          <p>
            Esta calculadora segue as alíquotas e valores do IRPF vigentes em 2026. O resultado é
            uma estimativa educativa. Seu imposto real pode variar se você tiver:
          </p>
          <ul>
            <li>Ganho de capital (venda de ações, imóveis)</li>
            <li>Atividade profissional autônoma ou PJ</li>
            <li>Bens e direitos no exterior</li>
            <li>Contribuições que excedem os limites oficiais</li>
            <li>Isenções específicas (ex: aposentado com renda baixa)</li>
          </ul>
          <p>
            Use esta ferramenta como referência. Para uma declaração oficial, consulte a Receita
            Federal ou um contador.
          </p>
        </Prose>
      </DisclaimerBox>

      <div className="flex gap-2">
        <CopyResultButton value={`IRPF 2026: ${formatBRL(result.irpfCalculado)}`} />
        <ShareResultButton
          title="Meu IRPF 2026"
          text={`Calculei meu IRPF 2026 em ${formatBRL(
            result.irpfCalculado,
          )} (alíquota efetiva: ${result.aliquotaEfetiva.toFixed(2)}%)`}
        />
        <ResetButton onClick={handleReset} />
      </div>

      <FAQSection items={FAQ} />

      <RelatedCalculators excludeSlug="irpf-2026" />
    </CalculatorLayout>
  );
}
