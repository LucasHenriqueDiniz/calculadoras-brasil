export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: "guia" | "dica" | "educacao" | "noticia" | "analise";
  imageUrl: string;
  imageAlt: string;
  author: string;
  publishedAt: string;
  readingTime: number;
  keywords: string[];
  faqs: Array<{ question: string; answer: string }>;
}

export const blogPosts: Record<string, BlogPost> = {
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
    readingTime: 6,
    keywords: [
      "como economizar conta de luz",
      "aparelhos que consomem mais energia",
      "dicas de economia de energia",
    ],
    faqs: [
      {
        question: "Quais aparelhos mais consomem energia em casa?",
        answer:
          "Chuveiro elétrico, ar-condicionado, geladeira e máquina de lavar roupa costumam liderar o consumo. O chuveiro sozinho pode representar 20-30% da conta em residências sem aquecimento a gás.",
      },
      {
        question: "Trocar lâmpadas por LED realmente compensa?",
        answer:
          "Sim. Uma lâmpada LED consome até 80% menos energia que uma incandescente e dura muito mais. O investimento se paga em poucos meses, especialmente em cômodos usados várias horas por dia.",
      },
      {
        question: "Vale a pena trocar o chuveiro para o modo verão/inverno?",
        answer:
          "Sim, sempre que a temperatura da água permitir. A resistência no modo verão consome bem menos potência. Ajustar isso no dia a dia é uma das formas mais simples de reduzir a conta.",
      },
      {
        question: "Ar-condicionado ligado a noite toda pesa muito na conta?",
        answer:
          "Pesa bastante, principalmente em aparelhos antigos e sem inversor. Usar o timer, manter a temperatura em 23-24°C e vedar portas/janelas reduz o consumo sem perder o conforto.",
      },
      {
        question: "Como saber quanto cada aparelho consome?",
        answer:
          "Multiplique a potência do aparelho (em watts, geralmente na etiqueta) pelo tempo de uso diário e pela tarifa da sua distribuidora. Nossa calculadora de conta de luz faz essa conta automaticamente para vários aparelhos ao mesmo tempo.",
      },
      {
        question: "Bandeira tarifária vermelha aumenta muito a conta?",
        answer:
          "Sim, a bandeira vermelha patamar 2 pode adicionar mais de R$ 9 a cada 100 kWh consumidos. Acompanhar a bandeira do mês ajuda a entender variações na conta mesmo sem mudar o consumo.",
      },
    ],
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
    readingTime: 7,
    keywords: ["custo pet anual", "quanto custa ter um cachorro", "custos com gato"],
    faqs: [
      {
        question: "Quanto custa ter um cachorro por ano?",
        answer:
          "Em média, entre R$ 3.000 e R$ 8.000 por ano considerando ração, vacinas, banho e tosa, vermífugo e uma reserva para imprevistos veterinários. Raças grandes e de pelo longo custam mais.",
      },
      {
        question: "Gato é mais barato que cachorro?",
        answer:
          "Geralmente sim, pois gatos comem menos ração, não precisam de passeios com profissional e costumam gerar menos gastos com adestramento. Ainda assim, vacinas e castração pesam igual no orçamento.",
      },
      {
        question: "Quais são os custos veterinários mais comuns?",
        answer:
          "Consultas de rotina, vacinas anuais, vermifugação, castração e exames preventivos. Um plano de saúde pet ou uma reserva de emergência de R$ 1.500 a R$ 2.000 evita sustos com cirurgias ou internações.",
      },
      {
        question: "Vale a pena contratar plano de saúde para pet?",
        answer:
          "Vale a pena principalmente para raças com predisposição a problemas de saúde ou para donos que preferem parcelar o custo mensalmente em vez de arcar com um valor alto de uma vez em emergências.",
      },
      {
        question: "Quanto gastar em ração faz diferença no orçamento?",
        answer:
          "Sim, e bastante. Rações premium custam 2 a 3 vezes mais que rações econômicas, mas rendem mais e geram menos problemas de saúde a longo prazo — o que também reduz gastos veterinários.",
      },
      {
        question: "Como estimar o custo real antes de adotar um pet?",
        answer:
          "Some ração mensal, higiene, uma reserva mensal para saúde e custos únicos (castração, vacinas iniciais, microchipagem). Nossa calculadora de custo de pet organiza esses valores e mostra o gasto mensal e anual esperado.",
      },
    ],
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
    readingTime: 8,
    keywords: [
      "assinaturas que valem a pena",
      "Netflix vs Disney",
      "quanto custa todas assinaturas",
    ],
    faqs: [
      {
        question: "Quanto os brasileiros gastam em média com assinaturas por mês?",
        answer:
          "Um lar com streaming de vídeo, música e um ou dois serviços extras (nuvem, academia, software) costuma somar entre R$ 150 e R$ 400 por mês. Muita gente não percebe esse total porque os valores são cobrados separadamente.",
      },
      {
        question: "Vale a pena assinar vários streamings de vídeo ao mesmo tempo?",
        answer:
          "Só compensa se você realmente assiste ao catálogo de cada um. Uma alternativa comum é revezar assinaturas mês a mês, mantendo apenas 1-2 ativas por vez e cancelando as demais.",
      },
      {
        question: "Como saber se uma assinatura vale o preço?",
        answer:
          "Divida o valor mensal pela quantidade de vezes que você realmente usa o serviço no mês. Se o custo por uso ficar alto comparado a uma alternativa avulsa, provavelmente não vale a pena manter.",
      },
      {
        question: "Planos anuais são sempre mais baratos que mensais?",
        answer:
          "Na maioria dos serviços sim, com desconto de 15% a 30% frente ao plano mensal. Mas só vale a pena se você tiver certeza de que vai usar o serviço por pelo menos a maior parte do ano.",
      },
      {
        question: "Assinatura compartilhada em família compensa?",
        answer:
          "Compensa bastante quando o serviço permite múltiplos perfis ou usuários, dividindo o custo por pessoa. Verifique sempre os termos de uso, já que muitos serviços restringem o compartilhamento entre endereços diferentes.",
      },
      {
        question: "Como organizar e controlar todas as minhas assinaturas?",
        answer:
          "Liste todas em uma planilha com valor, data de cobrança e frequência de uso real. Revise a cada 3 meses e cancele o que não estiver gerando valor proporcional ao custo.",
      },
    ],
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
    readingTime: 8,
    keywords: [
      "deduções IRPF",
      "descontar imposto de renda",
      "despesas dedutíveis IRPF",
      "pagar menos imposto",
    ],
    faqs: [
      {
        question: "Quais são as deduções de IRPF mais esquecidas?",
        answer:
          "Educação continuada (cursos e idiomas), consultas com dentista e oftalmologista, medicamentos com receita, sessões de psicólogo/psiquiatra e contribuições à previdência complementar (PGBL) costumam ficar de fora por desconhecimento.",
      },
      {
        question: "Despesas com saúde têm limite de dedução?",
        answer:
          "Não. Despesas médicas e odontológicas comprovadas são 100% dedutíveis, sem teto. É a categoria de dedução mais generosa da declaração completa.",
      },
      {
        question: "Cursos online e idiomas contam como dedução de educação?",
        answer:
          "Sim, desde que sejam instituições regularmente autorizadas e você guarde o comprovante de pagamento. O limite anual de dedução com educação é de R$ 3.561,50 por pessoa em 2026.",
      },
      {
        question: "Preciso guardar comprovante de tudo que deduzo?",
        answer:
          "Sim, por pelo menos 5 anos. A Receita Federal pode solicitar comprovação em malha fina, e sem nota fiscal ou recibo válido a dedução é glosada e você pode pagar imposto retroativo com multa.",
      },
      {
        question: "Vale a pena contribuir para PGBL só para deduzir imposto?",
        answer:
          "Pode valer, desde que você já declare pelo modelo completo e contribua até 12% da renda bruta anual. É uma das poucas formas de reduzir o imposto devido agora enquanto acumula para a aposentadoria.",
      },
      {
        question: "Quanto dá para economizar usando essas deduções esquecidas?",
        answer:
          "Cada R$ 1.000 em deduções válidas reduz o imposto entre R$ 75 e R$ 275, dependendo da sua alíquota marginal. Somando várias categorias esquecidas, a economia anual pode passar de R$ 1.000.",
      },
    ],
  },

  "contador-necessario-pj": {
    slug: "contador-necessario-pj",
    title: "Contador é Necessário para PJ?",
    description: "Quando contratar contador como PJ, custo, e como economizar.",
    category: "dica",
    imageUrl: "/blog/contador.jpg",
    imageAlt: "Contador e documentos contábeis",
    author: "Calcule Brasil",
    publishedAt: "2026-07-01",
    readingTime: 6,
    keywords: ["contador PJ", "custo contador", "imposto PJ", "contabilidade"],
    faqs: [
      {
        question: "É obrigatório ter contador sendo PJ?",
        answer:
          "Para empresas no Lucro Real, sim, é obrigatório por lei. No Simples Nacional e no MEI não é obrigatório, mas é altamente recomendado a partir do momento em que a empresa tem faturamento relevante ou funcionários.",
      },
      {
        question: "Quanto custa um contador para PJ pequeno?",
        answer:
          "No Simples Nacional, o valor típico fica entre R$ 300 e R$ 500 por mês. No Lucro Real, por causa da complexidade contábil, o custo sobe para R$ 600 a R$ 1.500 mensais ou mais, dependendo do volume de notas.",
      },
      {
        question: "O que exatamente um contador faz pelo PJ?",
        answer:
          "Apura e recolhe os impostos (DAS, IRPJ, CSLL), prepara a declaração anual (DEFIS ou ECF), organiza a folha de pró-labore, orienta sobre deduções permitidas e mantém a empresa regularizada perante o Fisco.",
      },
      {
        question: "MEI precisa de contador?",
        answer:
          "Na maioria dos casos não, já que o MEI paga um valor fixo mensal (DAS) e faz uma declaração anual simples (DASN-SIMEI) que pode ser feita pelo próprio empreendedor sem grandes dificuldades.",
      },
      {
        question: "Como saber se estou pagando caro demais pelo contador?",
        answer:
          "Compare pelo menos 3 orçamentos de escritórios de contabilidade na sua região e pergunte exatamente quais serviços estão incluídos (folha, impostos, consultoria). Preços muito baixos costumam vir com atendimento limitado.",
      },
      {
        question: "Um bom contador realmente compensa o custo mensal?",
        answer:
          "Na maioria dos casos sim. Um contador experiente identifica deduções, evita multas por erro de apuração e escolhe o regime tributário mais vantajoso, economias que costumam superar o valor do honorário mensal.",
      },
    ],
  },

  "despesas-dedutiveis-autonomo": {
    slug: "despesas-dedutiveis-autonomo",
    title: "Despesas Dedutíveis para Autônomo: O Guia Completo",
    description:
      "Descubra quais gastos um autônomo pode descontar do IRPF: equipamentos, combustível, aluguel do espaço de trabalho, internet e comprovação exigida.",
    category: "guia",
    imageUrl: "/blog/despesas-dedutiveis-autonomo.jpg",
    imageAlt: "Autônomo organizando comprovantes de despesas dedutíveis",
    author: "Calcule Brasil",
    publishedAt: "2026-07-07",
    readingTime: 8,
    keywords: [
      "despesas dedutíveis autônomo",
      "dedução IRPF autônomo",
      "o que autônomo pode descontar",
      "carnê-leão despesas",
    ],
    faqs: [
      {
        question: "Quais despesas um autônomo pode deduzir do IRPF?",
        answer:
          "Equipamentos e ferramentas de trabalho, combustível e manutenção do veículo usado profissionalmente (proporcional ao uso), aluguel do espaço de trabalho (proporcional), material de consumo e cursos da área de atuação.",
      },
      {
        question: "Como funciona a dedução do aluguel de home office?",
        answer:
          "Você pode deduzir a proporção do aluguel referente ao espaço usado exclusivamente para o trabalho. Por exemplo, se o escritório ocupa 1/4 da casa, é possível descontar 25% do valor do aluguel.",
      },
      {
        question: "Internet e telefone são totalmente dedutíveis?",
        answer:
          "Normalmente apenas parcialmente, proporcional ao uso profissional estimado. Guarde as faturas mensais, pois a Receita pode solicitar comprovação em caso de auditoria.",
      },
      {
        question: "Preciso de nota fiscal para todas as despesas?",
        answer:
          "Sim. Sem nota fiscal, recibo ou comprovante equivalente, a dedução pode ser glosada em uma malha fina, resultando em cobrança do imposto não pago com multa e juros.",
      },
      {
        question: "Cursos e capacitação profissional entram como dedução?",
        answer:
          "Sim, desde que diretamente relacionados à sua atividade profissional. Guarde o comprovante de pagamento e a descrição do curso para eventual comprovação.",
      },
      {
        question: "Onde eu declaro essas despesas no carnê-leão?",
        answer:
          "No livro-caixa do carnê-leão, informando cada despesa dedutível junto com o comprovante correspondente. O sistema calcula automaticamente a base de cálculo do IRPF já descontando essas despesas.",
      },
    ],
  },

  "investimentos-isentos-irpf": {
    slug: "investimentos-isentos-irpf",
    title: "Investimentos Isentos de IRPF em 2026: Guia Completo",
    description:
      "Conheça investimentos que não pagam imposto de renda no Brasil: poupança, LCI, LCA e debêntures incentivadas, além de como o Tesouro Direto é tributado.",
    category: "guia",
    imageUrl: "/blog/investimentos-isentos-irpf.jpg",
    imageAlt: "Investimentos isentos de imposto de renda",
    author: "Calcule Brasil",
    publishedAt: "2026-07-11",
    readingTime: 8,
    keywords: [
      "investimentos isentos IRPF",
      "poupança LCI LCA",
      "debêntures incentivadas",
      "Tesouro Direto imposto",
    ],
    faqs: [
      {
        question: "Quais investimentos são totalmente isentos de IRPF?",
        answer:
          "Poupança, LCI (Letra de Crédito Imobiliário) e LCA (Letra de Crédito Agropecuário) são isentas de imposto de renda para pessoa física, independente do prazo de aplicação.",
      },
      {
        question: "LCI e LCA rendem mais que a poupança?",
        answer:
          "Normalmente sim. LCI e LCA costumam render entre 90% e 95% da taxa DI, enquanto a poupança rende cerca de 70% da Selic (quando a Selic está acima de 8,5% ao ano), tornando-as mais competitivas para valores maiores.",
      },
      {
        question: "Debêntures incentivadas são totalmente isentas?",
        answer:
          "Não, apenas parcialmente. Costumam ter isenção de 50% a 75% dependendo da estrutura da emissão, mas ainda assim rendem acima da média por incentivarem investimento em infraestrutura.",
      },
      {
        question: "Tesouro Direto paga imposto de renda?",
        answer:
          "Sim, segue a tabela regressiva: 22,5% para resgates em até 6 meses, caindo gradualmente até 15% para prazos acima de 2 anos. Quanto mais tempo você mantém o investimento, menor o imposto.",
      },
      {
        question: "Vale a pena migrar tudo para investimentos isentos?",
        answer:
          "Depende do seu perfil de risco e liquidez necessária. Isenção de IR aumenta o rendimento líquido, mas diversificar entre isentos e tributados (como Tesouro Direto) ajuda a equilibrar segurança, liquidez e retorno.",
      },
      {
        question: "Existe limite de valor para investir em LCI e LCA?",
        answer:
          "Não há limite legal de valor, mas cada instituição financeira define o valor mínimo de aplicação e o prazo de carência, que costuma variar de 90 dias a alguns anos conforme o produto.",
      },
    ],
  },
};

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts[slug];
}

export const blogCategoryLabels: Record<BlogPost["category"], string> = {
  guia: "Guias",
  analise: "Análises",
  dica: "Dicas rápidas",
  educacao: "Fundamentos",
  noticia: "Notícias",
};

/** Every post, newest first. Drives the blog index, which is what keeps the posts linked. */
export function listBlogPosts(): BlogPost[] {
  return Object.values(blogPosts).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
