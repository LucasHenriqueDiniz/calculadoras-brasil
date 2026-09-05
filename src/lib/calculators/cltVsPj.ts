/**
 * CLT versus PJ comparison.
 *
 * Weighs a CLT salary — net pay plus the amortised value of the rights a
 * contract carries — against a PJ invoice, net of contributions, income tax and
 * the accountant.
 *
 * This module answers a MONTHLY question, exactly like the net-salary
 * calculator: what lands in the bank account each month under either
 * arrangement. That decides which half of the 2026 legislation applies — the
 * monthly incidence table and the monthly Lei 15.270/2025 reduction, neither of
 * which is its annual counterpart divided by twelve.
 *
 * The rules themselves live in `irpf-constants.ts`, alongside their sources —
 * the same module the net-salary calculator reads. Two calculators on this site
 * answer the same monthly CLT question, so they must agree to the centavo, and
 * sharing one definition is what makes that true by construction rather than by
 * review.
 */

import { calculateEmployeeInss } from "./inss-constants";
import {
  DEDUCTION_PER_DEPENDENT_MONTHLY,
  findMonthlyTaxBracket,
  monthlyReductionLei15270,
} from "./irpf-constants";
import { roundToCentavos } from "./money";

export interface CltVsPjInput {
  cltGrossSalary: number;
  monthlyPjOffer: number;
  /**
   * Dependants claimed against the CLT withholding base. They lower the CLT tax
   * and never touch the PJ side, where the invoice is sheltered by
   * `pjDeductibleExpenses` instead.
   */
  dependants: number;
  pjDeductibleExpenses: number;
}

/** How a monthly income tax was arrived at, in the order it is computed. */
export interface MonthlyIrpfDetail {
  /** The monthly base actually taken to the table. */
  assessableBase: number;
  /** What the monthly table produces, before the Lei 15.270/2025 reduction. */
  taxFromTable: number;
  /** The monthly reduction applied, never more than the tax due. */
  reductionLei15270: number;
  irpfWithheld: number;
}

/** The same, plus the contribution that shaped the base. */
export type CltVsPjTaxDetail = MonthlyIrpfDetail & { inssWithheld: number };

export interface CltVsPjResult {
  cltGrossSalary: number;
  monthlyPjOffer: number;
  cltNet: number;
  cltWithBenefits: number;
  pjNet: number;
  difference: number;
  differencePercent: number;
  breakEvenPjOffer: number;
  /** The CLT withholdings, plus the amortised benefits added on top of the net. */
  cltDetail: CltVsPjTaxDetail & { benefits: number };
  /** The PJ withholdings, plus the accountant fee, which is a cost and not a tax. */
  pjDetail: CltVsPjTaxDetail & { accountantFee: number };
  analysis: {
    cltIsBetter: boolean;
    /** The two packages are level to within a centavo. `cltIsBetter` alone cannot say so. */
    isTie: boolean;
    /** False when there is no CLT package to take a percentage of. */
    hasBaseForPercentage: boolean;
    monthlyDifference: number;
    annualDifference: number;
    /**
     * The verdict in Portuguese. Product copy: every string this field can hold
     * is written for the visitor and stays in Brazilian Portuguese.
     */
    rationale: string;
  };
}

/**
 * The rights a CLT contract carries, amortised over the year: 13th salary
 * (1/12), plus FGTS, holiday pay with its third and the usual allowances.
 *
 * ⚠️ A modelling assumption, not a figure from the legislation — and the one the
 * page's whole thesis rests on ("é comum ser preciso faturar entre 25% e 40% a
 * mais como PJ"). Moving it moves every verdict this calculator gives.
 */
const CLT_BENEFITS_RATE = 1 / 12 + 0.15;

/**
 * Pró-labore contribution, as a share of the invoice.
 *
 * ⚠️ Flat and uncapped on purpose-for-now: the RGPS ceiling is NOT applied here,
 * so a large invoice is charged 20% on all of it. Documented rather than fixed,
 * because unlike the income tax above no source in the research note covers it.
 */
const INSS_RATE_PJ = 0.2;

/** Accounting fee, as a share of the invoice. A cost, not a tax. */
const ACCOUNTANT_FEE_RATE = 0.05;

/** A difference this small is a tie: both sides are rounded to the centavo. */
const TIE_TOLERANCE = 0.01;

export function calculateCltVsPj(input: CltVsPjInput): CltVsPjResult {
  const cltGrossSalary = Math.max(input.cltGrossSalary, 0);
  const monthlyPjOffer = Math.max(input.monthlyPjOffer, 0);
  const pjDeductibleExpenses = Math.max(input.pjDeductibleExpenses, 0);

  // ---- CLT side ----------------------------------------------------------
  // INSS is progressive and capped at the RGPS ceiling, the same contribution
  // the net-salary calculator withholds for this salary. A flat percentage
  // would put the two calculators on different answers for the same input.
  const cltInssWithheld = calculateEmployeeInss(cltGrossSalary);
  const dependantAllowance = Math.max(input.dependants, 0) * DEDUCTION_PER_DEPENDENT_MONTHLY;
  const cltTax = computeMonthlyIrpf(
    cltGrossSalary,
    cltGrossSalary - cltInssWithheld - dependantAllowance,
  );

  const cltNet = roundToCentavos(cltGrossSalary - cltInssWithheld - cltTax.irpfWithheld);
  const cltBenefits = cltGrossSalary * CLT_BENEFITS_RATE;
  const cltWithBenefits = roundToCentavos(cltNet + cltBenefits);

  // ---- PJ side -----------------------------------------------------------
  const pj = computePjSide(monthlyPjOffer, pjDeductibleExpenses);

  // ---- The comparison ----------------------------------------------------
  // What a PJ must invoice to match the CLT package is a property of that
  // package and of the deductible expenses. It is solved for, not stepped
  // towards from the offer on the table, so two candidates weighing different
  // offers against the same salary are told the same figure.
  const breakEvenPjOffer = solveBreakEvenPjOffer(cltWithBenefits, pjDeductibleExpenses);

  const difference = roundToCentavos(pj.net - cltWithBenefits);
  const cltIsBetter = cltWithBenefits > pj.net;
  const isTie = Math.abs(difference) < TIE_TOLERANCE;

  // A percentage of nothing is not a number. Both fields are currency inputs
  // with no floor, so a visitor who clears them reaches this.
  const differencePercent =
    cltWithBenefits > 0 ? roundToCentavos((difference / cltWithBenefits) * 100) : 0;

  return {
    cltGrossSalary,
    monthlyPjOffer,
    cltNet,
    cltWithBenefits,
    pjNet: pj.net,
    difference,
    differencePercent,
    breakEvenPjOffer,
    cltDetail: { ...cltTax, inssWithheld: cltInssWithheld, benefits: cltBenefits },
    pjDetail: { ...pj.tax, inssWithheld: pj.inssWithheld, accountantFee: pj.accountantFee },
    analysis: {
      cltIsBetter,
      isTie,
      hasBaseForPercentage: cltWithBenefits > 0,
      monthlyDifference: Math.abs(difference),
      annualDifference: roundToCentavos(Math.abs(difference) * 12),
      rationale: writeRationale({
        isTie,
        cltIsBetter,
        hasBaseForPercentage: cltWithBenefits > 0,
        differencePercent,
        difference,
        breakEvenPjOffer,
      }),
    },
  };
}

/** The PJ side of the comparison, for whatever invoice is being considered. */
function computePjSide(monthlyPjOffer: number, pjDeductibleExpenses: number) {
  const inssWithheld = monthlyPjOffer * INSS_RATE_PJ;
  const accountantFee = monthlyPjOffer * ACCOUNTANT_FEE_RATE;
  const tax = computeMonthlyIrpf(
    monthlyPjOffer,
    monthlyPjOffer - inssWithheld - pjDeductibleExpenses,
  );

  return {
    inssWithheld,
    accountantFee,
    tax,
    net: roundToCentavos(monthlyPjOffer - inssWithheld - accountantFee - tax.irpfWithheld),
  };
}

/**
 * Monthly income tax on a base: the table, then the Lei 15.270/2025 reduction
 * on top of it.
 *
 * Both are rounded to the centavo, because both are legally denominated in it
 * and the reduction's first band is a centavo literal. Left in binary floating
 * point, the statute's own exempt case misses by 1.1e-13 and a salary the
 * statute declares exempt is withheld a sliver of tax.
 *
 * Reached from the PJ side too: a pró-labore is income taxed by the progressive
 * table, and relieving only one of the two sides would make the verdict an
 * artefact of the relief rather than of the arrangement.
 */
function computeMonthlyIrpf(
  monthlyGrossIncome: number,
  monthlyAssessableBase: number,
): MonthlyIrpfDetail {
  const assessableBase = Math.max(monthlyAssessableBase, 0);
  const { rate, deduction } = findMonthlyTaxBracket(assessableBase);
  const taxFromTable = roundToCentavos(Math.max(assessableBase * rate - deduction, 0));
  const reductionLei15270 = roundToCentavos(
    monthlyReductionLei15270(monthlyGrossIncome, taxFromTable),
  );

  return {
    assessableBase,
    taxFromTable,
    reductionLei15270,
    irpfWithheld: roundToCentavos(Math.max(taxFromTable - reductionLei15270, 0)),
  };
}

/**
 * The smallest invoice whose net matches `target`, to the centavo.
 *
 * Bisection, not a fixed number of R$ 100 steps away from the offer: the net is
 * strictly increasing in the invoice — the worst marginal case keeps about 40
 * centavos of every extra real, once 25% of contributions and fee, 27,5% of tax
 * on 80% of the invoice and the reduction's phase-out are all taken off — so the
 * search always brackets the answer and always converges to it.
 */
function solveBreakEvenPjOffer(target: number, pjDeductibleExpenses: number): number {
  if (target <= 0) {
    return 0;
  }

  let high = Math.max(target, 1);
  while (computePjSide(high, pjDeductibleExpenses).net < target && high < Number.MAX_SAFE_INTEGER) {
    high *= 2;
  }

  let low = 0;
  for (let step = 0; step < 100; step += 1) {
    const middle = (low + high) / 2;
    if (computePjSide(middle, pjDeductibleExpenses).net < target) {
      low = middle;
    } else {
      high = middle;
    }
  }

  return roundToCentavos(high);
}

/**
 * The verdict in Portuguese, which is what the page prints beside the badge.
 *
 * ⚠️ Product copy. The identifiers around these strings are English because the
 * repo is; every string returned here is read by a visitor and stays Brazilian
 * Portuguese, word for word.
 */
function writeRationale(verdict: {
  isTie: boolean;
  cltIsBetter: boolean;
  hasBaseForPercentage: boolean;
  differencePercent: number;
  difference: number;
  breakEvenPjOffer: number;
}): string {
  if (verdict.isTie) {
    return "CLT e PJ empatam: o ganho líquido mensal é o mesmo nos dois regimes.";
  }

  if (verdict.cltIsBetter) {
    return `CLT é ${Math.abs(verdict.differencePercent)}% mais vantajoso. PJ precisa de R$ ${verdict.breakEvenPjOffer.toFixed(0)}/mês para igualar.`;
  }

  if (!verdict.hasBaseForPercentage) {
    return `PJ é mais vantajoso. Ganho adicional: R$ ${verdict.difference.toFixed(2)}/mês.`;
  }

  return `PJ é ${verdict.differencePercent}% mais vantajoso. Ganho adicional: R$ ${verdict.difference.toFixed(2)}/mês.`;
}
