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
  title: "Mudança: transportadora, caminhão alugado ou por conta própria",
  columns: ["Transportadora", "Caminhão com motorista", "Van/caminhão alugado"],
  rows: [
    {
      feature: "Custo típico (2 quartos, mesma cidade)",
      items: ["R$ 2.000 a R$ 5.000", "R$ 900 a R$ 2.000", "R$ 500 a R$ 1.200"],
    },
    { feature: "Quem embala", items: ["A empresa (se contratado)", "Você", "Você"] },
    {
      feature: "Quem carrega",
      items: ["A empresa", "Ajudantes contratados", "Você e quem ajudar"],
    },
    {
      feature: "Seguro dos bens",
      items: ["Contratado à parte, obrigatório por lei", "Raramente incluído", "Não incluído"],
    },
    { feature: "Emissão de nota fiscal", items: ["Sim", "Nem sempre", "Só a locação"] },
    { feature: "Tempo típico", items: ["1 dia", "1 a 2 dias", "2 dias ou mais"] },
    {
      feature: "Risco de dano",
      items: ["Menor, e coberto", "Médio, sem cobertura", "Maior, sem cobertura"],
    },
  ],
};

const FAQ = [
  {
    question: "O seguro está incluído no preço da transportadora?",
    answer:
      "Não automaticamente. Empresas de mudança regulamentadas são obrigadas a oferecer cobertura, mas ela costuma ser contratada à parte e cobrada como percentual do valor declarado da carga — em geral entre 0,5% e 2%. Peça a apólice por escrito e confira o que fica de fora: itens frágeis sem embalagem original, eletrônicos e objetos de valor costumam ter cláusulas específicas.",
  },
  {
    question: "Como saber se a transportadora é regularizada?",
    answer:
      "Mudanças interestaduais exigem registro na ANTT, que pode ser consultado gratuitamente no site do órgão pelo CNPJ. Peça também CNPJ ativo, contrato de prestação de serviço e nota fiscal. Empresas que só aceitam pagamento adiantado por Pix pessoal e não emitem contrato são um sinal de alerta comum em golpes de mudança.",
  },
  {
    question: "Vale a pena contratar a embalagem?",
    answer:
      "Depende do volume de itens frágeis. O serviço de embalagem costuma acrescentar entre 20% e 40% ao orçamento, mas é justamente a embalagem inadequada que gera a maior parte dos danos — e danos em itens embalados pelo próprio cliente normalmente não são cobertos pelo seguro. Um meio-termo comum é embalar você mesmo roupas e livros e deixar louça, quadros e eletrônicos para a empresa.",
  },
  {
    question: "Quanto custa uma mudança interestadual?",
    answer:
      "Bem mais que uma mudança local: a distância entra no preço e o frete dedicado é caro. Faixas de R$ 4.000 a R$ 12.000 são comuns para um apartamento de dois quartos entre capitais distantes. A alternativa mais barata é a mudança compartilhada, em que sua carga divide o caminhão com outras — custa menos, mas o prazo de entrega é maior e menos previsível.",
  },
  {
    question: "Fazer por conta própria compensa?",
    answer:
      "Compensa em volume pequeno e distância curta, tipicamente quitinete ou um quarto na mesma cidade. Some ao aluguel do veículo o combustível, os pedágios, o material de embalagem, o eventual elevador de carga e o custo de contratar ajudantes por algumas horas — a diferença para um caminhão com motorista costuma encolher bastante. E lembre que nada estará coberto se algo quebrar.",
  },
  {
    question: "Que custos as pessoas costumam esquecer?",
    answer:
      "Taxa de reserva do elevador de carga no condomínio, material de embalagem, desmontagem e remontagem de móveis planejados, instalação de ar-condicionado no destino, limpeza do imóvel antigo, hospedagem se a mudança virar a noite e depósito temporário quando as datas de saída e entrada não coincidem.",
  },
];

const SOURCES = [
  {
    label: "ANTT — Consulta de transportadores registrados",
    href: "https://www.gov.br/antt/pt-br",
    note: "verificação de empresas para mudanças interestaduais",
  },
  {
    label: "Procon-SP — Orientações sobre contratação de serviços",
    href: "https://www.procon.sp.gov.br/",
    note: "direitos do consumidor e contratos de prestação de serviço",
  },
  {
    label: "Código de Defesa do Consumidor (Lei 8.078/1990)",
    href: "https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm",
    note: "responsabilidade do fornecedor por danos",
  },
];

const DESCRIPTION =
  "Transportadora, caminhão com motorista ou mudança por conta própria: compare custo, seguro, risco de dano e os gastos que quase todo mundo esquece.";

export const Route = createFileRoute("/comparar/mudanca")({
  head: () => ({
    meta: [
      { title: "Transportadora ou mudança por conta própria? | Calcule Brasil" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Vale a pena contratar transportadora de mudança?" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: absoluteUrl("/comparar/mudanca") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/comparar/mudanca") }],
    scripts: comparisonStructuredData({
      name: "Transportadora ou mudança por conta própria?",
      description: DESCRIPTION,
      path: "/comparar/mudanca",
      faq: FAQ,
    }),
  }),
  component: MudancaComparison,
});

function MudancaComparison() {
  return (
    <PageShell>
      <article>
        <PageHeader
          eyebrow="Análise de custo"
          title="Transportadora vs Mudança por Conta Própria"
          description="Quanto cada opção custa de verdade, o que o seguro cobre e quando cada uma faz sentido"
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
            A escolha entre contratar uma transportadora e organizar a mudança por conta própria
            costuma ser apresentada como uma questão de preço, mas na prática são três variáveis:
            quanto você paga, quanto trabalho assume e quem responde se algo quebrar. Esta página
            separa as três para você comparar propostas com os mesmos critérios.
          </p>
          <p>
            As faixas de preço abaixo são referências de mercado para uma mudança de dois quartos
            dentro da mesma cidade. Elas variam bastante conforme a região, o andar, a existência de
            elevador de carga e a época do ano — fim de mês e início de ano são períodos mais caros.
          </p>

          <h2>Comparação geral</h2>
          <ComparisonChart {...comparisonData} />

          <h2>Transportadora (R$ 2.000 a R$ 5.000)</h2>
          <p>
            É a opção mais cara e a única em que o risco sai do seu bolso. A empresa embala,
            carrega, transporta e remonta, e responde por danos nos termos do contrato e da apólice.
          </p>
          <ul>
            <li>Você não carrega nada e a mudança costuma se resolver em um dia</li>
            <li>Cobertura de seguro contratável, com valor declarado da carga</li>
            <li>Contrato e nota fiscal, o que dá respaldo em caso de problema</li>
            <li>Custo mais alto, e a embalagem costuma ser cobrada à parte</li>
            <li>Exige agendamento com antecedência em períodos de pico</li>
          </ul>

          <h2>Caminhão com motorista e ajudantes (R$ 900 a R$ 2.000)</h2>
          <p>
            Meio-termo bastante usado: você embala tudo e contrata o transporte com uma ou duas
            pessoas para carregar. Custa perto da metade da transportadora completa.
          </p>
          <ul>
            <li>Preço intermediário, com boa parte do esforço pesado terceirizado</li>
            <li>Flexível para negociar horário e número de viagens</li>
            <li>Seguro raramente incluído — confirme antes de fechar</li>
            <li>Qualidade muito variável; peça indicação e verifique o CNPJ</li>
            <li>A responsabilidade pela embalagem, e pelos danos dela, é sua</li>
          </ul>

          <h2>Van ou caminhão alugado (R$ 500 a R$ 1.200)</h2>
          <p>
            A opção mais barata no papel, e a que mais esconde custos. Faz sentido para volume
            pequeno e distância curta.
          </p>
          <ul>
            <li>Menor desembolso direto e controle total do cronograma</li>
            <li>
              Some ao aluguel: combustível, pedágio, material de embalagem, taxa de elevador de
              carga e diária de ajudantes
            </li>
            <li>Nenhuma cobertura para os seus bens</li>
            <li>Costuma tomar dois dias ou mais, com desgaste físico relevante</li>
            <li>Exige habilitação compatível com o veículo alugado</li>
          </ul>

          <h2>Como montar o orçamento real</h2>
          <p>
            Para comparar propostas de forma honesta, some sempre os mesmos itens em cada cenário:
            transporte, embalagem, ajudantes, seguro, desmontagem e remontagem de móveis, taxa de
            elevador de carga nos dois condomínios e eventual depósito temporário. É comum que a
            opção mais barata no primeiro orçamento deixe de ser a mais barata depois dessa soma.
          </p>
          <p>
            Peça no mínimo três orçamentos por escrito, com o valor discriminado por item. Desconfie
            de propostas fechadas sem visita técnica ou lista de volumes: elas tendem a ser
            reajustadas no dia da mudança.
          </p>

          <h2>Qual escolher</h2>
          <p>
            <strong>Quitinete ou um quarto, mesma cidade:</strong> caminhão com motorista e um
            ajudante costuma ser o melhor equilíbrio entre custo e esforço.
          </p>
          <p>
            <strong>Dois ou três quartos:</strong> transportadora, principalmente se houver móveis
            planejados, eletrodomésticos grandes ou itens de valor. O custo do seguro é pequeno
            perto do valor do que está sendo transportado.
          </p>
          <p>
            <strong>Mudança interestadual:</strong> só com empresa registrada na ANTT. A mudança
            compartilhada reduz o custo em troca de um prazo de entrega maior.
          </p>
          <p>
            <strong>Orçamento muito apertado:</strong> veículo alugado, mas planeje embalagem com
            antecedência e aceite que não haverá cobertura em caso de dano.
          </p>

          <SourcesList items={SOURCES} reviewedAt={REVIEWED_AT} />

          <a
            href="/calculadora-custo-mudanca"
            className="mt-6 inline-block rounded-md bg-primary px-5 py-2 font-semibold text-primary-foreground hover:opacity-90"
          >
            Calcular custo da sua mudança
          </a>
        </Prose>

        <div className="mx-auto mt-12 max-w-3xl px-4 pb-12 sm:px-6">
          <FAQSection items={FAQ} />
        </div>
      </article>
    </PageShell>
  );
}
