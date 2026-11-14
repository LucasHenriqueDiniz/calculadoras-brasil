import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PageHeader, PageShell, Prose } from "@/components/layout/PageShell";
import { ANEEL_TARIFF_SNAPSHOT } from "@/data/aneel-tariff-snapshot";
import { distributorName } from "@/data/distributor-names";
import { distributorPageByAgent, SAMP_MONTH, type DistributorPage } from "@/data/distributor-pages";
import {
  billTable,
  distributorFacts,
  historyWithGaps,
  rankByTariff,
  type DistributorFacts,
  type HistoryEntry,
  type RankedDistributor,
} from "@/lib/calculators/energy-tariffs";
import { formatLongDate, formatNumber, formatShortDate } from "@/lib/format";
import { lastmodFor } from "@/lib/seo-pages";

/**
 * One distributor's tariff: today, every period since ANEEL's series starts, its place in the
 * national ranking and the bill for common consumptions. The only importer of the snapshot on these
 * pages, so the history loads with them and not with the rest of the site.
 *
 * `data-*` attributes are read by scripts/verify-aneel-pages.mjs (against ANEEL's live data) and
 * `data-narrative` by tests/seo-smoke.mjs (which fails if two pages read alike once names and numbers
 * are masked).
 */
const DATE = ANEEL_TARIFF_SNAPSHOT.referenceDate;
const RANKED = rankByTariff(ANEEL_TARIFF_SNAPSHOT.distributors, DATE);

const kwh = (value: number) => `R$ ${formatNumber(value, 5)}`;
const brl = (value: number) => `R$ ${formatNumber(value, 2)}`;
const pct = (value: number) => `${value > 0 ? "+" : ""}${formatNumber(value, 1)}%`;
const abs = (value: number) => `${formatNumber(Math.abs(value), 1)}%`;
const reh = (resolution: string | null) => (resolution ? ` (REH ${resolution})` : "");

type Faq = { question: string; answer: string };

// "de São Paulo", "do Paraná", "da Bahia": the preposition a state takes in Portuguese.
const STATE_PHRASE: Readonly<Record<string, string>> = {
  AC: "do Acre",
  AL: "de Alagoas",
  AP: "do Amapá",
  AM: "do Amazonas",
  BA: "da Bahia",
  CE: "do Ceará",
  DF: "do Distrito Federal",
  ES: "do Espírito Santo",
  GO: "de Goiás",
  MA: "do Maranhão",
  MT: "de Mato Grosso",
  MS: "de Mato Grosso do Sul",
  MG: "de Minas Gerais",
  PA: "do Pará",
  PB: "da Paraíba",
  PR: "do Paraná",
  PE: "de Pernambuco",
  PI: "do Piauí",
  RJ: "do Rio de Janeiro",
  RN: "do Rio Grande do Norte",
  RS: "do Rio Grande do Sul",
  RO: "de Rondônia",
  RR: "de Roraima",
  SC: "de Santa Catarina",
  SP: "de São Paulo",
  SE: "de Sergipe",
  TO: "do Tocantins",
};

function rankSentence(f: DistributorFacts): string {
  const where = `a ${f.rank}ª mais cara entre ${f.count} distribuidoras`;
  const versus = f.current.kwh > f.nationalMedianKwh ? "acima" : "abaixo";
  if (f.rank <= f.count / 3) {
    return `É uma das tarifas mais altas do país: ${where}, acima da mediana nacional de ${kwh(f.nationalMedianKwh)}.`;
  }
  if (f.rank > (2 * f.count) / 3) {
    return `Está entre as tarifas mais baixas do país: ${where}, abaixo da mediana nacional de ${kwh(f.nationalMedianKwh)}.`;
  }
  return `Fica no meio da tabela nacional: ${where}, ${versus} da mediana de ${kwh(f.nationalMedianKwh)}.`;
}

function stateSentence(f: DistributorFacts, name: string): string {
  const state = f.uf ? STATE_PHRASE[f.uf] : undefined;
  if (!state) return "";
  if (f.stateCount === 1)
    return `É a única distribuidora ${state} com tarifa residencial em vigor.`;
  if (f.stateRank === 1) return `É a mais cara das ${f.stateCount} distribuidoras ${state}.`;
  if (f.stateRank === f.stateCount) {
    return `É a mais barata das ${f.stateCount} distribuidoras ${state}.`;
  }
  return `Entre as ${f.stateCount} distribuidoras ${state}, a ${name} é a ${f.stateRank}ª mais cara.`;
}

function yearSentence(f: DistributorFacts): string {
  if (f.changePct === null) {
    return "A ANEEL não publicou tarifa para a mesma data do ano passado, então não há variação de 12 meses.";
  }
  const median = f.nationalMedianChangePct;
  if (f.changePct < 0) {
    return `Em 12 meses a tarifa caiu ${abs(f.changePct)}, enquanto a mediana das distribuidoras variou ${pct(median)}.`;
  }
  if (f.changePct > median) {
    return `Em 12 meses subiu ${abs(f.changePct)}, mais que a mediana das distribuidoras, de ${pct(median)}.`;
  }
  return `Em 12 meses subiu ${abs(f.changePct)}, menos que a mediana das distribuidoras, de ${pct(median)}.`;
}

function historySentences(f: DistributorFacts): string[] {
  const sentences = [
    `Desde ${formatShortDate(f.first.start)}, quando começa a série da ANEEL, a tarifa passou de ${kwh(f.first.kwh)} para ${kwh(f.current.kwh)}: ${pct(f.sinceFirstPct)}.`,
  ];
  if (f.biggestRise) {
    sentences.push(
      `O maior reajuste de um período para o outro foi o de ${formatShortDate(f.biggestRise.start)}, ${pct(f.biggestRise.changePct ?? 0)}${reh(f.biggestRise.resolution)}.`,
    );
  }
  if (f.reductions === 0) {
    sentences.push("Nesta série, a tarifa nunca caiu de um período para o seguinte.");
  } else if (f.reductions === 1 && f.biggestDrop) {
    sentences.push(
      `Caiu uma única vez, em ${formatShortDate(f.biggestDrop.start)}: ${pct(f.biggestDrop.changePct ?? 0)}.`,
    );
  } else if (f.biggestDrop) {
    sentences.push(
      `Caiu ${f.reductions} vezes; a maior queda foi a de ${formatShortDate(f.biggestDrop.start)}, ${pct(f.biggestDrop.changePct ?? 0)}.`,
    );
  }
  if (f.offCycle > 0) {
    sentences.push(
      f.offCycle === 1
        ? "Um dos períodos durou menos de dez meses, sinal de uma revisão fora do reajuste anual."
        : `${f.offCycle} períodos duraram menos de dez meses, sinal de revisões fora do reajuste anual.`,
    );
  }
  if (f.gaps > 0) {
    sentences.push(
      f.gaps === 1
        ? "Há um trecho sem tarifa publicada pela ANEEL; a tabela o mostra em branco, sem preencher."
        : `Há ${f.gaps} trechos sem tarifa publicada pela ANEEL; a tabela os mostra em branco, sem preencher.`,
    );
  }
  return sentences;
}

function neighbourLink(row: RankedDistributor) {
  const page = distributorPageByAgent(row.agent);
  const text = `${distributorName(row.agent)}${row.uf ? ` (${row.uf})` : ""}, ${kwh(row.kwh)}`;
  if (page) {
    return (
      <Link to="/tarifa-de-energia/$slug" params={{ slug: page.slug }}>
        {text}
      </Link>
    );
  }
  return <Link to="/tarifa-de-energia">{text}</Link>;
}

function HistoryChart({ entries, name }: { entries: HistoryEntry[]; name: string }) {
  const periods = entries.filter(
    (entry): entry is Extract<HistoryEntry, { kind: "period" }> => entry.kind === "period",
  );
  const time = (date: string) => Date.parse(`${date}T00:00:00Z`);
  const x0 = time(periods[0].start);
  const x1 = time(periods[periods.length - 1].end);
  const max = Math.max(...periods.map((p) => p.kwh));
  const width = 640;
  const height = 220;
  const pad = 32;
  const x = (date: string) => pad + ((time(date) - x0) / (x1 - x0)) * (width - 2 * pad);
  const y = (value: number) => height - pad - (value / max) * (height - 2 * pad);
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Tarifa residencial da ${name} por período, de ${kwh(periods[0].kwh)} em ${formatShortDate(periods[0].start)} a ${kwh(periods[periods.length - 1].kwh)} em ${formatShortDate(periods[periods.length - 1].start)}`}
      className="h-auto w-full text-primary"
    >
      <line
        x1={pad}
        y1={height - pad}
        x2={width - pad}
        y2={height - pad}
        className="stroke-border"
      />
      {periods.map((period) => (
        <line
          key={period.start}
          x1={x(period.start)}
          x2={x(period.end)}
          y1={y(period.kwh)}
          y2={y(period.kwh)}
          stroke="currentColor"
          strokeWidth={3}
        />
      ))}
      <text x={pad} y={height - 10} className="fill-muted-foreground text-[11px]">
        {periods[0].start.slice(0, 4)}
      </text>
      <text
        x={width - pad}
        y={height - 10}
        textAnchor="end"
        className="fill-muted-foreground text-[11px]"
      >
        {periods[periods.length - 1].end.slice(0, 4)}
      </text>
      <text x={pad} y={y(max) - 8} className="fill-muted-foreground text-[11px]">
        {kwh(max)}/kWh
      </text>
    </svg>
  );
}

export function DistributorTariffPage({ page, faq }: { page: DistributorPage; faq: Faq[] }) {
  const distributor = ANEEL_TARIFF_SNAPSHOT.distributors.find((d) => d.agent === page.agent);
  if (!distributor) throw new Error(`${page.agent} is not in the tariff snapshot.`);
  const facts = distributorFacts(distributor, RANKED, DATE);
  const history = historyWithGaps(distributor.periods);
  const bills = billTable(facts.current.kwh);
  const path = `/tarifa-de-energia/${page.slug}`;
  const consumers = formatNumber(page.residentialConsumers / 1_000_000, 1);

  return (
    <PageShell>
      <article data-distributor={page.agent} data-rank={facts.rank}>
        <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6">
          <Breadcrumbs
            items={[{ label: "Tarifa de energia", to: "/tarifa-de-energia" }, { label: page.name }]}
          />
        </div>
        <PageHeader
          eyebrow={`Dados abertos da ANEEL · ${facts.uf ?? ""}`}
          title={`Tarifa de energia da ${page.name}`}
          description={`${kwh(facts.current.kwh)} por kWh antes de impostos, cada reajuste desde ${facts.first.start.slice(0, 4)} e quanto custa a conta de 50 a 500 kWh.`}
        />

        <Prose>
          <div data-narrative>
            <p>
              Em <time dateTime={lastmodFor(path)}>{formatLongDate(DATE)}</time>, a tarifa
              residencial convencional da {page.name} era de {kwh(facts.current.kwh)} por kWh antes
              de impostos, em vigor de {formatShortDate(facts.current.start)} a{" "}
              {formatShortDate(facts.current.end)}
              {reh(facts.current.resolution)}. {rankSentence(facts)}{" "}
              {stateSentence(facts, page.name)}
            </p>
            <p>{yearSentence(facts)}</p>
            <p>{historySentences(facts).join(" ")}</p>
            <p>
              {`A ${page.name} atende cerca de ${consumers} milhões de unidades consumidoras residenciais, segundo o SAMP da ANEEL de ${SAMP_MONTH.slice(5)}/${SAMP_MONTH.slice(0, 4)}.`}
            </p>
          </div>

          <h2>Histórico da tarifa desde {facts.first.start.slice(0, 4)}</h2>
          <HistoryChart entries={history} name={page.name} />
        </Prose>

        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)]">
            <table className="w-full min-w-[720px] text-sm" data-table="history">
              <caption className="sr-only">
                Tarifa residencial B1 da {page.name} em cada período publicado pela ANEEL
              </caption>
              <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th scope="col" className="px-3 py-2.5">
                    Período
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right">
                    R$/kWh
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right">
                    TUSD
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right">
                    TE
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right">
                    vs. anterior
                  </th>
                  <th scope="col" className="px-3 py-2.5">
                    Resolução
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry) =>
                  entry.kind === "gap" ? (
                    <tr
                      key={`gap-${entry.start}`}
                      data-gap-start={entry.start}
                      data-gap-end={entry.end}
                      className="border-t border-border/70 text-muted-foreground"
                    >
                      <td className="px-3 py-2">
                        {formatShortDate(entry.start)} a {formatShortDate(entry.end)}
                      </td>
                      <td className="px-3 py-2" colSpan={5}>
                        sem tarifa publicada pela ANEEL
                      </td>
                    </tr>
                  ) : (
                    <tr
                      key={entry.start}
                      data-period-start={entry.start}
                      data-period-end={entry.end}
                      className="border-t border-border/70"
                    >
                      <td className="px-3 py-2">
                        {formatShortDate(entry.start)} a {formatShortDate(entry.end)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums" data-cell="kwh">
                        {kwh(entry.kwh)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {formatNumber(entry.tusdKwh, 5)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {formatNumber(entry.teKwh, 5)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {entry.changePct === null ? "—" : pct(entry.changePct)}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {entry.resolution ? `REH ${entry.resolution}` : "—"}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Prose>
          <h2>Na tabela nacional</h2>
          <p>
            Logo acima, mais cara: {facts.above ? neighbourLink(facts.above) : "nenhuma"}. Logo
            abaixo, mais barata: {facts.below ? neighbourLink(facts.below) : "nenhuma"}. A tabela
            completa está no{" "}
            <Link to="/tarifa-de-energia">ranking das {facts.count} distribuidoras</Link>.
          </p>

          <h2>Quanto custa a conta, pela tarifa</h2>
          <p>
            O valor de cada consumo mensal na tarifa da {page.name}, antes de impostos e bandeira.
            Para outro consumo, ou para somar aparelho por aparelho, use a{" "}
            <Link to="/calculadora-conta-de-luz">calculadora de conta de luz</Link>.
          </p>
        </Prose>

        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)]">
            <table className="w-full text-sm" data-table="bill">
              <caption className="sr-only">
                Custo da energia por consumo mensal na tarifa da {page.name}, sem impostos
              </caption>
              <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th scope="col" className="px-3 py-2.5">
                    Consumo no mês
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right">
                    Pela tarifa
                  </th>
                </tr>
              </thead>
              <tbody>
                {bills.map((row) => (
                  <tr key={row.kwh} data-kwh-level={row.kwh} className="border-t border-border/70">
                    <th scope="row" className="px-3 py-2 text-left font-medium text-foreground">
                      {row.kwh} kWh
                    </th>
                    <td className="px-3 py-2 text-right tabular-nums" data-cell="cost">
                      {brl(row.cost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Prose>
          <h2>O que não está no preço</h2>
          <p>
            A tarifa homologada pela ANEEL não inclui ICMS, PIS e Cofins, a bandeira tarifária do
            mês nem a contribuição de iluminação pública, cobrada pelo município. Todos entram na
            fatura, então o valor por kWh da sua conta é maior que o desta página.
          </p>

          <h2>De onde vêm os números</h2>
          <p>
            Do conjunto Tarifas de Aplicação das Distribuidoras de Energia Elétrica, dos dados
            abertos da ANEEL (licença ODbL), lido em {formatShortDate(DATE)}: tarifa B1 residencial
            convencional, TUSD mais TE. Quando a ANEEL repete a mesma tarifa, com a mesma resolução,
            em dois registros seguidos, a tabela mostra um período só. O nome comercial foi
            conferido em {formatShortDate(DATE)}{" "}
            <a href={page.nameSource} target="_blank" rel="noreferrer">
              nesta fonte
            </a>
            .
          </p>

          <h2>Perguntas frequentes</h2>
          {faq.map((item) => (
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
            Calcular a conta de luz por aparelho
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </article>
    </PageShell>
  );
}
