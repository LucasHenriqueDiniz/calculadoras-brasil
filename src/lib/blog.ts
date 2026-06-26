export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: "guia" | "dica" | "educacao" | "noticia" | "analise";
  imageUrl: string;
  imageAlt: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  readingTime: number;
  keywords: string[];
  faqs: Array<{ question: string; answer: string }>;
}

export const blogPosts: Record<string, BlogPost> = {
  "quanto-custa-ter-carro": {
    slug: "quanto-custa-ter-carro",
    title: "Quanto custa ter um carro no Brasil em 2024",
    description:
      "Guia completo dos custos reais de manter um carro: combustível, IPVA, seguro, manutenção e depreciação. Inclui dicas de economia.",
    category: "guia",
    imageUrl: "/blog/carro-custo.jpg",
    imageAlt: "Custos mensais de ter um carro",
    author: "Calcule Brasil",
    publishedAt: "2026-06-25",
    updatedAt: "2026-06-25",
    readingTime: 8,
    keywords: [
      "quanto custa ter um carro",
      "custo mensal carro",
      "IPVA seguro combustível",
      "manutenção carro",
    ],
    faqs: [
      {
        question: "Qual é o custo mensal médio de um carro?",
        answer:
          "Em média, um carro popular no Brasil custa entre R$ 1.200 e R$ 2.500 por mês, incluindo combustível, IPVA, seguro, licenciamento e manutenção. Este valor varia bastante conforme o modelo, uso e cidade.",
      },
      {
        question: "Como calcular o custo por km de um carro?",
        answer:
          "Some todos os custos mensais (combustível + IPVA/12 + seguro/12 + manutenção + estacionamento + depreciação) e divida pelos quilômetros rodados. Exemplo: R$2.000/mês ÷ 800 km = R$2,50 por km.",
      },
      {
        question: "IPVA é realmente tão caro?",
        answer:
          "Varia conforme a alíquota do estado (2-4%) e o valor do veículo. Um carro de R$50.000 paga entre R$1.000 e R$2.000 de IPVA anualmente. Nossa calculadora mostra o impacto exato.",
      },
      {
        question: "Qual é mais barato: gasolina ou etanol?",
        answer:
          "A regra dos 70% funciona bem: etanol compensa se custar até 70% do preço da gasolina. Mas depende do consumo do seu carro específico. Use nossa calculadora para simular.",
      },
      {
        question: "Vale a pena leasing em vez de comprar?",
        answer:
          "Leasing pode ser mais barato se você rodar pouco (<1.000 km/mês) e não quer manutenção. Para quem roda mais, comprar e manter costuma ser mais econômico a longo prazo.",
      },
      {
        question: "Como reduzir o custo de manutenção?",
        answer:
          "Faça revisões preventivas no prazo, use óleo de boa qualidade, mantenha pneus calibrados e evite multas (contam como custo). Carros bem mantidos têm menos problemas caros.",
      },
      {
        question: "Seguro de carro é obrigatório?",
        answer:
          "Sim, apenas o DPVAT é obrigatório por lei (cobre acidentes). Seguro completo é opcional mas recomendado. Protege seu investimento contra roubo, colisão e terceiros.",
      },
      {
        question: "A depreciação afeta meu orçamento?",
        answer:
          "Sim. Um carro perde ~15-20% do valor no primeiro ano. Mesmo sem gastar dinheiro, seu patrimônio diminui. Nossa calculadora desmistifica esse custo invisível.",
      },
    ],
  },

  "quanto-custa-morar-sozinho": {
    slug: "quanto-custa-morar-sozinho",
    title: "Quanto custa morar sozinho - Guia 2024",
    description:
      "Descobrir quanto custa sair de casa e morar sozinho. Custos iniciais, mensais, por cidade e dicas de economia.",
    category: "guia",
    imageUrl: "/blog/morar-sozinho.jpg",
    imageAlt: "Custo mensal de morar sozinho",
    author: "Calcule Brasil",
    publishedAt: "2026-06-25",
    updatedAt: "2026-06-25",
    readingTime: 10,
    keywords: [
      "quanto custa morar sozinho",
      "custo aluguel condomínio",
      "primeira vez saindo de casa",
    ],
    faqs: [],
  },

  "como-economizar-conta-de-luz": {
    slug: "como-economizar-conta-de-luz",
    title: "Como economizar na conta de luz",
    description:
      "10 dicas práticas para reduzir sua conta de luz. Descubra quais aparelhos consomem mais e quanto custa cada um.",
    category: "dica",
    imageUrl: "/blog/economia-luz.jpg",
    imageAlt: "Dicas para economizar energia",
    author: "Calcule Brasil",
    publishedAt: "2026-06-25",
    updatedAt: "2026-06-25",
    readingTime: 6,
    keywords: [
      "como economizar conta de luz",
      "aparelhos que consomem mais energia",
      "dicas de economia de energia",
    ],
    faqs: [],
  },

  "custo-pet-anual": {
    slug: "custo-pet-anual",
    title: "Quanto custa cuidar de um pet por ano",
    description:
      "Guia completo de custos com pets. Ração, veterinário, higiene, vacinas e seguro. Descubra o custo anual real de adotar.",
    category: "guia",
    imageUrl: "/blog/custo-pet.jpg",
    imageAlt: "Custo anual de cuidar de um pet",
    author: "Calcule Brasil",
    publishedAt: "2026-06-25",
    updatedAt: "2026-06-25",
    readingTime: 7,
    keywords: ["custo pet anual", "quanto custa ter um cachorro", "custos com gato"],
    faqs: [],
  },

  "assinaturas-que-valem-a-pena": {
    slug: "assinaturas-que-valem-a-pena",
    title: "Assinaturas que realmente valem a pena",
    description:
      "Análise de quais assinaturas oferecem melhor custo-benefício. Streaming, software, academia e mais. Quanto você realmente gasta?",
    category: "analise",
    imageUrl: "/blog/assinaturas.jpg",
    imageAlt: "Análise de assinaturas que valem a pena",
    author: "Calcule Brasil",
    publishedAt: "2026-06-25",
    updatedAt: "2026-06-25",
    readingTime: 8,
    keywords: [
      "assinaturas que valem a pena",
      "Netflix vs Disney",
      "quanto custa todas assinaturas",
    ],
    faqs: [],
  },

  "calculadora-irpf-2026": {
    slug: "calculadora-irpf-2026",
    title: "Calculadora IRPF 2026: Quanto Você Deve Pagar",
    description:
      "Guia completo sobre IRPF 2026. Entenda as alíquotas progressivas, deduções permitidas, dependentes e como calcular seu imposto de renda.",
    category: "guia",
    imageUrl: "/blog/irpf-2026.jpg",
    imageAlt: "Calculadora IRPF 2026 - Imposto de Renda",
    author: "Calcule Brasil",
    publishedAt: "2026-06-25",
    updatedAt: "2026-06-25",
    readingTime: 12,
    keywords: [
      "calculadora IRPF 2026",
      "imposto de renda pessoa física",
      "alíquota IRPF 2026",
      "deduções IRPF permitidas",
      "dependentes IRPF",
      "quanto pagar de imposto",
    ],
    faqs: [
      {
        question: "Como funciona o cálculo do IRPF 2026?",
        answer:
          "O IRPF segue uma tabela progressiva: até R$ 21.503/ano isento, depois 7,5% até 15%, 22,5% e 27,5% nas maiores rendas. Você deduz INSS, deduções permitidas (educação, saúde, previdência) e dependentes antes de aplicar a alíquota.",
      },
      {
        question: "Qual é a alíquota IRPF para cada faixa salarial?",
        answer:
          "Até R$ 21.503/ano: 0% (isento). De R$ 21.503 a R$ 33.503: 7,5%. De R$ 33.503 a R$ 44.694: 15%. De R$ 44.694 a R$ 55.472: 22,5%. Acima de R$ 55.472: 27,5%. Essas faixas foram atualizadas em 2026.",
      },
      {
        question: "Dependentes reduzem meu IRPF?",
        answer:
          "Sim, cada dependente reduz R$ 2.275 da base imponível em 2026. Cônjuge, filhos até 21 anos (ou 24 se estudante), pais, irmãos menores contam. A redução é significativa se tiver vários dependentes.",
      },
      {
        question: "Educação é dedutível no IRPF?",
        answer:
          "Sim. Gastos com educação (pública, privada, uniforme, transporte escolar) são dedutíveis até o limite de R$ 3.561,50/ano em 2026. Inclua sua educação e de dependentes.",
      },
      {
        question: "Saúde é dedutível no IRPF?",
        answer:
          "Sim, completamente. Sem limite legal: consultas, exames, medicamentos, hospitais, plano de saúde, dentista — tudo entra. Mantenha comprovantes de todas as despesas.",
      },
      {
        question: "Vale a pena usar o regime simplificado?",
        answer:
          "Depende. Regime simplificado: dedução fixa de 20,5% da renda bruta. Regime completo: deduções reais (educação, saúde, previdência). Se tem muitos gastos dedutíveis, completo vale mais. Nossa calculadora compara para você.",
      },
      {
        question: "Quando devo declarar IRPF?",
        answer:
          "A declaração de 2026 é feita em 2027 (entre março e abril). Precisa declarar se teve renda > R$ 28.559,70 ou atividade profissional. Fique atento aos prazos divulgados pela Receita Federal.",
      },
      {
        question: "Como funciona o desconto INSS na calculadora?",
        answer:
          "Se empregado CLT, o INSS (8-11%) é retido na folha de pagamento automaticamente. A calculadora desconta 10% como média. Autônomos pagam diretamente à Receita Federal (alíquota conforme a categoria).",
      },
      {
        question: "Previdência complementar é dedutível?",
        answer:
          "Sim, até o limite de R$ 63.454/ano em 2026 (aproximadamente 13% da renda bruta). Contribuições a PGBL, VGBL, fundos de pensão entram como deduções.",
      },
      {
        question: "E se meu resultado for negativo? Ganho restituição?",
        answer:
          "Sim! Se o valor calculado for negativo, você tem direito à restituição (devolução de imposto pago em excesso). A Receita Federal restitui em até 3 parcelas mensais.",
      },
    ],
  },

  "guia-irpf-2026": {
    slug: "guia-irpf-2026",
    title: "Guia Completo: IRPF 2026 para Brasileiros",
    description:
      "Tudo que você precisa saber sobre IRPF 2026: alíquotas progressivas, dependentes, deduções, regimes de tributação e como reduzir imposto legalmente.",
    category: "guia",
    imageUrl: "/blog/guia-irpf.jpg",
    imageAlt: "Guia completo IRPF 2026",
    author: "Calcule Brasil",
    publishedAt: "2026-06-26",
    updatedAt: "2026-06-26",
    readingTime: 18,
    keywords: [
      "guia IRPF 2026",
      "alíquota IRPF",
      "imposto de renda pessoa física",
      "como pagar menos IRPF",
      "dependentes e IRPF",
      "deduções permitidas",
    ],
    faqs: [
      {
        question: "Qual é a alíquota IRPF para quem ganha R$ 50.000/ano?",
        answer:
          "Não é uma alíquota única. Você paga 0% até R$ 21.503, depois 7,5%, 15%, 22,5% conforme cada faixa. Alíquota efetiva fica em torno de 10-12%, bem menor que a marginal de 22,5%.",
      },
      {
        question: "Dependentes realmente reduzem IRPF?",
        answer:
          "Sim, cada dependente reduz R$ 2.275 da base imponível em 2026. Com 2 filhos, você já economiza R$ 4.550. Efeito significativo na hora do imposto.",
      },
      {
        question: "Qual regime é melhor para mim: completo ou simplificado?",
        answer:
          "Depende. Se tem muito gasto com educação/saúde, completo é melhor. Se tem pouco, simplificado (20,5% dedução fixa) é mais fácil e pode ser melhor. Use calculadora para comparar.",
      },
    ],
  },

  "salario-liquido-entenda": {
    slug: "salario-liquido-entenda",
    title: "Salário Líquido: Entenda Seus Descontos e o que Realmente Você Ganha",
    description:
      "Descubra de onde saem os descontos do seu salário: IRPF, INSS, sindicato e como calcular seu salário líquido real com base no bruto.",
    category: "guia",
    imageUrl: "/blog/salario-liquido.jpg",
    imageAlt: "Desconto de salário líquido",
    author: "Calcule Brasil",
    publishedAt: "2026-06-27",
    updatedAt: "2026-06-27",
    readingTime: 16,
    keywords: [
      "salário líquido",
      "salário bruto",
      "desconto salário",
      "IRPF desconto",
      "INSS desconto",
      "como calcular salário líquido",
    ],
    faqs: [],
  },

  "quanto-custa-ser-autonomo": {
    slug: "quanto-custa-ser-autonomo",
    title: "Quanto Custa Ser Autônomo no Brasil em 2026",
    description:
      "Guia completo sobre custos de ser autônomo: INSS autônomo, IRPF, deduções fiscais, recibos e quanto você realmente fica com seu ganho.",
    category: "guia",
    imageUrl: "/blog/autonomo.jpg",
    imageAlt: "Custos de ser autônomo no Brasil",
    author: "Calcule Brasil",
    publishedAt: "2026-06-28",
    updatedAt: "2026-06-28",
    readingTime: 15,
    keywords: [
      "autônomo",
      "INSS autônomo",
      "imposto autônomo",
      "ganho autônomo",
      "recibo autônomo",
      "custo ser autônomo",
    ],
    faqs: [],
  },

  "deducoes-irpf-esqueca": {
    slug: "deducoes-irpf-esqueca",
    title: "Deduções IRPF que Você Esquece de Descontar",
    description:
      "Descubra deduções IRPF que muitos brasileiros esquecem: educação, saúde, previdência, dependentes e recibos que reduzem imposto legalmente.",
    category: "guia",
    imageUrl: "/blog/deducoes-irpf.jpg",
    imageAlt: "Deduções do IRPF organizadas por categoria",
    author: "Calcule Brasil",
    publishedAt: "2026-07-01",
    updatedAt: "2026-07-01",
    readingTime: 8,
    keywords: [
      "deduções IRPF",
      "descontar imposto de renda",
      "despesas dedutíveis IRPF",
      "pagar menos imposto",
    ],
    faqs: [],
  },

  "dependentes-irpf-economia": {
    slug: "dependentes-irpf-economia",
    title: "Dependentes IRPF: Como Reduzem Imposto",
    description:
      "Entenda quem pode ser dependente no IRPF, quanto cada dependente reduz da base de cálculo e como evitar dupla declaração.",
    category: "guia",
    imageUrl: "/blog/dependentes-irpf.jpg",
    imageAlt: "Família revisando dependentes no imposto de renda",
    author: "Calcule Brasil",
    publishedAt: "2026-07-02",
    updatedAt: "2026-07-02",
    readingTime: 6,
    keywords: [
      "dependentes IRPF",
      "dependente imposto de renda",
      "reduzir IRPF com dependentes",
      "dedução dependente IRPF",
    ],
    faqs: [],
  },

  "recibo-rpa-autonomo": {
    slug: "recibo-rpa-autonomo",
    title: "Como Emitir Recibo de Autônomo (RPA) em 2026",
    description:
      "Guia prático para emitir recibo de autônomo, registrar valores, informar descontos de INSS e IRPF e manter comprovantes organizados.",
    category: "guia",
    imageUrl: "/blog/rpa-autonomo.jpg",
    imageAlt: "Recibo de pagamento autônomo preenchido",
    author: "Calcule Brasil",
    publishedAt: "2026-07-03",
    updatedAt: "2026-07-03",
    readingTime: 8,
    keywords: [
      "RPA autônomo",
      "recibo de pagamento autônomo",
      "como emitir RPA",
      "imposto autônomo",
    ],
    faqs: [],
  },

  "negociar-salario-melhor": {
    slug: "negociar-salario-melhor",
    title: "Como Negociar Salário Melhor: Estratégia Baseada em Dados",
    description:
      "Aprenda a negociar salário considerando valor bruto, salário líquido, descontos obrigatórios e benefícios que aumentam sua renda real.",
    category: "guia",
    imageUrl: "/blog/negociar-salario.jpg",
    imageAlt: "Pessoa negociando salário com dados financeiros",
    author: "Calcule Brasil",
    publishedAt: "2026-07-04",
    updatedAt: "2026-07-04",
    readingTime: 7,
    keywords: [
      "negociar salário",
      "salário bruto e líquido",
      "proposta salarial",
      "como pedir aumento",
    ],
    faqs: [],
  },
  "planejamento-tributario": {
    slug: "planejamento-tributario",
    title: "Planejamento Tributário Pessoal: Estratégias Legais para Reduzir Imposto",
    description:
      "Estratégias legais de planejamento tributário para pessoa física: previdência, investimentos, regime fiscal e como economizar imposto.",
    category: "guia",
    imageUrl: "/blog/planejamento.jpg",
    imageAlt: "Planejamento tributário pessoal",
    author: "Calcule Brasil",
    publishedAt: "2026-06-29",
    updatedAt: "2026-06-29",
    readingTime: 17,
    keywords: [
      "planejamento tributário",
      "reduzir imposto",
      "estratégia fiscal",
      "previdência complementar",
      "investimentos isentos",
      "economia tributária",
    ],
    faqs: [],
  },

  "clt-vs-pj-comparacao": {
    slug: "clt-vs-pj-comparacao",
    title: "CLT vs PJ: Qual Regime Vale Mais a Pena em 2026",
    description:
      "Análise completa: CLT vs PJ. Compare salário líquido, benefícios, impostos e veja qual regime é mais vantajoso para você.",
    category: "guia",
    imageUrl: "/blog/clt-pj.jpg",
    imageAlt: "Comparação CLT vs PJ",
    author: "Calcule Brasil",
    publishedAt: "2026-06-30",
    updatedAt: "2026-06-30",
    readingTime: 16,
    keywords: [
      "CLT vs PJ",
      "quando virar PJ",
      "salário PJ",
      "benefícios CLT",
      "imposto PJ",
      "ganho líquido CLT PJ",
    ],
    faqs: [],
  },

  "contador-necessario-pj": {
    slug: "contador-necessario-pj",
    title: "Contador é Necessário para PJ?",
    description: "Quando contratar contador como PJ, custo, e como economizar.",
    category: "referencia",
    imageUrl: "/blog/contador.jpg",
    author: "Calcule Brasil",
    publishedAt: "2026-07-01",
    updatedAt: "2026-07-01",
    readingTime: 6,
    keywords: ["contador PJ", "custo contador", "imposto PJ", "contabilidade"],
    faqs: [],
  },

  "tabela-irpf-2026-completa": {
    slug: "tabela-irpf-2026-completa",
    title: "Tabela IRPF 2026 Completa",
    description: "Tabela de alíquotas IRPF 2026, deduções dependentes, limites de isenção.",
    category: "referencia",
    imageUrl: "/blog/tabela.jpg",
    author: "Calcule Brasil",
    publishedAt: "2026-07-02",
    updatedAt: "2026-07-02",
    readingTime: 5,
    keywords: ["tabela IRPF", "alíquota IRPF 2026", "limite isenção"],
    faqs: [],
  },

  "formal-vs-informal": {
    slug: "formal-vs-informal",
    title: "Autônomo Formal vs Informal",
    description: "Diferenças e custos: ser autônomo registrado vs informal.",
    category: "guia",
    imageUrl: "/blog/formal.jpg",
    author: "Calcule Brasil",
    publishedAt: "2026-07-03",
    updatedAt: "2026-07-03",
    readingTime: 6,
    keywords: ["autônomo formal", "MEI", "autônomo informal", "contribuição INSS"],
    faqs: [],
  },

  "como-calcular-salario-pj": {
    slug: "como-calcular-salario-pj",
    title: "Como Calcular Salário PJ",
    description: "Passo a passo: calcule seu salário PJ descontando INSS, IRPF, contador.",
    category: "guia",
    imageUrl: "/blog/calculo-pj.jpg",
    author: "Calcule Brasil",
    publishedAt: "2026-07-04",
    updatedAt: "2026-07-04",
    readingTime: 7,
    keywords: ["salário PJ", "como calcular PJ", "ganho líquido PJ", "imposto PJ"],
    faqs: [],
  },

  "simplificado-vs-completo": {
    slug: "simplificado-vs-completo",
    title: "IRPF Simplificado vs Completo: Qual Escolher?",
    description: "Comparação: regime simplificado (20,5% dedução fixa) vs completo (deduções reais).",
    category: "guia",
    imageUrl: "/blog/regimes.jpg",
    author: "Calcule Brasil",
    publishedAt: "2026-07-05",
    updatedAt: "2026-07-05",
    readingTime: 6,
    keywords: ["regime simplificado", "regime completo", "IRPF 2026", "dedução IRPF"],
    faqs: [],
  },
};

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts[slug];
}
