import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { FAQSection } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { Button } from "@/components/ui/button";
import { absoluteUrl } from "@/lib/site";
import { getBlogPost } from "@/lib/blog";

const post = getBlogPost("guia-irpf-2026")!;

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

export const Route = createFileRoute("/blog/guia-irpf-2026")({
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
            O IRPF (Imposto de Renda Pessoa Física) é um dos maiores desafios financeiros dos
            brasileiros. Afeta mais de 50 milhões de pessoas, mas muitos ainda enfrentam dúvidas na
            hora de calcular, declarar ou planejar. Este guia completo cobre tudo que você precisa
            saber sobre o IRPF em 2026: desde as alíquotas progressivas até estratégias legais para
            reduzir sua carga tributária.
          </p>

          <h2>O que é IRPF e por que importa</h2>
          <p>
            O Imposto de Renda Pessoa Física é cobrado sobre a renda pessoal que você recebe. Pode
            vir de salário, bônus, 13º, rendimentos de investimentos, aluguel ou qualquer outra
            fonte. O governo utiliza o IRPF para financiar serviços públicos, e entender como ele
            funciona permite que você planeje melhor suas finanças.
          </p>
          <p>
            Conhecer o IRPF ajuda você a:
          </p>
          <ul>
            <li>Calcular corretamente quanto do seu salário bruto fica para você</li>
            <li>Identificar deduções que legalmente podem reduzir seu imposto</li>
            <li>Planejar a melhor estratégia tributária para sua situação</li>
            <li>Evitar problemas com a Receita Federal na hora da declaração</li>
            <li>Tomar decisões mais informadas sobre educação, saúde e previdência</li>
          </ul>

          <h2>As alíquotas progressivas de 2026</h2>
          <p>
            O IRPF funciona de forma progressiva: quanto mais você ganha, maior o imposto. Mas a
            progressão não é simples — diferentes faixas de renda têm taxas diferentes:
          </p>
          <table>
            <thead>
              <tr>
                <th>Faixa de Renda Anual</th>
                <th>Alíquota</th>
                <th>O que significa</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Até R$ 21.503,34</td>
                <td>0%</td>
                <td>Totalmente isento de imposto</td>
              </tr>
              <tr>
                <td>R$ 21.503,35 a R$ 33.503,34</td>
                <td>7,5%</td>
                <td>Você paga 7,5% da renda nesta faixa</td>
              </tr>
              <tr>
                <td>R$ 33.503,35 a R$ 44.693,59</td>
                <td>15%</td>
                <td>Você paga 15% da renda nesta faixa</td>
              </tr>
              <tr>
                <td>R$ 44.693,60 a R$ 55.471,74</td>
                <td>22,5%</td>
                <td>Você paga 22,5% da renda nesta faixa</td>
              </tr>
              <tr>
                <td>Acima de R$ 55.471,75</td>
                <td>27,5%</td>
                <td>Você paga 27,5% da renda nesta faixa</td>
              </tr>
            </tbody>
          </table>
          <p>
            <strong>Exemplo prático:</strong> se você ganha R$ 60.000/ano, NÃO paga 27,5% sobre os
            R$ 60.000. Você paga:
          </p>
          <ul>
            <li>0% até R$ 21.503,34</li>
            <li>7,5% de R$ 21.503,35 até R$ 33.503,34 (R$ 900,13)</li>
            <li>15% de R$ 33.503,35 até R$ 44.693,59 (R$ 1.687,92)</li>
            <li>22,5% de R$ 44.693,60 até R$ 55.471,74 (R$ 2.425,81)</li>
            <li>27,5% de R$ 55.471,75 até R$ 60.000 (R$ 1.245,19)</li>
          </ul>
          <p>
            <strong>Total:</strong> aproximadamente R$ 6.259,05 sobre R$ 60.000 = alíquota efetiva
            de ~10,4% (bem menor que 27,5%!).
          </p>

          <h2>Desconto INSS: a primeira redução</h2>
          <p>
            Antes de o IRPF ser calculado, você desconta o INSS (Instituto Nacional de Seguridade
            Social). Se você é empregado CLT:
          </p>
          <ul>
            <li>Faixa 1 (até R$ 1.412,00): 7,7%</li>
            <li>Faixa 2 (R$ 1.412,01 a R$ 2.666,68): 9%</li>
            <li>Faixa 3 (R$ 2.666,69 a R$ 4.000,03): 12%</li>
            <li>Faixa 4 (acima de R$ 4.000,03): 14% (com limite de contribuição)</li>
          </ul>
          <p>
            Este INSS é retido automaticamente pelo seu empregador, reduzindo sua base de cálculo
            para o IRPF.
          </p>

          <h2>Dependentes reduzem imposto</h2>
          <p>
            Cada dependente reduz sua base imponível em R$ 2.275 (em 2026). Quem conta como
            dependente:
          </p>
          <ul>
            <li>Cônjuge (mesma declaração ou casado)</li>
            <li>Filhos até 21 anos (ou 24 se estudante)</li>
            <li>Pais e avós a seu cargo</li>
            <li>Irmãos e irmãs menores a seu cargo</li>
            <li>Enteados e equiparados</li>
          </ul>
          <p>
            Exemplo: com 2 filhos, você deduz R$ 4.550 (2 × R$ 2.275) da base imponível.
          </p>

          <h2>Deduções que reduzem imposto</h2>

          <h3>Educação (até R$ 3.561,50/ano)</h3>
          <p>
            Despesas com sua educação ou de dependentes: tuição escola, universidade, cursos
            profissionais, uniformes, transporte escolar, material didático. Limite anual de R$
            3.561,50. Mantenha comprovantes.
          </p>

          <h3>Saúde (sem limite)</h3>
          <p>
            TODAS as despesas médicas e odontológicas: consultas, exames, hospitalizações,
            medicamentos, óculos, aparelho auditivo, plano de saúde. Sem limite máximo de dedução.
            Essencial guardar comprovantes.
          </p>

          <h3>Previdência Complementar (até R$ 63.454/ano)</h3>
          <p>
            Contribuições a PGBL (Plano Gerador de Benefício Livre), VGBL (Vida Gerador de Benefício
            Livre), fundos de pensão. O limite é aproximadamente 13% da sua renda bruta. Ideal para
            quem quer reduzir imposto agora e poupor para aposentadoria.
          </p>

          <h2>Regime Completo vs Simplificado</h2>

          <h3>Regime Completo</h3>
          <p>
            Você deduz os gastos reais com educação, saúde e previdência complementar. Melhor se:
          </p>
          <ul>
            <li>Tem filhos em escolas caras</li>
            <li>Tem despesas médicas/odontológicas altas</li>
            <li>Contribui para previdência complementar</li>
          </ul>

          <h3>Regime Simplificado</h3>
          <p>
            A Receita deduz automaticamente 20,5% da sua renda bruta. Você não precisa guardar
            comprovantes. Melhor se:
          </p>
          <ul>
            <li>Tem poucos gastos dedutíveis</li>
            <li>Prefere simplicidade e menos burocracia</li>
            <li>Não tem dependentes ou tem poucos</li>
          </ul>

          <p>
            <strong>Dica:</strong> use nossa calculadora IRPF para comparar os dois regimes e ver
            qual resulta em menor imposto para seu caso.
          </p>

          <Button asChild className="my-6" size="lg">
            <a href="/calculadora-irpf-2026">Simular seu IRPF 2026</a>
          </Button>

          <h2>Como reduzir seu IRPF legalmente</h2>
          <ul>
            <li>
              <strong>Mantenha comprovantes:</strong> educação, saúde, previdência. A Receita pode
              auditar.
            </li>
            <li>
              <strong>Contribua para previdência complementar:</strong> reduz impostos agora e
              melhora sua aposentadoria.
            </li>
            <li>
              <strong>Declare todos os dependentes:</strong> cada um economiza R$ 2.275/ano.
            </li>
            <li>
              <strong>Compare os regimes:</strong> nem sempre o completo é melhor.
            </li>
            <li>
              <strong>Organize despesas:</strong> agrupe educação e saúde para maximizar deduções.
            </li>
            <li>
              <strong>Consulte um contador:</strong> se tem renda alta ou situação complexa.
            </li>
          </ul>

          <h2>Quando você é obrigado a declarar</h2>
          <p>
            Você DEVE declarar IRPF se:
          </p>
          <ul>
            <li>Recebeu renda &gt; R$ 28.559,70 no ano</li>
            <li>Teve atividade profissional (autônomo, PJ)</li>
            <li>Recebeu herança, doação ou ganhou prêmio</li>
            <li>Tem bens (imóvel, carro, ações) acima de R$ 300 mil</li>
            <li>Vive no exterior mas é residente fiscal brasileiro</li>
          </ul>

          <h2>Calendário 2026</h2>
          <ul>
            <li>
              <strong>Janeiro a dezembro:</strong> ano-calendário para o qual você está declarando
            </li>
            <li>
              <strong>Fevereiro 2027 (estimado):</strong> Receita libera o programa de declaração
            </li>
            <li>
              <strong>Março a abril 2027 (estimado):</strong> período para enviar a declaração
            </li>
            <li>
              <strong>Maiões 2027 em diante:</strong> processamento e restituição liberada em lotes
            </li>
          </ul>

          <h2>Conclusão</h2>
          <p>
            O IRPF não é complicado quando você entende as alíquotas progressivas, as deduções
            permitidas e como os dependentes reduzem o imposto. Use este guia como referência e
            nossa calculadora IRPF para simular sua situação específica.
          </p>
          <p>
            Se tem dúvidas sobre valores muito altos, situações complexas (PJ, herança, bens no
            exterior), consulte um contador ou a Receita Federal. Mas para a maioria dos
            brasileiros que recebem salário, este guia e a calculadora são suficientes.
          </p>
        </Prose>

        <FAQSection items={post.faqs} />

        <RelatedCalculators excludeSlug="irpf-2026" />
      </article>
    </PageShell>
  );
}
