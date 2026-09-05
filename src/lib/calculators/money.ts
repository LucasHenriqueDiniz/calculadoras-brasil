/**
 * Currency arithmetic shared by the calculators.
 *
 * Not a tax rule and not a formatter: the functions here operate on numbers and
 * return numbers, so a calculator can settle an amount before comparing it,
 * while `src/lib/format.ts` stays responsible for turning a number into the
 * string a visitor reads.
 */

/**
 * Rounds a currency amount to the centavo, the granularity a payslip has.
 *
 * Worth doing rather than leaving to the formatter: binary floating point misses
 * a legal centavo literal often enough to change an answer. The monthly Lei
 * 15.270/2025 reduction is the case that proved it — unrounded, the table yields
 * 312,89000000000004 where the law says 312,89, the R$ 312,89 cap then fails to
 * cover it, and a salary the statute declares exempt is withheld a sliver of tax.
 */
export function roundToCentavos(amount: number): number {
  return Math.round(amount * 100) / 100;
}
