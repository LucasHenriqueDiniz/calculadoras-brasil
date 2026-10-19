/**
 * Streaming plans sold both monthly and yearly, as each service's own Brazilian
 * page priced them on 2026-10-18, for the table on /calculadora-assinaturas.
 * Transcribed by hand
 * (docs/research/2026-10-18-adsense-added-value/fetches/streaming-annual-plans-2026-10-18.md);
 * prices change, so a refresh means reading the three pages again and moving
 * the page's lastmod.
 *
 * `plan` is empty for a service with a single plan. `annual` is the year's total: Disney+ shows 12 × R$ 48,99 and 12 × R$ 33,99,
 * with "pagamento antecipado obrigatório"; Amazon and HBO Max print the total.
 */
export const STREAMING_ANNUAL_PLANS = {
  checkedAt: "2026-10-18",
  plans: [
    {
      service: "Amazon Prime",
      plan: "",
      monthly: 19.9,
      annual: 166.8,
      sourceUrl: "https://www.amazon.com.br/prime",
    },
    {
      service: "Disney+",
      plan: "Padrão",
      monthly: 49.9,
      annual: 407.88,
      sourceUrl: "https://www.disneyplus.com/pt-br",
    },
    {
      service: "Disney+",
      plan: "Premium",
      monthly: 69.9,
      annual: 587.88,
      sourceUrl: "https://www.disneyplus.com/pt-br",
    },
    {
      service: "HBO Max",
      plan: "Básico com anúncios",
      monthly: 29.9,
      annual: 274.8,
      sourceUrl: "https://www.hbomax.com/br/pt",
    },
    {
      service: "HBO Max",
      plan: "Standard",
      monthly: 44.9,
      annual: 418.8,
      sourceUrl: "https://www.hbomax.com/br/pt",
    },
    {
      service: "HBO Max",
      plan: "Platinum",
      monthly: 55.9,
      annual: 538.8,
      sourceUrl: "https://www.hbomax.com/br/pt",
    },
  ],
} as const;
