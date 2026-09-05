/**
 * IRPF 2026 Calculator
 * Computes Brazilian personal income tax (IRPF) under the 2026 legislation.
 * Reference: Receita Federal annual table, ano-calendário 2026 (exercício 2027).
 */

import { calcularInssEmpregado } from "./inss-constants";

export interface IrpfInput {
  rendaBrutaAnual: number;
  dependentes: number;
  deducaoEducacao: number;
  deducaoSaude: number;
  deducaoPrevidenciaComplementar: number;
  regimeSimplificado: boolean;
}

export interface IrpfResult {
  rendaBrutaAnual: number;
  descInss: number;
  baseCalculoSimplificada: number;
  deducaoEducacao: number;
  deducaoSaude: number;
  deducaoPrevidenciaComplementar: number;
  totalDeducoes: number;
  baseCalculoCompleta: number;
  descDependentes: number;
  baseImponivel: number;
  aliquotaEfetiva: number;
  irpfCalculado: number;
  irpfDevido: number;
  aliquotaMarginal: string;
  parcelasRestituicao?: number;
}

// Official annual table for ano-calendário 2026 (exercício 2027), Receita Federal.
// Figures, sources and the arithmetic that cross-checks them:
// docs/research/2026-09-04-irpf-2026-table/research.md
//
// Each bracket carries only its upper bound. The previous shape paired a `max`
// with the next bracket's `min` — two numbers that had to agree and did not, so
// every base between them (33503.346, say) matched no bracket at all and fell
// through to a fallback that charged 27.5% and then floored the result at zero.
const IRPF_TABLE_2026 = [
  { upTo: 29145.6, rate: 0.0, deduction: 0 },
  { upTo: 33919.8, rate: 0.075, deduction: 2185.92 },
  { upTo: 45012.6, rate: 0.15, deduction: 4729.91 },
  { upTo: 55976.16, rate: 0.225, deduction: 8105.85 },
  { upTo: Infinity, rate: 0.275, deduction: 10904.66 },
] as const;

// 2026 constants
const DEDUCTION_PER_DEPENDENT = 2275.08; // annual amount per dependant in 2026
const MAX_DEDUCTION_EDUCATION = 3561.5; // cap on education deductions
const MAX_DEDUCTION_HEALTH = 2666.67; // cap on health deductions (no official cap exists; used as a reference)
const SIMPLIFIED_DEDUCTION_RATE = 0.2; // desconto simplificado: 20% of gross income
const MAX_SIMPLIFIED_DEDUCTION = 17640.0; // annual ceiling on that discount in 2026

/**
 * Computes personal income tax.
 * Follows the Receita Federal progressive rules for 2026.
 */
export function calculateIrpf(input: IrpfInput): IrpfResult {
  // basic validation
  if (input.rendaBrutaAnual < 0) {
    throw new Error("Gross income cannot be negative");
  }
  if (input.dependentes < 0) {
    throw new Error("Number of dependants cannot be negative");
  }

  const { rendaBrutaAnual } = input;

  // 1. INSS deduction (withheld at source).
  // Variation: a self-employed worker already pays INSS as a contribution; an
  // employee has it withheld.
  //
  // The brackets are monthly and this module is annual, so the contribution is
  // computed on the monthly salary and annualised. What matters is not the rate
  // but the ceiling: a flat percentage of gross income has none, and deducted
  // R$ 50.000 from an income of R$ 500.000 against a legal maximum of R$ 11.857.
  const descInss = calcularInssEmpregado(rendaBrutaAnual / 12) * 12;

  // 2. taxable base after INSS
  const basePosInss = rendaBrutaAnual - descInss;

  // 3. determine the allowed deductions
  const deducaoEducacao = Math.min(input.deducaoEducacao, MAX_DEDUCTION_EDUCATION);
  const deducaoSaude = Math.min(input.deducaoSaude, MAX_DEDUCTION_HEALTH);
  const deducaoPrevidenciaComplementar = Math.max(input.deducaoPrevidenciaComplementar, 0);

  const totalDeducoes = deducaoEducacao + deducaoSaude + deducaoPrevidenciaComplementar;

  // 4. full calculation base
  const baseCalculoCompleta = Math.max(basePosInss - totalDeducoes, 0);

  // 5. dependant deduction (R$ 2.275 per dependant in 2026)
  const descDependentes = input.dependentes * DEDUCTION_PER_DEPENDENT;

  // 6. assessable base (full base minus dependants)
  const baseImponivel = Math.max(baseCalculoCompleta - descDependentes, 0);

  // 7. compute IRPF according to the chosen regime
  let irpfCalculado = 0;
  let aliquotaMarginal = "Isento";
  let baseCalculoSimplificada = 0;

  if (input.regimeSimplificado) {
    // Simplified regime: 20% of gross income, capped.
    //
    // The desconto simplificado REPLACES every deduction the legislation allows —
    // dependants included. Subtracting `descDependentes` here as well, which this
    // branch used to do, takes one of them twice. `descDependentes` is still
    // reported in the result; it just does not reduce the tax under this regime.
    const descontoSimplificado = Math.min(
      rendaBrutaAnual * SIMPLIFIED_DEDUCTION_RATE,
      MAX_SIMPLIFIED_DEDUCTION,
    );
    baseCalculoSimplificada = Math.max(rendaBrutaAnual - descontoSimplificado, 0);

    const { rate, deduction } = findTaxBracket(baseCalculoSimplificada);
    irpfCalculado = Math.max(baseCalculoSimplificada * rate - deduction, 0);
    aliquotaMarginal = rate > 0 ? `${(rate * 100).toFixed(1)}%` : "Isento";
  } else {
    // full regime: itemised deductions
    baseCalculoSimplificada = baseCalculoCompleta;
    const { rate, deduction } = findTaxBracket(baseImponivel);
    irpfCalculado = Math.max(baseImponivel * rate - deduction, 0);
    aliquotaMarginal = rate > 0 ? `${(rate * 100).toFixed(1)}%` : "Isento";
  }

  // 8. effective rate
  const aliquotaEfetiva = rendaBrutaAnual > 0 ? (irpfCalculado / rendaBrutaAnual) * 100 : 0;

  // 9. tax due (a negative value is a refund)
  const irpfDevido = irpfCalculado;

  // 10. number of refund instalments, if any
  const parcelasRestituicao = irpfDevido < 0 ? 3 : undefined;

  return {
    rendaBrutaAnual,
    descInss,
    baseCalculoSimplificada,
    deducaoEducacao,
    deducaoSaude,
    deducaoPrevidenciaComplementar,
    totalDeducoes,
    baseCalculoCompleta,
    descDependentes,
    baseImponivel,
    aliquotaEfetiva,
    irpfCalculado,
    irpfDevido,
    aliquotaMarginal,
    parcelasRestituicao,
  };
}

/**
 * Finds the rate bracket that applies to the assessable base.
 * Total by construction: the last bracket has no upper bound, so every
 * non-negative base matches exactly one.
 */
function findTaxBracket(baseImponivel: number): { rate: number; deduction: number } {
  if (baseImponivel <= 0) {
    return { rate: 0, deduction: 0 };
  }

  for (const bracket of IRPF_TABLE_2026) {
    if (baseImponivel <= bracket.upTo) {
      return { rate: bracket.rate, deduction: bracket.deduction };
    }
  }

  // Unreachable while the last bracket's upTo is Infinity. Throwing rather than
  // returning a rate keeps a future edit to that row from silently charging 0%.
  throw new Error("IRPF bracket table does not cover the assessable base");
}
