/**
 * IRPF 2026 Calculator
 * Computes Brazilian personal income tax (IRPF) under the 2026 legislation.
 *
 * This module answers an ANNUAL question — the ajuste anual — so it reaches for
 * the annual half of `irpf-constants.ts`. The monthly half belongs to
 * `salarioLiquido.ts` and `cltVsPj.ts`, and is not this one divided by twelve.
 */

import { calculateEmployeeInss } from "./inss-constants";
import {
  DEDUCTION_PER_DEPENDENT_ANNUAL,
  MAX_DEDUCTION_EDUCATION_ANNUAL,
  MAX_SIMPLIFIED_DEDUCTION_ANNUAL,
  SIMPLIFIED_DEDUCTION_RATE_ANNUAL,
  annualReductionLei15270,
  findAnnualTaxBracket,
} from "./irpf-constants";

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
  /** What the progressive table produces, before the Lei 15.270/2025 reduction. */
  irpfPelaTabela: number;
  /** The Lei 15.270/2025 reduction actually applied, never more than the tax due. */
  reducaoLei15270: number;
  /** What is actually owed: the table's figure less the reduction, floored at zero. */
  irpfCalculado: number;
  irpfDevido: number;
  aliquotaMarginal: string;
}

/**
 * Cap on health deductions.
 *
 * ⚠️ Stays here rather than joining the published figures in `irpf-constants.ts`,
 * and that is the point: no official ceiling on despesas médicas was found in
 * any source read for the research note. This is an invented reference figure,
 * and `salarioLiquido.ts` deliberately applies no health cap at all. Moving it
 * in beside the sourced constants would launder it into one of them.
 */
const MAX_DEDUCTION_HEALTH = 2666.67;

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
  const descInss = calculateEmployeeInss(rendaBrutaAnual / 12) * 12;

  // 2. taxable base after INSS
  const basePosInss = rendaBrutaAnual - descInss;

  // 3. determine the allowed deductions
  const deducaoEducacao = Math.min(input.deducaoEducacao, MAX_DEDUCTION_EDUCATION_ANNUAL);
  const deducaoSaude = Math.min(input.deducaoSaude, MAX_DEDUCTION_HEALTH);
  const deducaoPrevidenciaComplementar = Math.max(input.deducaoPrevidenciaComplementar, 0);

  const totalDeducoes = deducaoEducacao + deducaoSaude + deducaoPrevidenciaComplementar;

  // 4. full calculation base
  const baseCalculoCompleta = Math.max(basePosInss - totalDeducoes, 0);

  // 5. dependant deduction (R$ 2.275 per dependant in 2026)
  const descDependentes = input.dependentes * DEDUCTION_PER_DEPENDENT_ANNUAL;

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
      rendaBrutaAnual * SIMPLIFIED_DEDUCTION_RATE_ANNUAL,
      MAX_SIMPLIFIED_DEDUCTION_ANNUAL,
    );
    baseCalculoSimplificada = Math.max(rendaBrutaAnual - descontoSimplificado, 0);

    const { rate, deduction } = findAnnualTaxBracket(baseCalculoSimplificada);
    irpfCalculado = Math.max(baseCalculoSimplificada * rate - deduction, 0);
    aliquotaMarginal = rate > 0 ? `${(rate * 100).toFixed(1)}%` : "Isento";
  } else {
    // full regime: itemised deductions
    baseCalculoSimplificada = baseCalculoCompleta;
    const { rate, deduction } = findAnnualTaxBracket(baseImponivel);
    irpfCalculado = Math.max(baseImponivel * rate - deduction, 0);
    aliquotaMarginal = rate > 0 ? `${(rate * 100).toFixed(1)}%` : "Isento";
  }

  // 8. Lei 15.270/2025 reduction, applied to the tax the table produced.
  const irpfPelaTabela = irpfCalculado;
  const reducaoLei15270 = annualReductionLei15270(rendaBrutaAnual, irpfPelaTabela);

  // 9. what is actually owed
  irpfCalculado = Math.max(irpfPelaTabela - reducaoLei15270, 0);
  const irpfDevido = irpfCalculado;

  // 10. effective rate, on what is owed rather than on what the table said
  const aliquotaEfetiva = rendaBrutaAnual > 0 ? (irpfDevido / rendaBrutaAnual) * 100 : 0;

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
    irpfPelaTabela,
    reducaoLei15270,
    irpfCalculado,
    irpfDevido,
    aliquotaMarginal,
  };
}
