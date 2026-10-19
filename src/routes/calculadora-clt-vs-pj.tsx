import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { CalculatorLayout, FormSection } from "@/components/calculator/CalculatorLayout";
import { CurrencyInput, NumberInput } from "@/components/calculator/fields";
import { ResultSummaryCard, BreakdownTable, DisclaimerBox } from "@/components/calculator/results";
import { FAQSection } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { Prose } from "@/components/layout/PageShell";
import { RelatedPosts } from "@/components/calculator/RelatedPosts";
import { relatedPostsFor } from "@/data/calculators";
import { formatBRL } from "@/lib/format";
import {
  buildBreakEvenTable,
  calculateCltVsPj,
  type CltVsPjInput,
  type ProLaboreStrategy,
} from "@/lib/calculators/cltVsPj";
import { SIMPLES_ANNEX_III, SIMPLES_ANNEX_V } from "@/lib/calculators/simples-nacional";
import { absoluteUrl } from "@/lib/site";
import { calculatorStructuredData } from "@/lib/structured-data";
import { usePersistedState } from "@/lib/usePersistedState";

const DEFAULTS: CltVsPjInput = {
  cltGrossSalary: 5000,
  monthlyPjOffer: 6000,
  dependants: 0,
  pjMonthlyCosts: 300,
};

/** Monthly company costs assumed in the tables and the worked example: an online accountant and little else. */
const EXAMPLE_COSTS = 300;

const BREAK_EVEN_SALARIES = [
  3000, 4000, 5000, 6000, 8000, 10_000, 12_000, 15_000, 20_000, 25_000, 30_000,
];
const BREAK_EVEN_ROWS = buildBreakEvenTable(BREAK_EVEN_SALARIES, EXAMPLE_COSTS);
const LOWEST_MARGIN = Math.min(...BREAK_EVEN_ROWS.map((row) => row.aboveGross));
const HIGHEST_MARGIN = Math.max(...BREAK_EVEN_ROWS.map((row) => row.aboveGross));

const EXAMPLE_SALARY = 6000;
const EXAMPLE = calculateCltVsPj({
  cltGrossSalary: EXAMPLE_SALARY,
  monthlyPjOffer: 0,
  dependants: 0,
  pjMonthlyCosts: EXAMPLE_COSTS,
});
const EXAMPLE_AT_BREAK_EVEN = calculateCltVsPj({
  cltGrossSalary: EXAMPLE_SALARY,
  monthlyPjOffer: EXAMPLE.breakEvenPjOffer,
  dependants: 0,
  pjMonthlyCosts: EXAMPLE_COSTS,
});

function percent(share: number, digits = 0): string {
  return `${(share * 100).toFixed(digits).replace(".", ",")}%`;
}

const STRATEGY_LABEL: Record<ProLaboreStrategy, string> = {
  fatorR: "pró-labore de 28% do faturamento, que cumpre o Fator R",
  minimumWage: "pró-labore de um salário mínimo",
  dividendThreshold: "pró-labore ajustado para distribuir no máximo R$ 50 mil",
};

const DESCRIPTION =
  "Compare CLT e PJ no Simples Nacional com as regras de 2026: DAS do Anexo III ou V, Fator R, INSS e IR do pró-labore, e quanto faturar para empatar com FGTS, 13º e férias.";

const FAQ = [
  {
    question: "Quanto preciso ganhar como PJ para igualar a CLT?",
    answer: `Depende do salário e dos custos da empresa. Nesta simulação, com uma empresa de serviços no Simples Nacional, sem dependentes e R$ ${EXAMPLE_COSTS} de custos mensais, o faturamento de equilíbrio fica entre ${percent(LOWEST_MARGIN)} e ${percent(HIGHEST_MARGIN)} acima do salário bruto para salários de R$ 3.000 a R$ 30.000. A conta soma do lado CLT o líquido e os direitos (13º, FGTS e férias com um terço) e desconta do lado PJ o DAS, o INSS e o imposto de renda do pró-labore e os custos. Confirme o seu caso com um contador.`,
  },
  {
    question: "O que a CLT garante e o PJ não tem?",
    answer:
      "FGTS e a multa de 40% na demissão sem justa causa, 13º salário, férias remuneradas com adicional de um terço, aviso prévio, seguro-desemprego, licenças remuneradas e estabilidade em algumas situações. Nada disso é automático no PJ: precisa virar reserva financeira construída por você.",
  },
  {
    question: "E os benefícios como vale-refeição e plano de saúde?",
    answer:
      "Também deixam de existir como benefício. Você passa a contratar plano de saúde por conta própria, geralmente mais caro do que o plano coletivo empresarial, e recebe o equivalente ao vale em faturamento tributável. Ao comparar propostas, converta cada benefício em valor mensal e some ao lado da CLT.",
  },
  {
    question: "Quais custos o PJ tem que a calculadora considera?",
    answer:
      "O DAS do Simples Nacional, calculado pela alíquota efetiva do Anexo III ou V; o INSS de 11% sobre o pró-labore, limitado a R$ 932,31 por mês; o imposto de renda retido sobre o pró-labore, com as mesmas regras de um salário; os custos mensais que você informar, como contador e certificado digital; e, quando a distribuição de lucros passa de R$ 50 mil no mês, a retenção de 10% criada pela Lei 15.270/2025.",
  },
  {
    question: "O que é o Fator R e por que ele importa?",
    answer:
      "É a razão entre a folha de salários (aqui, o pró-labore) e o faturamento. Atividades como desenvolvimento de software e consultoria são tributadas no Anexo III quando ela é de 28% ou mais, e no Anexo V quando fica abaixo disso (LC 123/2006, art. 18, §§ 5º-J e 5º-M). Na primeira faixa, isso é 6% contra 15,5% do faturamento. A calculadora compara as opções de pró-labore e fica com a que deixa mais dinheiro no seu bolso.",
  },
  {
    question: "Existe risco jurídico em virar PJ?",
    answer:
      "Sim, quando a relação mantém as características de emprego — subordinação, pessoalidade, habitualidade e horário fixo. Nesses casos pode haver reconhecimento de vínculo, com consequências para as duas partes. Se a rotina proposta é idêntica à de um empregado, vale consultar um advogado trabalhista antes de aceitar.",
  },
];

export const Route = createFileRoute("/calculadora-clt-vs-pj")({
  head: () => ({
    meta: [
      { title: "Calculadora CLT vs PJ | Calcule Brasil" },
      { name: "description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/calculadora-clt-vs-pj") }],
    scripts: calculatorStructuredData({
      name: "Calculadora CLT vs PJ",
      description: DESCRIPTION,
      path: "/calculadora-clt-vs-pj",
      applicationCategory: "FinanceApplication",
      faq: FAQ,
    }),
  }),
  component: Calculator,
});

function Calculator() {
  const [input, setInput] = usePersistedState<CltVsPjInput>("clt-vs-pj-input-v3", DEFAULTS);
  const result = useMemo(() => calculateCltVsPj(input), [input]);
  const pj = result.pjDetail;

  return (
    <CalculatorLayout
      title="Calculadora CLT vs PJ"
      description="Compare ganho líquido entre regime CLT e PJ no Simples Nacional"
    >
      <FormSection title="Cenário CLT" description="Seu salário bruto em regime CLT">
        <CurrencyInput
          label="Salário bruto CLT mensal"
          value={input.cltGrossSalary}
          onChange={(v) => setInput({ ...input, cltGrossSalary: v })}
          hint="Valor antes de INSS e IRPF"
        />
        <NumberInput
          label="Número de dependentes"
          value={input.dependants}
          onChange={(v) => setInput({ ...input, dependants: v })}
          min={0}
          max={10}
          hint="Reduzem o imposto do salário CLT e o do pró-labore"
        />
      </FormSection>

      <FormSection
        title="Proposta PJ"
        description="Empresa de serviços de um sócio, no Simples Nacional"
      >
        <CurrencyInput
          label="Faturamento PJ mensal"
          value={input.monthlyPjOffer}
          onChange={(v) => setInput({ ...input, monthlyPjOffer: v })}
          hint="O valor da nota fiscal mensal que a proposta oferece"
        />
        <CurrencyInput
          label="Custos mensais da empresa"
          value={input.pjMonthlyCosts}
          onChange={(v) => setInput({ ...input, pjMonthlyCosts: v })}
          hint="Contador, certificado digital, sistemas. No Simples eles não reduzem o imposto."
        />
      </FormSection>

      <ResultSummaryCard
        title="Comparação"
        mainValue={formatBRL(result.cltWithBenefits)}
        mainLabel={
          result.analysis.isTie
            ? "Empate técnico"
            : result.analysis.cltIsBetter
              ? "CLT é melhor"
              : "PJ é melhor"
        }
        secondaryValue={formatBRL(Math.abs(result.difference))}
        secondaryLabel={
          result.analysis.hasBaseForPercentage
            ? `Diferença: ${Math.abs(result.differencePercent)}%`
            : "Diferença"
        }
        resultColor={
          result.analysis.isTie ? "neutral" : result.analysis.cltIsBetter ? "positive" : "warning"
        }
      />

      <BreakdownTable
        title="Ganho líquido mensal"
        items={[
          { label: "CLT - Salário líquido", value: formatBRL(result.cltNet) },
          {
            label: "CLT - Direitos (13º, FGTS, férias)",
            value: `+ ${formatBRL(result.cltWithBenefits - result.cltNet)}`,
            subtext: "Diluídos mês a mês",
          },
          { label: "CLT Total", value: formatBRL(result.cltWithBenefits), isFinal: true },
          { label: "PJ - Faturamento", value: formatBRL(result.monthlyPjOffer) },
          {
            label: `DAS do Simples (Anexo ${pj.annex})`,
            value: `- ${formatBRL(pj.das)}`,
            subtext: `Alíquota efetiva de ${percent(pj.dasEffectiveRate, 2)}`,
          },
          {
            label: "INSS do sócio (11% do pró-labore)",
            value: `- ${formatBRL(pj.inssWithheld)}`,
            subtext: `Pró-labore de ${formatBRL(pj.proLabore)}: ${STRATEGY_LABEL[pj.strategy]}`,
          },
          { label: "IR sobre o pró-labore", value: `- ${formatBRL(pj.irpfWithheld)}` },
          { label: "Custos da empresa", value: `- ${formatBRL(pj.costs)}` },
          ...(pj.dividendWithholding > 0
            ? [
                {
                  label: "IR sobre lucros acima de R$ 50 mil",
                  value: `- ${formatBRL(pj.dividendWithholding)}`,
                  subtext: "10% sobre toda a distribuição do mês (Lei 15.270/2025)",
                },
              ]
            : []),
          { label: "PJ - Líquido", value: formatBRL(result.pjNet), isFinal: true },
          {
            label: "Faturamento PJ para igualar a CLT",
            value: formatBRL(result.breakEvenPjOffer),
            subtext:
              input.cltGrossSalary > 0
                ? `${((result.breakEvenPjOffer / input.cltGrossSalary - 1) * 100).toFixed(0)}% acima do salário CLT`
                : "Informe o salário CLT para comparar",
          },
        ]}
      />

      <DisclaimerBox>
        {!pj.withinModel && (
          <p className="mb-3">
            <strong>Atenção:</strong> acima de R$ 300 mil por mês (R$ 3,6 milhões por ano), o ISS
            deixa de ser recolhido dentro do DAS, e esta simulação não o calcula. O líquido PJ
            mostrado está acima do real.
          </p>
        )}
        <p>
          Para o seu cenário, seria preciso faturar cerca de{" "}
          <strong>{formatBRL(result.breakEvenPjOffer)}</strong> por mês como PJ para chegar ao mesmo
          ganho de <strong>{formatBRL(result.cltWithBenefits)}</strong> por mês em CLT, já somados
          FGTS, 13º e férias.
        </p>
        <p className="mt-3">
          É uma estimativa educativa para uma empresa de serviços de um sócio no Simples Nacional,
          com o faturamento estável ao longo de doze meses. Ela não cobre Lucro Presumido, MEI,
          exportação de serviços nem o risco de reconhecimento de vínculo quando a relação mantém as
          características de emprego. Consulte um contador antes de decidir.
        </p>
      </DisclaimerBox>

      <BreakEvenSection />

      <FAQSection items={FAQ} />

      <RelatedCalculators excludeSlug="clt-vs-pj" />
      <RelatedPosts slugs={relatedPostsFor("clt-vs-pj")} />
    </CalculatorLayout>
  );
}

function BreakEvenSection() {
  const atBreakEven = EXAMPLE_AT_BREAK_EVEN.pjDetail;
  const benefits = EXAMPLE.cltWithBenefits - EXAMPLE.cltNet;

  return (
    <Prose>
      <h2>Quanto faturar como PJ para empatar com a CLT</h2>
      <p>
        A tabela abaixo foi calculada pela própria calculadora, para quem não tem dependentes e tem{" "}
        {formatBRL(EXAMPLE_COSTS)} de custos mensais na empresa. Cada linha é o faturamento de
        equilíbrio que o formulário mostraria para aquele salário CLT.
      </p>
      <div className="not-prose overflow-x-auto rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)]">
        <table className="w-full min-w-[640px] text-sm">
          <caption className="sr-only">
            Faturamento PJ de equilíbrio por salário CLT, em 2026, no Simples Nacional
          </caption>
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th scope="col" className="px-3 py-2.5">
                Salário CLT
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Líquido CLT
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Pacote CLT
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Faturamento de equilíbrio
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Acima do salário
              </th>
            </tr>
          </thead>
          <tbody>
            {BREAK_EVEN_ROWS.map((row) => (
              <tr key={row.cltGrossSalary} className="border-t border-border/70">
                <th scope="row" className="px-3 py-2 text-left font-medium text-foreground">
                  {formatBRL(row.cltGrossSalary)}
                </th>
                <td className="px-3 py-2 text-right">{formatBRL(row.cltNet)}</td>
                <td className="px-3 py-2 text-right">{formatBRL(row.cltWithBenefits)}</td>
                <td className="px-3 py-2 text-right font-semibold text-foreground">
                  {formatBRL(row.breakEvenPjOffer)}
                </td>
                <td className="px-3 py-2 text-right">{percent(row.aboveGross, 1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        A margem não cresce com o salário. Ela é maior nos salários baixos, onde os{" "}
        {formatBRL(EXAMPLE_COSTS)} de custos e o pró-labore mínimo pesam mais sobre a nota, cai na
        faixa do meio, onde o DAS ainda é de 6% e o pró-labore escapa do imposto, e volta a subir
        quando o faturamento passa de R$ 15 mil por mês e entra na segunda faixa do Simples.
      </p>

      <h2>Para onde vai o faturamento de um PJ</h2>
      <p>
        Um exemplo com os números da própria simulação, para um salário CLT de{" "}
        {formatBRL(EXAMPLE_SALARY)}: o líquido CLT é {formatBRL(EXAMPLE.cltNet)}, os direitos somam{" "}
        {formatBRL(benefits)} e o pacote fica em {formatBRL(EXAMPLE.cltWithBenefits)}. O faturamento
        PJ que empata com ele é de {formatBRL(EXAMPLE.breakEvenPjOffer)} por mês, e se reparte
        assim:
      </p>
      <ul>
        <li>
          <strong>DAS:</strong> {formatBRL(atBreakEven.das)}, a{" "}
          {percent(atBreakEven.dasEffectiveRate, 2)} do Anexo {atBreakEven.annex}. O Simples cobra
          sobre o faturamento, não sobre o lucro, e a alíquota efetiva sobe conforme a receita dos
          últimos doze meses (LC 123/2006, art. 18, § 1º-A).
        </li>
        <li>
          <strong>Pró-labore:</strong> {formatBRL(atBreakEven.proLabore)}, a retirada mensal do
          sócio. Sobre ele saem {formatBRL(atBreakEven.inssWithheld)} de INSS (11%, com teto de R$
          932,31) e {formatBRL(atBreakEven.irpfWithheld)} de imposto de renda, pelas mesmas regras
          de um salário.
        </li>
        <li>
          <strong>Custos:</strong> {formatBRL(atBreakEven.costs)} da empresa. No Simples eles não
          reduzem imposto nenhum: só diminuem o que sobra para distribuir.
        </li>
        <li>
          <strong>Lucro distribuído:</strong> {formatBRL(atBreakEven.distribution)}, sem imposto,
          porque fica abaixo de R$ 50 mil no mês.
        </li>
      </ul>

      <h2>Por que o pró-labore decide o anexo</h2>
      <p>
        Desenvolvimento de software, consultoria, engenharia e design são tributados no Anexo III
        quando a folha de salários, que numa empresa de um sócio é o pró-labore, chega a 28% do
        faturamento, e no Anexo V quando fica abaixo (LC 123/2006, art. 18, §§ 5º-J e 5º-M). Na
        primeira faixa, a diferença é de {percent(SIMPLES_ANNEX_III[0].rate, 1)} contra{" "}
        {percent(SIMPLES_ANNEX_V[0].rate, 1)} do faturamento.
      </p>
      <p>
        Um pró-labore maior paga mais INSS e mais imposto de renda, mas leva a empresa para o anexo
        mais barato. A calculadora faz a conta que um contador faria: compara um pró-labore de 28%,
        um de salário mínimo e, quando a distribuição passaria de R$ 50 mil, um pró-labore ajustado
        para ficar nesse limite, e mostra o que deixa mais dinheiro no seu bolso.
      </p>

      <h2>Lucros acima de R$ 50 mil por mês</h2>
      <p>
        Desde janeiro de 2026, quando uma empresa distribui a uma mesma pessoa mais de R$ 50 mil de
        lucros no mês, há retenção de 10% de imposto de renda sobre o total distribuído, e não só
        sobre o que passa do limite (Lei 9.250/1995, art. 6º-A, incluído pela Lei 15.270/2025). Um
        real acima de R$ 50 mil custa R$ 5 mil. Por isso, nessa faixa, costuma valer a pena aumentar
        o pró-labore para distribuir exatamente R$ 50 mil, e a calculadora testa essa opção.
      </p>

      <h2>O que a CLT paga fora do contracheque</h2>
      <p>
        A simulação avalia os direitos do contrato em <strong>23,33% do salário bruto</strong>: 1/12
        do salário, que é a forma mensal do 13º, mais 15% que representam FGTS, férias com o
        adicional de um terço e os demais encargos habituais. No salário de{" "}
        {formatBRL(EXAMPLE_SALARY)}, isso dá {formatBRL(benefits)} por mês.
      </p>
      <ul>
        <li>
          <strong>13º salário:</strong> um salário extra por ano. Dividido por doze, é 1/12 do bruto
          a cada mês, ainda que o dinheiro só apareça em dezembro.
        </li>
        <li>
          <strong>FGTS:</strong> depósito mensal de 8% do salário feito pelo empregador em conta
          vinculada. Não sai do contracheque nem aparece nele, mas é patrimônio seu.
        </li>
        <li>
          <strong>Multa de 40%:</strong> incide sobre o saldo do FGTS na demissão sem justa causa.
          Cresce com o tempo de casa e só existe porque existe vínculo.
        </li>
        <li>
          <strong>Férias com um terço:</strong> um mês de descanso por ano com o salário mantido,
          mais um adicional de um terço.
        </li>
      </ul>
      <p>
        Esses 23,33% são uma <strong>premissa desta calculadora</strong>, não um percentual escrito
        em lei. Empresas com plano de saúde robusto, participação nos lucros ou previdência privada
        entregam mais; contratos enxutos entregam menos. Se o seu pacote é mais generoso, o
        faturamento de equilíbrio real é maior que o estimado aqui.
      </p>

      <h2>O que esta simulação não modela</h2>
      <ul>
        <li>Lucro Presumido, Lucro Real e MEI, que têm regras próprias.</li>
        <li>Exportação de serviços, que tem tratamento tributário diferente.</li>
        <li>
          Faturamento acima de R$ 3,6 milhões por ano, a partir do qual o ISS é recolhido fora do
          DAS.
        </li>
        <li>
          Mudanças que a reforma tributária (Lei Complementar 214/2025) traga para o Simples
          Nacional.
        </li>
        <li>O imposto mínimo anual para rendas acima de R$ 600 mil por ano.</li>
        <li>Plano de saúde, vale-refeição e outros benefícios corporativos do lado CLT.</li>
      </ul>

      <h2>A reserva que substitui os direitos perdidos</h2>
      <p>
        Trocar de regime não elimina o 13º, as férias e a rescisão: transfere a responsabilidade por
        eles para você. No exemplo de {formatBRL(EXAMPLE_SALARY)}, os {formatBRL(benefits)} mensais
        atribuídos aos direitos equivalem a {percent(benefits / EXAMPLE.breakEvenPjOffer, 1)} do
        faturamento de equilíbrio. Guardar essa fatia de cada nota recria o que o contrato fazia
        sozinho, em três caixas: uma para férias e 13º, uma para os meses entre contratos e uma,
        intocável, para os impostos.
      </p>

      <h2>Erros comuns ao comparar as duas propostas</h2>
      <ul>
        <li>
          <strong>Comparar bruto com bruto.</strong> Salário bruto e faturamento não sofrem os
          mesmos descontos. A comparação honesta é entre líquidos, com os direitos somados do lado
          CLT.
        </li>
        <li>
          <strong>Esquecer os meses sem contrato.</strong> Faturar doze meses por ano é o cenário
          otimista. Divida o ganho anual esperado por doze antes de comparar com o salário.
        </li>
        <li>
          <strong>Ignorar o plano de saúde individual.</strong> Contratado por conta própria,
          costuma custar mais que o coletivo empresarial e reajusta por faixa etária.
        </li>
        <li>
          <strong>Escolher o pró-labore sem olhar o anexo.</strong> Um pró-labore baixo economiza
          INSS e imposto, mas pode levar a empresa do Anexo III para o V e custar mais no DAS.
        </li>
      </ul>

      <h2>Quando a comparação não deveria ser só sobre dinheiro</h2>
      <p>
        Se a rotina proposta mantém subordinação, horário fixo e pessoalidade, a relação tem
        características de emprego e o risco jurídico é dos dois lados. Se você pretende financiar
        um imóvel, comprovar renda como PJ exige histórico e documentação que um contracheque
        resolve sozinho. Na direção oposta, autonomia de agenda, atender mais de um cliente e um
        teto de ganho mais alto são vantagens reais do PJ que nenhuma calculadora precifica. Antes
        de assinar, leve os dois cenários a um contador e, se a rotina for idêntica à de um
        empregado, também a um advogado trabalhista.
      </p>
    </Prose>
  );
}
