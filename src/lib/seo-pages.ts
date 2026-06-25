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
  { path: "/blog/quanto-custa-ter-carro", changefreq: "monthly", priority: 0.8 },
  { path: "/blog/quanto-custa-morar-sozinho", changefreq: "monthly", priority: 0.8 },
  { path: "/blog/como-economizar-conta-de-luz", changefreq: "monthly", priority: 0.8 },
  { path: "/blog/custo-pet-anual", changefreq: "monthly", priority: 0.8 },
  { path: "/blog/assinaturas-que-valem-a-pena", changefreq: "monthly", priority: 0.8 },
  { path: "/sobre", changefreq: "yearly", priority: 0.5 },
  { path: "/metodologia", changefreq: "monthly", priority: 0.7 },
  { path: "/privacidade", changefreq: "yearly", priority: 0.3 },
  { path: "/termos", changefreq: "yearly", priority: 0.3 },
  { path: "/contato", changefreq: "yearly", priority: 0.4 },
] as const;

export type SeoPath = (typeof SEO_PAGES)[number]["path"];
