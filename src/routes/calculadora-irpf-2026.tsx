import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CreditCard } from "lucide-react";
import { CalculatorLayout, FormSection } from "@/components/calculator/CalculatorLayout";
import {
  CurrencyInput,
  NumberInput,
  SelectField,
  CheckboxField,
} from "@/components/calculator/fields";
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
import { Button } from "@/components/ui/button";
import { formatBRL, parseBRNumber } from "@/lib/format";
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
  "Calcule seu IRPF 2026 de forma fácil. Inclua dependentes, deduções com educação e saúde, e saiba quanto você deve ao leão ou se terá restituição.";

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
      "O IRPF segue uma tabela progressiva: quanto mais você ganha, maior a alíquota. Em 2026: até R$ 21.503/ano isento, depois 7,5% até 15%, 22,5% e 27,5% nas maiores rendas. A calculadora segue as regras oficiais.",
  },
  {
    question: "Qual é a alíquota IRPF para cada faixa salarial?",
    answer:
      "Até R$ 21.503/ano: 0% (isento). De R$ 21.503 a R$ 33.503: 7,5%. De R$ 33.503 a R$ 44.694: 15%. De R$ 44.694 a R$ 55.472: 22,5%. Acima de R$ 55.472: 27,5%. Essas faixas foram atualizadas em 2026.",
  },
  {
    question: "Dependentes reduzem meu IRPF?",
    answer:
      "Sim, cada dependente reduz R$ 2.275 da base imponível em 2026. Cônjuge, filhos até 21 anos (ou 24 se estudante), pais, irmãos menores contam. A redução é significativa se tiver vários dependentes.",
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
      "Depende. Regime simplificado: dedução fixa de 20,5% da renda bruta. Regime completo: deduções reais (educação, saúde, previdência). Se tem muitos gastos dedutíveis, completo vale mais. A calculadora compara para você.",
  },
  {
    question: "Quando devo declarar IRPF?",
    answer:
      "A declaração de 2026 é feita em 2027 (entre março e abril). Precisa declarar se teve renda > R$ 28.559,70 (em 2026) ou atividade profissional. Fique atento aos prazos divulgados pela Receita Federal.",
  },
  {
    question: "Como funciona o desconto INSS na calculadora?",
    answer:
      "Se empregado CLT, o INSS (8-11%) é retido na folha de pagamento automaticamente. A calculadora desconta 10% como média. Autônomos pagam diretamente à Receita Federal (alíquota conforme a categoria).",
  },
  {
    question: "Previdência complementar é dedutível?",
    answer:
      "Sim, até o limite de R$ 63.454/ano em 2026 (aproximadamente 13% da renda bruta). Contribuições a PGBL, VGBL, fundos de pensão entram como deduções.",
  },
  {
    question: "E se meu resultado for negativo? Ganho restituição?",
    answer:
      "Sim! Se o valor calculado for negativo, você tem direito à restituição (devolução de imposto pago em excesso). A Receita Federal restitui em até 3 parcelas mensais.",
  },
  {
    question: "Preciso pagar imposto se ganho pouco?",
    answer:
      "Só se sua renda ultrapassar R$ 21.503,34/ano (em 2026). Abaixo disso, é isento. Se recebe salário de empresa, ela faz retenção na folha mesmo assim — você recupera na restituição.",
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

      <FormSection
        title="Deduções permitidas"
        description="Gastos que reduzem sua base de cálculo"
      >
        <CurrencyInput
          label="Gastos com educação (anual)"
          placeholder="Escola, universidade, material"
          value={input.deducaoEducacao}
          onChange={(value) => setInput({ ...input, deducaoEducacao: value })}
          hint={`Até R$ ${formatBRL(3561.5)}/ano. Inclua sua educação e de dependentes.`}
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
          hint={`Até R$ ${formatBRL(63454)}/ano (13% da renda bruta).`}
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
              label: "Regime Simplificado (20,5% dedução fixa)",
              value: "simplificado",
            },
          ]}
          hint="Regime completo é melhor se tem muitas deduções. Simplifcado é mais fácil se tem poucas."
        />
      </FormSection>

      <ResultSummaryCard
        title="Seu IRPF 2026"
        mainValue={formatBRL(Math.abs(result.irpfCalculado))}
        mainLabel={result.irpfCalculado > 0 ? "Você deve pagar" : "Você terá restituição"}
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
            label: "Desconto INSS (10% aprox.)",
            value: `- ${formatBRL(result.descInss)}`,
            subtext: "Retenção na folha ou contribuição de autônomo",
          },
          {
            label: "Base após INSS",
            value: formatBRL(result.rendaBrutaAnual - result.descInss),
          },
          {
            label: "Deduções (educação, saúde, previdência)",
            value: `- ${formatBRL(result.totalDeducoes)}`,
            subtext: `Educação: ${formatBRL(result.deducaoEducacao)} | Saúde: ${formatBRL(
              result.deducaoSaude
            )} | Previdência: ${formatBRL(result.deducaoPrevidenciaComplementar)}`,
          },
          {
            label: "Base de cálculo",
            value: formatBRL(result.baseCalculoCompleta),
          },
          {
            label: `Desconto por ${input.dependentes} dependente(s)`,
            value: `- ${formatBRL(result.descDependentes)}`,
            subtext: `R$ 2.275 por dependente`,
          },
          {
            label: "Base imponível",
            value: formatBRL(result.baseImponivel),
          },
          {
            label: "IRPF Calculado",
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
        <CopyResultButton value={`IRPF 2026: ${formatBRL(Math.abs(result.irpfCalculado))}`} />
        <ShareResultButton
          title="Meu IRPF 2026"
          text={`Calculei meu IRPF 2026 em ${formatBRL(
            Math.abs(result.irpfCalculado)
          )} (alíquota efetiva: ${result.aliquotaEfetiva.toFixed(2)}%)`}
        />
        <ResetButton onClick={handleReset} />
      </div>

      <FAQSection items={FAQ} />

      <RelatedCalculators excludeSlug="irpf-2026" />
    </CalculatorLayout>
  );
}
