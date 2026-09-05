import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { FAQSection } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { Button } from "@/components/ui/button";
import { absoluteUrl } from "@/lib/site";
import { getBlogPost } from "@/lib/blog";

const post = getBlogPost("calculadora-irpf-2026")!;

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: post.title,
  description: post.description,
  datePublished: post.publishedAt,
  dateModified: post.updatedAt,
  author: { "@type": "Organization", name: post.author },
  image: post.imageUrl,
};

export const Route = createFileRoute("/blog/calculadora-irpf-2026")({
  head: () => ({
    meta: [
      { title: `${post.title} | Calcule Brasil` },
      { name: "description", content: post.description },
      { property: "og:title", content: post.title },
      { property: "og:description", content: post.description },
      { property: "og:type", content: "article" },
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
          eyebrow={`${post.category} • ${post.readingTime} min`}
          title={post.title}
          description={post.description}
        />

        <Prose>
          <p>
            Você receberá seu salário em 2026, mas quanto realmente fica para você depois de todos
            os descontos? O IRPF (Imposto de Renda Pessoa Física) afeta mais de 50 milhões de
            brasileiros, mas muitos ainda não entendem como funciona. Neste guia, explicamos passo a
            passo como calcular seu imposto de renda e mostramos como nossa calculadora simplifica
            tudo isso.
          </p>

          <h2>O que é IRPF e por que você deve entender</h2>
          <p>
            O IRPF é o imposto que você paga sobre sua renda pessoal — seja salário, bônus,
            rendimento de investimentos ou outras receitas. A Receita Federal cobra esse imposto de
            forma progressiva: quanto mais você ganha, maior a alíquota.
          </p>
          <p>Entender seu IRPF ajuda você a:</p>
          <ul>
            <li>
              <strong>Planejar seu orçamento:</strong> saber quanto do seu salário bruto realmente
              vira líquido
            </li>
            <li>
              <strong>Identificar deduções:</strong> saber quais gastos você pode descontar
              (educação, saúde, previdência)
            </li>
            <li>
              <strong>Escolher o melhor regime:</strong> decidir entre regime completo ou
              simplificado
            </li>
            <li>
              <strong>Preparar a declaração:</strong> ter os números prontos quando chegar o período
              de declaração
            </li>
          </ul>

          <h2>Alíquotas progressivas IRPF 2026</h2>
          <p>
            O IRPF segue uma tabela progressiva. Isso significa que você não paga a mesma alíquota
            em toda sua renda — diferentes faixas têm taxas diferentes:
          </p>
          <table>
            <thead>
              <tr>
                <th>Base de Cálculo (Anual)</th>
                <th>Alíquota</th>
                <th>Exemplo (imposto pela tabela)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Até R$ 29.145,60</td>
                <td>0% (Isento)</td>
                <td>Base de R$ 28.000/ano não paga imposto</td>
              </tr>
              <tr>
                <td>R$ 29.145,61 a R$ 33.919,80</td>
                <td>7,5%</td>
                <td>Base de R$ 30.000/ano paga ~R$ 64,08</td>
              </tr>
              <tr>
                <td>R$ 33.919,81 a R$ 45.012,60</td>
                <td>15%</td>
                <td>Base de R$ 40.000/ano paga ~R$ 1.270,09</td>
              </tr>
              <tr>
                <td>R$ 45.012,61 a R$ 55.976,16</td>
                <td>22,5%</td>
                <td>Base de R$ 50.000/ano paga ~R$ 3.144,15</td>
              </tr>
              <tr>
                <td>Acima de R$ 55.976,16</td>
                <td>27,5%</td>
                <td>Base de R$ 60.000/ano paga ~R$ 5.595,34</td>
              </tr>
            </tbody>
          </table>
          <p>
            <strong>Importante:</strong> essa progressão significa que uma pessoa com base de
            cálculo de R$ 50.000/ano não paga 22,5% sobre TODA a renda. Ela paga alíquotas
            diferentes em cada faixa. Por isso, a alíquota "efetiva" é sempre menor que a
            "marginal".
          </p>

          <h2>A redução da Lei 15.270/2025</h2>
          <p>
            Os valores da coluna acima são o que a <em>tabela</em> cobra. Em 2026 há um segundo
            passo: a Lei 15.270/2025 abate um valor do imposto que a tabela calculou. Ela não mexeu
            nas faixas — trabalha em cima do resultado delas.
          </p>
          <ul>
            <li>
              <strong>Renda tributável anual até R$ 60.000:</strong> a redução chega a R$ 2.694,15 e
              zera o imposto devido.
            </li>
            <li>
              <strong>De R$ 60.000,01 a R$ 88.200:</strong> a redução é R$ 8.429,73 menos 0,095575 ×
              os rendimentos tributáveis, até chegar a zero.
            </li>
            <li>
              <strong>Acima de R$ 88.200:</strong> não há redução.
            </li>
          </ul>
          <p>
            A redução nunca passa do imposto devido: pode zerar o que você paga, mas não gera
            restituição sozinha. É por isso que se fala em isenção para quem recebe até cerca de R$
            5.000 por mês.
          </p>

          <h2>Desconto INSS: a retenção na fonte</h2>
          <p>
            Se você é empregado CLT, seu empregador desconta o INSS direto do seu salário
            (normalmente 8-11%, dependendo da faixa). Esse desconto é oficial e reduz a base de
            cálculo do IRPF.
          </p>
          <p>
            Se você é autônomo, contribuinte individual ou PJ, você mesmo paga o INSS diretamente à
            Receita Federal.
          </p>

          <h2>Dependentes reduzem seu imposto</h2>
          <p>
            Cada dependente reduz sua base imponível em R$ 2.275,08 (valor de 2026), no regime
            completo. Quem conta como dependente:
          </p>
          <ul>
            <li>Cônjuge (mesmo se separado, em alguns casos)</li>
            <li>Filhos até 21 anos (ou 24 anos se estudante)</li>
            <li>Pais e irmãos menores a seu cargo</li>
            <li>Enteados e equiparados</li>
          </ul>
          <p>
            <strong>Exemplo:</strong> se sua base imponível é R$ 50.000 e você tem 2 dependentes, a
            base reduz em R$ 4.550,16 (2 × R$ 2.275,08), ficando em R$ 45.449,84 para cálculo do
            imposto.
          </p>

          <h2>Deduções que reduzem sua base de cálculo</h2>
          <p>
            Certos gastos são "dedutíveis" — ou seja, você pode subtrair da sua base de cálculo:
          </p>

          <h3>Educação (até R$ 3.561,50)</h3>
          <p>
            Gastos com escola, universidade, cursos profissionais, uniforme, transporte escolar.
            Inclua sua educação e de dependentes. Mantenha recibos da escola/universidade.
          </p>

          <h3>Saúde (sem limite legal)</h3>
          <p>
            Todas as despesas: consultas, exames, hospitalizações, medicamentos, plano de saúde,
            dentista, óculos, aparelho auditivo. SEM LIMITE máximo. Mantenha todos os comprovantes.
          </p>

          <h3>Previdência Complementar (até R$ 63.454/ano)</h3>
          <p>
            Contribuições a PGBL, VGBL, fundos de pensão. O limite é aproximadamente 13% da sua
            renda bruta.
          </p>

          <h2>Regime Completo vs. Simplificado</h2>
          <p>
            Você pode escolher entre dois regimes de tributação. Qual é melhor depende do seu
            perfil:
          </p>

          <h3>Regime Completo (Deduções Reais)</h3>
          <p>Você deduz os gastos reais com educação, saúde e previdência. Melhor se:</p>
          <ul>
            <li>Tem filhos em escola privada cara</li>
            <li>Tem despesas médicas/odontológicas altas</li>
            <li>Contribui para previdência complementar</li>
          </ul>

          <h3>Regime Simplificado (Dedução Fixa 20%)</h3>
          <p>
            A Receita Federal deduz automaticamente 20% dos seus rendimentos tributáveis, até o
            limite de R$ 17.640,00 por ano. Você não precisa de comprovantes, mas esse desconto
            substitui todas as outras deduções — educação, saúde, previdência e dependentes. Melhor
            se:
          </p>
          <ul>
            <li>Tem poucos gastos dedutíveis</li>
            <li>Prefere simplicidade</li>
            <li>Não tem muitos filhos ou não estuda</li>
          </ul>

          <p>
            <strong>Dica:</strong> simule os dois na nossa calculadora IRPF. Ela mostra o resultado
            do regime que você escolher, então rode uma vez em cada um e compare.
          </p>

          <h2>Exemplo prático: quanto você paga</h2>
          <p>
            Vamos simular o caso de uma pessoa que ganha R$ 60.000/ano e declara pelo regime
            completo:
          </p>
          <ul>
            <li>Renda bruta anual: R$ 60.000</li>
            <li>Desconto INSS (estimativa de 10% para o exemplo): R$ 6.000</li>
            <li>Base após INSS: R$ 54.000</li>
            <li>Deduções (educação + saúde + previdência): R$ 8.000</li>
            <li>Base de cálculo: R$ 46.000</li>
            <li>Dependentes: 1 (desconto de R$ 2.275,08)</li>
            <li>Base imponível final: R$ 43.724,92</li>
            <li>Imposto pela tabela: ~R$ 1.828,83</li>
            <li>
              Redução da Lei 15.270/2025: −R$ 1.828,83 (a renda tributável não passa de R$ 60.000)
            </li>
            <li>IRPF devido: R$ 0</li>
          </ul>
          <p>
            Neste exemplo, a tabela chegaria a cobrar cerca de R$ 1.828, mas a redução abate esse
            valor inteiro e o imposto devido fica em zero. O que sai do bolso são os ~R$ 6.000 de
            INSS. Se a empresa reteve IRPF na folha ao longo do ano, essa diferença é acertada na
            declaração.
          </p>

          <h2>Desconto na fonte e retenção</h2>
          <p>
            Se você é empregado, seu empregador já retém o IRPF estimado na folha de pagamento a
            cada mês. No final do ano, você declara e acerta as contas:
          </p>
          <ul>
            <li>
              <strong>Se reteve muito:</strong> você recebe restituição (devolvem o dinheiro)
            </li>
            <li>
              <strong>Se reteve pouco:</strong> você paga a diferença
            </li>
          </ul>
          <p>
            A retenção é apenas uma "adiantamento" do imposto que você deve ao governo. A verdade
            sai na declaração anual.
          </p>

          <h2>Quando você deve declarar IRPF</h2>
          <p>Você é obrigado a declarar IRPF se:</p>
          <ul>
            <li>Recebeu renda &gt; R$ 28.559,70 no ano</li>
            <li>Teve atividade profissional (autônomo, PJ)</li>
            <li>Receberá herança, doação ou ganhou na loteria</li>
            <li>Tem bens (imóvel, carro, ações) acima de R$ 300 mil</li>
            <li>Vive no exterior, mas é residente fiscal brasileiro</li>
          </ul>
          <p>
            <strong>Calendário:</strong> a declaração de 2026 é feita em 2027, normalmente de março
            a abril. Fique atento aos prazos que a Receita Federal divulga anualmente.
          </p>

          <h2>Use a calculadora IRPF para seu caso</h2>
          <p>Simular seu imposto manualmente é complicado. Use nossa calculadora IRPF 2026:</p>
          <ul>
            <li>Informe sua renda bruta anual</li>
            <li>Adicione dependentes</li>
            <li>Declare seus gastos com educação, saúde e previdência</li>
            <li>Escolha seu regime (completo ou simplificado)</li>
            <li>Veja instantaneamente quanto você deve pagar</li>
          </ul>

          <Button asChild className="my-6" size="lg">
            <a href="/calculadora-irpf-2026">Abra a calculadora IRPF 2026</a>
          </Button>

          <h2>Dicas para reduzir seu IRPF legalmente</h2>
          <ul>
            <li>
              <strong>Mantenha gastos com educação:</strong> lembre-se do limite de R$ 3.561,50
            </li>
            <li>
              <strong>Guarde comprovantes de saúde:</strong> são 100% dedutíveis, sem limite
            </li>
            <li>
              <strong>Contribua para previdência complementar:</strong> reduz impostos agora e
              melhora sua aposentadoria
            </li>
            <li>
              <strong>Registre dependentes corretamente:</strong> cada um reduz R$ 2.275,08/ano da
              base de cálculo, no regime completo
            </li>
            <li>
              <strong>Compare os regimes:</strong> nem sempre o completo é melhor (a calculadora
              ajuda)
            </li>
          </ul>

          <h2>Conclusão</h2>
          <p>
            O IRPF não é um mistério. Compreender as alíquotas progressivas, as deduções permitidas
            e os dois regimes ajuda você a planejar melhor seu orçamento e tomar decisões mais
            informadas sobre educação, saúde e previdência.
          </p>
          <p>
            Use nossa calculadora IRPF 2026 para simular seu caso pessoal. Guarde sempre seus
            comprovantes e, se tiver dúvidas, consulte a Receita Federal ou um contador.
          </p>
        </Prose>

        <FAQSection items={post.faqs} />

        <RelatedCalculators excludeSlug="irpf-2026" />
      </article>
    </PageShell>
  );
}
