export const SITE_REVIEW_DATE = "2026-06-23";
export const SITE_REVIEW_DATE_LABEL = "23 de junho de 2026";
export const EDITORIAL_RESPONSIBLE = "Calcule Brasil";

/**
 * `lastmod` is the date that page's own content last changed — not the
 * site-wide editorial review date above. A sitemap that stamps every URL with
 * the same date tells Google nothing, and Google answers by not re-crawling:
 * dating each page apart is what makes the signal usable.
 *
 * It is maintained by hand, so it has to move in the same commit that changes a
 * page. `lastmodFor` also feeds `dateModified` in the JSON-LD, and the SEO smoke
 * test fails when the two disagree — which is what catches a date left behind.
 */
export const SEO_PAGES = [
  { path: "/", lastmod: "2026-09-02", changefreq: "weekly", priority: 1 },
  { path: "/calculadoras", lastmod: "2026-09-02", changefreq: "monthly", priority: 0.8 },
  {
    path: "/calculadora-custo-carro",
    lastmod: "2026-09-12",
    changefreq: "monthly",
    priority: 0.9,
  },
  {
    path: "/calculadora-morar-sozinho",
    lastmod: "2026-09-12",
    changefreq: "monthly",
    priority: 0.9,
  },
  {
    path: "/calculadora-conta-de-luz",
    lastmod: "2026-09-12",
    changefreq: "monthly",
    priority: 0.9,
  },
  { path: "/calculadora-assinaturas", lastmod: "2026-09-12", changefreq: "monthly", priority: 0.9 },
  {
    path: "/calculadora-custo-mudanca",
    lastmod: "2026-09-12",
    changefreq: "monthly",
    priority: 0.9,
  },
  { path: "/calculadora-custo-pet", lastmod: "2026-09-12", changefreq: "monthly", priority: 0.9 },
  { path: "/calculadora-irpf-2026", lastmod: "2026-09-12", changefreq: "monthly", priority: 0.95 },
  {
    path: "/calculadora-salario-liquido",
    lastmod: "2026-09-12",
    changefreq: "monthly",
    priority: 0.95,
  },
  {
    path: "/calculadora-inss-autonomo",
    lastmod: "2026-09-12",
    changefreq: "monthly",
    priority: 0.9,
  },
  { path: "/calculadora-clt-vs-pj", lastmod: "2026-09-12", changefreq: "monthly", priority: 0.9 },
  {
    path: "/calculadora-previdencia-complementar",
    lastmod: "2026-09-12",
    changefreq: "monthly",
    priority: 0.85,
  },
  {
    path: "/calculadora-beneficios-fiscais",
    lastmod: "2026-09-12",
    changefreq: "monthly",
    priority: 0.8,
  },
  { path: "/blog", lastmod: "2026-09-12", changefreq: "weekly", priority: 0.85 },
  {
    path: "/blog/quanto-custa-ter-carro",
    lastmod: "2026-09-12",
    changefreq: "monthly",
    priority: 0.8,
  },
  {
    path: "/blog/quanto-custa-morar-sozinho",
    lastmod: "2026-09-12",
    changefreq: "monthly",
    priority: 0.8,
  },
  {
    path: "/blog/como-economizar-conta-de-luz",
    lastmod: "2026-09-12",
    changefreq: "monthly",
    priority: 0.8,
  },
  { path: "/blog/custo-pet-anual", lastmod: "2026-09-12", changefreq: "monthly", priority: 0.8 },
  {
    path: "/blog/assinaturas-que-valem-a-pena",
    lastmod: "2026-09-12",
    changefreq: "monthly",
    priority: 0.8,
  },
  {
    path: "/blog/calculadora-irpf-2026",
    lastmod: "2026-09-12",
    changefreq: "monthly",
    priority: 0.85,
  },
  { path: "/blog/guia-irpf-2026", lastmod: "2026-09-12", changefreq: "monthly", priority: 0.9 },
  {
    path: "/blog/salario-liquido-entenda",
    lastmod: "2026-09-12",
    changefreq: "monthly",
    priority: 0.85,
  },
  {
    path: "/blog/quanto-custa-ser-autonomo",
    lastmod: "2026-09-12",
    changefreq: "monthly",
    priority: 0.85,
  },
  {
    path: "/blog/deducoes-irpf-esqueca",
    lastmod: "2026-09-12",
    changefreq: "monthly",
    priority: 0.8,
  },
  {
    path: "/blog/dependentes-irpf-economia",
    lastmod: "2026-09-12",
    changefreq: "monthly",
    priority: 0.8,
  },
  {
    path: "/blog/recibo-rpa-autonomo",
    lastmod: "2026-09-12",
    changefreq: "monthly",
    priority: 0.8,
  },
  {
    path: "/blog/negociar-salario-melhor",
    lastmod: "2026-09-12",
    changefreq: "monthly",
    priority: 0.8,
  },
  {
    path: "/blog/planejamento-tributario",
    lastmod: "2026-09-12",
    changefreq: "monthly",
    priority: 0.8,
  },
  {
    path: "/blog/clt-vs-pj-comparacao",
    lastmod: "2026-09-12",
    changefreq: "monthly",
    priority: 0.85,
  },
  {
    path: "/blog/salario-por-setor-2026",
    lastmod: "2026-09-12",
    changefreq: "monthly",
    priority: 0.75,
  },
  { path: "/blog/mei-vs-pj-custo", lastmod: "2026-09-12", changefreq: "monthly", priority: 0.75 },
  {
    path: "/blog/investimentos-isentos-irpf",
    lastmod: "2026-09-12",
    changefreq: "monthly",
    priority: 0.75,
  },
  { path: "/blog/quando-virar-pj", lastmod: "2026-09-12", changefreq: "monthly", priority: 0.75 },
  {
    path: "/blog/aposentadoria-early-retirement",
    lastmod: "2026-09-12",
    changefreq: "monthly",
    priority: 0.75,
  },
  {
    path: "/blog/despesas-dedutiveis-autonomo",
    lastmod: "2026-09-12",
    changefreq: "monthly",
    priority: 0.75,
  },
  {
    path: "/blog/contador-necessario-pj",
    lastmod: "2026-09-12",
    changefreq: "monthly",
    priority: 0.75,
  },
  {
    path: "/blog/tabela-irpf-2026-completa",
    lastmod: "2026-09-12",
    changefreq: "monthly",
    priority: 0.75,
  },
  {
    path: "/blog/formal-vs-informal",
    lastmod: "2026-09-12",
    changefreq: "monthly",
    priority: 0.75,
  },
  {
    path: "/blog/como-calcular-salario-pj",
    lastmod: "2026-09-12",
    changefreq: "monthly",
    priority: 0.75,
  },
  {
    path: "/blog/simplificado-vs-completo",
    lastmod: "2026-09-12",
    changefreq: "monthly",
    priority: 0.8,
  },
  { path: "/comparar", lastmod: "2026-09-02", changefreq: "monthly", priority: 0.75 },
  { path: "/comparar/streaming", lastmod: "2026-08-06", changefreq: "monthly", priority: 0.7 },
  { path: "/comparar/academia", lastmod: "2026-08-06", changefreq: "monthly", priority: 0.7 },
  { path: "/comparar/mudanca", lastmod: "2026-08-06", changefreq: "monthly", priority: 0.7 },
  { path: "/comparar/energia", lastmod: "2026-08-06", changefreq: "monthly", priority: 0.7 },
  { path: "/sobre", lastmod: "2026-09-02", changefreq: "yearly", priority: 0.5 },
  { path: "/metodologia", lastmod: "2026-09-02", changefreq: "monthly", priority: 0.7 },
  { path: "/privacidade", lastmod: "2026-08-06", changefreq: "yearly", priority: 0.3 },
  { path: "/termos", lastmod: "2026-06-26", changefreq: "yearly", priority: 0.3 },
  { path: "/contato", lastmod: "2026-09-02", changefreq: "yearly", priority: 0.4 },
] as const;

export type SeoPath = (typeof SEO_PAGES)[number]["path"];

const LASTMOD_BY_PATH = new Map<string, string>(SEO_PAGES.map((page) => [page.path, page.lastmod]));

/** The date the page at `path` last changed, for `dateModified` in JSON-LD. */
export function lastmodFor(path: string): string {
  return LASTMOD_BY_PATH.get(path) ?? SITE_REVIEW_DATE;
}
