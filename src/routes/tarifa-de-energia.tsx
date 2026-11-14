import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { TariffRankingTable } from "@/components/content/TariffRankingTable";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PageHeader, PageShell, Prose } from "@/components/layout/PageShell";
import { ANEEL_TARIFF_SUMMARY } from "@/data/aneel-tariff-summary";
import { distributorName } from "@/data/distributor-names";
import type { RankedSummaryRow } from "@/lib/calculators/energy-tariffs";
import { formatLongDate, formatNumber, formatShortDate } from "@/lib/format";
import { lastmodFor } from "@/lib/seo-pages";
import { absoluteUrl } from "@/lib/site";
import { comparisonStructuredData } from "@/lib/structured-data";

const PATH = "/tarifa-de-energia";
const DATASET_URL =
  "https://dadosabertos.aneel.gov.br/dataset/tarifas-distribuidoras-energia-eletrica";

// Every figure in the prose, the title and the FAQ comes from the generated summary, and the table
// from the snapshot it was summarised from (tests/aneel-snapshot.test.ts holds the two equal). The
// head reads only the summary: route heads are not code-split, and the full history would ride
// in every page's JavaScript.
const {
  referenceDate: DATE,
  count: COUNT,
  most: MOST,
  least: LEAST,
  medianKwh: MEDIAN_KWH,
  withChange: WITH_CHANGE,
  medianChangePct: MEDIAN_CHANGE,
  roseTenOrMore: ROSE_TEN,
  fell: FELL,
  biggestRise: BIGGEST_RISE,
} = ANEEL_TARIFF_SUMMARY;
const SPREAD = MOST.kwh / LEAST.kwh;

const kwh = (value: number) => `R$ ${formatNumber(value, 5)}`;
const pct = (value: number) => `${value > 0 ? "+" : ""}${formatNumber(value, 1)}%`;
const label = (row: Pick<RankedSummaryRow, "agent" | "uf" | "city">) => {
  const place = row.city ? `${row.city}, ${row.uf}` : row.uf;
  return place ? `${distributorName(row.agent)} (${place})` : distributorName(row.agent);
};

const TITLE = `Tarifa de energia por distribuidora: ranking das ${COUNT} | Calcule Brasil`;
const DESCRIPTION = `A tarifa residencial de energia das ${COUNT} distribuidoras do Brasil, da mais cara à mais barata, com quanto cada uma mudou em 12 meses. Dados abertos da ANEEL de ${formatShortDate(DATE)}.`;

const FAQ = [
  {
    question: "Qual distribuidora tem a tarifa de energia residencial mais cara?",
    answer: `Em ${formatLongDate(DATE)}, a ${label(MOST)}, com ${kwh(MOST.kwh)} por kWh antes de impostos, em vigor desde ${formatShortDate(MOST.since)}${MOST.resolution ? ` pela Resolução Homologatória nº ${MOST.resolution}` : ""}.`,
  },
  {
    question: "Qual distribuidora tem a tarifa de energia residencial mais barata?",
    answer: `Em ${formatLongDate(DATE)}, a ${label(LEAST)}, com ${kwh(LEAST.kwh)} por kWh antes de impostos. A mais cara cobrava ${formatNumber(SPREAD, 1)} vezes esse valor.`,
  },
  {
    question: "Quanto a tarifa de energia subiu nos últimos 12 meses?",
    answer: `Depende da distribuidora. Entre as ${WITH_CHANGE} que tinham tarifa nas duas datas, a variação mediana foi de ${pct(MEDIAN_CHANGE)}; ${ROSE_TEN} subiram 10% ou mais e ${FELL} ficaram mais baratas. A maior alta foi a da ${label(BIGGEST_RISE)}: ${pct(BIGGEST_RISE.changePct ?? 0)}.`,
  },
];

export const Route = createFileRoute("/tarifa-de-energia")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        property: "og:title",
        content: `Tarifa de energia por distribuidora: ranking das ${COUNT}`,
      },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: absoluteUrl(PATH) },
    ],
    links: [{ rel: "canonical", href: absoluteUrl(PATH) }],
    scripts: comparisonStructuredData({
      name: `Tarifa de energia por distribuidora: ranking das ${COUNT}`,
      description: DESCRIPTION,
      path: PATH,
      faq: FAQ,
    }),
  }),
  component: EnergyTariffRanking,
});

function EnergyTariffRanking() {
  return (
    <PageShell>
      <article>
        <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6">
          <Breadcrumbs items={[{ label: "Tarifa de energia" }]} />
        </div>
        <PageHeader
          eyebrow="Dados abertos da ANEEL"
          title="Tarifa de energia residencial por distribuidora"
          description={`As ${COUNT} distribuidoras com tarifa residencial em vigor, da mais cara à mais barata, e quanto cada uma mudou em 12 meses.`}
        />

        <Prose>
          <p>
            Em <time dateTime={lastmodFor(PATH)}>{formatLongDate(DATE)}</time>, {COUNT}{" "}
            distribuidoras tinham tarifa residencial em vigor no Brasil. A mais cara, {label(MOST)},
            cobrava {kwh(MOST.kwh)} por kWh; a mais barata, {label(LEAST)}, {kwh(LEAST.kwh)}:{" "}
            {formatNumber(SPREAD, 1)} vezes menos. Metade das distribuidoras cobrava até{" "}
            {kwh(MEDIAN_KWH)}.
          </p>
          <p>
            Em 12 meses, a variação mediana foi de {pct(MEDIAN_CHANGE)}. {ROSE_TEN} distribuidoras
            subiram 10% ou mais, e {FELL} ficaram mais baratas. A maior alta foi a da{" "}
            {label(BIGGEST_RISE)}, {pct(BIGGEST_RISE.changePct ?? 0)}.
          </p>
          <p>
            Os valores são a tarifa antes de impostos, que é o que a ANEEL homologa. O preço do kWh
            na sua conta é maior: veja <a href="#o-que-nao-esta-no-preco">o que fica de fora</a>.
            Para estimar a conta com a tarifa da sua distribuidora, use a{" "}
            <Link to="/calculadora-conta-de-luz">calculadora de conta de luz</Link>.
          </p>

          <h2 id="ranking">Ranking das {COUNT} distribuidoras</h2>
        </Prose>

        <TariffRankingTable />

        <Prose>
          <h2>Como esta tabela é feita</h2>
          <p>
            A fonte é o conjunto{" "}
            <a href={DATASET_URL} target="_blank" rel="noreferrer">
              Tarifas de Aplicação das Distribuidoras de Energia Elétrica
            </a>
            , dos dados abertos da ANEEL (licença ODbL), lido em {formatLongDate(DATE)}. Para cada
            distribuidora entra a tarifa B1 residencial na modalidade convencional: a TUSD (uso da
            rede) somada à TE (energia), que a ANEEL publica em R$ por MWh e aqui aparece por kWh.
          </p>
          <p>
            A variação de 12 meses compara a tarifa em vigor em {formatShortDate(DATE)} com a que
            estava em vigor no mesmo dia do ano anterior. Fica em branco quando a ANEEL não publicou
            tarifa para aquela data. Quando a ANEEL repete a mesma tarifa, com a mesma resolução, em
            dois registros seguidos, a tabela conta um só.
          </p>
          <p>
            A UF das concessionárias vem do próprio cadastro de atendimento da ANEEL. A das
            cooperativas, que esse cadastro não cobre, é a da sede no cadastro de CNPJ, com a cidade
            abaixo do nome: uma cooperativa atende a região em volta da sede.
          </p>

          <h2 id="o-que-nao-esta-no-preco">O que não está no preço</h2>
          <p>
            A tarifa homologada pela ANEEL não inclui ICMS, PIS e Cofins, a bandeira tarifária do
            mês nem a contribuição de iluminação pública, cobrada pelo município. Todos entram na
            fatura, então o valor por kWh da sua conta é maior que o desta tabela, e a diferença
            muda de estado para estado.
          </p>

          <h2>Perguntas frequentes</h2>
          {FAQ.map((item) => (
            <div key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </div>
          ))}
        </Prose>

        <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
          <Link
            to="/calculadora-conta-de-luz"
            className="group inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Calcular a conta de luz com a tarifa da sua distribuidora
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </article>
    </PageShell>
  );
}
