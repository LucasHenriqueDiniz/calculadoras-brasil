import { SITE_REVIEW_DATE } from "@/lib/seo-pages";
import { SITE_URL, absoluteUrl } from "@/lib/site";

interface StructuredFaq {
  question: string;
  answer: string;
}

interface CalculatorStructuredDataOptions {
  name: string;
  description: string;
  path?: string;
  url?: string;
  applicationCategory: "FinanceApplication" | "UtilitiesApplication";
  faq: StructuredFaq[];
}

export function calculatorStructuredData({
  name,
  description,
  path,
  url,
  applicationCategory,
  faq,
}: CalculatorStructuredDataOptions) {
  const pageUrl = url ?? absoluteUrl(path ?? "/");

  const schemas = [
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "@id": `${pageUrl}#application`,
        url: pageUrl,
        name,
        description,
        applicationCategory,
        operatingSystem: "Web",
        inLanguage: "pt-BR",
        dateModified: SITE_REVIEW_DATE,
        publisher: { "@id": `${SITE_URL}/#organization` },
        offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
      }),
    },
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name, item: pageUrl },
        ],
      }),
    },
  ];

  // Um FAQPage sem perguntas é inválido para o Google — só emitimos quando há FAQ.
  if (faq.length > 0) {
    schemas.push({
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      }),
    });
  }

  return schemas;
}

interface ComparisonStructuredDataOptions {
  name: string;
  description: string;
  path: string;
  faq: StructuredFaq[];
}

/**
 * Dados estruturados das páginas de comparação: artigo editorial + trilha de
 * navegação + FAQ (esta última apenas quando há perguntas cadastradas).
 */
export function comparisonStructuredData({
  name,
  description,
  path,
  faq,
}: ComparisonStructuredDataOptions) {
  const pageUrl = absoluteUrl(path);

  const schemas = [
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": `${pageUrl}#article`,
        url: pageUrl,
        headline: name,
        description,
        inLanguage: "pt-BR",
        dateModified: SITE_REVIEW_DATE,
        author: { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
      }),
    },
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Comparações", item: absoluteUrl("/comparar") },
          { "@type": "ListItem", position: 3, name, item: pageUrl },
        ],
      }),
    },
  ];

  if (faq.length > 0) {
    schemas.push({
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      }),
    });
  }

  return schemas;
}
