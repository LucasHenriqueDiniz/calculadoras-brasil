import { Link } from "@tanstack/react-router";
import { calculators } from "@/data/calculators";
import { blogPosts } from "@/lib/blog";

interface RelatedContentProps {
  category: "impostos" | "custos" | "comparacoes";
  excludeSlug?: string;
  maxItems?: number;
}

export function RelatedContent({
  category,
  excludeSlug,
  maxItems = 4,
}: RelatedContentProps) {
  const relatedCalcs = calculators
    .filter((c) => c.category === category && c.slug !== excludeSlug)
    .slice(0, maxItems);

  const relatedPosts = Object.values(blogPosts)
    .filter((p) => !excludeSlug || !p.slug.includes(excludeSlug))
    .slice(0, 2);

  if (relatedCalcs.length === 0 && relatedPosts.length === 0) return null;

  return (
    <section className="my-12 border-t pt-8">
      <h2 className="mb-6 text-2xl font-bold">Conteúdo Relacionado</h2>

      {relatedCalcs.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-semibold">Calculadoras Similares</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedCalcs.map((calc) => (
              <Link
                key={calc.slug}
                to={calc.path}
                className="rounded-lg border border-gray-200 p-4 transition hover:border-blue-500 hover:shadow-md"
              >
                <h4 className="font-semibold text-gray-900">{calc.shortTitle}</h4>
                <p className="mt-2 text-sm text-gray-600">{calc.tagline}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {relatedPosts.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold">Leia Também</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {relatedPosts.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="rounded-lg border border-gray-200 p-4 transition hover:border-blue-500 hover:shadow-md"
              >
                <h4 className="font-semibold text-gray-900">{post.title}</h4>
                <p className="mt-2 text-sm text-gray-600">{post.description}</p>
                <span className="mt-3 inline-block text-xs text-gray-500">
                  {post.readingTime} min de leitura
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
