/**
 * CLT versus PJ comparison.
 *
 * Weighs a CLT salary — net pay plus the amortised value of the rights a
 * contract carries — against a PJ invoice, net of contributions, income tax and
 * the accountant.
 *
 * This module answers a MONTHLY question, exactly like `salarioLiquido.ts`: what
 * lands in the bank account each month under either arrangement. That decides
 * which half of the 2026 legislation applies — the monthly incidence table and
 * the monthly Lei 15.270/2025 reduction, neither of which is its annual
 * counterpart divided by twelve.
 *
 * The rules themselves live in `irpf-constants.ts`, alongside their sources —
 * the same module `salarioLiquido.ts` reads. Two calculators on this site answer
 * the same monthly CLT question, so they must agree to the centavo, and sharing
 * one definition is what makes that true by construction rather than by review.
 */

import { calculateEmployeeInss } from "./inss-constants";
import {
  DEDUCTION_PER_DEPENDENT_MONTHLY,
  findMonthlyTaxBracket,
  monthlyReductionLei15270,
} from "./irpf-constants";
import { roundToCentavos } from "./money";

export interface CltVsPjInput {
  salarioCltBruto: number;
  propostaPjMensal: number;
  /**
   * Dependants claimed against the CLT withholding base. They lower the CLT tax
   * and never touch the PJ side, where the invoice is sheltered by
   * `despesasDedutivelsPj` instead.
   */
  dependentes: number;
  despesasDedutivelsPj: number;
}

/** How a monthly income tax was arrived at, in the order it is computed. */
export interface IrpfMensalDetalhado {
  /** The monthly base actually taken to the table. */
  baseIrpf: number;
  /** What the monthly table produces, before the Lei 15.270/2025 reduction. */
  irpfPelaTabela: number;
  /** The monthly reduction applied, never more than the tax due. */
  reducaoLei15270: number;
  descIrpf: number;
}

/** The same, plus the contribution that shaped the base. */
export type CltVsPjImpostoDetalhado = IrpfMensalDetalhado & { descInss: number };

export interface CltVsPjResult {
  salarioCltBruto: number;
  propostaPjMensal: number;
  cltLiquido: number;
  cltComBeneficios: number;
  pjLiquido: number;
  diferenca: number;
  percentualDiferenca: number;
  pjNecessaria: number;
  /** The CLT withholdings, plus the amortised benefits added on top of the net. */
  detalhesClt: CltVsPjImpostoDetalhado & { beneficios: number };
  /** The PJ withholdings, plus the accountant fee, which is a cost and not a tax. */
  detalhesPj: CltVsPjImpostoDetalhado & { descContador: number };
  analise: {
    cltMelhor: boolean;
    /** The two packages are level to within a centavo. `cltMelhor` alone cannot say so. */
    empate: boolean;
    /** False when there is no CLT package to take a percentage of. */
    temBaseParaPercentual: boolean;
    diferencaMensal: number;
    diferencaAnual: number;
    justificativa: string;
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
  const salarioCltBruto = Math.max(input.salarioCltBruto, 0);
  const propostaPjMensal = Math.max(input.propostaPjMensal, 0);
  const despesasDedutivelsPj = Math.max(input.despesasDedutivelsPj, 0);

  // ---- CLT side ----------------------------------------------------------
  // INSS is progressive and capped at the RGPS ceiling, the same contribution
  // /calculadora-salario-liquido withholds for this salary. A flat percentage
  // would put the two calculators on different answers for the same input.
  const descInssClt = calculateEmployeeInss(salarioCltBruto);
  const deducaoDependentes = Math.max(input.dependentes, 0) * DEDUCTION_PER_DEPENDENT_MONTHLY;
  const impostoClt = calcularIrpfMensal(
    salarioCltBruto,
    salarioCltBruto - descInssClt - deducaoDependentes,
  );

  const cltLiquido = roundToCentavos(salarioCltBruto - descInssClt - impostoClt.descIrpf);
  const beneficiosClt = salarioCltBruto * CLT_BENEFITS_RATE;
  const cltComBeneficios = roundToCentavos(cltLiquido + beneficiosClt);

  // ---- PJ side -----------------------------------------------------------
  const pj = calcularPj(propostaPjMensal, despesasDedutivelsPj);

  // ---- The comparison ----------------------------------------------------
  // What a PJ must invoice to match the CLT package is a property of that
  // package and of the deductible expenses. It is solved for, not stepped
  // towards from the offer on the table, so two candidates weighing different
  // offers against the same salary are told the same figure.
  const pjNecessaria = resolverPjNecessaria(cltComBeneficios, despesasDedutivelsPj);

  const diferenca = roundToCentavos(pj.liquido - cltComBeneficios);
  const cltMelhor = cltComBeneficios > pj.liquido;
  const empate = Math.abs(diferenca) < TIE_TOLERANCE;

  // A percentage of nothing is not a number. Both fields are currency inputs
  // with no floor, so a visitor who clears them reaches this.
  const percentualDiferenca =
    cltComBeneficios > 0 ? roundToCentavos((diferenca / cltComBeneficios) * 100) : 0;

  return {
    salarioCltBruto,
    propostaPjMensal,
    cltLiquido,
    cltComBeneficios,
    pjLiquido: pj.liquido,
    diferenca,
    percentualDiferenca,
    pjNecessaria,
    detalhesClt: { ...impostoClt, descInss: descInssClt, beneficios: beneficiosClt },
    detalhesPj: { ...pj.imposto, descInss: pj.descInss, descContador: pj.descContador },
    analise: {
      cltMelhor,
      empate,
      temBaseParaPercentual: cltComBeneficios > 0,
      diferencaMensal: Math.abs(diferenca),
      diferencaAnual: roundToCentavos(Math.abs(diferenca) * 12),
      justificativa: escreverJustificativa({
        empate,
        cltMelhor,
        temBaseParaPercentual: cltComBeneficios > 0,
        percentualDiferenca,
        diferenca,
        pjNecessaria,
      }),
    },
  };
}

/** The PJ side of the comparison, for whatever invoice is being considered. */
function calcularPj(propostaPjMensal: number, despesasDedutivelsPj: number) {
  const descInss = propostaPjMensal * INSS_RATE_PJ;
  const descContador = propostaPjMensal * ACCOUNTANT_FEE_RATE;
  const imposto = calcularIrpfMensal(
    propostaPjMensal,
    propostaPjMensal - descInss - despesasDedutivelsPj,
  );

  return {
    descInss,
    descContador,
    imposto,
    liquido: roundToCentavos(propostaPjMensal - descInss - descContador - imposto.descIrpf),
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
function calcularIrpfMensal(
  rendimentoBrutoMensal: number,
  baseImponivelMensal: number,
): IrpfMensalDetalhado {
  const baseIrpf = Math.max(baseImponivelMensal, 0);
  const { rate, deduction } = findMonthlyTaxBracket(baseIrpf);
  const irpfPelaTabela = roundToCentavos(Math.max(baseIrpf * rate - deduction, 0));
  const reducaoLei15270 = roundToCentavos(
    monthlyReductionLei15270(rendimentoBrutoMensal, irpfPelaTabela),
  );

  return {
    baseIrpf,
    irpfPelaTabela,
    reducaoLei15270,
    descIrpf: roundToCentavos(Math.max(irpfPelaTabela - reducaoLei15270, 0)),
  };
}

/**
 * The smallest invoice whose net matches `alvo`, to the centavo.
 *
 * Bisection, not a fixed number of R$ 100 steps away from the offer: the net is
 * strictly increasing in the invoice — the worst marginal case keeps about 40
 * centavos of every extra real, once 25% of contributions and fee, 27,5% of tax
 * on 80% of the invoice and the reduction's phase-out are all taken off — so the
 * search always brackets the answer and always converges to it.
 */
function resolverPjNecessaria(alvo: number, despesasDedutivelsPj: number): number {
  if (alvo <= 0) {
    return 0;
  }

  let high = Math.max(alvo, 1);
  while (calcularPj(high, despesasDedutivelsPj).liquido < alvo && high < Number.MAX_SAFE_INTEGER) {
    high *= 2;
  }

  let low = 0;
  for (let step = 0; step < 100; step += 1) {
    const middle = (low + high) / 2;
    if (calcularPj(middle, despesasDedutivelsPj).liquido < alvo) {
      low = middle;
    } else {
      high = middle;
    }
  }

  return roundToCentavos(high);
}

/** The verdict in Portuguese, which is what the page prints beside the badge. */
function escreverJustificativa(veredito: {
  empate: boolean;
  cltMelhor: boolean;
  temBaseParaPercentual: boolean;
  percentualDiferenca: number;
  diferenca: number;
  pjNecessaria: number;
}): string {
  if (veredito.empate) {
    return "CLT e PJ empatam: o ganho líquido mensal é o mesmo nos dois regimes.";
  }

  if (veredito.cltMelhor) {
    return `CLT é ${Math.abs(veredito.percentualDiferenca)}% mais vantajoso. PJ precisa de R$ ${veredito.pjNecessaria.toFixed(0)}/mês para igualar.`;
  }

  if (!veredito.temBaseParaPercentual) {
    return `PJ é mais vantajoso. Ganho adicional: R$ ${veredito.diferenca.toFixed(2)}/mês.`;
  }

  return `PJ é ${veredito.percentualDiferenca}% mais vantajoso. Ganho adicional: R$ ${veredito.diferenca.toFixed(2)}/mês.`;
}
