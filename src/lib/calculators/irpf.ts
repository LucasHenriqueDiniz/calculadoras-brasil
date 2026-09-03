/**
 * IRPF 2026 Calculator
 * Computes Brazilian personal income tax (IRPF) under the 2026 legislation.
 * Reference: IRPF 2026 progressive table (updated 01/01/2026).
 */

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

// IRPF 2026 progressive table (in force from 01/01/2026).
// Rates and deductions per income bracket.
const IRPF_TABLE_2026 = [
  { min: 0, max: 21503.34, rate: 0.0, deduction: 0 },
  { min: 21503.35, max: 33503.34, rate: 0.075, deduction: 1612.75 },
  { min: 33503.35, max: 44693.59, rate: 0.15, deduction: 4257.67 },
  { min: 44693.6, max: 55471.74, rate: 0.225, deduction: 7633.69 },
  { min: 55471.75, max: Infinity, rate: 0.275, deduction: 10432.32 },
];

// 2026 constants
const INSS_RATE = 0.1; // employee INSS rate (8-11%; 10% used as the average)
const DEDUCTION_PER_DEPENDENT = 2275.0; // amount per dependant in 2026
const MAX_DEDUCTION_EDUCATION = 3561.5; // cap on education deductions
const MAX_DEDUCTION_HEALTH = 2666.67; // cap on health deductions (no official cap exists; used as a reference)
const SIMPLIFIED_DEDUCTION_RATE = 0.205; // simplified deduction: up to 20.5% of gross income

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
  const descInss = rendaBrutaAnual * INSS_RATE;

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
    // simplified regime: flat 20.5% deduction of gross income, up to the allowed cap
    baseCalculoSimplificada = Math.max(rendaBrutaAnual * (1 - SIMPLIFIED_DEDUCTION_RATE), 0);
    const baseImponvelSimplificada = Math.max(baseCalculoSimplificada - descDependentes, 0);

    // apply the table to the result
    const { rate, deduction } = findTaxBracket(baseImponvelSimplificada);
    irpfCalculado = Math.max(baseImponvelSimplificada * rate - deduction, 0);
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
 */
function findTaxBracket(baseImponivel: number): { rate: number; deduction: number } {
  if (baseImponivel <= 0) {
    return { rate: 0, deduction: 0 };
  }

  for (const bracket of IRPF_TABLE_2026) {
    if (baseImponivel >= bracket.min && baseImponivel <= bracket.max) {
      return { rate: bracket.rate, deduction: bracket.deduction };
    }
  }

  // past every range (unlikely): fall back to the last bracket
  const lastBracket = IRPF_TABLE_2026[IRPF_TABLE_2026.length - 1];
  return { rate: lastBracket.rate, deduction: lastBracket.deduction };
}
