import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Newspaper } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { blogCategoryLabels, listBlogPosts, type BlogPost } from "@/lib/blog";
import { absoluteUrl } from "@/lib/site";

const DESCRIPTION =
  "Guias, análises e explicações sobre IRPF, salário líquido, CLT vs PJ, custo de vida e contas da casa. Tudo em português claro, com as contas abertas.";

const posts = listBlogPosts();

/**
 * Display order for the category sections. A full Record rather than an array,
 * so a category added to `BlogPost` fails to compile here instead of quietly
 * dropping its posts off the page.
 */
const CATEGORY_RANK: Record<BlogPost["category"], number> = {
  guia: 0,
  analise: 1,
  dica: 2,
  educacao: 3,
  noticia: 4,
};

const sections = (Object.keys(CATEGORY_RANK) as BlogPost["category"][])
  .sort((a, b) => CATEGORY_RANK[a] - CATEGORY_RANK[b])
  .map((category) => ({
    category,
    label: blogCategoryLabels[category],
    items: posts.filter((post) => post.category === category),
  }))
  .filter((section) => section.items.length > 0);

const collectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${absoluteUrl("/blog")}#collection`,
  url: absoluteUrl("/blog"),
  name: "Blog do Calcule Brasil",
  description: DESCRIPTION,
  inLanguage: "pt-BR",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: posts.length,
    itemListElement: posts.map((post, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/blog/${post.slug}`),
      name: post.title,
    })),
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Início", item: absoluteUrl("/") },
    { "@type": "ListItem", position: 2, name: "Blog", item: absoluteUrl("/blog") },
  ],
};

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog | Calcule Brasil" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Blog | Calcule Brasil" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: absoluteUrl("/blog") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/blog") }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(collectionSchema) },
      { type: "application/ld+json", children: JSON.stringify(breadcrumbSchema) },
    ],
  }),
  component: BlogIndex,
});

function PostCard({ post }: { post: BlogPost }) {
  return (
    <a
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-card-hover)]"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <BookOpen className="h-5 w-5" aria-hidden />
        </span>
        <h3 className="font-display text-base font-semibold leading-snug text-foreground">
          {post.title}
        </h3>
      </div>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
        {post.description}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/70 pt-3">
        <span className="text-xs text-muted-foreground">{post.readingTime} min de leitura</span>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
          Ler
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </a>
  );
}

function BlogIndex() {
  return (
    <PageShell>
      <section className="relative overflow-hidden border-b border-border bg-surface">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-primary-soft/40 [mask-image:radial-gradient(60%_100%_at_50%_0,black,transparent)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            <Newspaper className="h-3.5 w-3.5" aria-hidden /> Blog
          </p>
          <h1 className="max-w-2xl text-balance font-display text-4xl text-foreground sm:text-5xl">
            As contas por trás das calculadoras
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            {DESCRIPTION}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            {posts.length} textos publicados até aqui.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        {sections.map((section) => (
          <section key={section.category} className="mb-14 last:mb-0">
            <h2 className="font-display text-2xl text-foreground">{section.label}</h2>
            <ul className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {section.items.map((post) => (
                <li key={post.slug}>
                  <PostCard post={post} />
                </li>
              ))}
            </ul>
          </section>
        ))}

        <div className="mt-4 space-y-5 text-pretty leading-relaxed text-foreground/85">
          <h2 className="font-display text-2xl text-foreground">Como este blog é escrito</h2>
          <p>
            Cada texto aqui existe para explicar a conta que uma calculadora do site faz por baixo
            do capô. Quando uma calculadora devolve um número, a pergunta seguinte costuma ser
            &ldquo;por que esse valor?&rdquo; — e é essa pergunta que os artigos respondem, com a
            regra, a fórmula e um exemplo com valores reais.
          </p>
          <p>
            As regras tributárias e previdenciárias citadas seguem a legislação vigente no momento
            da revisão indicada em cada página, e são reescritas sempre que uma tabela muda. Faixas
            de preço e médias de mercado servem para dimensionar a ordem de grandeza da decisão, não
            como cotação: variam por região, fornecedor e época do ano.
          </p>
          <p>
            Todo o conteúdo é informativo e educativo. Ele não substitui a orientação de um
            contador, de um advogado ou do canal oficial do órgão responsável, e nenhuma estimativa
            publicada aqui deve ser tratada como valor final para fins de declaração, pagamento ou
            contrato.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-surface p-8 text-center shadow-[var(--shadow-card)]">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Prefere ir direto ao número?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            As calculadoras rodam no navegador, sem cadastro, com os seus próprios valores.
          </p>
          <Link
            to="/calculadoras"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Ver todas as calculadoras <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
