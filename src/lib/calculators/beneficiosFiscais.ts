/**
 * Meal and transport benefits against the salary raise that would leave the
 * worker with the same money.
 *
 * The rules, read on Planalto
 * (docs/research/2026-10-18-adsense-added-value/fetches/planalto-beneficios.md):
 * - meal benefit within the PAT: not part of the salário de contribuição
 *   (Lei 6.321/1976, art. 3º), and food supplied by the employer is exempt from
 *   income tax (Lei 7.713/1988, art. 6º, I);
 * - vale-transporte: the employer's part has no salary nature, no INSS, no FGTS
 *   and is not taxable income (Lei 7.418/1985, art. 2º), and the employer pays
 *   only what exceeds 6% of the base salary (art. 4º, parágrafo único) — the
 *   worker covers the rest, as they would without the benefit.
 *
 * The cash equivalent is computed by the net-salary calculator itself: the gross
 * raise whose net, after the raise's own INSS and income tax, equals the benefit.
 * This used to divide the benefit by one minus an income-tax rate the visitor
 * typed, which left INSS out altogether and ignored the 6% the worker pays
 * towards the vale-transporte.
 */

import { calculateNetSalary } from "./salarioLiquido";
import { roundToCentavos } from "./money";

/** Lei 7.418/1985, art. 4º, parágrafo único: the worker's share of the commute. */
const TRANSPORT_EMPLOYEE_SHARE = 0.06;

export interface TaxFreeBenefitsInput {
  /** The base salary, which sets the vale-transporte share and the rate a raise is taxed at. */
  monthlyGrossSalary: number;
  monthlyMealAllowance: number;
  /** What the commute costs a month in public transport, before any vale-transporte. */
  monthlyTransportCost: number;
}

export interface TaxFreeBenefitsResult {
  monthlyMealAllowance: number;
  /** What the worker still pays towards the commute: up to 6% of the base salary. */
  transportEmployeeShare: number;
  /** What the employer pays towards it: the part above 6%. This is the benefit. */
  transportEmployerShare: number;
  /** What the benefits are worth to the worker each month, untaxed. */
  monthlyBenefitTotal: number;
  annualBenefitTotal: number;
  /** The gross raise that would net the same money after its INSS and income tax. */
  equivalentGrossRaise: number;
  /** INSS and income tax that raise would cost the worker. */
  taxesOnEquivalentRaise: number;
}

function netAt(monthlyGrossSalary: number): number {
  return calculateNetSalary({
    monthlyGrossSalary,
    dependants: 0,
    monthlyPrivatePension: 0,
    hasMealAllowance: false,
    hasTransportAllowance: false,
    hasUnionDue: false,
  }).monthlyNetSalary;
}

/**
 * The smallest raise, to the centavo, whose extra net reaches `target`. The net
 * rises with the gross (the marginal INSS plus income tax stays below 42%), so
 * bisection brackets it.
 */
function equivalentRaise(monthlyGrossSalary: number, target: number): number {
  if (target <= 0) return 0;

  const base = netAt(monthlyGrossSalary);
  let low = 0;
  let high = target * 3 + 1;
  for (let step = 0; step < 100; step += 1) {
    const middle = (low + high) / 2;
    if (netAt(monthlyGrossSalary + middle) - base < target) {
      low = middle;
    } else {
      high = middle;
    }
  }

  let answer = Math.ceil(high * 100) / 100;
  while (netAt(monthlyGrossSalary + answer) - base < target - 1e-9) {
    answer = roundToCentavos(answer + 0.01);
  }
  return answer;
}

export function calculateTaxFreeBenefits(input: TaxFreeBenefitsInput): TaxFreeBenefitsResult {
  const salary = Math.max(input.monthlyGrossSalary, 0);
  const meal = Math.max(input.monthlyMealAllowance, 0);
  const transportCost = Math.max(input.monthlyTransportCost, 0);

  const transportEmployeeShare = roundToCentavos(
    Math.min(transportCost, salary * TRANSPORT_EMPLOYEE_SHARE),
  );
  const transportEmployerShare = roundToCentavos(transportCost - transportEmployeeShare);
  const monthlyBenefitTotal = roundToCentavos(meal + transportEmployerShare);
  const equivalentGrossRaise = equivalentRaise(salary, monthlyBenefitTotal);

  return {
    monthlyMealAllowance: meal,
    transportEmployeeShare,
    transportEmployerShare,
    monthlyBenefitTotal,
    annualBenefitTotal: roundToCentavos(monthlyBenefitTotal * 12),
    equivalentGrossRaise,
    taxesOnEquivalentRaise: roundToCentavos(equivalentGrossRaise - monthlyBenefitTotal),
  };
}

/** One line of the page's table: what R$ X of benefits is worth in salary, by salary. */
export interface BenefitEquivalenceRow {
  monthlyGrossSalary: number;
  monthlyBenefitTotal: number;
  equivalentGrossRaise: number;
  /** How much more the raise must be than the benefit, as a share: 0,4 is 40%. */
  premium: number;
}

/** The page's table, built by the calculator: the same meal benefit at each salary. */
export function buildBenefitEquivalenceTable(
  salaries: readonly number[],
  monthlyMealAllowance: number,
): BenefitEquivalenceRow[] {
  return salaries.map((monthlyGrossSalary) => {
    const result = calculateTaxFreeBenefits({
      monthlyGrossSalary,
      monthlyMealAllowance,
      monthlyTransportCost: 0,
    });

    return {
      monthlyGrossSalary,
      monthlyBenefitTotal: result.monthlyBenefitTotal,
      equivalentGrossRaise: result.equivalentGrossRaise,
      premium:
        result.monthlyBenefitTotal > 0
          ? result.equivalentGrossRaise / result.monthlyBenefitTotal - 1
          : 0,
    };
  });
}
