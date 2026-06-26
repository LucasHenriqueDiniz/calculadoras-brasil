export interface InssAutonomiInput {
  ganhoMensalBruto: number;
  regimeSimplificado: boolean;
  mesesContribuidos: number;
  taxaRetornoEstimada: number;
}

export interface InssAutonomiResult {
  ganhoMensalBruto: number;
  ganhoAnualBruto: number;
  contribuicaoInssContributinte: number;
  contribuicaoInssSimplificada: number;
  escolhaOtima: "contributinte" | "simplificada";
  economiaAnual: number;
  tempoContribuicaoTotal: number;
  salarioContribuicao: number;
  estimativaAposentadoria: number;
  detalhes: {
    aliquotaEfetivaContributinte: number;
    aliquotaEfetivaSimplificada: number;
  };
}

export function calculateInssAutonomi(input: InssAutonomiInput): InssAutonomiResult {
  const ganhoAnualBruto = input.ganhoMensalBruto * 12;

  // Regime de Contributinte Individual (20%)
  const contribuicaoContributinte = ganhoAnualBruto * 0.2;

  // Regime Simplificado (~11% sobre ganhos)
  const contribuicaoSimplificada = ganhoAnualBruto * 0.11;

  // Definir regime ótimo
  const escolhaOtima =
    contribuicaoSimplificada < contribuicaoContributinte ? "simplificada" : "contributinte";
  const contribuicaoEscolhida =
    escolhaOtima === "simplificada" ? contribuicaoSimplificada : contribuicaoContributinte;
  const economiaAnual = Math.abs(contribuicaoContributinte - contribuicaoSimplificada);

  // Estimar benefício de aposentadoria (simplificado)
  const salarioContribuicao = input.ganhoMensalBruto;
  const tempoContribuicaoTotal = input.mesesContribuidos;

  // Estimativa muito simplificada: 70% do último salário após 35 anos de contribuição
  const estimativaAposentadoria =
    tempoContribuicaoTotal >= 35 * 12 ? salarioContribuicao * 0.7 : salarioContribuicao * 0.5;

  return {
    ganhoMensalBruto: input.ganhoMensalBruto,
    ganhoAnualBruto,
    contribuicaoInssContributinte: contribuicaoContributinte,
    contribuicaoInssSimplificada: contribuicaoSimplificada,
    escolhaOtima,
    economiaAnual,
    tempoContribuicaoTotal,
    salarioContribuicao,
    estimativaAposentadoria,
    detalhes: {
      aliquotaEfetivaContributinte: 20,
      aliquotaEfetivaSimplificada: 11,
    },
  };
}
