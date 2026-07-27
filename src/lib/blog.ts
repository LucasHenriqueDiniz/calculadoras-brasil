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
    faqs: [
      {
        question: "Quanto custa em média morar sozinho no Brasil?",
        answer:
          "Depende muito da cidade e do padrão de vida, mas a maioria das pessoas gasta entre R$ 1.800 e R$ 3.500 por mês somando aluguel, condomínio, contas e alimentação em capitais. Em cidades menores, o custo pode cair pela metade.",
      },
      {
        question: "Quais são os custos iniciais para sair de casa?",
        answer:
          "Além do primeiro aluguel, calcule caução ou fiador, taxa de imobiliária (geralmente 1 aluguel), móveis básicos, eletrodomésticos e mudança. Um valor inicial realista fica entre R$ 3.000 e R$ 8.000 dependendo do que você já possui.",
      },
      {
        question: "Vale mais a pena alugar sozinho ou dividir apartamento?",
        answer:
          "Dividir reduz o custo por pessoa em até 50%, mas exige compatibilidade de rotina e regras claras sobre contas. Morar sozinho custa mais, mas oferece total autonomia. Use nossa calculadora para comparar os dois cenários com seus números reais.",
      },
      {
        question: "Quanto da minha renda devo gastar com aluguel?",
        answer:
          "A regra prática mais usada é destinar no máximo 30% da renda líquida para aluguel e condomínio. Passar disso costuma comprometer o orçamento para alimentação, transporte e reserva de emergência.",
      },
      {
        question: "O condomínio pode ser mais caro que o aluguel?",
        answer:
          "Sim, principalmente em prédios com muita infraestrutura (piscina, academia, portaria 24h). Antes de fechar contrato, sempre peça o valor do condomínio dos últimos meses, pois ele varia com manutenções extraordinárias.",
      },
      {
        question: "Como reduzir o custo mensal de morar sozinho?",
        answer:
          "Negocie o aluguel citando preços da região, escolha imóveis sem itens de luxo que você não usa, compare planos de internet e energia, e cozinhe em casa. Pequenas mudanças de hábito reduzem facilmente 15-20% do custo mensal.",
      },
    ],
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
    updatedAt: "2026-06-25",
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
    updatedAt: "2026-06-25",
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
    faqs: [
      {
        question: "Qual é a diferença entre salário bruto e líquido?",
        answer:
          "O salário bruto é o valor combinado no contrato, antes de descontos. O líquido é o que efetivamente cai na sua conta depois de descontar INSS, IRPF e outras deduções obrigatórias ou opcionais.",
      },
      {
        question: "Quais descontos aparecem obrigatoriamente na folha?",
        answer:
          "INSS (8% a 14%, conforme faixa) e IRPF (retenção na fonte, quando a renda ultrapassa o limite de isenção) são os descontos obrigatórios mais comuns. Sindicato e outros descontos dependem de convenção coletiva ou opção do trabalhador.",
      },
      {
        question: "Vale refeição e vale transporte reduzem o salário líquido?",
        answer:
          "Não. Esses benefícios são creditados à parte e não entram no cálculo do salário líquido nem são tributados como salário. Eles aumentam sua renda disponível sem aumentar o IRPF.",
      },
      {
        question: "Por que meu líquido varia de mês a mês mesmo com salário fixo?",
        answer:
          "Geralmente por causa de horas extras, comissões, bônus ou descontos variáveis (faltas, atrasos). O INSS e o IRPF são recalculados sobre a base de cada mês, então qualquer variação de bruto afeta o líquido proporcionalmente.",
      },
      {
        question: "Como calcular meu salário líquido rapidamente?",
        answer:
          "Informe seu salário bruto e número de dependentes na nossa calculadora de salário líquido. Ela aplica automaticamente as faixas de INSS e IRPF vigentes e mostra o valor líquido estimado.",
      },
      {
        question: "O desconto de IRPF na folha é definitivo?",
        answer:
          "Não. É uma antecipação do imposto anual. Na declaração de ajuste, você pode receber restituição se pagou mais do que devia, ou ter que complementar se pagou menos ao longo do ano.",
      },
    ],
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
    faqs: [
      {
        question: "Quanto um autônomo paga de INSS?",
        answer:
          "O contribuinte individual pode optar pela alíquota cheia de 20% sobre o salário de contribuição, ou pelo plano simplificado de 11% sobre o salário mínimo — mas nesse caso não conta tempo para aposentadoria por tempo de contribuição.",
      },
      {
        question: "Autônomo precisa pagar IRPF todo mês?",
        answer:
          "Sim, se a renda mensal ultrapassar o limite de isenção, o autônomo (carnê-leão) deve calcular e recolher o IRPF mensalmente, além de declarar tudo na declaração anual.",
      },
      {
        question: "Quais despesas um autônomo pode descontar do imposto?",
        answer:
          "Despesas necessárias à atividade profissional: aluguel do espaço de trabalho (proporcional), material de consumo, equipamentos, e em alguns casos parte de combustível e internet. Guarde sempre os comprovantes.",
      },
      {
        question: "Vale a pena virar MEI em vez de autônomo comum?",
        answer:
          "Se sua atividade se enquadra nas categorias permitidas e o faturamento anual fica até R$ 81.000, o MEI costuma sair mais barato: paga um valor fixo mensal (DAS) e tem menos burocracia que o carnê-leão tradicional.",
      },
      {
        question: "Quanto sobra de ganho líquido para um autônomo?",
        answer:
          "Depois de INSS, IRPF e deduções, é comum sobrar entre 55% e 70% do valor bruto, dependendo da faixa de renda e das despesas dedutíveis. Nossa calculadora simula esse cenário com seus números.",
      },
      {
        question: "Como se planejar financeiramente sendo autônomo?",
        answer:
          "Separe de 25% a 35% de cada recebimento para impostos e contribuições, mantenha controle de ganhos e despesas, e considere previdência complementar para compensar a ausência de FGTS e 13º salário.",
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
    updatedAt: "2026-07-01",
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
    faqs: [
      {
        question: "Quanto cada dependente reduz no IRPF?",
        answer:
          "Em 2026, cada dependente reduz R$ 2.275,08 da base de cálculo anual. Se você está na alíquota de 22,5%, a economia é de aproximadamente R$ 512 por dependente ao ano.",
      },
      {
        question: "Quem pode ser declarado como dependente?",
        answer:
          "Filhos até 21 anos (ou 24 se cursando ensino superior), cônjuge, pais e avós sob seu sustento, irmãos menores sob sua guarda, e enteados nas mesmas condições dos filhos.",
      },
      {
        question: "Posso declarar filho de ex-companheiro como dependente?",
        answer:
          "Sim, se o filho mora com você e depende financeiramente do seu sustento. É preciso ter cuidado para evitar dupla declaração — apenas um responsável pode incluir a mesma pessoa como dependente no mesmo ano.",
      },
      {
        question: "Vale mais a pena incluir dependente ou declarar separado?",
        answer:
          "Depende da renda de cada um. Em geral, incluir dependentes com renda baixa ou nula compensa, pois a dedução supera o imposto que essa pessoa pagaria declarando sozinha. Compare os cenários antes de decidir.",
      },
      {
        question: "Pais idosos contam como dependentes mesmo recebendo aposentadoria?",
        answer:
          "Podem contar se a renda deles for baixa e você comprovar que arca com o sustento. Se a aposentadoria for isenta e baixa, normalmente ainda compensa incluir como dependente.",
      },
      {
        question: "Como declarar um dependente no programa da Receita?",
        answer:
          'Na ficha "Dependentes", adicione nome completo, CPF e grau de parentesco. O CPF é obrigatório para maiores de 8 anos e ajuda a evitar inconsistências que geram malha fina.',
      },
    ],
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
    faqs: [
      {
        question: "O que é RPA e por que preciso emitir?",
        answer:
          "RPA (Recibo de Pagamento a Autônomo) é o documento que comprova que você prestou um serviço e recebeu como pessoa física autônoma. Ele formaliza a renda perante a Receita Federal e o INSS.",
      },
      {
        question: "Quem deve emitir o RPA: eu ou o contratante?",
        answer:
          "Na prática, quem contrata o autônomo costuma preparar o RPA para reter e recolher o INSS e o IRPF na fonte, mas o autônomo também pode emitir o próprio recibo, principalmente quando o contratante é pessoa física.",
      },
      {
        question: "Quais informações não podem faltar no RPA?",
        answer:
          "Nome e CPF de quem presta o serviço, nome e CNPJ/CPF de quem paga, descrição do serviço, valor bruto, descontos de INSS e IRPF (quando aplicável) e a data de emissão.",
      },
      {
        question: "Existe prazo para emitir o RPA?",
        answer:
          "O recibo deve ser emitido no momento do pagamento ou logo em seguida, e os recolhimentos de INSS/IRPF retidos seguem os prazos mensais definidos pela Receita Federal, geralmente até o dia 20 do mês seguinte.",
      },
      {
        question: "O que acontece se eu nunca emitir RPA?",
        answer:
          "Sem RPA não há comprovação formal de renda, o que dificulta financiamentos, cria risco de autuação por sonegação e impede a contagem de tempo de contribuição para aposentadoria.",
      },
      {
        question: "Posso emitir RPA por aplicativo ou site?",
        answer:
          "Sim. Diversas prefeituras e plataformas privadas oferecem emissão eletrônica de recibo de autônomo, que já calcula automaticamente os descontos de INSS e IRPF conforme a tabela vigente.",
      },
    ],
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
    faqs: [
      {
        question: "Devo negociar salário bruto ou líquido?",
        answer:
          "Sempre negocie o valor bruto, mas defina antes quanto você precisa receber em líquido. Calcule o bruto equivalente para não fechar um valor que, depois dos descontos, fica abaixo do que você planejava.",
      },
      {
        question: "Como calculo o bruto necessário para um líquido específico?",
        answer:
          "Use nossa calculadora de salário líquido de forma inversa: teste valores brutos até encontrar o líquido que você deseja. Isso evita surpresas na primeira folha de pagamento.",
      },
      {
        question: "Vale incluir benefícios na negociação?",
        answer:
          "Sim. Vale refeição, vale transporte e plano de saúde não são tributados como salário, então aumentam sua renda disponível sem elevar o IRPF. São ótimos argumentos quando a empresa não pode subir o salário bruto.",
      },
      {
        question: "Como argumentar um valor salarial mais alto?",
        answer:
          "Baseie-se em pesquisas salariais da sua região e cargo, destaque resultados concretos entregues e demonstre conhecimento do mercado. Números concretos pesam mais que apenas pedir 'mais'.",
      },
      {
        question: "É melhor negociar aumento fixo ou variável (bônus/comissão)?",
        answer:
          "Depende do seu momento: fixo dá previsibilidade e conta para FGTS e 13º; variável pode render mais no curto prazo, mas tem menos garantias. Avalie sua tolerância a risco antes de escolher.",
      },
      {
        question: "Como saber se a proposta da empresa é boa?",
        answer:
          "Compare o salário líquido final (não o bruto anunciado), some o valor de benefícios oferecidos e confronte com o custo de vida da cidade e sua expectativa mínima antes de aceitar.",
      },
    ],
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
    faqs: [
      {
        question: "Planejamento tributário pessoal é legal?",
        answer:
          "Sim, desde que use apenas benefícios previstos em lei (deduções, isenções, regimes de tributação). Isso é diferente de sonegação, que é omitir ou falsificar informações para pagar menos imposto.",
      },
      {
        question: "Qual é a estratégia mais simples para começar?",
        answer:
          "Compare o regime simplificado (dedução fixa de 20,5%) com o completo (deduções reais) na sua declaração. Essa escolha sozinha já pode gerar economia significativa sem nenhuma mudança de comportamento.",
      },
      {
        question: "Investir em PGBL realmente reduz meu imposto?",
        answer:
          "Sim, para quem declara pelo modelo completo. Contribuições de até 12% da renda bruta anual em PGBL são dedutíveis, reduzindo o imposto devido no ano corrente enquanto forma poupança para a aposentadoria.",
      },
      {
        question: "Quais investimentos ajudam no planejamento tributário?",
        answer:
          "Poupança (isenta até certo limite), LCI e LCA (isentas de IR) e debêntures incentivadas (isenção parcial) são opções que reduzem a carga tributária sobre rendimentos comparadas a CDBs e fundos tradicionais.",
      },
      {
        question: "Vale contratar um contador para planejamento pessoal?",
        answer:
          "Vale a pena principalmente para quem tem múltiplas fontes de renda, imóveis ou investimentos variados. O contador identifica deduções e estratégias específicas que a declaração simplificada não captura.",
      },
      {
        question: "Planejamento tributário serve só para quem ganha muito?",
        answer:
          "Não. Mesmo rendas médias se beneficiam ao usar corretamente deduções de saúde, educação e dependentes, ou ao escolher o regime de tributação mais vantajoso na declaração anual.",
      },
    ],
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
    faqs: [
      {
        question: "Quanto a mais o PJ precisa ganhar para igualar o CLT?",
        answer:
          "Como regra prática, o salário bruto PJ precisa ser cerca de 30% maior que o CLT para compensar a ausência de FGTS, 13º, férias remuneradas e a maior carga de INSS e contador. Varia conforme a faixa de renda.",
      },
      {
        question: "PJ paga mais imposto que CLT?",
        answer:
          "Em termos percentuais, sim: o INSS do contribuinte individual chega a 20% (contra 8-14% do CLT) e não há retenção automática de benefícios. Em compensação, o PJ pode deduzir despesas da atividade, o que reduz parte dessa diferença.",
      },
      {
        question: "Quais benefícios o CLT tem que o PJ perde?",
        answer:
          "FGTS (8% do salário depositado mensalmente), 13º salário, férias com adicional de 1/3, seguro-desemprego e estabilidade em algumas situações. O PJ precisa recriar essas reservas por conta própria.",
      },
      {
        question: "O que caracteriza PJ mascarado (pejotização irregular)?",
        answer:
          "Trabalhar para um único cliente, com horário fixo, subordinação direta e exclusividade são sinais de vínculo empregatício disfarçado. A Justiça do Trabalho pode reconhecer o vínculo e a empresa pagar verbas retroativas.",
      },
      {
        question: "Como decidir entre CLT e PJ na prática?",
        answer:
          "Simule os dois cenários com o mesmo padrão de vida desejado, considere sua tolerância a instabilidade de renda e verifique se você tem reserva de emergência de pelo menos 6 meses antes de migrar para PJ.",
      },
      {
        question: "PJ compensa para quem tem apenas um cliente fixo?",
        answer:
          "Raramente compensa financeiramente e ainda traz risco de reclassificação trabalhista. PJ costuma valer mais quando há múltiplos clientes, liberdade de agenda e ganho bruto bem acima da média CLT equivalente.",
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
    updatedAt: "2026-07-01",
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

  "tabela-irpf-2026-completa": {
    slug: "tabela-irpf-2026-completa",
    title: "Tabela IRPF 2026 Completa",
    description: "Tabela de alíquotas IRPF 2026, deduções dependentes, limites de isenção.",
    category: "educacao",
    imageUrl: "/blog/tabela.jpg",
    imageAlt: "Tabela de alíquotas IRPF 2026",
    author: "Calcule Brasil",
    publishedAt: "2026-07-02",
    updatedAt: "2026-07-02",
    readingTime: 5,
    keywords: ["tabela IRPF", "alíquota IRPF 2026", "limite isenção"],
    faqs: [
      {
        question: "Qual é o limite de isenção do IRPF em 2026?",
        answer:
          "Rendimentos até R$ 21.503,34 por ano (equivalente a até 2 salários mínimos mensais) ficam isentos de IRPF, considerando apenas a tabela progressiva sobre salários e rendimentos tributáveis.",
      },
      {
        question: "Como funciona a tabela progressiva do IRPF?",
        answer:
          "O imposto é calculado por faixas: cada parcela da renda paga a alíquota da sua faixa correspondente, não a alíquota máxima sobre o valor total. Por isso a alíquota efetiva é sempre menor que a alíquota marginal da tabela.",
      },
      {
        question: "Quanto cada dependente reduz na tabela do IRPF?",
        answer:
          "R$ 2.275,08 por dependente ao ano em 2026. Esse valor é abatido da base de cálculo antes de aplicar a alíquota da tabela progressiva.",
      },
      {
        question: "Qual é o limite de dedução com educação em 2026?",
        answer:
          "R$ 3.561,50 por pessoa ao ano (titular e cada dependente), cobrindo mensalidades escolares, faculdade, cursos técnicos e educação infantil.",
      },
      {
        question: "Despesas médicas têm limite na tabela IRPF?",
        answer:
          "Não. Despesas com saúde (médicos, dentistas, hospitais, planos de saúde) não têm limite de dedução na declaração completa, desde que devidamente comprovadas.",
      },
      {
        question: "Quem precisa declarar IRPF em 2026?",
        answer:
          "Quem recebeu rendimentos tributáveis acima de R$ 33.888 no ano, teve ganho de capital, possui bens acima de R$ 800 mil ou se enquadra em outras hipóteses definidas anualmente pela Receita Federal.",
      },
    ],
  },

  "formal-vs-informal": {
    slug: "formal-vs-informal",
    title: "Autônomo Formal vs Informal",
    description: "Diferenças e custos: ser autônomo registrado vs informal.",
    category: "guia",
    imageUrl: "/blog/formal.jpg",
    imageAlt: "Autônomo formal e informal",
    author: "Calcule Brasil",
    publishedAt: "2026-07-03",
    updatedAt: "2026-07-03",
    readingTime: 6,
    keywords: ["autônomo formal", "MEI", "autônomo informal", "contribuição INSS"],
    faqs: [
      {
        question: "Quais são os riscos de trabalhar como autônomo informal?",
        answer:
          "Sem registro, você não tem direito a aposentadoria, auxílio-doença ou salário-maternidade pelo INSS, além de não conseguir comprovar renda para financiamentos, cartões e aluguel.",
      },
      {
        question: "Quanto custa se formalizar como autônomo ou MEI?",
        answer:
          "O DAS (Documento de Arrecadação do Simples) de autônomo/MEI custa entre R$ 65 e R$ 75 por mês em 2026, incluindo INSS e, no caso do MEI, ICMS ou ISS conforme a atividade.",
      },
      {
        question: "MEI e autônomo formal são a mesma coisa?",
        answer:
          "Não exatamente. O MEI é uma categoria de microempreendedor com CNPJ próprio e limite de faturamento de R$ 81.000/ano. O autônomo formal contribui como contribuinte individual, sem CNPJ, e pode ter qualquer faixa de renda.",
      },
      {
        question: "A partir de quanto vale a pena se formalizar?",
        answer:
          "Mesmo em rendas baixas (R$ 20-30 mil/ano) já vale a pena pela contagem de tempo de contribuição e acesso a benefícios do INSS. O ganho fica ainda mais claro acima de R$ 40 mil/ano, quando a comprovação de renda também pesa mais.",
      },
      {
        question: "Ser informal pode gerar problema com a Receita Federal?",
        answer:
          "Sim. Depósitos recorrentes em conta sem origem declarada podem cair em malha fina ou gerar cobrança retroativa de imposto e multa, especialmente com o aumento do cruzamento de dados bancários.",
      },
      {
        question: "Formalizar como MEI limita meus ganhos?",
        answer:
          "O MEI tem teto de faturamento de R$ 81.000/ano. Ultrapassando esse limite, é preciso migrar para microempresa (Simples Nacional) ou outra categoria de PJ, o que muda a forma de tributação.",
      },
    ],
  },

  "como-calcular-salario-pj": {
    slug: "como-calcular-salario-pj",
    title: "Como Calcular Salário PJ",
    description: "Passo a passo: calcule seu salário PJ descontando INSS, IRPF, contador.",
    category: "guia",
    imageUrl: "/blog/calculo-pj.jpg",
    imageAlt: "Cálculo de salário PJ",
    author: "Calcule Brasil",
    publishedAt: "2026-07-04",
    updatedAt: "2026-07-04",
    readingTime: 7,
    keywords: ["salário PJ", "como calcular PJ", "ganho líquido PJ", "imposto PJ"],
    faqs: [
      {
        question: "Qual a fórmula básica para calcular salário PJ líquido?",
        answer:
          "Valor bruto − INSS (contribuinte individual, ~20% ou 11% simplificado) − honorário do contador − imposto estimado sobre o restante (Simples Nacional ou IRPF, conforme regime) = ganho líquido.",
      },
      {
        question: "Quanto fica de líquido em relação ao bruto no PJ?",
        answer:
          "Como referência geral, o PJ costuma reter entre 55% e 70% do valor bruto como líquido, dependendo do regime tributário, da alíquota de INSS escolhida e do custo do contador.",
      },
      {
        question: "O contador é um custo fixo obrigatório no cálculo?",
        answer:
          "Na prática sim, pois a maioria dos regimes de PJ (Simples Nacional, Lucro Presumido) exige contabilidade regular. O custo típico fica entre R$ 300 e R$ 600/mês para uma empresa pequena.",
      },
      {
        question: "Como o Simples Nacional entra nessa conta?",
        answer:
          "O Simples aplica uma alíquota única (geralmente 6% a 16,5% conforme o anexo e faturamento acumulado) sobre o faturamento bruto, substituindo vários tributos separados. Isso simplifica bastante o cálculo comparado ao Lucro Real.",
      },
      {
        question: "Preciso considerar dependentes no cálculo do PJ?",
        answer:
          "Dependentes afetam o IRPF na retirada de pró-labore ou distribuição de lucros pessoa física, mas não alteram diretamente o imposto da pessoa jurídica (Simples/Lucro Presumido).",
      },
      {
        question: "Existe uma calculadora para simular meu salário PJ?",
        answer:
          "Sim. Nossa calculadora CLT vs PJ simula o ganho líquido em ambos os regimes considerando INSS, IRPF, contador e benefícios, para você comparar com seu caso específico.",
      },
    ],
  },

  "simplificado-vs-completo": {
    slug: "simplificado-vs-completo",
    title: "IRPF Simplificado vs Completo: Qual Escolher?",
    description:
      "Comparação: regime simplificado (20,5% dedução fixa) vs completo (deduções reais).",
    category: "guia",
    imageUrl: "/blog/regimes.jpg",
    imageAlt: "Comparação de regimes IRPF",
    author: "Calcule Brasil",
    publishedAt: "2026-07-05",
    updatedAt: "2026-07-05",
    readingTime: 6,
    keywords: ["regime simplificado", "regime completo", "IRPF 2026", "dedução IRPF"],
    faqs: [
      {
        question: "Qual é a diferença entre regime simplificado e completo?",
        answer:
          "O simplificado aplica uma dedução fixa de 20,5% sobre a renda bruta tributável, sem precisar comprovar gastos. O completo permite deduzir despesas reais (educação, saúde, dependentes, previdência), mas exige comprovantes.",
      },
      {
        question: "Como sei qual regime é melhor para mim?",
        answer:
          "Compare os dois: se suas deduções reais (educação + saúde + dependentes + previdência) somarem mais que 20,5% da sua renda bruta, o completo compensa. Caso contrário, o simplificado é mais vantajoso.",
      },
      {
        question: "Existe um teto para a dedução do regime simplificado?",
        answer:
          "Sim. O desconto simplificado tem um limite anual, reajustado periodicamente pela Receita Federal. Rendas muito altas podem esbarrar nesse teto e acabar levando o completo a ser mais vantajoso.",
      },
      {
        question: "Posso trocar de regime todo ano?",
        answer:
          "Sim, a escolha é feita a cada declaração anual e você pode alternar livremente conforme sua situação financeira mudar de um ano para o outro.",
      },
      {
        question: "O programa da Receita já indica o melhor regime?",
        answer:
          "Sim, o próprio programa gerador da declaração calcula automaticamente os dois cenários e mostra qual resulta em menos imposto a pagar ou maior restituição.",
      },
      {
        question: "Quem tem poucos dependentes deve preferir o simplificado?",
        answer:
          "Geralmente sim, principalmente se também não tem muitos gastos com saúde ou educação. Nesses casos, o desconto fixo de 20,5% tende a superar a soma das deduções reais disponíveis.",
      },
    ],
  },

  "quando-virar-pj": {
    slug: "quando-virar-pj",
    title: "Quando Vale a Pena Virar PJ? Critérios Práticos",
    description:
      "Critérios objetivos para decidir entre permanecer CLT ou virar PJ: renda mínima, reserva financeira, múltiplos clientes e os riscos do PJ mascarado.",
    category: "guia",
    imageUrl: "/blog/quando-virar-pj.jpg",
    imageAlt: "Decisão entre continuar CLT ou virar PJ",
    author: "Calcule Brasil",
    publishedAt: "2026-07-06",
    updatedAt: "2026-07-06",
    readingTime: 8,
    keywords: ["quando virar PJ", "vale a pena virar PJ", "CLT vs PJ decisão", "PJ mascarado"],
    faqs: [
      {
        question: "Qual é a regra prática para decidir se vale virar PJ?",
        answer:
          "Se a proposta em PJ for pelo menos 30% maior que seu salário bruto CLT atual, você tem múltiplos clientes (ou potencial para tê-los) e uma reserva de emergência de 3 a 6 meses, PJ costuma valer a pena.",
      },
      {
        question: "Qual renda mínima faz sentido para virar PJ?",
        answer:
          "Abaixo de R$ 80.000/ano, os custos fixos de contador e a perda de benefícios CLT (FGTS, 13º, férias) costumam pesar mais que as vantagens fiscais do PJ. Acima de R$ 120.000/ano, a conta geralmente fica favorável.",
      },
      {
        question: "Trabalhar para um único cliente como PJ é seguro?",
        answer:
          "Não é recomendado. Prestar serviço com exclusividade, horário fixo e subordinação direta caracteriza vínculo empregatício disfarçado (PJ mascarado), que a Justiça do Trabalho pode reconhecer e gerar cobrança retroativa de verbas trabalhistas.",
      },
      {
        question: "Preciso de reserva financeira antes de virar PJ?",
        answer:
          "Sim, o ideal é ter de 3 a 6 meses de despesas guardados, já que o PJ não tem seguro-desemprego nem estabilidade e pode enfrentar meses de faturamento mais baixo entre um contrato e outro.",
      },
      {
        question: "Como simular se compensa virar PJ no meu caso?",
        answer:
          "Compare o salário líquido + benefícios do seu CLT atual com o ganho líquido estimado em PJ (descontando INSS, imposto e contador) na nossa calculadora CLT vs PJ, usando o valor bruto exato da proposta.",
      },
      {
        question: "Quais benefícios preciso recriar sozinho ao virar PJ?",
        answer:
          "FGTS (8% do bruto), 13º salário, férias com adicional de 1/3 e a contribuição para aposentadoria deixam de ser automáticos. É preciso reservar esses valores mensalmente por conta própria.",
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
    updatedAt: "2026-07-07",
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

  "mei-vs-pj-custo": {
    slug: "mei-vs-pj-custo",
    title: "MEI vs PJ: Qual é Mais Barato em 2026?",
    description:
      "Compare custos mensais, impostos e limites de faturamento entre MEI e PJ (Simples Nacional/Lucro Presumido) para escolher o regime certo para sua atividade.",
    category: "guia",
    imageUrl: "/blog/mei-vs-pj-custo.jpg",
    imageAlt: "Comparação de custos entre MEI e PJ",
    author: "Calcule Brasil",
    publishedAt: "2026-07-08",
    updatedAt: "2026-07-08",
    readingTime: 8,
    keywords: ["MEI vs PJ", "custo MEI", "custo PJ", "Simples Nacional", "quanto custa abrir PJ"],
    faqs: [
      {
        question: "Qual é o custo mensal do MEI comparado ao PJ comum?",
        answer:
          "O MEI paga um DAS fixo de aproximadamente R$ 65-75/mês, incluindo INSS. Um PJ no Simples Nacional, além do imposto sobre o faturamento, costuma pagar R$ 300-600/mês só de contador.",
      },
      {
        question: "Até quanto posso faturar sendo MEI?",
        answer:
          "O limite é R$ 81.000 de faturamento bruto por ano (cerca de R$ 6.750/mês em média). Ultrapassando esse teto, é obrigatório migrar para outra categoria de PJ, como microempresa do Simples Nacional.",
      },
      {
        question: "MEI é sempre mais barato que PJ?",
        answer:
          "Para faturamentos até a faixa de R$ 60.000-80.000/ano, sim, o MEI costuma ser bem mais barato. Acima disso, o Simples Nacional pode compensar por permitir contratar funcionários e ter alíquotas proporcionais ao faturamento.",
      },
      {
        question: "PJ paga menos imposto que MEI em faturamentos altos?",
        answer:
          "Pode pagar proporcionalmente menos em algumas faixas do Simples Nacional (6% a 16,5% conforme o anexo), especialmente quando o MEI já não é mais permitido pelo teto de faturamento.",
      },
      {
        question: "Quais as diferenças de burocracia entre MEI e PJ?",
        answer:
          "O MEI tem declaração anual simplificada (DASN-SIMEI) e dispensa contador na maioria dos casos. O PJ exige contabilidade regular, emissão de guias mensais e, dependendo do regime, escrituração fiscal completa.",
      },
      {
        question: "Como decidir entre MEI e PJ para minha atividade?",
        answer:
          "Verifique primeiro se sua atividade é permitida como MEI e se o faturamento projetado fica dentro do limite anual. Se sim, comece como MEI pelo custo menor; migre para PJ apenas quando o crescimento exigir.",
      },
    ],
  },

  "salario-por-setor-2026": {
    slug: "salario-por-setor-2026",
    title: "Salário Líquido por Setor em 2026: Tecnologia, Saúde, Educação e Varejo",
    description:
      "Veja quanto fica de salário líquido em diferentes setores da economia brasileira e como deduções e benefícios mudam o desconto final.",
    category: "analise",
    imageUrl: "/blog/salario-por-setor-2026.jpg",
    imageAlt: "Comparação de salário líquido entre setores",
    author: "Calcule Brasil",
    publishedAt: "2026-07-09",
    updatedAt: "2026-07-09",
    readingTime: 7,
    keywords: [
      "salário líquido por setor",
      "salário líquido tecnologia",
      "quanto fica de salário líquido",
      "desconto salário por profissão",
    ],
    faqs: [
      {
        question: "Por que o salário líquido varia tanto entre setores?",
        answer:
          "A principal razão é a faixa de renda: salários mais altos (comuns em tecnologia) caem em alíquotas de IRPF maiores, enquanto salários baixos (comércio e varejo) ficam próximos ou dentro da faixa de isenção.",
      },
      {
        question: "Setor de tecnologia tem desconto maior no salário?",
        answer:
          "Em termos percentuais, sim, porque os salários costumam ser mais altos e entram em faixas de IRPF de 15% a 27,5%. Em compensação, muitas empresas do setor oferecem benefícios que reduzem o impacto no orçamento.",
      },
      {
        question: "Servidores públicos têm desconto de IRPF diferente?",
        answer:
          "Não existe alíquota especial para servidores; a tabela do IRPF é a mesma para todos. A diferença percebida vem principalmente de benefícios e estabilidade, não do cálculo do imposto em si.",
      },
      {
        question: "Como aumentar meu salário líquido sem mudar de setor?",
        answer:
          "Negocie benefícios não tributáveis (vale refeição, transporte, plano de saúde), aumente contribuições dedutíveis (previdência complementar) e maximize deduções de educação e saúde na declaração anual.",
      },
      {
        question: "Salários baixos realmente pagam pouco ou nenhum IRPF?",
        answer:
          "Sim. Rendimentos até R$ 21.503,34/ano ficam isentos, e faixas logo acima pagam alíquotas baixas (7,5%), o que explica o desconto reduzido em setores com salários menores como comércio e varejo.",
      },
      {
        question: "Como comparar meu salário líquido com a média do setor?",
        answer:
          "Informe seu salário bruto na nossa calculadora de salário líquido para obter o valor líquido exato e compare com as médias de mercado divulgadas por pesquisas salariais do seu setor e cargo.",
      },
    ],
  },

  "aposentadoria-early-retirement": {
    slug: "aposentadoria-early-retirement",
    title: "Aposentadoria Antecipada: Quanto Poupar para se Aposentar Cedo",
    description:
      "Estratégia FIRE aplicada ao Brasil: regra dos 4%, quanto poupar por padrão de gastos, tempo estimado até a independência financeira e riscos do IRPF sobre investimentos.",
    category: "guia",
    imageUrl: "/blog/aposentadoria-early-retirement.jpg",
    imageAlt: "Planejamento de aposentadoria antecipada",
    author: "Calcule Brasil",
    publishedAt: "2026-07-10",
    updatedAt: "2026-07-10",
    readingTime: 9,
    keywords: [
      "aposentadoria antecipada",
      "FIRE Brasil",
      "quanto poupar para aposentar",
      "independência financeira",
    ],
    faqs: [
      {
        question: "O que é a regra dos 4% na aposentadoria antecipada?",
        answer:
          "É uma estimativa de que você pode sacar 4% do seu patrimônio investido por ano, de forma sustentável, sem esgotar o capital ao longo de décadas. Um patrimônio de R$ 1 milhão sustentaria gastos de R$ 40 mil/ano.",
      },
      {
        question: "Quanto preciso poupar para viver de renda no Brasil?",
        answer:
          "Multiplique seus gastos anuais desejados por 25 (o inverso de 4%). Quem gasta R$ 10 mil/mês (R$ 120 mil/ano) precisaria de aproximadamente R$ 3 milhões investidos.",
      },
      {
        question: "Em quanto tempo consigo me aposentar poupando parte da renda?",
        answer:
          "Poupando 50% da renda, a independência financeira costuma levar cerca de 17 anos. Poupando 60%, esse prazo cai para aproximadamente 12 anos, considerando retorno real médio dos investimentos.",
      },
      {
        question: "Investimentos para aposentadoria antecipada pagam IRPF?",
        answer:
          "Sim, a maioria paga. Tesouro Direto e fundos seguem tabela regressiva de IR (de 22,5% a 15% conforme o prazo), enquanto LCI, LCA e poupança são isentas. Planeje a tributação na sua projeção de renda passiva.",
      },
      {
        question: "Previdência complementar ajuda na aposentadoria antecipada?",
        answer:
          "Ajuda de duas formas: reduz o IRPF devido hoje (até 12% da renda bruta em PGBL, para quem declara pelo modelo completo) e acumula capital com tributação diferida até o resgate.",
      },
      {
        question: "Quais são os principais riscos da estratégia FIRE no Brasil?",
        answer:
          "Inflação acima do esperado, mudanças na tributação de investimentos e imprevistos de saúde são os riscos mais comuns. Por isso, especialistas recomendam uma margem de segurança acima do valor calculado pela regra dos 4%.",
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
    updatedAt: "2026-07-11",
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
