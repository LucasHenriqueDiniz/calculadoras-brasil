import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { CalculatorLayout, FormSection } from "@/components/calculator/CalculatorLayout";
import { CurrencyInput } from "@/components/calculator/fields";
import { ResultSummaryCard, BreakdownTable, DisclaimerBox } from "@/components/calculator/results";
import { FAQSection } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { Prose } from "@/components/layout/PageShell";
import { RelatedPosts } from "@/components/calculator/RelatedPosts";
import { relatedPostsFor } from "@/data/calculators";
import { formatBRL } from "@/lib/format";
import { calculateCltVsPj, type CltVsPjInput } from "@/lib/calculators/cltVsPj";
import { absoluteUrl } from "@/lib/site";
import { calculatorStructuredData } from "@/lib/structured-data";
import { usePersistedState } from "@/lib/usePersistedState";

const DEFAULTS: CltVsPjInput = {
  cltGrossSalary: 5000,
  monthlyPjOffer: 6000,
  dependants: 0,
  pjDeductibleExpenses: 0,
};

const DESCRIPTION =
  "Compare ganho líquido entre CLT e PJ. Descubra quanto você precisa faturar como PJ para igualar sua CLT depois de somar FGTS, 13º, férias e benefícios.";

const FAQ = [
  {
    question: "Quanto preciso ganhar como PJ para igualar a CLT?",
    answer:
      "Depende do seu salário e dos benefícios que você recebe hoje. Nesta simulação, que trata o faturamento inteiro como pró-labore tributado pela tabela progressiva mensal e aplica 20% de contribuição sobre toda a nota, o faturamento de equilíbrio costuma ficar entre 50% e 80% acima do salário bruto — porque FGTS, 13º, férias com um terço, benefícios e a contribuição previdenciária passam a sair do seu bolso. Regimes mais leves, como o Simples Nacional, derrubam esse percentual e não são modelados aqui, então trate o número como a ponta conservadora da conversa e confirme o seu caso com um contador.",
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
      "A simulação considera a tributação sobre o faturamento, o custo de contabilidade e a contribuição previdenciária do pró-labore. Não considera despesas específicas do seu negócio, como equipamentos, coworking, certificado digital, seguros ou honorários de abertura da empresa — inclua esses valores à parte antes de decidir.",
  },
  {
    question: "PJ paga menos imposto que CLT?",
    answer:
      "Em faixas de renda mais altas, a carga tributária no Simples Nacional costuma ser menor que a do IRPF na fonte. Mas a comparação só é honesta depois de somar os direitos que você deixa de receber e os custos que passa a ter. Um líquido maior no mês pode significar um pacote pior no ano.",
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
  const [input, setInput] = usePersistedState<CltVsPjInput>("clt-vs-pj-input-v2", DEFAULTS);
  const result = useMemo(() => calculateCltVsPj(input), [input]);

  return (
    <CalculatorLayout
      title="Calculadora CLT vs PJ"
      description="Compare ganho líquido entre regime CLT e PJ"
    >
      <FormSection title="Cenário CLT" description="Seu salário bruto em regime CLT">
        <CurrencyInput
          label="Salário bruto CLT mensal"
          value={input.cltGrossSalary}
          onChange={(v) => setInput({ ...input, cltGrossSalary: v })}
          hint="Valor antes de INSS e IRPF"
        />
      </FormSection>

      <FormSection title="Proposta PJ" description="Valor que você receberia como PJ">
        <CurrencyInput
          label="Proposta PJ mensal"
          value={input.monthlyPjOffer}
          onChange={(v) => setInput({ ...input, monthlyPjOffer: v })}
          hint="Quanto está oferecendo como PJ"
        />
        <CurrencyInput
          label="Despesas dedutíveis PJ"
          value={input.pjDeductibleExpenses}
          onChange={(v) => setInput({ ...input, pjDeductibleExpenses: v })}
          hint="Equipamentos, combustível, aluguel do espaço"
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
        title="Ganho Líquido Mensal"
        items={[
          {
            label: "CLT - Salário líquido",
            value: formatBRL(result.cltNet),
          },
          {
            label: "CLT - Benefícios (13º, FGTS, vale)",
            value: `+ ${formatBRL(result.cltWithBenefits - result.cltNet)}`,
            subtext: "Diluído mensalmente",
          },
          {
            label: "CLT Total",
            value: formatBRL(result.cltWithBenefits),
            isFinal: true,
          },
          {
            label: "PJ - Proposta",
            value: formatBRL(result.monthlyPjOffer),
          },
          {
            label: "PJ - Líquido (após INSS, IRPF, contador)",
            value: formatBRL(result.pjNet),
            isFinal: true,
          },
          {
            label: "PJ Necessária para igualar CLT",
            value: formatBRL(result.breakEvenPjOffer),
            subtext:
              input.cltGrossSalary > 0
                ? `${((result.breakEvenPjOffer / input.cltGrossSalary - 1) * 100).toFixed(0)}% a mais que CLT`
                : "Informe o salário CLT para comparar",
          },
        ]}
      />

      <DisclaimerBox>
        <p>
          Para o seu cenário, a simulação indica que seria preciso faturar cerca de{" "}
          <strong>{formatBRL(result.breakEvenPjOffer)}</strong> por mês como PJ para chegar ao mesmo
          ganho líquido de <strong>{formatBRL(result.cltWithBenefits)}</strong> por mês em CLT, já
          somados FGTS, 13º e férias.
        </p>
        <p className="mt-3">
          É uma estimativa educativa. Ela não considera despesas próprias do seu negócio
          (equipamentos, coworking, certificado digital, seguros), variações de anexo e alíquota no
          Simples Nacional ao longo do ano, nem o risco de reconhecimento de vínculo quando a
          relação mantém as características de emprego. Consulte um contador antes de decidir.
        </p>
      </DisclaimerBox>

      <Prose>
        <h2>Como ler o resultado desta calculadora</h2>
        <p>
          O número mais importante da simulação não é o líquido de nenhum dos dois lados: é o{" "}
          <strong>faturamento de equilíbrio</strong>, a nota fiscal mensal que faria o seu bolso
          terminar o mês igual nos dois regimes. Ele quase sempre sai bem acima do salário bruto, e
          isso costuma ser o primeiro susto de quem roda a conta.
        </p>
        <p>
          A distância tem duas causas somadas. A calculadora não compara a proposta PJ com o seu
          salário bruto: compara com o seu líquido <em>mais</em> os direitos que o contrato paga
          fora do contracheque, diluídos mês a mês. E o valor faturado como PJ não chega inteiro na
          conta — contribuição, contabilidade e imposto consomem parte dele antes. A nota precisa
          vencer os dois efeitos ao mesmo tempo.
        </p>
        <p>
          Um exemplo com os números da própria simulação, para um salário bruto de R$ 6.000 sem
          dependentes e sem despesas dedutíveis: o líquido CLT estimado é R$ 4.973,39, os direitos
          amortizados somam R$ 1.400,00, o pacote total fica em R$ 6.373,39 — e o faturamento de
          equilíbrio estimado é R$ 10.310,67 por mês, cerca de 72% acima do salário bruto.
        </p>

        <h2>O que a CLT paga fora do contracheque</h2>
        <p>
          A simulação avalia os direitos do contrato em <strong>23,33% do salário bruto</strong>,
          repartidos em duas parcelas: 1/12 do salário, que é a forma mensal do 13º, mais 15% que
          representam FGTS, férias com o adicional de um terço e os demais encargos habituais. No
          salário de R$ 6.000 isso é R$ 500,00 de 13º e R$ 900,00 do restante.
        </p>
        <p>A mecânica de cada item ajuda a entender por que eles viram valor mensal:</p>
        <ul>
          <li>
            <strong>13º salário:</strong> um salário extra por ano. Dividido por doze, é 1/12 do
            bruto a cada mês, ainda que você só veja o dinheiro em dezembro.
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
            mais um adicional de um terço. O salário desse mês você receberia de qualquer forma; o
            que entra na conta como ganho extra é o adicional.
          </li>
          <li>
            <strong>Aviso prévio:</strong> período pago entre a comunicação da demissão e o fim do
            contrato. É um colchão de tempo, não só de dinheiro.
          </li>
        </ul>
        <p>
          Esses 23,33% são uma <strong>premissa de modelagem desta calculadora</strong>, não um
          percentual escrito em lei. Empresas com plano de saúde robusto, participação nos lucros ou
          previdência privada entregam mais; contratos enxutos entregam menos. Se o seu pacote é
          mais generoso que a média, o faturamento de equilíbrio real é ainda maior que o estimado
          aqui.
        </p>

        <h2>Para onde vai o faturamento de um PJ</h2>
        <p>
          Do lado PJ, a simulação tira três coisas da nota antes de chegar ao líquido: a
          contribuição previdenciária, o honorário do contador e o imposto de renda sobre o que
          sobra. No faturamento de equilíbrio de R$ 10.310,67 do exemplo, isso significa cerca de R$
          2.062,13 de contribuição, R$ 515,53 de contabilidade e R$ 1.359,62 de imposto — cerca de
          38% do que é faturado não chega à sua conta.
        </p>
        <p>
          Duas consequências práticas desse desenho merecem atenção na hora de negociar. A primeira
          é que a contribuição previdenciária é aplicada como{" "}
          <strong>20% sobre todo o faturamento</strong>, sem aplicar o teto do RGPS de R$ 8.475,55
          que limita a contribuição de um empregado a R$ 988,09 por mês. Na prática o pró-labore tem
          teto, e quem o respeita paga menos do que a simulação mostra: esta é, portanto, a ponta
          conservadora da estimativa.
        </p>
        <p>
          A segunda é a <strong>margem de cada real adicional</strong>. Na faixa mais alta da
          tabela, cerca de 53 centavos de cada real a mais faturado sobrevivem à contribuição, ao
          contador e ao imposto; na faixa em que a redução mensal da Lei 15.270/2025 vai sendo
          retirada, a margem chega perto de 40 centavos. É por isso que pedir mais R$ 1.000 na
          proposta PJ não significa mais R$ 1.000 no seu bolso. O campo de despesas dedutíveis atua
          sobre essa mesma margem, mas só pelo lado do imposto: reduz a base do IRPF e não a
          contribuição nem o honorário. Um aviso sobre esse campo: a simulação abate o valor
          informado apenas do imposto, nunca do líquido. Uma despesa real sai do seu bolso de
          qualquer forma, então some as despesas do seu negócio por fora do faturamento de
          equilíbrio antes de fechar a conta.
        </p>

        <h2>O que esta simulação não modela</h2>
        <p>
          A calculadora trata o faturamento inteiro como renda tributável pela tabela progressiva
          mensal, o que corresponde a um cenário de pró-labore integral. Ela{" "}
          <strong>não modela</strong> o Simples Nacional, o anexo em que a sua atividade se
          enquadra, o Fator R, a variação de alíquota efetiva ao longo do ano nem o limite anual de
          faturamento do regime.
        </p>
        <p>
          Isso importa porque esses mecanismos costumam puxar a carga tributária do PJ para baixo:
          se o seu caso se enquadra em um regime mais leve, o faturamento de equilíbrio verdadeiro
          fica abaixo do que esta página estima, e é essa diferença que um contador calcula com os
          seus documentos na mão. Também ficam de fora os custos próprios do negócio, os dependentes
          no lado CLT (cada um reduziria a base mensal do imposto em R$ 189,59) e o valor dos
          benefícios corporativos perdidos.
        </p>

        <h2>A reserva que substitui os direitos perdidos</h2>
        <p>
          Trocar de regime não elimina o 13º, as férias e a rescisão: transfere a responsabilidade
          por eles para você. O próprio número da simulação dimensiona isso — os R$ 1.400,00 mensais
          atribuídos aos direitos no exemplo equivalem a cerca de 13,6% do faturamento de
          equilíbrio. Guardar essa fatia de cada nota recria o que o contrato fazia sozinho.
        </p>
        <p>Costuma ajudar separar a reserva em três funções diferentes:</p>
        <ul>
          <li>
            <strong>Caixa de férias e 13º:</strong> paga o mês em que você não vai faturar e o
            décimo terceiro que ninguém mais deposita. É a parcela mais previsível e a primeira a
            ser montada.
          </li>
          <li>
            <strong>Caixa de rescisão:</strong> ocupa o lugar do saldo de FGTS, da multa e do aviso
            prévio. Como contrato PJ costuma ter prazo de encerramento curto, é a reserva que evita
            aceitar a próxima proposta por necessidade.
          </li>
          <li>
            <strong>Caixa de impostos:</strong> separada das outras duas e intocável, porque esse
            dinheiro nunca foi seu. Misturá-la com a reserva de emergência é o erro mais comum no
            primeiro ano.
          </li>
        </ul>
        <p>
          A aposentadoria também muda de mãos: o empregado contribui pela tabela progressiva até o
          teto, enquanto o PJ decide sozinho quanto recolher e sobre qual base, com efeito direto no
          benefício futuro.
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
            <strong>Tratar o contador como opcional.</strong> Obrigações acessórias em atraso geram
            multa mesmo quando não há imposto a pagar.
          </li>
          <li>
            <strong>Decidir pelo primeiro mês.</strong> Ele costuma ser o melhor: ainda não houve
            férias, nem 13º ausente, nem período entre contratos.
          </li>
        </ul>

        <h2>Quando a comparação não deveria ser só sobre dinheiro</h2>
        <p>
          Há situações em que o número maior não é a melhor decisão. Se a rotina proposta mantém
          subordinação, horário fixo e pessoalidade, a relação tem características de emprego e o
          risco jurídico é dos dois lados. Se você pretende financiar um imóvel, comprovar renda
          como PJ exige histórico e documentação que um contracheque resolve sozinho. E se a sua
          tolerância a meses irregulares é baixa, a estabilidade do vínculo vale algo que não cabe
          na planilha.
        </p>
        <p>
          Na direção oposta, autonomia de agenda, atender mais de um cliente e um teto de ganho mais
          alto são vantagens reais do PJ que nenhuma calculadora precifica. Use esta simulação para
          saber a partir de qual faturamento a conversa sobre dinheiro fica empatada e decida o
          resto com o que só você sabe: o seu setor, a sua reserva atual e a sua disposição a correr
          risco. Antes de assinar, leve os dois cenários a um contador e, se a rotina proposta for
          idêntica à de um empregado, também a um advogado trabalhista.
        </p>
      </Prose>

      <FAQSection items={FAQ} />

      <RelatedCalculators excludeSlug="clt-vs-pj" />
      <RelatedPosts slugs={relatedPostsFor("clt-vs-pj")} />
    </CalculatorLayout>
  );
}
