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
    keywords: [
      "custo pet anual",
      "quanto custa ter um cachorro",
      "custos com gato",
    ],
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
};

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts[slug];
}
