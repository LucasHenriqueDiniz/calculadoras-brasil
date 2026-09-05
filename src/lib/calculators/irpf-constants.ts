/**
 * IRPF reference parameters used by the calculators.
 *
 * IMPORTANT: these are reference values and must be reviewed every time Receita
 * Federal publishes a new incidence table or the legislature changes the
 * reduction. The site's calculators show educational estimates — the official
 * amount is always the one assessed by Receita Federal.
 *
 * Figures, sources and the arithmetic that cross-checks them:
 * docs/research/2026-09-04-irpf-2026-table/research.md
 *
 * ⚠️ The monthly figures are NOT the annual ones divided by twelve, and the
 * monthly reduction is not the annual one divided by twelve either. Receita
 * Federal publishes the two tables separately and Lei 15.270/2025 states the two
 * reductions separately; the parcels alone give it away (R$ 908,73 is not
 * R$ 10.904,66 / 12). Every symbol below therefore says which axis it belongs
 * to, and nothing here converts between them. Three calculators each held their
 * own copy of these rules and each was wrong in a different way — the
 * duplication was the defect, the wrong figures were its symptom.
 */

/** One row of an incidence table: its upper bound, its rate, its parcela a deduzir. */
export interface IrpfBracket {
  readonly upTo: number;
  readonly rate: number;
  readonly deduction: number;
}

/**
 * Official monthly incidence table from January 2026, Receita Federal.
 *
 * Each bracket carries only its upper bound. The shape that paired a `max` with
 * the next bracket's `min` needed two numbers to agree, and they did not — every
 * base in between matched no bracket at all and fell through to a fallback.
 */
export const IRPF_MONTHLY_TABLE_2026: readonly IrpfBracket[] = [
  { upTo: 2428.8, rate: 0.0, deduction: 0 },
  { upTo: 2826.65, rate: 0.075, deduction: 182.16 },
  { upTo: 3751.05, rate: 0.15, deduction: 394.16 },
  { upTo: 4664.68, rate: 0.225, deduction: 675.49 },
  { upTo: Infinity, rate: 0.275, deduction: 908.73 },
];

/**
 * Official annual incidence table for ano-calendário 2026 (exercício 2027),
 * Receita Federal. Same row shape and same reason for it as the monthly table.
 */
export const IRPF_ANNUAL_TABLE_2026: readonly IrpfBracket[] = [
  { upTo: 29145.6, rate: 0.0, deduction: 0 },
  { upTo: 33919.8, rate: 0.075, deduction: 2185.92 },
  { upTo: 45012.6, rate: 0.15, deduction: 4729.91 },
  { upTo: 55976.16, rate: 0.225, deduction: 8105.85 },
  { upTo: Infinity, rate: 0.275, deduction: 10904.66 },
];

/** Dependant allowance per month, from the monthly table page. */
export const DEDUCTION_PER_DEPENDENT_MONTHLY = 189.59;

/** Dependant allowance per year, from the annual table page. */
export const DEDUCTION_PER_DEPENDENT_ANNUAL = 2275.08;

/** Annual ceiling on despesas com instrução. The legislation states no monthly one. */
export const MAX_DEDUCTION_EDUCATION_ANNUAL = 3561.5;

/** Desconto simplificado, annual: 20% of gross income, from the annual table page. */
export const SIMPLIFIED_DEDUCTION_RATE_ANNUAL = 0.2;

/** Annual ceiling on that discount. */
export const MAX_SIMPLIFIED_DEDUCTION_ANNUAL = 17640.0;

/**
 * Desconto simplificado, monthly. Only half of this pair is sourced, so the two
 * halves are labelled rather than presented as one figure from the research note.
 *
 * INFERRED — this rate. No monthly source read for that research gives any
 * percentage at all; 20% is the ANNUAL rate, carried across on the assumption
 * that the monthly discount is the same proportion under a lower ceiling. It is
 * a separate constant from the annual rate for exactly that reason: the day
 * Receita Federal publishes a monthly percentage, only one of the two moves.
 *
 * The inference is free today, and provably rather than by luck: 607,20 / 0,20
 * is R$ 3.036,00, and 80% of R$ 3.036,00 is R$ 2.428,80 — the exempt ceiling
 * itself. So below R$ 3.036 of gross both readings (a rate under a cap, or a
 * flat R$ 607,20) leave the base inside the exemption, and above it both
 * subtract the same R$ 607,20. They can never produce a different withholding.
 * They do differ in `baseImponivelMensal` below R$ 3.036 — at a gross of
 * R$ 1.000 this reading gives R$ 800,00 and the flat one R$ 392,80 — but no
 * route renders that field. The equivalence is pinned by the net-salary
 * calculator's own suite, in the case named "withholds what a flat R$ 607,20
 * reading of the ceiling would", so an edit that moves the rate or the ceiling
 * apart fails there instead of shipping.
 */
export const SIMPLIFIED_DEDUCTION_RATE_MONTHLY = 0.2;

/**
 * SOURCED — the monthly ceiling on that discount. Receita Federal's own monthly
 * table states "Limite do desconto simplificado: R$ 607,20" and nothing more
 * (fetches/receita-federal-tabelas-2026.md). Note it is NOT the annual ceiling
 * divided by twelve (17.640,00 / 12 = 1.470,00).
 */
export const MAX_SIMPLIFIED_DEDUCTION_MONTHLY = 607.2;

// Lei 15.270/2025, monthly reduction (Art. 3º-A). Applied to the tax the table
// produces rather than changing the brackets, which is why no table expresses it.
const MONTHLY_REDUCTION_FULL_UP_TO = 5000.0;
const MONTHLY_REDUCTION_FULL_AMOUNT = 312.89;
const MONTHLY_REDUCTION_PHASE_OUT_UP_TO = 7350.0;
const MONTHLY_REDUCTION_PHASE_OUT_BASE = 978.62;
const MONTHLY_REDUCTION_PHASE_OUT_RATE = 0.133145;

// Lei 15.270/2025, annual reduction (Art. 11-A). A different statute band with
// different constants, not the monthly one multiplied by twelve.
const ANNUAL_REDUCTION_FULL_UP_TO = 60000.0;
const ANNUAL_REDUCTION_FULL_AMOUNT = 2694.15;
const ANNUAL_REDUCTION_PHASE_OUT_UP_TO = 88200.0;
const ANNUAL_REDUCTION_PHASE_OUT_BASE = 8429.73;
const ANNUAL_REDUCTION_PHASE_OUT_RATE = 0.095575;

/**
 * Finds the rate bracket that applies to a monthly assessable base.
 * Total by construction: the last bracket has no upper bound, so every
 * non-negative base matches exactly one.
 */
export function findMonthlyTaxBracket(monthlyBase: number): IrpfBracket {
  return findBracket(IRPF_MONTHLY_TABLE_2026, monthlyBase);
}

/**
 * Finds the rate bracket that applies to an annual assessable base.
 * Total by construction, the same way the monthly lookup is.
 */
export function findAnnualTaxBracket(annualBase: number): IrpfBracket {
  return findBracket(IRPF_ANNUAL_TABLE_2026, annualBase);
}

/**
 * Monthly reduction of Lei 15.270/2025.
 *
 * ⚠️ The coefficient applies to gross monthly income, not to the calculation
 * base — Receita Federal's own worked example is explicit about it, and applying
 * it to the base instead is silent and wrong.
 *
 * Capped at the tax the table produced, so it can zero the withholding but never
 * turn it into a refund.
 */
export function monthlyReductionLei15270(grossMonthlyIncome: number, taxFromTable: number): number {
  if (grossMonthlyIncome <= MONTHLY_REDUCTION_FULL_UP_TO) {
    return Math.min(MONTHLY_REDUCTION_FULL_AMOUNT, taxFromTable);
  }

  if (grossMonthlyIncome <= MONTHLY_REDUCTION_PHASE_OUT_UP_TO) {
    const reduction =
      MONTHLY_REDUCTION_PHASE_OUT_BASE - MONTHLY_REDUCTION_PHASE_OUT_RATE * grossMonthlyIncome;
    return Math.min(Math.max(reduction, 0), taxFromTable);
  }

  return 0;
}

/**
 * Annual reduction of Lei 15.270/2025.
 *
 * ⚠️ The coefficient applies to gross taxable income, not to the calculation
 * base — the same trap the monthly reduction sets.
 *
 * The first band is written "até R$ 2.694,15 (de modo que o imposto devido seja
 * zero)". R$ 2.694,15 is exactly the tax due at R$ 60.000 under the simplified
 * discount, so it zeroes that case by construction. It is a cap, not a promise:
 * an itemised return at the same income can still owe the difference.
 */
export function annualReductionLei15270(grossAnnualIncome: number, taxFromTable: number): number {
  if (grossAnnualIncome <= ANNUAL_REDUCTION_FULL_UP_TO) {
    return Math.min(ANNUAL_REDUCTION_FULL_AMOUNT, taxFromTable);
  }

  if (grossAnnualIncome <= ANNUAL_REDUCTION_PHASE_OUT_UP_TO) {
    const reduction =
      ANNUAL_REDUCTION_PHASE_OUT_BASE - ANNUAL_REDUCTION_PHASE_OUT_RATE * grossAnnualIncome;
    return Math.min(Math.max(reduction, 0), taxFromTable);
  }

  return 0;
}

/**
 * The lookup itself, written once and reached only through the two bound
 * wrappers above. Taking the table as a parameter here keeps one body; keeping
 * that parameter off the exported surface keeps a caller from pairing a monthly
 * base with the annual table, which is the mistake this module exists to prevent.
 */
function findBracket(table: readonly IrpfBracket[], base: number): IrpfBracket {
  if (base <= 0) {
    return { upTo: Infinity, rate: 0, deduction: 0 };
  }

  for (const bracket of table) {
    if (base <= bracket.upTo) {
      return bracket;
    }
  }

  // Unreachable while the last bracket's upTo is Infinity. Throwing rather than
  // returning a rate keeps a future edit to that row from silently charging 0%.
  throw new Error("IRPF bracket table does not cover the assessable base");
}
