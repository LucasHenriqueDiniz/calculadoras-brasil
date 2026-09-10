import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { absoluteUrl } from "@/lib/site";
import { getBlogPost } from "@/lib/blog";

const POST_SLUG = "quanto-custa-morar-sozinho";
const post = getBlogPost(POST_SLUG)!;

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: post.title,
  description: post.description,
  datePublished: post.publishedAt,
  dateModified: post.updatedAt,
  author: { "@type": "Organization", name: post.author },
};

export const Route = createFileRoute("/blog/quanto-custa-morar-sozinho")({
  head: () => ({
    meta: [
      { title: `${post.title} | Calcule Brasil` },
      { name: "description", content: post.description },
      { property: "og:title", content: post.title },
      { property: "og:description", content: post.description },
    ],
    links: [{ rel: "canonical", href: absoluteUrl(`/blog/${post.slug}`) }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(articleSchema) }],
  }),
  component: BlogPost,
});

function BlogPost() {
  return (
    <PageShell>
      <article>
        <PageHeader
          eyebrow={`${post.category} • ${post.readingTime} min de leitura`}
          title={post.title}
          description={post.description}
        />

        <Prose>
          {/* INTRODUCTION */}
          <p>
            Morar sozinho é um grande passo. Mas quanto custa realmente? Entre aluguel, condomínio,
            contas, mercado e imprevistos, o valor pode surpreender.
          </p>

          <p>
            O erro mais comum não é errar o valor do aluguel — esse todo mundo pesquisa. É somar só
            o aluguel e descobrir depois que a conta que chega todo mês tem cinco linhas, não uma. E
            é subestimar o primeiro mês, que custa várias vezes o custo mensal e é o que faz muita
            gente voltar para a casa dos pais no primeiro semestre.
          </p>

          <h2>Resumo rápido: Quanto custa morar sozinho?</h2>
          <ul>
            <li>
              <strong>Custo mensal médio:</strong> R$ 1.500 a R$ 3.000 (São Paulo/Rio)
            </li>
            <li>
              <strong>Custos iniciais:</strong> R$ 5.000 a R$ 10.000 (caução, móveis, etc)
            </li>
            <li>
              <strong>Maior despesa:</strong> Aluguel (40-50% do orçamento)
            </li>
          </ul>

          {/* THE 30% RULE, AND WHY IT MISLEADS HERE */}
          <h2>A regra dos 30% engana no Brasil</h2>
          <p>
            A recomendação que mais circula é gastar no máximo 30% da renda com moradia. O problema
            é que ela nasceu falando de <em>housing cost</em> — o custo de morar inteiro — e no
            Brasil ela é repetida como se fosse sobre a linha do aluguel. São coisas diferentes, e a
            diferença é grande.
          </p>
          <p>
            Quem ganha R$ 4.000 líquidos e aplica a regra sobre o aluguel procura algo de R$ 1.200.
            Só que o pacote de moradia daquele imóvel raramente para aí:
          </p>
          <ul>
            <li>Aluguel: R$ 1.200</li>
            <li>Condomínio: R$ 350</li>
            <li>IPTU parcelado: R$ 90</li>
            <li>Seguro incêndio (obrigatório em contrato de locação): R$ 30</li>
            <li>Luz, água, gás e internet: R$ 320</li>
          </ul>
          <p>
            Total: <strong>R$ 1.990</strong>, ou <strong>50% da renda</strong> — não 30%. Para
            fechar em 30% de verdade (R$ 1.200 no pacote todo), o aluguel precisaria ficar perto de
            R$ 600, o que muda completamente a lista de bairros que entram na busca.
          </p>
          <p>
            Não existe percentual certo para todo mundo: quem mora perto do trabalho e não tem carro
            aguenta um percentual de moradia mais alto do que quem gasta R$ 500 de transporte. O
            número que importa é o que sobra depois de tudo, e é isso que a{" "}
            <a href="/calculadora-morar-sozinho">calculadora de morar sozinho</a> mostra.
          </p>

          <h2>Custos mensais fixos</h2>

          <h3>Aluguel</h3>
          <p>A maior parcela do seu orçamento. Varia muito por cidade:</p>
          <ul>
            <li>Estúdio em SP: R$ 800-1.500</li>
            <li>1 quarto em SP: R$ 1.200-2.000</li>
            <li>Cidades do interior: R$ 500-1.000</li>
          </ul>

          <h3>Condomínio + IPTU</h3>
          <p>Não esqueça desses custos:</p>
          <ul>
            <li>Condomínio: R$ 200-500</li>
            <li>IPTU: R$ 50-200</li>
          </ul>

          <h3>Contas básicas</h3>
          <ul>
            <li>Luz: R$ 100-200</li>
            <li>Água: R$ 40-80</li>
            <li>Gás: R$ 50-100</li>
            <li>Internet: R$ 80-150</li>
          </ul>

          <h2>Custos variáveis</h2>

          <h3>Alimentação</h3>
          <p>
            Varia conforme hábito. Se cozinhar em casa: R$ 400-600. Se comer fora: R$ 800-1.200+.
          </p>

          <h3>Transporte</h3>
          <ul>
            <li>Passagem mensal: R$ 120-200 (metrô/ônibus)</li>
            <li>Ou gasolina/uber: R$ 300-500</li>
          </ul>

          <h3>Higiene e limpeza</h3>
          <p>R$ 100-150 por mês em produtos básicos.</p>

          {/* THE COSTS PEOPLE LEAVE OUT OF THE SPREADSHEET */}
          <h2>Os custos que ninguém soma</h2>
          <p>
            Estes quase nunca aparecem nas listas de &quot;quanto custa morar sozinho&quot;, e
            juntos costumam somar de R$ 150 a R$ 400 por mês:
          </p>
          <ul>
            <li>
              <strong>Seguro incêndio.</strong> Exigido na maioria dos contratos de locação. R$ 20 a
              R$ 50 por mês, cobrado junto com o aluguel.
            </li>
            <li>
              <strong>Taxa de lixo.</strong> Cobrada separadamente do IPTU em várias cidades.
            </li>
            <li>
              <strong>Reposição do que quebra.</strong> Chuveiro, lâmpada, vedante de torneira,
              panela que descolou. Em imóvel alugado, o que é desgaste de uso é seu. Reserve algo
              como R$ 80 por mês e você raramente será pego de surpresa.
            </li>
            <li>
              <strong>A primeira multa por atraso.</strong> Boleto de condomínio e aluguel não
              perdoam. Vale programar débito automático antes do primeiro vencimento.
            </li>
            <li>
              <strong>Vida social que mudou de lugar.</strong> Morando sozinho você recebe gente em
              casa, e isso vira mercado. Não é lazer, é alimentação.
            </li>
          </ul>

          {/* WORKED EXAMPLE */}
          <h2>Exemplo: o primeiro mês de quem ganha R$ 4.000</h2>
          <p>
            Vale fazer a conta inteira uma vez, porque o mês da mudança não se parece com nenhum
            outro. Cenário: estúdio de R$ 1.100 no interior, primeiro imóvel, sem móveis.
          </p>
          <ul>
            <li>Caução (2 meses de aluguel): R$ 2.200</li>
            <li>Primeiro aluguel adiantado: R$ 1.100</li>
            <li>Móveis básicos — cama, mesa, armário, sofá usado: R$ 2.500</li>
            <li>Geladeira e micro-ondas: R$ 1.800</li>
            <li>Máquina de lavar: R$ 1.400</li>
            <li>Utensílios, roupa de cama, cortina, panelas: R$ 800</li>
            <li>Frete da mudança: R$ 400</li>
          </ul>
          <p>
            Total do primeiro mês: <strong>R$ 10.200</strong>, contra um custo mensal de rotina
            perto de R$ 1.900. Ou seja,{" "}
            <strong>a entrada custa mais de cinco meses de operação</strong> — e é por isso que a
            pergunta &quot;quanto custa morar sozinho&quot; tem duas respostas muito diferentes.
          </p>
          <p>
            Dá para reduzir bem esse número: fiador ou seguro-fiança no lugar da caução corta R$
            2.200, e móvel usado corta outros R$ 1.500. Mas planejar com R$ 10 mil e gastar R$ 6 mil
            é uma situação bem melhor do que o contrário.
          </p>

          {/* RESERVE */}
          <h2>A reserva antes da mudança, não depois</h2>
          <p>
            A conta de cima é o que sai para entrar no imóvel. Separado dela, vale ter três meses de
            custo fixo guardados antes de assinar o contrato — no exemplo acima, cerca de R$ 5.700.
          </p>
          <p>
            O motivo não é pessimismo: contrato de locação tem prazo, e quem perde a renda no meio
            dele continua devendo aluguel. Uma reserva de três meses é o que transforma um
            imprevisto em transtorno em vez de mudança forçada. Se juntar tudo de uma vez é
            inviável, morar acompanhado por mais um ano e entrar com a reserva pronta costuma sair
            mais barato do que entrar sem ela.
          </p>

          <h2>Custos iniciais (primeira vez)</h2>
          <ul>
            <li>Caução: 1-3 meses de aluguel</li>
            <li>Taxa de imobiliária: 1 mês de aluguel</li>
            <li>Móveis básicos: R$ 2.000-5.000</li>
            <li>Eletrodomésticos: R$ 1.000-2.000</li>
            <li>Utensílios: R$ 500-1.000</li>
          </ul>

          {/* CTA */}
          <div className="my-8 rounded-lg border border-border bg-surface p-6">
            <h3 className="mb-3">Use nossa calculadora</h3>
            <p className="mb-4 text-muted-foreground">
              Coloque seus valores de aluguel, contas e hábitos para ver o custo real.
            </p>
            <a
              href="/calculadora-morar-sozinho"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground hover:opacity-90"
            >
              Calcular <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <h2>Dicas de economia</h2>
          <ol>
            <li>
              <strong>Compartilhe um imóvel.</strong> Dividir aluguel + contas reduz custos em 40%.
            </li>
            <li>
              <strong>Cozinhe em casa.</strong> Comida caseira é 60% mais barata que comer fora.
            </li>
            <li>
              <strong>Use transporte público.</strong> Mais barato que carro/uber.
            </li>
            <li>
              <strong>Peça desconto no aluguel.</strong> Se pagar à vista, muitos proprietários
              descontam 5-10%.
            </li>
          </ol>

          {/* LIMITATIONS */}
          <h2>O que essas faixas não capturam</h2>
          <p>
            Todos os valores acima são faixas de referência, reunidas para dar ordem de grandeza — e
            ordem de grandeza é o que elas conseguem dar. O aluguel de um estúdio varia mais entre
            dois bairros da mesma cidade do que entre duas capitais, e nenhuma faixa publicada
            resolve isso para o seu caso.
          </p>
          <p>
            Três coisas mudam o resultado mais do que qualquer número desta página: a cidade, a
            distância até o trabalho (que troca aluguel por transporte, nas duas direções) e o
            quanto você cozinha. Por isso a recomendação prática é usar estas faixas só para saber
            se a conta fecha de forma grosseira, e depois rodar a{" "}
            <a href="/calculadora-morar-sozinho">calculadora com os seus próprios valores</a> —
            aluguel real do anúncio que você viu, contas do imóvel onde você mora hoje, seu hábito
            de mercado.
          </p>
          <p>
            Este texto é educativo e não substitui planejamento financeiro individual. Os valores
            citados não são cotações e mudam com o tempo.
          </p>
        </Prose>
      </article>
    </PageShell>
  );
}
