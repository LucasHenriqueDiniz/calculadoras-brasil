/**
 * Simples Nacional rules for a service company: the two annexes a one-person
 * service PJ falls into, and the effective rate the DAS is charged at.
 *
 * Every figure is transcribed from LC 123/2006 as Planalto prints it in force
 * (Anexos III and V in the wording of LC 155/2016, vigência 01/01/2018):
 * docs/research/2026-10-18-pj-simples-nacional/fetches/planalto-lc-123-2006-art-18-anexos.md.
 *
 * ⚠️ Both annexes carry "Vide Lei Complementar nº 214, de 2025" — the tax reform.
 * Its effect on the DAS in 2026 was not researched; these are the tables
 * Planalto prints as current.
 */

export type SimplesAnnex = "III" | "V";

export interface SimplesBand {
  /** Upper bound of the band, in revenue over the previous twelve months (RBT12). */
  upTo: number;
  /** Alíquota nominal. */
  rate: number;
  /** Parcela a deduzir, in reais. */
  deduction: number;
}

/** Anexo III: services not listed in § 5º-C, and § 5º-I services at a Fator R of 28% or more. */
export const SIMPLES_ANNEX_III: readonly SimplesBand[] = [
  { upTo: 180_000, rate: 0.06, deduction: 0 },
  { upTo: 360_000, rate: 0.112, deduction: 9_360 },
  { upTo: 720_000, rate: 0.135, deduction: 17_640 },
  { upTo: 1_800_000, rate: 0.16, deduction: 35_640 },
  { upTo: 3_600_000, rate: 0.21, deduction: 125_640 },
  { upTo: 4_800_000, rate: 0.33, deduction: 648_000 },
];

/** Anexo V: § 5º-I services, and § 5º-D ones (software, websites) below a Fator R of 28%. */
export const SIMPLES_ANNEX_V: readonly SimplesBand[] = [
  { upTo: 180_000, rate: 0.155, deduction: 0 },
  { upTo: 360_000, rate: 0.18, deduction: 4_500 },
  { upTo: 720_000, rate: 0.195, deduction: 9_900 },
  { upTo: 1_800_000, rate: 0.205, deduction: 17_100 },
  { upTo: 3_600_000, rate: 0.23, deduction: 62_100 },
  { upTo: 4_800_000, rate: 0.305, deduction: 540_000 },
];

/** Payroll as a percentage of revenue at which §§ 5º-J and 5º-M put a service company in Anexo III. */
export const FATOR_R_PERCENT = 28;

/** RBT12 above which a company leaves the Simples Nacional: the top of the sixth band. */
export const SIMPLES_ANNUAL_REVENUE_CEILING = 4_800_000;

/**
 * RBT12 above which the effective rate of both annexes FALLS by 2,5 points, at
 * the start of the sixth band — measured, see tests/calculators/simples-nacional.test.ts.
 * The sixth band's share-out leaves the municipal ISS out of the DAS, to be paid
 * apart; that reading of the sublimit is not researched here, so the model
 * stops at this revenue rather than under-charge past it.
 */
export const SIMPLES_MODEL_REVENUE_LIMIT = 3_600_000;

const ANNEXES: Record<SimplesAnnex, readonly SimplesBand[]> = {
  III: SIMPLES_ANNEX_III,
  V: SIMPLES_ANNEX_V,
};

/**
 * The annex a service company is taxed in, given its payroll and revenue.
 *
 * Compared in whole centavos, because "igual ou superior a 28%" is an exact
 * threshold: in floating point, 28% of R$ 7.334,00 divided back by R$ 7.334,00
 * lands a hair under 0,28, and a company meeting the Fator R to the centavo was
 * taxed in Anexo V for it — R$ 648 a month less in hand.
 */
export function annexFor(payroll: number, revenue: number): SimplesAnnex {
  const payrollCents = Math.round(payroll * 100);
  const revenueCents = Math.round(revenue * 100);
  return payrollCents * 100 >= FATOR_R_PERCENT * revenueCents ? "III" : "V";
}

/** The smallest pró-labore that meets the Fator R on `revenue`: 28%, rounded up to the centavo. */
export function fatorRProLabore(revenue: number): number {
  return Math.ceil((Math.round(revenue * 100) * FATOR_R_PERCENT) / 100) / 100;
}

/**
 * LC 123/2006, art. 18, § 1º-A: `(RBT12 × Aliq − PD) / RBT12`, with the nominal
 * rate and the parcela a deduzir of the band RBT12 falls in.
 *
 * The parcela exists to make this continuous, so the effective rate has no jump
 * at any band boundary. Revenue past the Simples ceiling is priced on the sixth
 * band, which is the most the formula can say; callers flag it as outside the
 * regime rather than trusting the figure.
 */
export function simplesEffectiveRate(annex: SimplesAnnex, rbt12: number): number {
  if (rbt12 <= 0) return 0;

  const bands = ANNEXES[annex];
  const band = bands.find(({ upTo }) => rbt12 <= upTo) ?? bands[bands.length - 1];

  return (rbt12 * band.rate - band.deduction) / rbt12;
}
