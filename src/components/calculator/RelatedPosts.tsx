import { ArrowRight, BookOpen } from "lucide-react";
import { getBlogPost, type BlogPost } from "@/lib/blog";

interface RelatedPostsProps {
  /** Blog slugs to link, in display order. Unknown slugs are skipped. */
  slugs: string[];
}

/**
 * Blog posts are static file routes, so they carry no typed `Link` target that
 * a slug can be fed into — a plain anchor is what actually renders a crawlable
 * href here.
 */
export function RelatedPosts({ slugs }: RelatedPostsProps) {
  const posts = slugs.map(getBlogPost).filter((post): post is BlogPost => Boolean(post));

  if (posts.length === 0) return null;

  return (
    <section aria-labelledby="related-posts-heading" className="space-y-4">
      <h2 id="related-posts-heading" className="font-display text-2xl text-foreground">
        Leia também
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {posts.map((post) => (
          <li key={post.slug}>
            <a
              href={`/blog/${post.slug}`}
              className="group flex h-full items-start gap-3 rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-card-hover)]"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                <BookOpen className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">{post.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {post.description}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {post.readingTime} min de leitura
                </p>
              </div>
              <ArrowRight
                className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary"
                aria-hidden
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
