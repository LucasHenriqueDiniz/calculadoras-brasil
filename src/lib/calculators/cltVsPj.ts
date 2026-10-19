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
 * The PJ is a one-person service company in the Simples Nacional (decision D6
 * in docs/architecture/ARCHITECTURE.md): a DAS on the invoice, a pró-labore
 * taxed like a salary, and the rest distributed as profit.
 *
 * The rules themselves live in `irpf-constants.ts`, alongside their sources —
 * the same module the net-salary calculator reads. Two calculators on this site
 * answer the same monthly CLT question, so they must agree to the centavo, and
 * sharing one definition is what makes that true by construction rather than by
 * review.
 */

import { INSS_CEILING, MINIMUM_WAGE } from "./inss-constants";
import { DEDUCTION_PER_DEPENDENT_MONTHLY } from "./irpf-constants";
import { monthlyIncomeTax } from "./irpf-monthly";
import { roundToCentavos } from "./money";
import { calculateNetSalary } from "./salarioLiquido";
import {
  SIMPLES_MODEL_REVENUE_LIMIT,
  annexFor,
  fatorRProLabore,
  simplesEffectiveRate,
  type SimplesAnnex,
} from "./simples-nacional";

export interface CltVsPjInput {
  cltGrossSalary: number;
  monthlyPjOffer: number;
  /** The worker's dependants: they lower the withholding on the CLT salary and on the pró-labore alike. */
  dependants: number;
  /**
   * What the company spends each month: accountant, digital certificate,
   * software. Under the Simples Nacional the DAS is charged on revenue, so this
   * shelters no tax; it only leaves less to distribute.
   */
  pjMonthlyCosts: number;
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

/** How the company sets the pró-labore, and therefore which annex it is taxed in. */
export type ProLaboreStrategy = "fatorR" | "minimumWage" | "dividendThreshold";

/** The PJ side, in the order the money moves. */
export interface PjDetail extends CltVsPjTaxDetail {
  strategy: ProLaboreStrategy;
  annex: SimplesAnnex;
  /** The DAS's effective rate, LC 123/2006 art. 18 § 1º-A, at twelve times this invoice. */
  dasEffectiveRate: number;
  das: number;
  /** Paid by the company; INSS and IRPF on it are withheld from the partner. */
  proLabore: number;
  costs: number;
  /** What is left in the company after the DAS, the pró-labore and the costs. */
  distribution: number;
  /** Lei 9.250, art. 6º-A: 10% of the whole distribution once it exceeds R$ 50.000 in a month. */
  dividendWithholding: number;
  /**
   * False when twelve times the invoice is past R$ 3,6 milhões: there the sixth
   * band takes ISS out of the DAS, which this model does not charge, so the net
   * it shows is too high.
   */
  withinModel: boolean;
}

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
  pjDetail: PjDetail;
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
 * ⚠️ A modelling assumption, not a figure from the legislation, and the one the
 * break-even rests on most: with the Simples Nacional PJ of decision D6 it puts
 * the break-even invoice roughly 10% to 40% above the gross salary for salaries
 * from R$ 3.000 to R$ 30.000 — measured, see `buildBreakEvenTable`. Moving it
 * moves every verdict this calculator gives. No research has examined it yet.
 */
const CLT_BENEFITS_RATE = 1 / 12 + 0.15;

/**
 * The partner's contribution on the pró-labore: 20% (Lei 8.212/1991, art. 21)
 * less the 9 points art. 30 § 4º lets the company's own contribution cover. The
 * company's 20% is inside the DAS for Anexos III and V.
 */
const PARTNER_INSS_RATE = 0.11;

/** Lei 9.250, art. 6º-A: monthly distribution above which the whole of it is taxed. */
const DIVIDEND_WITHHOLDING_THRESHOLD = 50_000;
const DIVIDEND_WITHHOLDING_RATE = 0.1;

/** A difference this small is a tie: both sides are rounded to the centavo. */
const TIE_TOLERANCE = 0.01;

export function calculateCltVsPj(input: CltVsPjInput): CltVsPjResult {
  const cltGrossSalary = Math.max(input.cltGrossSalary, 0);
  const monthlyPjOffer = Math.max(input.monthlyPjOffer, 0);
  const pjMonthlyCosts = Math.max(input.pjMonthlyCosts, 0);
  const dependants = Math.max(input.dependants, 0);

  // ---- CLT side ----------------------------------------------------------
  // The net-salary calculator's own answer for this salary, not a second copy
  // of it. The copy this replaced took the legal route every time and missed
  // the desconto simplificado mensal that Lei 9.250, art. 4º, § 2º applies when
  // it is more beneficial — overstating the CLT withholding by up to R$ 23,78
  // between R$ 4.878 and R$ 5.754 of gross, exactly where CLT and PJ are close.
  // One call is what makes the two pages agree by construction.
  const clt = calculateNetSalary({
    monthlyGrossSalary: cltGrossSalary,
    dependants: input.dependants,
    monthlyPrivatePension: 0,
    hasMealAllowance: false,
    hasTransportAllowance: false,
    hasUnionDue: false,
  });
  const cltInssWithheld = clt.inssWithheld;
  const cltTax: MonthlyIrpfDetail = {
    assessableBase: clt.monthlyAssessableBase,
    taxFromTable: clt.taxFromTable,
    reductionLei15270: clt.reductionLei15270,
    irpfWithheld: clt.estimatedIrpfWithheld,
  };

  const cltNet = roundToCentavos(clt.monthlyNetSalary);
  const cltBenefits = cltGrossSalary * CLT_BENEFITS_RATE;
  const cltWithBenefits = roundToCentavos(cltNet + cltBenefits);

  // ---- PJ side -----------------------------------------------------------
  const pj = computePjSide(monthlyPjOffer, pjMonthlyCosts, dependants);

  // ---- The comparison ----------------------------------------------------
  // What a PJ must invoice to match the CLT package is a property of that
  // package and of the deductible expenses. It is solved for, not stepped
  // towards from the offer on the table, so two candidates weighing different
  // offers against the same salary are told the same figure.
  const breakEvenPjOffer = solveBreakEvenPjOffer(cltWithBenefits, pjMonthlyCosts, dependants);

  const difference = roundToCentavos(pj.net - cltWithBenefits);
  const cltIsBetter = cltWithBenefits > pj.net;
  const isTie = Math.abs(difference) <= TIE_TOLERANCE + 1e-9;

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
    pjDetail: pj,
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

/**
 * The PJ side, for whatever invoice is being considered: every pró-labore an
 * accountant would weigh, and the one that leaves the most in hand.
 *
 * - `fatorR`: 28% of the invoice (never below the minimum wage), which meets the
 *   Fator R and taxes in Anexo III.
 * - `minimumWage`: the minimum wage, which below roughly R$ 5.789 of invoice is
 *   already 28% and lands in Anexo III too, and above it lands in Anexo V.
 * - `dividendThreshold`: whatever pró-labore leaves exactly R$ 50.000 to
 *   distribute, in either annex it qualifies for. Without it, art. 6º-A's 10% on
 *   the WHOLE distribution would knock about R$ 5.000 off the net at the invoice
 *   where the distribution crosses R$ 50.000 — a drop no accountant lets happen,
 *   because a slightly larger pró-labore avoids it. With it, the net rises with
 *   the invoice through that point.
 *
 * No pró-labore exceeds the invoice: a company cannot pay out more than it takes
 * in, and an empty invoice nets nothing rather than a loss.
 */
function computePjSide(
  monthlyPjOffer: number,
  costs: number,
  dependants: number,
): PjDetail & { net: number } {
  const at = (proLabore: number, strategy: ProLaboreStrategy) =>
    pjSideAt(monthlyPjOffer, Math.min(monthlyPjOffer, proLabore), strategy, costs, dependants);

  const candidates = [
    at(Math.max(MINIMUM_WAGE, fatorRProLabore(monthlyPjOffer)), "fatorR"),
    at(MINIMUM_WAGE, "minimumWage"),
  ];

  for (const annex of ["III", "V"] as const) {
    const das = roundToCentavos(monthlyPjOffer * simplesEffectiveRate(annex, monthlyPjOffer * 12));
    const proLabore = roundToCentavos(
      monthlyPjOffer - das - costs - DIVIDEND_WITHHOLDING_THRESHOLD,
    );
    if (proLabore >= MINIMUM_WAGE && annexFor(proLabore, monthlyPjOffer) === annex) {
      candidates.push(at(proLabore, "dividendThreshold"));
    }
  }

  return candidates.reduce((best, candidate) => (candidate.net > best.net ? candidate : best));
}

function pjSideAt(
  monthlyPjOffer: number,
  requestedProLabore: number,
  strategy: ProLaboreStrategy,
  costs: number,
  dependants: number,
): PjDetail & { net: number } {
  const proLabore = roundToCentavos(requestedProLabore);
  const rbt12 = monthlyPjOffer * 12;
  const annex = annexFor(proLabore, monthlyPjOffer);
  const dasEffectiveRate = simplesEffectiveRate(annex, rbt12);
  const das = roundToCentavos(monthlyPjOffer * dasEffectiveRate);

  const inssWithheld = roundToCentavos(PARTNER_INSS_RATE * Math.min(proLabore, INSS_CEILING));
  const tax = monthlyIncomeTax(
    proLabore,
    inssWithheld + dependants * DEDUCTION_PER_DEPENDENT_MONTHLY,
  );

  const distribution = roundToCentavos(monthlyPjOffer - das - proLabore - costs);
  const dividendWithholding =
    distribution > DIVIDEND_WITHHOLDING_THRESHOLD
      ? roundToCentavos(distribution * DIVIDEND_WITHHOLDING_RATE)
      : 0;

  return {
    strategy,
    annex,
    dasEffectiveRate,
    das,
    proLabore,
    inssWithheld,
    assessableBase: tax.assessableBase,
    taxFromTable: tax.taxFromTable,
    reductionLei15270: tax.reductionLei15270,
    irpfWithheld: tax.withheld,
    costs,
    distribution,
    dividendWithholding,
    withinModel: rbt12 <= SIMPLES_MODEL_REVENUE_LIMIT,
    net: roundToCentavos(
      monthlyPjOffer - das - costs - inssWithheld - tax.withheld - dividendWithholding,
    ),
  };
}

/**
 * The smallest invoice whose net matches `target`, to the centavo.
 *
 * Bisection, not a fixed number of R$ 100 steps away from the offer. Each
 * strategy's net rises with the invoice: the marginal DAS is the band's nominal
 * rate, at most 33%, and 28% of each extra real goes to a pró-labore that loses
 * at most 11% + 27,5% of itself, so every real invoiced keeps well over half. The
 * better of two rising nets rises too, so the search brackets the answer.
 *
 * ⚠️ One exception, from the statute and kept on purpose: past R$ 50.000 of
 * monthly distribution, art. 6º-A takes 10% of the whole of it, so the net drops
 * by about R$ 5.000 at that point. Targets that sit on the drop — CLT packages
 * past roughly R$ 50.000 a month — can bisect to either side of it.
 */
function solveBreakEvenPjOffer(target: number, costs: number, dependants: number): number {
  if (target <= 0) {
    return 0;
  }

  let high = Math.max(target, 1);
  while (computePjSide(high, costs, dependants).net < target && high < Number.MAX_SAFE_INTEGER) {
    high *= 2;
  }

  let low = 0;
  for (let step = 0; step < 100; step += 1) {
    const middle = (low + high) / 2;
    if (computePjSide(middle, costs, dependants).net < target) {
      low = middle;
    } else {
      high = middle;
    }
  }

  // Up to the centavo, never to the nearest one: the net is computed on a
  // centavo grid, and rounding `high` down can land a centavo short of the
  // target — CLT R$ 5.000 with R$ 300 of costs bisected to R$ 6.560,88, which
  // nets R$ 5.665,15 against a package of R$ 5.665,16.
  let answer = Math.ceil(high * 100) / 100;
  while (computePjSide(answer, costs, dependants).net < target) {
    answer = roundToCentavos(answer + 0.01);
  }
  return answer;
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

/** One line of the page's break-even table. */
export interface BreakEvenRow {
  cltGrossSalary: number;
  cltNet: number;
  cltWithBenefits: number;
  breakEvenPjOffer: number;
  /** How far the break-even invoice sits above the gross salary, as a share: 0,25 is 25%. */
  aboveGross: number;
  /** How the PJ side is set up at that invoice. */
  annex: SimplesAnnex;
  strategy: ProLaboreStrategy;
}

/**
 * The page's break-even table, built by the calculator itself: every row is the
 * break-even the form would report for that salary, with the PJ side read at
 * the break-even invoice.
 */
export function buildBreakEvenTable(
  cltGrossSalaries: readonly number[],
  pjMonthlyCosts: number,
  dependants = 0,
): BreakEvenRow[] {
  return cltGrossSalaries.map((cltGrossSalary) => {
    const atSalary = calculateCltVsPj({
      cltGrossSalary,
      monthlyPjOffer: 0,
      dependants,
      pjMonthlyCosts,
    });
    const atBreakEven = calculateCltVsPj({
      cltGrossSalary,
      monthlyPjOffer: atSalary.breakEvenPjOffer,
      dependants,
      pjMonthlyCosts,
    });

    return {
      cltGrossSalary: atSalary.cltGrossSalary,
      cltNet: atSalary.cltNet,
      cltWithBenefits: atSalary.cltWithBenefits,
      breakEvenPjOffer: atSalary.breakEvenPjOffer,
      aboveGross:
        atSalary.cltGrossSalary > 0 ? atSalary.breakEvenPjOffer / atSalary.cltGrossSalary - 1 : 0,
      annex: atBreakEven.pjDetail.annex,
      strategy: atBreakEven.pjDetail.strategy,
    };
  });
}
