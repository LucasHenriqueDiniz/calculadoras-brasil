import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { absoluteUrl } from "@/lib/site";
import { getBlogPost } from "@/lib/blog";

const post = getBlogPost("custo-pet-anual")!;

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: post.title,
  description: post.description,
  datePublished: post.publishedAt,
  dateModified: post.updatedAt,
  author: { "@type": "Organization", name: post.author },
};

export const Route = createFileRoute("/blog/custo-pet-anual")({
  head: () => ({
    meta: [
      { title: `${post.title} | Calcule Brasil` },
      { name: "description", content: post.description },
      { property: "og:title", content: post.title },
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
        <PageHeader eyebrow="Guia de custos" title={post.title} description={post.description} />

        <Prose>
          <p>
            Adotar um animal é uma decisão afetiva, mas envolve um compromisso financeiro que dura
            anos. Um cão de porte médio vive tipicamente entre 10 e 14 anos, e um gato pode passar
            dos 15 — o que transforma um gasto mensal aparentemente pequeno em algo na casa das
            dezenas de milhares de reais ao longo da vida do animal.
          </p>
          <p>
            Este guia organiza os custos em três blocos: o que se repete todo mês, o que aparece uma
            vez por ano e o que surge sem aviso. As faixas de valor são referências de mercado em
            capitais brasileiras e variam bastante por cidade, porte do animal e escolha de marca —
            use-as como ponto de partida e ajuste com os preços da sua região.
          </p>

          <h2>Custo anual médio de um pet</h2>
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Ração</th>
                <th>Veterinário</th>
                <th>Outros</th>
                <th>Total/ano</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Cachorro pequeno</td>
                <td>R$ 1.200</td>
                <td>R$ 600</td>
                <td>R$ 400</td>
                <td>R$ 2.200</td>
              </tr>
              <tr>
                <td>Cachorro médio</td>
                <td>R$ 1.800</td>
                <td>R$ 700</td>
                <td>R$ 600</td>
                <td>R$ 3.100</td>
              </tr>
              <tr>
                <td>Cachorro grande</td>
                <td>R$ 3.000</td>
                <td>R$ 800</td>
                <td>R$ 800</td>
                <td>R$ 4.600</td>
              </tr>
              <tr>
                <td>Gato</td>
                <td>R$ 600</td>
                <td>R$ 500</td>
                <td>R$ 300</td>
                <td>R$ 1.400</td>
              </tr>
            </tbody>
          </table>

          <p>
            Os totais acima não incluem gastos de emergência nem o custo inicial de aquisição. Eles
            representam um ano típico, sem intercorrências de saúde.
          </p>

          <h2>Detalhamento dos custos</h2>

          <h3>Ração: o maior gasto recorrente</h3>
          <p>
            A alimentação costuma responder por metade ou mais do custo anual. A diferença entre uma
            ração popular e uma super premium pode ser de duas a três vezes no preço por quilo, mas
            a comparação direta engana: rações mais concentradas exigem porções menores, então o
            custo por dia se aproxima mais do que a etiqueta sugere.
          </p>
          <p>
            Para comparar de verdade, calcule o <strong>custo por dia</strong>: divida o preço do
            pacote pela quantidade de dias que ele dura na porção recomendada para o peso do seu
            animal. É esse número que deve entrar no orçamento, não o preço do pacote.
          </p>

          <h3>Saúde e veterinário</h3>
          <ul>
            <li>Consulta de rotina: R$ 100 a R$ 250</li>
            <li>Vacinas anuais (múltipla e antirrábica): R$ 150 a R$ 350</li>
            <li>Vermífugo e antipulgas: R$ 100 a R$ 400 por ano, conforme o porte</li>
            <li>Castração (custo único): R$ 300 a R$ 1.200</li>
            <li>Exames de rotina em animais idosos: R$ 300 a R$ 800 por ano</li>
            <li>Atendimento de emergência: de R$ 500 a vários milhares, sem previsibilidade</li>
          </ul>
          <p>
            Muitos municípios oferecem castração gratuita ou subsidiada e campanhas públicas de
            vacinação antirrábica. Vale consultar a secretaria de saúde ou de bem-estar animal da
            sua cidade antes de pagar preço cheio por esses procedimentos.
          </p>

          <h3>Higiene, banho e tosa</h3>
          <p>
            De R$ 50 a R$ 150 por sessão, com frequência de uma a duas vezes por mês — o que dá algo
            entre R$ 600 e R$ 3.600 por ano. Raças de pelo longo puxam a faixa para cima, tanto pela
            frequência quanto pelo tempo de tosa. Gatos, em geral, dispensam banho regular, mas
            consomem areia sanitária: de R$ 40 a R$ 120 por mês.
          </p>

          <h3>Acessórios e itens de uso</h3>
          <p>
            Cama, comedouro, coleira, transportadora, arranhador e brinquedos somam de R$ 300 a R$
            600 por ano em reposição. O primeiro ano é mais caro, porque tudo é comprado de uma vez
            — reserve entre R$ 600 e R$ 1.500 para a chegada do animal.
          </p>

          <h2>O custo que quase ninguém planeja</h2>
          <p>
            A maior fonte de aperto financeiro com pets não é a ração: é a emergência veterinária.
            Uma cirurgia, uma internação de alguns dias ou o tratamento de uma doença crônica podem
            passar de R$ 5.000 sem aviso prévio. Duas formas de se preparar:
          </p>
          <ul>
            <li>
              <strong>Reserva própria:</strong> guardar de R$ 50 a R$ 100 por mês numa aplicação de
              liquidez diária. Em dois anos isso forma um colchão razoável, e o dinheiro continua
              seu se não for usado.
            </li>
            <li>
              <strong>Plano de saúde pet:</strong> de R$ 60 a R$ 250 por mês conforme cobertura.
              Compensa mais para animais de raças com predisposição a problemas específicos. Leia
              com atenção carências, limites anuais e exclusões por doença preexistente — é onde a
              maior parte das frustrações aparece.
            </li>
          </ul>
          <p>
            Não existe resposta única entre as duas. O plano transforma um risco imprevisível em
            custo fixo; a reserva é mais flexível, mas exige disciplina e pode não estar pronta
            quando a emergência acontecer.
          </p>

          <h2>Como reduzir o custo sem prejudicar o animal</h2>
          <ul>
            <li>
              Compare rações pelo custo por dia, não pelo preço do pacote, e evite trocar de marca
              bruscamente.
            </li>
            <li>
              Mantenha vacinas e vermifugação em dia: prevenção custa uma fração do tratamento.
            </li>
            <li>
              Controle o peso do animal. Obesidade está associada a problemas articulares e
              metabólicos caros e crônicos.
            </li>
            <li>
              Procure campanhas municipais de castração e vacinação, e clínicas-escola de faculdades
              de veterinária, que costumam cobrar bem menos.
            </li>
            <li>
              Faça a escova de dentes em casa. Limpeza dentária sob anestesia é um dos procedimentos
              recorrentes mais caros e é largamente evitável.
            </li>
            <li>
              Compre itens de reposição fora de datas comemorativas e prefira acessórios duráveis a
              trocas frequentes.
            </li>
          </ul>

          <h2>Sobre estes números</h2>
          <p>
            As faixas apresentadas são estimativas de mercado observadas em capitais brasileiras e
            servem para dimensionar o orçamento, não como cotação. Preços de ração, serviços
            veterinários e planos variam muito por região e por estabelecimento. Nenhuma informação
            aqui substitui a orientação de um médico-veterinário sobre a alimentação e a saúde do
            seu animal.
          </p>

          <a
            href="/calculadora-custo-pet"
            className="mt-6 inline-block rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground hover:opacity-90"
          >
            Calcular custo do seu pet
          </a>
        </Prose>
      </article>
    </PageShell>
  );
}
