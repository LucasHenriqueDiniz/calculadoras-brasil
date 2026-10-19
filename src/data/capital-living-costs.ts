/**
 * What a home and food cost in each capital that both sources cover, for the
 * table on /calculadora-morar-sozinho. Transcribed by hand from two reports, so
 * a refresh means reading both again and moving the page's lastmod:
 *
 * - rent: Índice FipeZAP de Locação Residencial, informe de setembro de 2026,
 *   each capital's "Preço médio (setembro/2026)" in R$/m², asking prices of new
 *   rentals of apartments of every size
 *   (docs/research/2026-10-18-adsense-added-value/fetches/fipezap-locacao-2026-09.md);
 * - food: DIEESE/Conab, Pesquisa Nacional da Cesta Básica de Alimentos, Tabela 1
 *   of setembro de 2026, the monthly ration Decreto-Lei 399/1938 sets for one
 *   adult worker (fetches/dieese-cesta-basica-2026-09.md).
 *
 * FipeZAP covers 22 capitals; Boa Vista, Macapá, Palmas, Porto Velho and Rio
 * Branco have a cesta but no rent figure, and are left out.
 */
export const CAPITAL_LIVING_COSTS = {
  rentSource: "Índice FipeZAP de Locação Residencial, setembro de 2026",
  rentSourceUrl:
    "https://downloads.fipe.org.br/indices/fipezap/fipezap-202609-residencial-locacao.pdf",
  basketSource: "DIEESE/Conab, cesta básica de setembro de 2026",
  basketSourceUrl: "https://www.dieese.org.br/analisecestabasica/2026/202609cestabasica.html",
  capitals: [
    { city: "Aracaju", uf: "SE", rentPerSquareMetre: 36.04, basicBasket: 587.76 },
    { city: "Belo Horizonte", uf: "MG", rentPerSquareMetre: 50.78, basicBasket: 802.99 },
    { city: "Belém", uf: "PA", rentPerSquareMetre: 62.25, basicBasket: 731.62 },
    { city: "Brasília", uf: "DF", rentPerSquareMetre: 53.84, basicBasket: 773.78 },
    { city: "Campo Grande", uf: "MS", rentPerSquareMetre: 32.95, basicBasket: 806.56 },
    { city: "Cuiabá", uf: "MT", rentPerSquareMetre: 48.9, basicBasket: 891.24 },
    { city: "Curitiba", uf: "PR", rentPerSquareMetre: 49.44, basicBasket: 841.93 },
    { city: "Florianópolis", uf: "SC", rentPerSquareMetre: 61.81, basicBasket: 915.62 },
    { city: "Fortaleza", uf: "CE", rentPerSquareMetre: 42.22, basicBasket: 779.96 },
    { city: "Goiânia", uf: "GO", rentPerSquareMetre: 43.86, basicBasket: 808.01 },
    { city: "João Pessoa", uf: "PB", rentPerSquareMetre: 51.86, basicBasket: 660.21 },
    { city: "Maceió", uf: "AL", rentPerSquareMetre: 56.63, basicBasket: 631.28 },
    { city: "Manaus", uf: "AM", rentPerSquareMetre: 53.05, basicBasket: 676.18 },
    { city: "Natal", uf: "RN", rentPerSquareMetre: 45.71, basicBasket: 635.6 },
    { city: "Porto Alegre", uf: "RS", rentPerSquareMetre: 46.78, basicBasket: 889.15 },
    { city: "Recife", uf: "PE", rentPerSquareMetre: 64.39, basicBasket: 663.48 },
    { city: "Rio de Janeiro", uf: "RJ", rentPerSquareMetre: 61.86, basicBasket: 913.46 },
    { city: "Salvador", uf: "BA", rentPerSquareMetre: 55.4, basicBasket: 634.67 },
    { city: "São Luís", uf: "MA", rentPerSquareMetre: 57.99, basicBasket: 692.94 },
    { city: "São Paulo", uf: "SP", rentPerSquareMetre: 65.78, basicBasket: 922.51 },
    { city: "Teresina", uf: "PI", rentPerSquareMetre: 32.59, basicBasket: 698.55 },
    { city: "Vitória", uf: "ES", rentPerSquareMetre: 57.06, basicBasket: 829.14 },
  ],
} as const;
