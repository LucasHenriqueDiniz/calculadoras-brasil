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

  return [
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
    {
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
    },
  ];
}
