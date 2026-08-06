import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { ComparisonChart } from "@/components/ComparisonChart";
import { FAQSection } from "@/components/calculator/FAQSection";
import { SourcesList } from "@/components/content/SourcesList";
import { absoluteUrl } from "@/lib/site";
import { comparisonStructuredData } from "@/lib/structured-data";

const REVIEWED_AT = "agosto de 2026";

const comparisonData = {
  title: "Energia: rede da concessionária vs geração solar própria",
  columns: ["Só a rede", "Solar + rede"],
  rows: [
    { feature: "Investimento inicial", items: ["R$ 0", "R$ 12.000 a R$ 30.000"] },
    { feature: "Conta mensal típica", items: ["R$ 150 a R$ 400", "R$ 40 a R$ 120"] },
    {
      feature: "O que continua sendo cobrado",
      items: ["Tudo", "Custo de disponibilidade + Fio B"],
    },
    { feature: "Redução típica da conta", items: ["—", "50% a 80%"] },
    { feature: "Payback estimado", items: ["—", "6 a 10 anos"] },
    { feature: "Manutenção", items: ["Nenhuma", "Limpeza periódica; inversor a cada 10-15 anos"] },
    { feature: "Vida útil dos painéis", items: ["—", "25 anos com perda gradual de eficiência"] },
    { feature: "Exige imóvel próprio", items: ["Não", "Na prática, sim"] },
  ],
};

const FAQ = [
  {
    question: "A conta de luz zera com energia solar?",
    answer:
      "Não. Mesmo gerando toda a energia que consome, você continua pagando o custo de disponibilidade — 30 kWh para ligação monofásica, 50 kWh para bifásica e 100 kWh para trifásica — mais tributos e iluminação pública. Desde a Lei 14.300/2022 também há a cobrança gradual do Fio B sobre a energia injetada na rede. Contas próximas de zero são exceção, não a regra.",
  },
  {
    question: "O que a Lei 14.300/2022 mudou no cálculo?",
    answer:
      "Ela encerrou a gratuidade total do uso da rede na geração distribuída. Sistemas conectados depois de janeiro de 2023 pagam um percentual crescente do componente Fio B da tarifa sobre a energia compensada, o que reduz a economia e alonga o payback em relação às simulações antigas. Quem conectou antes tem regra de transição própria. Peça ao integrador uma simulação que já considere essa cobrança.",
  },
  {
    question: "Qual é o payback real de um sistema solar?",
    answer:
      "Depende da tarifa da sua concessionária, da irradiação da sua região, do consumo e do preço do sistema. Faixas de 6 a 10 anos são realistas na maior parte do Brasil hoje. Simulações que prometem 3 ou 4 anos costumam ignorar o custo de disponibilidade, a cobrança do Fio B, a troca do inversor e a perda anual de eficiência dos painéis.",
  },
  {
    question: "Vale a pena instalar solar em apartamento?",
    answer:
      "Em geral não pela via convencional, porque a área de telhado é compartilhada e a instalação depende de aprovação do condomínio. Duas alternativas costumam fazer mais sentido: a geração compartilhada, em que você assina a cota de uma usina remota, e o consórcio de condomínio para atender as áreas comuns.",
  },
  {
    question: "Energia solar valoriza o imóvel?",
    answer:
      "É plausível que um sistema instalado e quitado seja considerado na avaliação, já que reduz o custo de ocupação. Mas não existe percentual garantido: o efeito depende do mercado local, da idade do sistema e de o comprador atribuir valor a ele. Não recomendamos contar com valorização como parte do retorno do investimento.",
  },
  {
    question: "Financiar o sistema ainda compensa?",
    answer:
      "Só se a parcela do financiamento for menor que a economia mensal na conta. Com juros altos, é comum a parcela superar a economia nos primeiros anos, o que adia o retorno. Compare o custo total do financiamento com o valor à vista antes de fechar, e desconfie de propostas que apresentam apenas a parcela.",
  },
];

const SOURCES = [
  {
    label: "Lei 14.300/2022 — Marco legal da microgeração e minigeração distribuída",
    href: "https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2022/lei/l14300.htm",
    note: "regras de compensação e cobrança do Fio B",
  },
  {
    label: "ANEEL — Geração distribuída",
    href: "https://www.gov.br/aneel/pt-br/assuntos/geracao-distribuida",
    note: "regulamentação vigente e custo de disponibilidade",
  },
  {
    label: "ANEEL — Tarifas de energia por distribuidora",
    href: "https://www.gov.br/aneel/pt-br/assuntos/tarifas",
    note: "tarifa aplicável na sua região",
  },
  {
    label: "INPE — Atlas Brasileiro de Energia Solar",
    href: "http://labren.ccst.inpe.br/atlas_2017.html",
    note: "irradiação solar por região",
  },
];

const DESCRIPTION =
  "Energia solar vale a pena? Compare investimento, redução real da conta, payback e o que continua sendo cobrado depois da Lei 14.300/2022.";

export const Route = createFileRoute("/comparar/energia")({
  head: () => ({
    meta: [
      { title: "Energia Solar vs Rede: vale a pena em 2026? | Calcule Brasil" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Energia Solar vs Rede: vale a pena?" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: absoluteUrl("/comparar/energia") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/comparar/energia") }],
    scripts: comparisonStructuredData({
      name: "Energia Solar vs Rede: vale a pena?",
      description: DESCRIPTION,
      path: "/comparar/energia",
      faq: FAQ,
    }),
  }),
  component: EnergiaComparison,
});

function EnergiaComparison() {
  return (
    <PageShell>
      <article>
        <PageHeader
          eyebrow="Análise de investimento"
          title="Energia Solar vs Rede da Concessionária"
          description="Quanto custa, quanto economiza de verdade e em quantos anos o sistema se paga"
        />

        <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6">
          <Link
            to="/comparar"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Voltar para comparações
          </Link>
        </div>

        <Prose>
          <p>
            A pergunta &quot;vale a pena instalar solar?&quot; não tem resposta única. Ela depende
            de três variáveis que mudam muito de casa para casa: quanto você paga hoje por kWh,
            quanta irradiação solar a sua região recebe e quanto custa o sistema dimensionado para o
            seu consumo. Esta página organiza as premissas para você fazer a conta com números
            realistas — inclusive os custos que as simulações comerciais costumam omitir.
          </p>

          <h2>Comparação geral</h2>
          <ComparisonChart {...comparisonData} />

          <h2>O que muda depois da Lei 14.300/2022</h2>
          <p>
            Até 2022, quem gerava energia solar compensava praticamente todo o consumo e pagava
            apenas o custo de disponibilidade. A Lei 14.300/2022 mudou isso: sistemas conectados a
            partir de janeiro de 2023 passam a pagar um percentual crescente do componente{" "}
            <strong>Fio B</strong> da tarifa sobre a energia injetada na rede e depois compensada.
            Na prática, a economia por kWh gerado é menor do que era, e o payback ficou mais longo.
          </p>
          <p>
            Duas consequências importantes ao avaliar propostas: simulações feitas com a regra
            antiga superestimam o retorno, e sistemas conectados antes de 2023 têm regra de
            transição própria — o que significa que a experiência de um vizinho que instalou há
            alguns anos não se aplica diretamente ao seu caso.
          </p>

          <h2>Os custos que continuam na conta</h2>
          <p>Nenhum sistema conectado à rede zera a fatura. Continuam sendo cobrados:</p>
          <ul>
            <li>
              <strong>Custo de disponibilidade:</strong> o mínimo pago à distribuidora — 30 kWh para
              ligação monofásica, 50 kWh para bifásica e 100 kWh para trifásica.
            </li>
            <li>
              <strong>Fio B sobre a energia compensada:</strong> percentual crescente, conforme a
              Lei 14.300/2022.
            </li>
            <li>
              <strong>Tributos e contribuição de iluminação pública:</strong> incidem normalmente.
            </li>
            <li>
              <strong>Troca do inversor:</strong> equipamento com vida útil menor que a dos painéis,
              em geral 10 a 15 anos. Reserve esse custo no cálculo de longo prazo.
            </li>
            <li>
              <strong>Perda de eficiência dos painéis:</strong> degradação típica em torno de 0,5%
              ao ano, o que reduz a geração ao longo dos 25 anos de vida útil.
            </li>
          </ul>

          <h2>Cenários de payback</h2>
          <p>
            Os cenários abaixo são ilustrativos e assumem uma redução de 65% na conta, sistema pago
            à vista e reajuste tarifário anual moderado. Eles servem para mostrar a ordem de
            grandeza, não para substituir uma simulação com a sua tarifa real.
          </p>

          <h3>Casa com conta de R$ 200/mês</h3>
          <ul>
            <li>Gasto anual sem solar: cerca de R$ 2.400</li>
            <li>Conta estimada com solar: cerca de R$ 70/mês, ou R$ 840 por ano</li>
            <li>Economia anual: cerca de R$ 1.560</li>
            <li>Sistema de R$ 14.000: payback aproximado de 9 anos</li>
          </ul>

          <h3>Casa com conta de R$ 400/mês</h3>
          <ul>
            <li>Gasto anual sem solar: cerca de R$ 4.800</li>
            <li>Conta estimada com solar: cerca de R$ 140/mês, ou R$ 1.680 por ano</li>
            <li>Economia anual: cerca de R$ 3.120</li>
            <li>Sistema de R$ 22.000: payback aproximado de 7 anos</li>
          </ul>

          <h3>Apartamento com conta de R$ 150/mês</h3>
          <ul>
            <li>
              Instalação convencional raramente é viável: o telhado é área comum do condomínio
            </li>
            <li>
              Alternativas: geração compartilhada (assinatura de cota de usina remota) ou projeto do
              condomínio para as áreas comuns
            </li>
            <li>
              Antes disso, medidas de baixo custo — troca para LED, chuveiro em temperatura menor,
              revisão do uso do ar-condicionado — costumam ter retorno mais rápido
            </li>
          </ul>

          <h2>Em que situações costuma compensar</h2>
          <p>
            <strong>Tende a compensar</strong> quando você tem imóvel próprio com telhado adequado,
            conta acima de R$ 250 por mês, pretende ficar no imóvel por 10 anos ou mais e consegue
            pagar à vista ou com juros baixos.
          </p>
          <p>
            <strong>Tende a não compensar</strong> quando você aluga, mora em apartamento, tem conta
            abaixo de R$ 150 por mês, planeja mudar em poucos anos ou só consegue financiar com
            parcela maior que a economia mensal.
          </p>
          <p>
            <strong>Antes de decidir:</strong> peça ao menos três orçamentos, exija que a simulação
            considere a cobrança do Fio B e confirme a tarifa da sua distribuidora. Se a proposta
            mostrar payback muito abaixo de 6 anos, pergunte quais premissas foram usadas.
          </p>

          <h2>Limitações desta análise</h2>
          <p>
            As faixas de preço e de economia aqui são estimativas de mercado e variam por região,
            distribuidora, tipo de telhado e porte do sistema. Não consideramos incentivos estaduais
            específicos, linhas de crédito subsidiadas, tarifa branca nem geração compartilhada em
            detalhe. Nada nesta página é recomendação de investimento: use os números como ponto de
            partida para uma simulação com o seu caso concreto.
          </p>

          <SourcesList items={SOURCES} reviewedAt={REVIEWED_AT} />

          <a
            href="/calculadora-conta-de-luz"
            className="mt-6 inline-block rounded-md bg-primary px-5 py-2 font-semibold text-primary-foreground hover:opacity-90"
          >
            Calcular sua conta de luz atual
          </a>
        </Prose>

        <div className="mx-auto mt-12 max-w-3xl px-4 pb-12 sm:px-6">
          <FAQSection items={FAQ} />
        </div>
      </article>
    </PageShell>
  );
}
