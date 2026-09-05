import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { CalculatorLayout, FormSection } from "@/components/calculator/CalculatorLayout";
import { CurrencyInput, NumberInput } from "@/components/calculator/fields";
import { ResultSummaryCard, BreakdownTable, DisclaimerBox } from "@/components/calculator/results";
import { FAQSection } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { formatBRL } from "@/lib/format";
import {
  calculatePrevidenciaComplementar,
  type PrevidenciaComplementarInput,
} from "@/lib/calculators/previdenciaComplementar";
import { absoluteUrl } from "@/lib/site";
import { calculatorStructuredData } from "@/lib/structured-data";
import { usePersistedState } from "@/lib/usePersistedState";

const DEFAULTS: PrevidenciaComplementarInput = {
  contribuicaoMensalPgbl: 1000,
  tasaRetornoAnual: 8,
  anosAteAposentadoria: 20,
  aliquotaIrpfAtual: 22.5,
};

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
  const [input, setInput] = usePersistedState<PrevidenciaComplementarInput>(
    "previdencia-input",
    DEFAULTS,
  );
  const result = useMemo(() => calculatePrevidenciaComplementar(input), [input]);

  return (
    <CalculatorLayout
      title="Calculadora Previdência Complementar"
      description="Reduza IRPF e acumule para aposentadoria complementar"
    >
      <FormSection title="Contribuição" description="Quanto você quer contribuir mensalmente">
        <CurrencyInput
          label="Contribuição mensal (PGBL/VGBL)"
          value={input.contribuicaoMensalPgbl}
          onChange={(v) => setInput({ ...input, contribuicaoMensalPgbl: v })}
          hint="A dedução do PGBL é limitada a 12% da renda bruta anual tributável"
        />
      </FormSection>

      <FormSection title="Projeção" description="Taxa de retorno e tempo até aposentadoria">
        <NumberInput
          label="Taxa de retorno anual esperada (%)"
          value={input.tasaRetornoAnual}
          onChange={(v) => setInput({ ...input, tasaRetornoAnual: v })}
          min={0}
          max={20}
          hint="Histórico médio: 8-10% a.a."
        />
        <NumberInput
          label="Anos até aposentadoria"
          value={input.anosAteAposentadoria}
          onChange={(v) => setInput({ ...input, anosAteAposentadoria: v })}
          min={1}
          max={40}
          hint="Quanto tempo até parar de trabalhar"
        />
      </FormSection>

      <ResultSummaryCard
        title="Saldo Projetado"
        mainValue={formatBRL(result.montanteFinalHorizonte)}
        mainLabel={`em ${input.anosAteAposentadoria} anos`}
        secondaryValue={formatBRL(result.economiaIrpfAnual)}
        secondaryLabel="Economia IRPF/ano"
        resultColor="positive"
      />

      <BreakdownTable
        title="Projeção"
        items={[
          {
            label: "Contribuição mensal",
            value: formatBRL(input.contribuicaoMensalPgbl),
          },
          {
            label: "Contribuição anual",
            value: formatBRL(result.contribuicaoAnualPgbl),
          },
          {
            label: "Economia IRPF mensal",
            value: formatBRL(result.economiaIrpfMensal),
            subtext: "Desconto sobre sua contribuição",
          },
          {
            label: "Saldo em 10 anos",
            value: formatBRL(result.montanteFinal10anos),
          },
          {
            label: "Saldo em 20 anos",
            value: formatBRL(result.montanteFinal20anos),
          },
          {
            label: "Saldo em 30 anos",
            value: formatBRL(result.montanteFinal30anos),
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

      <FAQSection items={FAQ} />

      <RelatedCalculators excludeSlug="previdencia-complementar" />
    </CalculatorLayout>
  );
}
