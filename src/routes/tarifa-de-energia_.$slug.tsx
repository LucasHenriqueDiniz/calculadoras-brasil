import { createFileRoute, notFound } from "@tanstack/react-router";
import { DistributorTariffPage } from "@/components/content/DistributorTariffPage";
import { ANEEL_DISTRIBUTOR_SUMMARIES } from "@/data/aneel-distributor-summaries";
import { distributorPageBySlug, type DistributorPage } from "@/data/distributor-pages";
import type { DistributorHeadSummary } from "@/lib/calculators/energy-tariffs";
import { formatNumber, formatShortDate } from "@/lib/format";
import { absoluteUrl } from "@/lib/site";
import { comparisonStructuredData } from "@/lib/structured-data";

// The head reads the generated summaries only; the history (the snapshot) is imported by
// DistributorTariffPage, which is code-split with the route's component. Route heads are not.

const kwh = (value: number) => `R$ ${formatNumber(value, 5)}`;
const brl = (value: number) => `R$ ${formatNumber(value, 2)}`;
const pct = (value: number) => `${value > 0 ? "+" : ""}${formatNumber(value, 1)}%`;

function distributorFaq(page: DistributorPage, summary: DistributorHeadSummary) {
  return [
    {
      question: `Quanto custa o kWh da ${page.name}?`,
      answer: `${kwh(summary.kwh)} por kWh na tarifa residencial convencional, antes de impostos, em vigor desde ${formatShortDate(summary.since)}${summary.resolution ? ` (Resolução Homologatória nº ${summary.resolution} da ANEEL)` : ""}.`,
    },
    {
      question: `Quanto custam 100 kWh na ${page.name}?`,
      answer: `${brl(Math.round(summary.kwh * 100 * 100) / 100)} pela tarifa, antes de ICMS, PIS e Cofins, da bandeira tarifária e da contribuição de iluminação pública, que entram na fatura e deixam o valor final maior.`,
    },
    {
      question: `Quanto a tarifa da ${page.name} mudou em 12 meses?`,
      answer:
        summary.changePct === null
          ? `A ANEEL não publicou tarifa da ${page.name} para a mesma data do ano anterior, então não há como medir.`
          : `${pct(summary.changePct)} em relação à tarifa em vigor na mesma data do ano anterior. Desde ${formatShortDate(summary.firstStart)}, início da série da ANEEL, a variação é de ${pct(summary.sinceFirstPct)}.`,
    },
  ];
}

export const Route = createFileRoute("/tarifa-de-energia_/$slug")({
  loader: ({ params }) => {
    const page = distributorPageBySlug(params.slug);
    const summary = ANEEL_DISTRIBUTOR_SUMMARIES[params.slug];
    if (!page || !summary) throw notFound();
    return { page, summary };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { page, summary } = loaderData;
    const path = `/tarifa-de-energia/${page.slug}`;
    const year = summary.firstStart.slice(0, 4);
    const title = `Tarifa de energia ${page.name}: ${kwh(summary.kwh)}/kWh e histórico desde ${year}`;
    const description = `A tarifa residencial da ${page.name}${summary.uf ? ` (${summary.uf})` : ""} é ${kwh(summary.kwh)} por kWh antes de impostos. Cada reajuste desde ${year}, a posição entre ${summary.count} distribuidoras e quanto custam de 50 a 500 kWh.`;
    return {
      meta: [
        { title: `${title} | Calcule Brasil` },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: absoluteUrl(path) },
      ],
      links: [{ rel: "canonical", href: absoluteUrl(path) }],
      scripts: comparisonStructuredData({
        name: `Tarifa de energia ${page.name}`,
        description,
        path,
        faq: distributorFaq(page, summary),
        parent: { name: "Tarifa de energia", path: "/tarifa-de-energia" },
      }),
    };
  },
  component: DistributorRoute,
});

function DistributorRoute() {
  const { page, summary } = Route.useLoaderData();
  return <DistributorTariffPage page={page} faq={distributorFaq(page, summary)} />;
}
