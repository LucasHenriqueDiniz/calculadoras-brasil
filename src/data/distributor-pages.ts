/**
 * The distributors with a page of their own under /tarifa-de-energia/<slug>: the pilot of
 * docs/plans/organic-traffic/slice-04-distributor-pilot.md.
 *
 * Chosen as the ten with the most residential consumers in ANEEL's SAMP for August 2026, the
 * latest month every distributor had reported on 2026-11-14
 * (docs/research/2026-11-14-public-data-pages/measurements/samp-residential-consumers-2026-08.tsv).
 * `name` is what the distributor calls itself, checked on 2026-11-14 at `nameSource`.
 */
export interface DistributorPage {
  slug: string;
  /** ANEEL's `SigAgente` in the tariff dataset. */
  agent: string;
  name: string;
  nameSource: string;
  /** Residential consumer units, SAMP, August 2026. */
  residentialConsumers: number;
}

export const SAMP_MONTH = "2026-08";

export const DISTRIBUTOR_PAGES: readonly DistributorPage[] = [
  {
    slug: "cemig",
    agent: "CEMIG-D",
    name: "Cemig",
    nameSource: "https://www.cemig.com.br/",
    residentialConsumers: 8_536_384,
  },
  {
    slug: "enel-sao-paulo",
    agent: "ELETROPAULO",
    name: "Enel São Paulo",
    nameSource: "https://www.enel.com.br/pt-saopaulo.html",
    residentialConsumers: 7_619_153,
  },
  {
    slug: "neoenergia-coelba",
    agent: "COELBA",
    name: "Neoenergia Coelba",
    nameSource: "https://www.neoenergia.com/web/bahia",
    residentialConsumers: 6_282_407,
  },
  {
    slug: "cpfl-paulista",
    agent: "CPFL-PAULISTA",
    name: "CPFL Paulista",
    nameSource: "https://www.cpfl.com.br/institucional",
    residentialConsumers: 4_650_887,
  },
  {
    slug: "copel",
    agent: "COPEL-DIS",
    name: "Copel",
    nameSource: "https://www.copel.com/",
    residentialConsumers: 4_505_635,
  },
  {
    slug: "neoenergia-pernambuco",
    agent: "Neoenergia PE",
    name: "Neoenergia Pernambuco",
    nameSource: "https://www.neoenergia.com/web/pernambuco",
    residentialConsumers: 3_849_786,
  },
  {
    slug: "light",
    agent: "LIGHT SESA",
    name: "Light",
    nameSource: "https://www.light.com.br/",
    residentialConsumers: 3_799_152,
  },
  {
    slug: "enel-ceara",
    agent: "ENEL CE",
    name: "Enel Ceará",
    nameSource: "https://www.enel.com.br/pt-ceara.html",
    residentialConsumers: 3_507_540,
  },
  {
    slug: "equatorial-goias",
    agent: "EQUATORIAL GO",
    name: "Equatorial Goiás",
    // The group's own pages render the name with JavaScript, so a fetch could not read it there;
    // this is the press using it.
    nameSource:
      "https://www.jornalopcao.com.br/ultimas-noticias/equatorial-goias-cai-para-penultimo-lugar-em-ranking-de-desempenho-da-aneel-695299/",
    residentialConsumers: 3_185_346,
  },
  {
    slug: "celesc",
    agent: "CELESC",
    name: "Celesc",
    nameSource: "https://www.celesc.com.br/",
    residentialConsumers: 2_840_717,
  },
];

export function distributorPageBySlug(slug: string): DistributorPage | undefined {
  return DISTRIBUTOR_PAGES.find((page) => page.slug === slug);
}

export function distributorPageByAgent(agent: string): DistributorPage | undefined {
  return DISTRIBUTOR_PAGES.find((page) => page.agent === agent);
}
