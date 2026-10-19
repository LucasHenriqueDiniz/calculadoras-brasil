/**
 * The /calculadoras page, organised by the decision a visitor is making rather
 * than by topic. The home page already lists every calculator by name; this is
 * what makes the hub say something the home page does not, which is the reason
 * Google stopped treating it as an empty page (Soft 404 on 2026-10-18).
 *
 * Every calculator must appear in at least one situation, and every slug must
 * exist: `tests/calculator-guide.test.ts` holds both.
 */
export interface GuideStep {
  /** A calculator slug from `calculators`. */
  calculator: string;
  /** When this calculator is the right one, in this situation. */
  why: string;
}

export interface GuideExtraLink {
  to: "/comparar/energia";
  title: string;
  why: string;
}

export interface GuideSituation {
  id: string;
  title: string;
  intro: string;
  steps: GuideStep[];
  extra?: GuideExtraLink;
}

export const calculatorGuide: GuideSituation[] = [
  {
    id: "sair-de-casa",
    title: "Vou sair de casa",
    intro:
      "O que mais surpreende quem sai da casa dos pais raramente é o aluguel: é tudo o que vem junto com ele e o custo de chegar ao imóvel novo. Vale fazer as contas nesta ordem.",
    steps: [
      {
        calculator: "morar-sozinho",
        why: "Comece aqui. Some aluguel, condomínio, contas básicas, internet, mercado e uma reserva para imprevistos, e veja quanto do salário isso consome todo mês.",
      },
      {
        calculator: "custo-mudanca",
        why: "Depois, o custo de chegar: caminhão, embalagens, taxas do imóvel novo, móveis e as primeiras contas, que vencem antes de a rotina se ajustar.",
      },
      {
        calculator: "conta-de-luz",
        why: "Para não estimar a luz no chute: liste os aparelhos que vão com você e veja o consumo em kWh e o custo de cada um.",
      },
    ],
  },
  {
    id: "proposta-de-emprego",
    title: "Recebi uma proposta de emprego",
    intro:
      "O número da proposta quase nunca é o que cai na conta. Antes de comparar ofertas, leve todas para a mesma base: o valor líquido.",
    steps: [
      {
        calculator: "salario-liquido",
        why: "Transforma o salário bruto no que você recebe de fato, descontando INSS, imposto de renda retido e contribuição sindical, já com a redução do imposto que vale a partir de 2026.",
      },
      {
        calculator: "clt-vs-pj",
        why: "Se a proposta é como PJ, compara o líquido dos dois regimes e calcula quanto a nota fiscal mensal precisa valer para empatar com o salário CLT.",
      },
      {
        calculator: "beneficios-fiscais",
        why: "Se a proposta inclui vale-refeição ou vale-transporte, mostra quanto de salário em dinheiro seria preciso para chegar ao mesmo valor, na alíquota de imposto que você informar.",
      },
    ],
  },
  {
    id: "conta-propria",
    title: "Trabalho por conta própria",
    intro:
      "Sem empregador, a contribuição ao INSS e a poupança para a aposentadoria passam a ser decisões suas, e cada escolha tem um custo mensal agora e uma consequência mais adiante.",
    steps: [
      {
        calculator: "inss-autonomo",
        why: "Calcula a contribuição pelo plano normal de 20% ou pelo simplificado de 11%, e o que cada um muda na aposentadoria.",
      },
      {
        calculator: "previdencia-complementar",
        why: "Projeta quanto uma contribuição mensal em PGBL ou VGBL acumula no prazo que você escolher, e quanto do imposto de renda ela pode reduzir.",
      },
    ],
  },
  {
    id: "imposto-de-renda",
    title: "Quero saber quanto vou pagar de imposto de renda",
    intro:
      "A tabela progressiva sozinha não responde a pergunta: dependentes, despesas dedutíveis e a escolha entre o desconto simplificado e as deduções legais mudam o resultado.",
    steps: [
      {
        calculator: "irpf-2026",
        why: "Simula o imposto do ano com dependentes e despesas de saúde e educação, no regime que você escolher, e mostra em linha própria a redução criada pela Lei 15.270/2025.",
      },
    ],
  },
  {
    id: "carro",
    title: "Estou pensando em comprar um carro",
    intro:
      "A parcela do financiamento é a parte do custo que o vendedor mostra. O resto chega depois, todo mês e todo ano.",
    steps: [
      {
        calculator: "custo-carro",
        why: "Reúne combustível, IPVA, seguro, manutenção e depreciação em um custo mensal, o número para pôr ao lado da parcela antes de assinar.",
      },
    ],
  },
  {
    id: "pet",
    title: "Vou adotar um pet",
    intro:
      "O custo de um animal não termina na adoção ou na compra: alimentação, cuidados e saúde viram uma despesa fixa por muitos anos.",
    steps: [
      {
        calculator: "custo-pet",
        why: "Soma ração, banho, vacinas, vermífugo, brinquedos e plano de saúde em uma estimativa mensal, antes de o animal chegar em casa.",
      },
    ],
  },
  {
    id: "gastos-fixos",
    title: "Quero cortar gastos fixos",
    intro:
      "Gastos pequenos e recorrentes passam despercebidos justamente porque nenhum deles, sozinho, parece grande. Somados ao longo de um ano, costumam ser.",
    steps: [
      {
        calculator: "assinaturas",
        why: "Liste streaming, aplicativos, academia e cursos e veja quanto todos juntos custam por mês e por ano.",
      },
      {
        calculator: "conta-de-luz",
        why: "Mostra quais aparelhos pesam mais na conta, que é por onde a economia começa.",
      },
    ],
    extra: {
      to: "/comparar/energia",
      title: "Energia solar vs rede da concessionária",
      why: "Se a conta de luz é alta e estável, compara quanto custa um sistema solar, quanto ele economiza e em quantos anos se paga.",
    },
  },
];
