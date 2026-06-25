import {
  Car,
  Home as HomeIcon,
  Zap,
  CreditCard,
  Truck,
  PawPrint,
  Wallet,
  HeartPulse,
  type LucideIcon,
} from "lucide-react";

export type CalculatorCategoryId = "moradia" | "veiculos" | "financas" | "pet" | "impostos";

export interface CategoryMeta {
  id: CalculatorCategoryId;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const calculatorCategories: CategoryMeta[] = [
  {
    id: "moradia",
    label: "Casa e moradia",
    description: "Custos de morar, contas da casa e mudança.",
    icon: HomeIcon,
  },
  {
    id: "veiculos",
    label: "Veículos",
    description: "Quanto custa ter e rodar com um carro.",
    icon: Car,
  },
  {
    id: "financas",
    label: "Finanças pessoais",
    description: "Gastos recorrentes que pesam no orçamento.",
    icon: Wallet,
  },
  {
    id: "pet",
    label: "Pets",
    description: "O custo real de cuidar bem dos animais.",
    icon: HeartPulse,
  },
  {
    id: "impostos",
    label: "Impostos e tributos",
    description: "Simuladores de IRPF, INSS, salário líquido e impostos pessoais.",
    icon: CreditCard,
  },
];

export interface CalculatorMeta {
  slug: string;
  path:
    | "/calculadora-custo-carro"
    | "/calculadora-morar-sozinho"
    | "/calculadora-conta-de-luz"
    | "/calculadora-assinaturas"
    | "/calculadora-custo-mudanca"
    | "/calculadora-custo-pet"
    | "/calculadora-irpf-2026"
    | "/calculadora-salario-liquido"
    | "/calculadora-inss-autonomo"
    | "/calculadora-clt-vs-pj"
    | "/calculadora-previdencia-complementar"
    | "/calculadora-beneficios-fiscais";
  category: CalculatorCategoryId;
  title: string;
  shortTitle: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  intro: string;
  whatItDoes: string[];
  inputs: string[];
}

export const calculators: CalculatorMeta[] = [
  {
    slug: "custo-carro",
    path: "/calculadora-custo-carro",
    category: "veiculos",
    title: "Calculadora de custo de carro",
    shortTitle: "Custo de carro",
    tagline: "Quanto seu carro realmente custa por mês",
    description:
      "Some combustível, IPVA, seguro, manutenção e depreciação para entender o custo mensal real do seu carro.",
    icon: Car,
    intro:
      "Muita gente olha só para o preço da parcela do financiamento e esquece que ter um carro envolve combustível, IPVA, seguro, manutenção preventiva, pneus e a perda natural de valor do veículo. Esta calculadora reúne todos esses itens em uma estimativa mensal honesta.",
    whatItDoes: [
      "Estima o gasto mensal com combustível a partir da quilometragem e do consumo do veículo.",
      "Considera IPVA, licenciamento e seguro como custos anuais diluídos por mês.",
      "Inclui manutenção preventiva, troca de pneus e revisões.",
      "Calcula a depreciação aproximada do veículo no período de uso.",
    ],
    inputs: [
      "Quilometragem mensal média",
      "Consumo médio do carro (km/l)",
      "Preço do combustível na sua cidade",
      "Valor anual de IPVA, seguro e licenciamento",
      "Tempo planejado de uso do veículo",
    ],
  },
  {
    slug: "morar-sozinho",
    path: "/calculadora-morar-sozinho",
    category: "moradia",
    title: "Calculadora de custo para morar sozinho",
    shortTitle: "Morar sozinho",
    tagline: "Estime quanto custa sair da casa dos pais",
    description:
      "Junte aluguel, condomínio, contas básicas, internet, mercado e imprevistos para saber se cabe no seu salário.",
    icon: HomeIcon,
    intro:
      "Morar sozinho não é só pagar aluguel. Há condomínio, IPTU, luz, água, gás, internet, mercado, produtos de limpeza, transporte e uma reserva para imprevistos. Esta calculadora ajuda a montar o orçamento mensal antes de assinar o contrato.",
    whatItDoes: [
      "Soma aluguel, condomínio e IPTU em uma linha mensal só.",
      "Inclui contas básicas: luz, água, gás e internet.",
      "Estima mercado e itens de casa a partir do seu perfil.",
      "Sugere reserva de emergência mensal proporcional ao custo fixo.",
    ],
    inputs: [
      "Valor do aluguel pretendido",
      "Condomínio e IPTU do imóvel",
      "Cidade ou faixa de tarifa de luz/água",
      "Hábito alimentar (em casa, delivery, refeições fora)",
      "Renda líquida mensal",
    ],
  },
  {
    slug: "conta-de-luz",
    path: "/calculadora-conta-de-luz",
    category: "moradia",
    title: "Calculadora de conta de luz por aparelho",
    shortTitle: "Conta de luz",
    tagline: "Descubra quais aparelhos pesam na sua conta",
    description:
      "Calcule o consumo mensal em kWh e o custo aproximado de cada aparelho da sua casa.",
    icon: Zap,
    intro:
      "Geladeira, chuveiro, ar-condicionado e máquina de lavar costumam ser os campeões da conta de luz. Esta calculadora converte a potência de cada aparelho e o tempo de uso em kWh por mês, mostrando quanto cada um pesa na fatura.",
    whatItDoes: [
      "Converte potência (W) e tempo de uso em kWh por mês.",
      "Aplica a tarifa de energia da sua região para virar reais.",
      "Permite comparar aparelhos lado a lado.",
      "Mostra quanto cada hábito (banho longo, ar ligado à noite) custa.",
    ],
    inputs: [
      "Potência do aparelho em watts",
      "Horas de uso por dia",
      "Dias de uso por mês",
      "Tarifa de energia (R$/kWh) da sua conta",
    ],
  },
  {
    slug: "assinaturas",
    path: "/calculadora-assinaturas",
    category: "financas",
    title: "Calculadora de gasto com assinaturas",
    shortTitle: "Assinaturas",
    tagline: "Veja o custo total das suas assinaturas",
    description:
      "Liste streaming, apps, academia e cursos para ver o impacto mensal, anual e por ano de uso.",
    icon: CreditCard,
    intro:
      "Pequenas assinaturas de R$ 20, R$ 30 e R$ 50 somadas viram um custo expressivo no fim do ano. Esta calculadora reúne todas as suas assinaturas em um lugar e mostra o total mensal, anual e o quanto você pagaria em 3 ou 5 anos mantendo tudo.",
    whatItDoes: [
      "Soma assinaturas mensais e anuais em um total único.",
      "Mostra o gasto projetado em 12, 36 e 60 meses.",
      "Identifica assinaturas que mais pesam no orçamento.",
      "Permite simular cortes e ver o impacto da economia.",
    ],
    inputs: [
      "Nome e valor de cada assinatura",
      "Frequência (mensal ou anual)",
      "Categoria (streaming, software, academia, etc.)",
    ],
  },
  {
    slug: "custo-mudanca",
    path: "/calculadora-custo-mudanca",
    category: "moradia",
    title: "Calculadora de custo de mudança residencial",
    shortTitle: "Custo de mudança",
    tagline: "Planeje o orçamento da sua mudança",
    description:
      "Estime caminhão, embalagem, taxas de imóvel novo, móveis e os primeiros meses de contas.",
    icon: Truck,
    intro:
      "Uma mudança custa muito mais do que a diária do caminhão. Tem caixa, fita, plástico-bolha, taxa de condomínio, vistoria, depósito caução, montagem de móveis e a primeira leva de compras na casa nova. Esta calculadora monta um orçamento realista.",
    whatItDoes: [
      "Estima caminhão e mão de obra conforme distância e volume.",
      "Inclui materiais de embalagem e seguro de mudança.",
      "Considera custos do imóvel novo: caução, taxas e vistoria.",
      "Reserva orçamento para móveis, eletro e itens básicos.",
    ],
    inputs: [
      "Distância entre o imóvel atual e o novo",
      "Tamanho do imóvel atual (cômodos)",
      "Necessidade de comprar móveis ou eletrodomésticos",
      "Caução, primeiro aluguel e taxas do imóvel novo",
    ],
  },
  {
    slug: "custo-pet",
    path: "/calculadora-custo-pet",
    category: "pet",
    title: "Calculadora de custo de pet",
    shortTitle: "Custo de pet",
    tagline: "Quanto custa cuidar bem do seu pet",
    description:
      "Ração, banho, vacinas, vermífugo, brinquedos e plano de saúde — tudo em uma estimativa mensal.",
    icon: PawPrint,
    intro:
      "Ter um cachorro ou gato envolve gastos fixos (ração, areia) e gastos sazonais (vacina anual, banho mensal, consulta veterinária). Esta calculadora ajuda a estimar o custo mensal médio antes de adotar — ou a revisar o orçamento de quem já tem pet.",
    whatItDoes: [
      "Estima o consumo mensal de ração por porte e idade.",
      "Inclui banho/tosa, vacinas, vermífugo e antipulgas.",
      "Considera plano de saúde pet ou reserva para emergências.",
      "Permite somar mais de um animal na mesma estimativa.",
    ],
    inputs: [
      "Espécie (cão ou gato) e porte aproximado",
      "Tipo de ração (padrão, premium, super premium)",
      "Frequência de banho/tosa",
      "Plano de saúde pet (sim/não)",
    ],
  },
  {
    slug: "irpf-2026",
    path: "/calculadora-irpf-2026",
    category: "impostos",
    title: "Calculadora IRPF 2026",
    shortTitle: "IRPF 2026",
    tagline: "Calcule seu imposto de renda e alíquota efetiva",
    description:
      "Simule sua declaração de IRPF 2026. Inclua dependentes, deduções com educação e saúde, e veja quanto você deve ao leão.",
    icon: CreditCard,
    intro:
      "O Imposto de Renda Pessoa Física (IRPF) afeta ~50 milhões de brasileiros, mas poucos entendem como funciona. Esta calculadora segue as regras progressivas da Receita Federal para 2026, considerando dependentes, deduções permitidas (educação, saúde, previdência) e regime tributário (completo ou simplificado).",
    whatItDoes: [
      "Calcula o IRPF anual baseado nas alíquotas progressivas de 2026.",
      "Considera desconto INSS na fonte (retenção).",
      "Aplica deduções com educação (até R$ 3.561,50), saúde e previdência complementar.",
      "Desconta R$ 2.275 por dependente na base imponível.",
      "Compara regime completo vs. simplificado (20,5% de dedução fixa).",
      "Mostra alíquota marginal e efetiva do seu imposto.",
    ],
    inputs: [
      "Renda bruta anual (salário, bônus, 13º)",
      "Número de dependentes",
      "Gastos anuais com educação e saúde",
      "Contribuição com previdência complementar",
      "Regime tributário (completo ou simplificado)",
    ],
  },
  {
    slug: "salario-liquido",
    path: "/calculadora-salario-liquido",
    category: "impostos",
    title: "Calculadora de Salário Líquido",
    shortTitle: "Salário Líquido",
    tagline: "Descubra quanto você realmente recebe",
    description:
      "Converta seu salário bruto em líquido. Desconte IRPF, INSS, sindicato e veja quanto fica para você.",
    icon: CreditCard,
    intro:
      "Salário bruto e salário líquido são bem diferentes. Seu empregador desconta automaticamente IRPF, INSS e sindicato. Esta calculadora mostra exatamente quanto você fica com seu ganho após todos os descontos.",
    whatItDoes: [
      "Calcula INSS automático conforme faixas salariais (7,7% a 14%).",
      "Estima IRPF mensal com base em dependentes e deduções.",
      "Inclui descontos com sindicato e vale transporte.",
      "Mostra valor de benefícios não tributáveis (vale refeição).",
      "Calcula alíquota efetiva e economia com dependentes.",
    ],
    inputs: [
      "Salário bruto mensal",
      "Número de dependentes",
      "Gastos mensais com educação e saúde",
      "Contribuição previdência complementar",
      "Se tem vale refeição, transporte, sindicato",
    ],
  },
  {
    slug: "inss-autonomo",
    path: "/calculadora-inss-autonomo",
    category: "impostos",
    title: "Calculadora INSS Autônomo",
    shortTitle: "INSS Autônomo",
    tagline: "Simule sua contribuição INSS como autônomo",
    description:
      "Calcule INSS para autônomo (20% ou 11% simplificado) e veja impacto na aposentadoria.",
    icon: CreditCard,
    intro:
      "Autônomos pagam INSS diretamente. Podem escolher entre 20% de contribuinte individual ou 11% do regime simplificado. Esta calculadora mostra quanto você paga e o impacto na aposentadoria.",
    whatItDoes: [
      "Calcula INSS em ambos os regimes (20% vs 11%).",
      "Estima benefício de aposentadoria futuro.",
      "Mostra impacto de contribuições adicionais.",
      "Compara os dois regimes lado a lado.",
    ],
    inputs: [
      "Ganho mensal como autônomo",
      "Régime preferido (20% ou 11%)",
      "Tempo de contribuição planejado",
    ],
  },
  {
    slug: "clt-vs-pj",
    path: "/calculadora-clt-vs-pj",
    category: "impostos",
    title: "Calculadora CLT vs PJ",
    shortTitle: "CLT vs PJ",
    tagline: "Compare ganho líquido: CLT vs PJ",
    description:
      "Descubra qual regime é mais vantajoso para você. Compare salário CLT com proposta PJ lado a lado.",
    icon: CreditCard,
    intro:
      "Muitos têm oportunidade de virar PJ, mas qual é realmente mais vantajoso? Esta calculadora compara ganho líquido, benefícios e custos de ambos os regimes.",
    whatItDoes: [
      "Calcula salário líquido CLT com INSS, IRPF, benefícios.",
      "Calcula ganho líquido PJ com impostos maiores.",
      "Mostra quanto PJ precisa ganhar para igualar CLT.",
      "Compara benefícios (FGTS, 13º, férias).",
    ],
    inputs: [
      "Salário bruto CLT",
      "Proposta de valor PJ",
      "Número de dependentes",
      "Despesas mensais estimadas PJ",
    ],
  },
  {
    slug: "previdencia-complementar",
    path: "/calculadora-previdencia-complementar",
    category: "impostos",
    title: "Calculadora Previdência Complementar",
    shortTitle: "Previdência Complementar",
    tagline: "Simule economia tributária + aposentadoria",
    description:
      "Contribua para PGBL/VGBL, reduza IRPF agora e acumule para aposentadoria complementar.",
    icon: CreditCard,
    intro:
      "Previdência complementar oferece duplo ganho: reduz seu IRPF hoje e constrói poupança para aposentadoria. Limite é até 13% da renda bruta. Simule seu caso.",
    whatItDoes: [
      "Calcula economia de IRPF mensal/anual.",
      "Projeta valor acumulado em 10, 20, 30 anos.",
      "Mostra impacto de diferentes taxas de retorno.",
      "Compara contribuição regular vs eventual.",
    ],
    inputs: [
      "Contribuição mensal planejada",
      "Taxa de retorno estimada",
      "Tempo até aposentadoria",
      "Alíquota IRPF estimada",
    ],
  },
  {
    slug: "beneficios-fiscais",
    path: "/calculadora-beneficios-fiscais",
    category: "impostos",
    title: "Calculadora Benefícios Fiscais",
    shortTitle: "Benefícios Fiscais",
    tagline: "Vale refeição, transporte e outros benefícios",
    description:
      "Simule economia com vale refeição e transporte. Veja impacto fiscal de benefícios não tributáveis.",
    icon: CreditCard,
    intro:
      "Vale refeição e vale transporte são benefícios não tributáveis que reduzem seu IRPF. Esta calculadora mostra quanto você economiza em impostos com esses benefícios.",
    whatItDoes: [
      "Calcula economias com vale refeição/transporte.",
      "Mostra impacto no salário líquido.",
      "Compara com recebimento em dinheiro.",
      "Projeta economia anual.",
    ],
    inputs: [
      "Valor de vale refeição mensal",
      "Valor de vale transporte mensal",
      "Alíquota IRPF atual",
    ],
  },
];

export function getCalculator(slug: string) {
  return calculators.find((c) => c.slug === slug);
}
