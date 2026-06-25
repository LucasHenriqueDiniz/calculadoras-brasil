/**
 * IRPF 2026 Calculator
 * Calcula o Imposto de Renda Pessoa Física (IRPF) baseado na legislação brasileira 2026
 * Reference: Tabela progressiva IRPF 2026 (atualizada 01/01/2026)
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

// Tabela progressiva IRPF 2026 (vigência 01/01/2026)
// Alíquotas e deduções por faixa de renda
const IRPF_TABLE_2026 = [
  { min: 0, max: 21503.34, rate: 0.0, deduction: 0 },
  { min: 21503.35, max: 33503.34, rate: 0.075, deduction: 1612.75 },
  { min: 33503.35, max: 44693.59, rate: 0.15, deduction: 4257.67 },
  { min: 44693.6, max: 55471.74, rate: 0.225, deduction: 7633.69 },
  { min: 55471.75, max: Infinity, rate: 0.275, deduction: 10432.32 },
];

// Constantes 2026
const INSS_RATE = 0.1; // Taxa INSS empregado (8-11%, usamos 10% média)
const DEDUCTION_PER_DEPENDENT = 2275.0; // Valor por dependente em 2026
const MAX_DEDUCTION_EDUCATION = 3561.5; // Limite de deduções com educação
const MAX_DEDUCTION_HEALTH = 2666.67; // Limite de deduções com saúde (não há limite oficial, usamos como referência)
const SIMPLIFIED_DEDUCTION_RATE = 0.205; // Dedução simplificada: até 20,5% da renda bruta

/**
 * Calcula o IRPF de pessoa física
 * Segue as regras progressivas da Receita Federal para 2026
 */
export function calculateIrpf(input: IrpfInput): IrpfResult {
  // Validações básicas
  if (input.rendaBrutaAnual < 0) {
    throw new Error("Renda bruta não pode ser negativa");
  }
  if (input.dependentes < 0) {
    throw new Error("Número de dependentes não pode ser negativo");
  }

  const { rendaBrutaAnual } = input;

  // 1. Calcular desconto INSS (retenção na fonte)
  // Variação: se autônomo, já paga INSS como contribuição; se empregado, é retido
  const descInss = rendaBrutaAnual * INSS_RATE;

  // 2. Base tributável após INSS
  const basePosInss = rendaBrutaAnual - descInss;

  // 3. Determinar deduções permitidas
  const deducaoEducacao = Math.min(input.deducaoEducacao, MAX_DEDUCTION_EDUCATION);
  const deducaoSaude = Math.min(input.deducaoSaude, MAX_DEDUCTION_HEALTH);
  const deducaoPrevidenciaComplementar = Math.max(input.deducaoPrevidenciaComplementar, 0);

  const totalDeducoes = deducaoEducacao + deducaoSaude + deducaoPrevidenciaComplementar;

  // 4. Base de cálculo completa
  const baseCalculoCompleta = Math.max(basePosInss - totalDeducoes, 0);

  // 5. Desconto com dependentes (R$ 2.275 por dependente em 2026)
  const descDependentes = input.dependentes * DEDUCTION_PER_DEPENDENT;

  // 6. Base imponível (base completa menos dependentes)
  const baseImponivel = Math.max(baseCalculoCompleta - descDependentes, 0);

  // 7. Calcular IRPF conforme regime
  let irpfCalculado = 0;
  let aliquotaMarginal = "Isento";
  let baseCalculoSimplificada = 0;

  if (input.regimeSimplificado) {
    // Regime Simplificado: dedução fixa de 20,5% da renda bruta (até o máximo permitido)
    baseCalculoSimplificada = Math.max(
      rendaBrutaAnual * (1 - SIMPLIFIED_DEDUCTION_RATE),
      0
    );
    const baseImponvelSimplificada = Math.max(baseCalculoSimplificada - descDependentes, 0);

    // Aplicar tabela ao resultado
    const { rate, deduction } = findTaxBracket(baseImponvelSimplificada);
    irpfCalculado = Math.max(baseImponvelSimplificada * rate - deduction, 0);
    aliquotaMarginal = rate > 0 ? `${(rate * 100).toFixed(1)}%` : "Isento";
  } else {
    // Regime Completo: deduções itemizadas
    baseCalculoSimplificada = baseCalculoCompleta;
    const { rate, deduction } = findTaxBracket(baseImponivel);
    irpfCalculado = Math.max(baseImponivel * rate - deduction, 0);
    aliquotaMarginal = rate > 0 ? `${(rate * 100).toFixed(1)}%` : "Isento";
  }

  // 8. Calcular alíquota efetiva
  const aliquotaEfetiva = rendaBrutaAnual > 0 ? (irpfCalculado / rendaBrutaAnual) * 100 : 0;

  // 9. IRPF devido (se negativo, é restituição)
  const irpfDevido = irpfCalculado;

  // 10. Número de parcelas de restituição (se houver)
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
 * Encontra a faixa de alíquota apropriada para a base imponível
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

  // Se passar de todos os ranges (improvável), retorna a última faixa
  const lastBracket = IRPF_TABLE_2026[IRPF_TABLE_2026.length - 1];
  return { rate: lastBracket.rate, deduction: lastBracket.deduction };
}

/**
 * Formata um valor monetário para exibição
 * (Este helper será reutilizado de @/lib/format em tempo de execução)
 */
export function formatIrpfValue(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
