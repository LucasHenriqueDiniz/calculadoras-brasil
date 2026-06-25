export const SITE_REVIEW_DATE = "2026-06-23";
export const SITE_REVIEW_DATE_LABEL = "23 de junho de 2026";
export const EDITORIAL_RESPONSIBLE = "Calcule Brasil";

export const SEO_PAGES = [
  { path: "/", changefreq: "weekly", priority: 1 },
  { path: "/calculadora-custo-carro", changefreq: "monthly", priority: 0.9 },
  { path: "/calculadora-morar-sozinho", changefreq: "monthly", priority: 0.9 },
  { path: "/calculadora-conta-de-luz", changefreq: "monthly", priority: 0.9 },
  { path: "/calculadora-assinaturas", changefreq: "monthly", priority: 0.9 },
  { path: "/calculadora-custo-mudanca", changefreq: "monthly", priority: 0.9 },
  { path: "/calculadora-custo-pet", changefreq: "monthly", priority: 0.9 },
  { path: "/calculadora-irpf-2026", changefreq: "monthly", priority: 0.95 },
  { path: "/calculadora-salario-liquido", changefreq: "monthly", priority: 0.95 },
  { path: "/calculadora-inss-autonomo", changefreq: "monthly", priority: 0.9 },
  { path: "/calculadora-clt-vs-pj", changefreq: "monthly", priority: 0.9 },
  { path: "/calculadora-previdencia-complementar", changefreq: "monthly", priority: 0.85 },
  { path: "/calculadora-beneficios-fiscais", changefreq: "monthly", priority: 0.8 },
  { path: "/blog/quanto-custa-ter-carro", changefreq: "monthly", priority: 0.8 },
  { path: "/blog/quanto-custa-morar-sozinho", changefreq: "monthly", priority: 0.8 },
  { path: "/blog/como-economizar-conta-de-luz", changefreq: "monthly", priority: 0.8 },
  { path: "/blog/custo-pet-anual", changefreq: "monthly", priority: 0.8 },
  { path: "/blog/assinaturas-que-valem-a-pena", changefreq: "monthly", priority: 0.8 },
  { path: "/blog/calculadora-irpf-2026", changefreq: "monthly", priority: 0.85 },
  { path: "/blog/guia-irpf-2026", changefreq: "monthly", priority: 0.9 },
  { path: "/blog/salario-liquido-entenda", changefreq: "monthly", priority: 0.85 },
  { path: "/blog/quanto-custa-ser-autonomo", changefreq: "monthly", priority: 0.85 },
  { path: "/blog/planejamento-tributario", changefreq: "monthly", priority: 0.8 },
  { path: "/blog/clt-vs-pj-comparacao", changefreq: "monthly", priority: 0.85 },
  { path: "/comparar", changefreq: "monthly", priority: 0.75 },
  { path: "/comparar/streaming", changefreq: "monthly", priority: 0.7 },
  { path: "/comparar/academia", changefreq: "monthly", priority: 0.7 },
  { path: "/comparar/mudanca", changefreq: "monthly", priority: 0.7 },
  { path: "/comparar/energia", changefreq: "monthly", priority: 0.7 },
  { path: "/sobre", changefreq: "yearly", priority: 0.5 },
  { path: "/metodologia", changefreq: "monthly", priority: 0.7 },
  { path: "/privacidade", changefreq: "yearly", priority: 0.3 },
  { path: "/termos", changefreq: "yearly", priority: 0.3 },
  { path: "/contato", changefreq: "yearly", priority: 0.4 },
] as const;

export type SeoPath = (typeof SEO_PAGES)[number]["path"];
