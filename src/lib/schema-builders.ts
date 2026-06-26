import { absoluteUrl, SITE_URL } from "@/lib/site";
import { SITE_REVIEW_DATE } from "@/lib/seo-pages";

interface BlogPostMeta {
  title: string;
  description: string;
  path: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
  image?: string;
}

interface BreadcrumbItem {
  name: string;
  path: string;
}

export function articleSchema(post: BlogPostMeta) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${absoluteUrl(post.path)}#article`,
    headline: post.title,
    description: post.description,
    image: post.image ? absoluteUrl(post.image) : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    inLanguage: "pt-BR",
    author: {
      "@type": "Organization",
      name: post.author,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: post.author,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/apple-touch-icon.png"),
      },
    },
  };
}

export function breadcrumbSchema(breadcrumbs: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "Calcule Brasil",
    url: SITE_URL,
    logo: absoluteUrl("/apple-touch-icon.png"),
    description: "Hub de calculadoras brasileiras para finanças pessoais, impostos e custos do dia a dia",
    inLanguage: "pt-BR",
    sameAs: [],
  };
}

export function faqPageSchema(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function webApplicationSchema(options: {
  name: string;
  description: string;
  path: string;
  applicationCategory: "FinanceApplication" | "UtilitiesApplication";
}) {
  const pageUrl = absoluteUrl(options.path);
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${pageUrl}#application`,
    url: pageUrl,
    name: options.name,
    description: options.description,
    applicationCategory: options.applicationCategory,
    operatingSystem: "Web",
    inLanguage: "pt-BR",
    dateModified: SITE_REVIEW_DATE,
    publisher: { "@id": `${SITE_URL}/#organization` },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "BRL",
    },
  };
}
