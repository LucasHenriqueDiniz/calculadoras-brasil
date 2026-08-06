import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { ComparisonChart } from "@/components/ComparisonChart";
import { FAQSection } from "@/components/calculator/FAQSection";
import { SourcesList } from "@/components/content/SourcesList";
import { absoluteUrl } from "@/lib/site";
import { comparisonStructuredData } from "@/lib/structured-data";

const REVIEWED_AT = "agosto de 2026";

const FAQ = [
  {
    question: "Estes preços estão sempre atualizados?",
    answer:
      "Não podemos garantir isso. Plataformas de streaming reajustam preços e reorganizam planos várias vezes por ano, e frequentemente de forma diferente por região. Os valores desta página são referências do período de revisão indicado no fim do texto — sempre confira o preço vigente no site oficial antes de assinar.",
  },
  {
    question: "Assinar vários serviços mais baratos compensa?",
    answer:
      "Depende de quanto você assiste. Duas assinaturas de R$ 30 custam o mesmo que uma de R$ 60, mas só fazem sentido se você usa as duas com regularidade. O erro comum é acumular serviços por causa de uma única série e esquecer de cancelar depois — é assim que a soma passa de R$ 200 por mês sem ninguém perceber.",
  },
  {
    question: "Vale a pena assinar e cancelar por temporada?",
    answer:
      "Sim, e é uma das formas mais eficazes de reduzir o gasto. Como quase todos os serviços são mensais e sem fidelidade, dá para assinar no mês em que sai a série que você quer, maratonar e cancelar. Alguns permitem programar o cancelamento para o fim do ciclo já pago, o que evita esquecimento.",
  },
  {
    question: "Compartilhar conta com outra casa ainda funciona?",
    answer:
      "Cada vez menos. Os principais serviços passaram a restringir o uso fora do domicílio principal e a cobrar por membros extras. Antes de contar com o rateio para dividir o custo, confira as regras atuais do serviço — o combinado pode deixar de funcionar de um mês para o outro.",
  },
  {
    question: "Como saber quanto estou gastando no total?",
    answer:
      "Liste todas as assinaturas ativas, incluindo as anuais cobradas de uma vez e as que vieram embutidas em outro pacote, como serviços de telefonia. Converta tudo para valor mensal e some. É comum o total surpreender, porque cada cobrança isolada parece pequena. Nossa calculadora de assinaturas faz essa consolidação.",
  },
];

const SOURCES = [
  { label: "Netflix — planos e preços no Brasil", href: "https://www.netflix.com/br/" },
  { label: "Disney+ — planos e preços", href: "https://www.disneyplus.com/pt-br" },
  { label: "Prime Video — Amazon Brasil", href: "https://www.primevideo.com/" },
  { label: "Max — planos e preços", href: "https://www.max.com/br/pt" },
  {
    label: "Código de Defesa do Consumidor (Lei 8.078/1990)",
    href: "https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm",
    note: "regras de cobrança recorrente e cancelamento",
  },
];

const DESCRIPTION =
  "Netflix, Disney+, Prime Video e Max: compare preço mensal, custo anual, catálogo e compartilhamento — e veja quanto o conjunto de assinaturas pesa no seu orçamento.";

const comparisonData = {
  title: "Streaming: Preço e Catálogo",
  columns: ["Netflix", "Disney+", "Prime Video", "HBO Max"],
  rows: [
    {
      feature: "Preço mensal (básico)",
      items: ["R$ 55", "R$ 33", "R$ 15", "R$ 40"],
    },
    {
      feature: "Preço anual",
      items: ["R$ 660", "R$ 400", "R$ 180", "R$ 480"],
    },
    {
      feature: "Qualidade máxima",
      items: ["4K (R$ 165/mês)", "4K incluído", "4K incluído", "4K incluído"],
    },
    {
      feature: "Compartilhamento",
      items: ["1-4 perfis", "4 perfis", "1 conta", "2-4 perfis"],
    },
    {
      feature: "Filmes exclusivos",
      items: ["Muitos", "Poucos", "Alguns", "Vários"],
    },
    {
      feature: "Séries exclusivas",
      items: ["Muitas", "Muitas", "Algumas", "Muitas"],
    },
    {
      feature: "Documentários",
      items: ["Muitos", "Alguns", "Alguns", "Alguns"],
    },
    {
      feature: "Período grátis",
      items: ["Não", "7 dias", "30 dias", "Não"],
    },
  ],
};

export const Route = createFileRoute("/comparar/streaming")({
  head: () => ({
    meta: [
      { title: "Netflix vs Disney+ vs Prime: Qual vale mais? | Calcule Brasil" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Netflix vs Disney+: Qual vale mais a pena?" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: absoluteUrl("/comparar/streaming") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/comparar/streaming") }],
    scripts: comparisonStructuredData({
      name: "Netflix vs Disney+ vs Prime Video vs Max",
      description: DESCRIPTION,
      path: "/comparar/streaming",
      faq: FAQ,
    }),
  }),
  component: StreamingComparison,
});

function StreamingComparison() {
  return (
    <PageShell>
      <article>
        <PageHeader
          eyebrow="Comparação de Preços"
          title="Netflix vs Disney+ vs Prime Video vs HBO Max"
          description="Qual streaming compensa mais? Compare preço, catálogo e qualidade."
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
            Escolher entre serviços de streaming envolve três coisas: quanto custa, o que tem no
            catálogo e quanto você realmente assiste. O preço isolado engana, porque uma assinatura
            barata que fica parada custa mais por hora assistida do que uma cara usada todo dia.
          </p>
          <p>
            <strong>Sobre os preços desta página:</strong> as plataformas reajustam valores e
            reorganizam planos com frequência, e há diferenças por região e por promoção vigente. Os
            números abaixo são referências do período de revisão indicado ao fim do texto — confirme
            sempre no site oficial antes de assinar.
          </p>

          <h2>Tabela de Comparação</h2>
          <ComparisonChart {...comparisonData} />

          <h2>Netflix</h2>
          <p>
            <strong>Melhor para:</strong> quem quer catálogo diverso (filmes + séries).
          </p>
          <ul>
            <li>Catálogo: gigantesco, sempre atualizado</li>
            <li>Preço: R$ 55-165/mês conforme qualidade</li>
            <li>Compartilhamento: permite 1-4 perfis (depende do plano)</li>
            <li>Força: originals exclusivas de qualidade</li>
            <li>Fraqueza: sem período grátis</li>
          </ul>

          <h2>Disney+</h2>
          <p>
            <strong>Melhor para:</strong> famílias que gostam de Disney, Marvel, Star Wars.
          </p>
          <ul>
            <li>Catálogo: especializado em família (Disney, Marvel, Star Wars, Pixar)</li>
            <li>Preço: R$ 33/mês (mais barato)</li>
            <li>Compartilhamento: 4 perfis simultâneos</li>
            <li>Força: conteúdo exclusivo de qualidade</li>
            <li>Fraqueza: catálogo menor que Netflix</li>
          </ul>

          <h2>Prime Video</h2>
          <p>
            <strong>Melhor para:</strong> quem já tem Amazon Prime (frete grátis + Prime Video).
          </p>
          <ul>
            <li>Catálogo: médio, mas com séries boas</li>
            <li>Preço: R$ 15/mês (se tiver Prime anual)</li>
            <li>Valor: inclui frete grátis na Amazon</li>
            <li>Força: melhor custo se já usa Prime</li>
            <li>Fraqueza: catálogo menor que Netflix</li>
          </ul>

          <h2>HBO Max</h2>
          <p>
            <strong>Melhor para:</strong> fãs de seriados de drama de qualidade.
          </p>
          <ul>
            <li>Catálogo: forte em séries, fraco em filmes</li>
            <li>Preço: R$ 40-45/mês</li>
            <li>Força: séries dramáticas de ouro (Game of Thrones, Chernobyl, Succession)</li>
            <li>Fraqueza: catálogo menor</li>
          </ul>

          <h2>Qual Escolher?</h2>
          <p>
            <strong>Se quer tudo:</strong> Netflix (catálogo) + Disney+ (Marvel/família).
          </p>
          <p>
            <strong>Se quer economizar:</strong> Disney+ (R$ 33) + Prime Video (R$ 15) = R$ 48/mês
            (vs Netflix R$ 55).
          </p>
          <p>
            <strong>Se quer séries boas:</strong> HBO Max é especialista.
          </p>

          <h2>Como avaliar se uma assinatura se paga</h2>
          <p>
            Em vez de comparar mensalidades, calcule o <strong>custo por hora assistida</strong>:
            divida o valor mensal pelo número de horas que você efetivamente consumiu no serviço
            naquele mês. Uma assinatura de R$ 55 usada por 20 horas sai a R$ 2,75 a hora, mais
            barata que qualquer sessão de cinema; a mesma assinatura usada por duas horas sai a R$
            27,50.
          </p>
          <p>
            Faça esse cálculo por dois ou três meses antes de renovar. Serviços com custo por hora
            muito alto são os primeiros candidatos ao cancelamento — e, como quase nenhum tem
            fidelidade, dá para voltar quando algo que você quer ver for lançado.
          </p>
          <p>
            Outra prática que reduz bastante o gasto é a <strong>assinatura rotativa</strong>:
            manter um ou dois serviços fixos e alternar o terceiro conforme os lançamentos,
            cancelando assim que terminar a série que motivou a assinatura.
          </p>

          <h2>Impacto no orçamento mensal</h2>
          <p>
            <strong>1 streaming:</strong> R$ 33-165/mês = R$ 400-2.000/ano
          </p>
          <p>
            <strong>2 streamings:</strong> R$ 88/mês (Disney + Netflix básico) = R$ 1.056/ano
          </p>
          <p>
            <strong>3+ streamings:</strong> R$ 200+/mês = R$ 2.400+/ano (repense!)
          </p>

          <div className="my-8 rounded-lg border border-border bg-surface p-6">
            <h3 className="mb-3 font-semibold">Use nossa calculadora de assinaturas</h3>
            <p className="text-sm text-muted-foreground">
              Liste todas suas assinaturas e veja o impacto real no seu orçamento mensal.
            </p>
            <a
              href="/calculadora-assinaturas"
              className="mt-4 inline-block rounded-md bg-primary px-5 py-2 font-semibold text-primary-foreground hover:opacity-90"
            >
              Calcular meu gasto
            </a>
          </div>

          <h2>Limitações desta comparação</h2>
          <p>
            Comparamos preço anunciado, estrutura de planos e perfil de catálogo. Não avaliamos
            qualidade de streaming em conexões lentas, disponibilidade título a título — que muda
            todo mês — nem pacotes combinados oferecidos por operadoras. Preferências de conteúdo
            são pessoais: use a tabela para descartar o que claramente não serve e teste os períodos
            gratuitos antes de se comprometer.
          </p>

          <SourcesList items={SOURCES} reviewedAt={REVIEWED_AT} />
        </Prose>

        <div className="mx-auto mt-12 max-w-3xl px-4 pb-12 sm:px-6">
          <FAQSection items={FAQ} />
        </div>
      </article>
    </PageShell>
  );
}
