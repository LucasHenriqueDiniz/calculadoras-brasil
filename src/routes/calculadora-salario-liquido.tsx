import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CreditCard } from "lucide-react";
import { CalculatorLayout, FormSection } from "@/components/calculator/CalculatorLayout";
import { CurrencyInput, NumberInput, SelectField } from "@/components/calculator/fields";
import {
  DisclaimerBox,
  ResultSummaryCard,
  BreakdownTable,
} from "@/components/calculator/results";
import { CopyResultButton, ResetButton, ShareResultButton } from "@/components/calculator/actions";
import { FAQSection, type FAQItem } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { Prose } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/format";
import {
  calculateSalarioLiquido,
  type SalarioLiquidoInput,
} from "@/lib/calculators/salarioLiquido";
import { absoluteUrl } from "@/lib/site";
import { calculatorStructuredData } from "@/lib/structured-data";
import { usePersistedState } from "@/lib/usePersistedState";

const PAGE_TITLE = "Calculadora de Salário Líquido 2026";
const PAGE_DESCRIPTION =
  "Descubra quanto você realmente recebe. Calcule seu salário líquido descontando IRPF, INSS, sindicato e outros descontos automáticos.";

const DEFAULTS: SalarioLiquidoInput = {
  salarioBrutoMensal: 5000,
  dependentes: 0,
  deducaoEducacao: 0,
  deducaoSaude: 0,
  deducaoPrevidenciaComplementar: 0,
  temValeRefeicao: false,
  temValeTransporte: false,
  temSindicato: false,
  regimeSimplificado: false,
};

const FAQ: FAQItem[] = [
  {
    question: "Qual é a diferença entre salário bruto e líquido?",
    answer:
      "Salário bruto é o valor antes de descontos. Salário líquido é o que você realmente recebe depois de IRPF, INSS, sindicato. A diferença geralmente é 15-25% do bruto.",
  },
  {
    question: "Como funciona a retenção de IRPF na folha?",
    answer:
      "Seu empregador calcula e desconta o IRPF mensalmente (retenção na fonte). No final do ano, você declara e acerta: se reteve demais, recebe restituição; se reteve pouco, paga diferença.",
  },
  {
    question: "O INSS é obrigatório?",
    answer:
      "Sim. Empregados CLT pagam INSS de 8% a 14% automaticamente. É obrigatório para ter direito a benefícios (auxílio-doença, maternidade, aposentadoria).",
  },
  {
    question: "Vale refeição reduz meu imposto?",
    answer:
      "Sim. Vale refeição é um benefício não tributável, ou seja, não entra na base de cálculo do IRPF. Você recebe o benefício sem pagar imposto sobre ele.",
  },
  {
    question: "Dependentes reduzem meu desconto de IRPF?",
    answer:
      "Sim. Cada dependente reduz a base de cálculo do IRPF em R$ 2.275/ano (~R$ 189/mês). Filhos, cônjuge, pais a seu cargo contam como dependentes.",
  },
  {
    question: "Como reduzir meu desconto de IRPF?",
    answer:
      "Contribuindo para previdência complementar (até R$ 63.454/ano), gastos com educação e saúde, e incluindo todos os dependentes. Use a calculadora para ver o impacto.",
  },
  {
    question: "Posso negociar um salário bruto maior?",
    answer:
      "Sim. Conhecendo a diferença bruto→líquido, você pode negociar melhor. Peça o salário bruto que resulta no líquido desejado, não ao contrário.",
  },
  {
    question: "O resultado da calculadora é garantido?",
    answer:
      "É uma estimativa educativa. Seu IRPF real pode variar conforme dependentes adicionados na declaração, deduções, e outras particularidades. Use como referência.",
  },
];

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
  const [input, setInput] = usePersistedState<SalarioLiquidoInput>(
    "salario-liquido-input",
    DEFAULTS
  );
  const result = useMemo(() => calculateSalarioLiquido(input), [input]);

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
          value={input.salarioBrutoMensal}
          onChange={(value) => setInput({ ...input, salarioBrutoMensal: value })}
          hint="Valor antes de qualquer desconto"
        />
        <NumberInput
          label="Número de dependentes"
          placeholder="0"
          value={input.dependentes}
          onChange={(value) => setInput({ ...input, dependentes: value })}
          min={0}
          max={10}
          hint="Filhos até 21 anos (ou 24 se estudante), cônjuge, pais"
        />
      </FormSection>

      <FormSection
        title="Deduções permitidas (opcional)"
        description="Gastos que reduzem sua base de IRPF"
      >
        <CurrencyInput
          label="Gastos mensais com educação"
          placeholder="0"
          value={input.deducaoEducacao}
          onChange={(value) => setInput({ ...input, deducaoEducacao: value })}
          hint="Sua educação ou de dependentes (limite: R$ 3.561,50/ano)"
        />
        <CurrencyInput
          label="Gastos mensais com saúde"
          placeholder="0"
          value={input.deducaoSaude}
          onChange={(value) => setInput({ ...input, deducaoSaude: value })}
          hint="Médico, dentista, medicamentos, plano de saúde (sem limite)"
        />
        <CurrencyInput
          label="Previdência complementar mensal"
          placeholder="0"
          value={input.deducaoPrevidenciaComplementar}
          onChange={(value) => setInput({ ...input, deducaoPrevidenciaComplementar: value })}
          hint="PGBL, VGBL, fundo de pensão (limite: ~13% da renda bruta)"
        />
      </FormSection>

      <FormSection
        title="Benefícios e descontos"
        description="Vale refeição, transporte, sindicato"
      >
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={input.temValeRefeicao}
              onChange={(e) => setInput({ ...input, temValeRefeicao: e.target.checked })}
              className="h-4 w-4"
            />
            <span>Tenho vale refeição (~R$ 360/mês)</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={input.temValeTransporte}
              onChange={(e) => setInput({ ...input, temValeTransporte: e.target.checked })}
              className="h-4 w-4"
            />
            <span>Tenho vale transporte (até 6% do salário)</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={input.temSindicato}
              onChange={(e) => setInput({ ...input, temSindicato: e.target.checked })}
              className="h-4 w-4"
            />
            <span>Desconto de sindicato (~1 hora/mês)</span>
          </label>
        </div>
      </FormSection>

      <ResultSummaryCard
        title="Seu Salário Líquido"
        mainValue={formatBRL(result.salarioLiquidoMensal)}
        mainLabel="Salário líquido mensal"
        secondaryValue={formatBRL(result.rendimentoTotalMensal)}
        secondaryLabel="+ benefícios não tributáveis"
        resultColor="positive"
      />

      <BreakdownTable
        title="Detalhamento mensal"
        items={[
          {
            label: "Salário bruto",
            value: formatBRL(result.salarioBrutoMensal),
          },
          {
            label: "Desconto INSS (8-14%)",
            value: `- ${formatBRL(result.descInssEmpregado)}`,
            subtext: "Contribuição para seguridade social",
          },
          {
            label: "Desconto IRPF (retenção)",
            value: `- ${formatBRL(result.descIrpfEstimado)}`,
            subtext: `Alíquota efetiva: ${result.aliquotaEfetivaIrpf.toFixed(1)}%`,
          },
          {
            label: "Desconto sindicato",
            value: result.descSindicato > 0 ? `- ${formatBRL(result.descSindicato)}` : "R$ 0",
          },
          {
            label: "Desconto vale transporte",
            value: result.descValeTransporte > 0 ? `- ${formatBRL(result.descValeTransporte)}` : "R$ 0",
          },
          {
            label: "Salário líquido",
            value: formatBRL(result.salarioLiquidoMensal),
            isFinal: true,
          },
          {
            label: "Benefícios não tributáveis (vale refeição)",
            value: formatBRL(result.beneficiosNaoTributaveis),
            subtext: "Não entra no imposto de renda",
          },
          {
            label: "Ganho total mensal",
            value: formatBRL(result.rendimentoTotalMensal),
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
          <p>Use como referência. Verifique seu contracheque para valores exatos.</p>
        </Prose>
      </DisclaimerBox>

      <div className="flex gap-2">
        <CopyResultButton value={`Salário líquido: ${formatBRL(result.salarioLiquidoMensal)}`} />
        <ShareResultButton
          title="Meu salário líquido 2026"
          text={`Calculei que meu salário líquido é ${formatBRL(result.salarioLiquidoMensal)} (bruto de ${formatBRL(result.salarioBrutoMensal)})`}
        />
        <ResetButton onClick={handleReset} />
      </div>

      <FAQSection items={FAQ} />

      <RelatedCalculators excludeSlug="salario-liquido" />
    </CalculatorLayout>
  );
}
