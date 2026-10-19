import { createFileRoute } from "@tanstack/react-router";
import {
  Briefcase,
  Car,
  CreditCard,
  Database,
  FileText,
  Gift,
  Home as HomeIcon,
  Landmark,
  ListChecks,
  PawPrint,
  PiggyBank,
  ShieldAlert,
  Truck,
  Wallet,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageShell, PageHeader } from "@/components/layout/PageShell";
import { ANTT_COEFFICIENTS_IN_FORCE_FROM } from "@/lib/calculators/antt-freight-floor";
import { ETHANOL_YIELD_PERCENT } from "@/lib/calculators/carCost";
import { INSS_CEILING, MINIMUM_WAGE } from "@/lib/calculators/inss-constants";
import {
  DEDUCTION_PER_DEPENDENT_ANNUAL,
  DEDUCTION_PER_DEPENDENT_MONTHLY,
  MAX_DEDUCTION_EDUCATION_ANNUAL,
  MAX_SIMPLIFIED_DEDUCTION_ANNUAL,
  SIMPLIFIED_DEDUCTION_MONTHLY,
} from "@/lib/calculators/irpf-constants";
import { FINANCIAL_STATUS_BANDS } from "@/lib/calculators/livingAlone";
import { FATOR_R_PERCENT, SIMPLES_MODEL_REVENUE_LIMIT } from "@/lib/calculators/simples-nacional";
import { formatBRL, formatLongDate } from "@/lib/format";
import { absoluteUrl } from "@/lib/site";

interface Section {
  id: string;
  label: string;
  title: string;
  icon: LucideIcon;
}

// Every figure below is read from the module that applies it, so this page
// cannot drift from the calculators. It once described a freight estimate from
// distance and volume that no calculator ever made, a "35% of income" rule the
// calculator did not use, and said personal taxes were not covered while six
// calculators computed them.
const sections: Section[] = [
  { id: "principios", label: "Princípios gerais", title: "Princípios gerais", icon: ListChecks },
  { id: "salario", label: "Salário líquido", title: "Salário líquido", icon: Wallet },
  { id: "irpf", label: "IRPF 2026", title: "IRPF 2026", icon: FileText },
  { id: "inss", label: "INSS autônomo", title: "INSS autônomo", icon: Landmark },
  { id: "clt-pj", label: "CLT vs PJ", title: "CLT vs PJ", icon: Briefcase },
  {
    id: "previdencia",
    label: "Previdência complementar",
    title: "Previdência complementar",
    icon: PiggyBank,
  },
  { id: "beneficios", label: "Benefícios fiscais", title: "Benefícios fiscais", icon: Gift },
  { id: "carro", label: "Custo de carro", title: "Custo de carro", icon: Car },
  { id: "morar", label: "Morar sozinho", title: "Morar sozinho", icon: HomeIcon },
  { id: "luz", label: "Conta de luz", title: "Conta de luz", icon: Zap },
  { id: "assinaturas", label: "Assinaturas", title: "Assinaturas", icon: CreditCard },
  { id: "mudanca", label: "Custo de mudança", title: "Custo de mudança", icon: Truck },
  { id: "pet", label: "Custo de pet", title: "Custo de pet", icon: PawPrint },
  { id: "fontes", label: "Dados públicos", title: "Dados públicos e fontes", icon: Database },
  { id: "limitacoes", label: "Limitações", title: "Limitações", icon: ShieldAlert },
];

const section = (id: string): Section => {
  const found = sections.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`No methodology section ${id}`);
  return found;
};

const SOURCES: { source: string; usedIn: string; data: string; updated: string; limits: string }[] =
  [
    {
      source: "Planalto",
      usedIn: "Calculadoras de imposto, morar sozinho, mudança",
      data: "Texto das leis e emendas citadas",
      updated: "Conferido em cada revisão da página",
      limits: "Regras gerais; casos especiais ficam de fora",
    },
    {
      source: "ANP",
      usedIn: "Custo de carro",
      data: "Preço médio dos combustíveis por estado",
      updated:
        "Semanal: o formulário consulta a semana mais recente, a tabela usa uma semana indicada",
      limits: "Média dos postos pesquisados; o seu posto pode cobrar outro preço",
    },
    {
      source: "ANEEL",
      usedIn: "Conta de luz",
      data: "Tarifa B1 residencial convencional (TUSD + TE)",
      updated: "Dataset oficial, com cache semanal no site",
      limits: "Não inclui impostos, bandeiras nem iluminação pública",
    },
    {
      source: "Inmetro, PBE Veicular 2026",
      usedIn: "Custo de carro",
      data: "Rendimento do etanol: mediana de 261 carros flex",
      updated: "Tabela anual do Inmetro",
      limits: "Consumo de laboratório; cada carro varia alguns pontos",
    },
    {
      source: "FipeZAP e DIEESE/Conab",
      usedIn: "Morar sozinho",
      data: "Aluguel médio por m² e cesta básica por capital",
      updated: "Mensal; a tabela usa o mês indicado na página",
      limits: "Preço de anúncio de novos aluguéis; a cesta é o mínimo legal de alimentos",
    },
    {
      source: "ANTT",
      usedIn: "Custo de mudança",
      data: "Coeficientes do piso mínimo de frete, carga geral",
      updated: "A cada revisão da ANTT",
      limits: "Piso do frete do caminhão, não o preço de uma mudança",
    },
    {
      source: "Eletrobrás, publicada pelo IDEC",
      usedIn: "Conta de luz",
      data: "Consumo mensal de geladeiras e freezer",
      updated: "Medição de 2013",
      limits: "Aparelhos novos podem gastar menos",
    },
    {
      source: "FEDIAF",
      usedIn: "Custo de pet",
      data: "Necessidade de energia de cães e gatos adultos",
      updated: "Diretrizes de 2025",
      limits: "Médias; cada animal varia",
    },
    {
      source: "IBGE",
      usedIn: "Formulários com estado",
      data: "Lista de estados e municípios",
      updated: "Eventual",
      limits: "Fonte auxiliar",
    },
  ];

/** Lei 8.212/1991: 11% on the pró-labore, capped at the INSS ceiling. */
const PARTNER_INSS_CAP = INSS_CEILING * 0.11;

export const Route = createFileRoute("/metodologia")({
  head: () => ({
    meta: [
      { title: "Metodologia | Calcule Brasil" },
      {
        name: "description",
        content:
          "Como o Calcule Brasil constrói cada estimativa: fórmulas, premissas e limites de cada cálculo.",
      },
      { property: "og:title", content: "Metodologia | Calcule Brasil" },
      {
        property: "og:description",
        content: "Fórmulas, premissas e limitações das nossas calculadoras.",
      },
      { property: "og:url", content: absoluteUrl("/metodologia") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/metodologia") }],
  }),
  component: MetodologiaPage,
});

function SectionCard({ section, children }: { section: Section; children: React.ReactNode }) {
  const Icon = section.icon;
  return (
    <section
      id={section.id}
      className="scroll-mt-24 rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <h2 className="font-display text-xl text-foreground sm:text-2xl">{section.title}</h2>
      </div>
      <div className="mt-4 space-y-4 text-pretty leading-relaxed text-foreground/85">
        {children}
      </div>
    </section>
  );
}

function MetodologiaPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Metodologia"
        title="Como construímos cada estimativa"
        description="Transparência sobre as fórmulas, premissas e limites usados nas calculadoras."
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        {/* One document, with its own table of contents inside it. */}
        <article className="lg:grid lg:grid-cols-[16rem_1fr] lg:gap-12">
          {/* Table of contents */}
          <nav aria-label="Índice da metodologia" className="mb-10 lg:mb-0">
            <div className="lg:sticky lg:top-24">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Nesta página
              </p>
              <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground/80 transition hover:border-primary/30 hover:text-primary lg:w-full lg:border-transparent lg:bg-transparent lg:px-2"
                    >
                      <section.icon className="h-4 w-4 text-primary" aria-hidden />
                      {section.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Content */}
          <div className="space-y-6">
            <SectionCard section={section("principios")}>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  Cada calculadora parte dos <strong>valores que você informa</strong>. Onde ela usa
                  um dado público ou uma regra legal, a página diz qual é a fonte e a data.
                </li>
                <li>
                  As regras vêm de <strong>fontes oficiais ou primárias</strong> sempre que elas
                  existem: leis e emendas no Planalto, tabelas da Receita Federal, portarias da
                  ANTT, levantamentos da ANP e da ANEEL. Quando só há fonte secundária, a página diz
                  isso.
                </li>
                <li>
                  As tabelas das páginas são <strong>calculadas pela própria calculadora</strong> e
                  dão os mesmos números que o formulário para as mesmas entradas.
                </li>
                <li>
                  Os resultados são <strong>estimativas educativas</strong>, não um valor oficial: a
                  folha, a declaração e o orçamento de cada caso podem ter detalhes que a
                  calculadora não vê.
                </li>
              </ul>
            </SectionCard>

            <SectionCard section={section("salario")}>
              <p>
                Do salário bruto saem o INSS e o imposto de renda retido na fonte. O INSS segue a
                tabela progressiva de 2026, de 7,5% a 14%, cada alíquota só sobre a parte do salário
                dentro da sua faixa, até o teto de {formatBRL(INSS_CEILING)}.
              </p>
              <p>
                A base do imposto é o salário menos as deduções legais (o INSS,{" "}
                {formatBRL(DEDUCTION_PER_DEPENDENT_MONTHLY)} por dependente e a previdência
                complementar) ou o desconto simplificado de{" "}
                {formatBRL(SIMPLIFIED_DEDUCTION_MONTHLY)}, o que for mais vantajoso (Lei 9.250/1995,
                art. 4º, § 2º). Sobre ela aplica-se a tabela mensal de 2026 e depois a redução da
                Lei 15.270/2025, integral até R$ 5.000 de salário e decrescente até R$ 7.350.
              </p>
              <p>
                O vale-transporte desconta até 6% do salário, sem passar do custo do transporte (Lei
                7.418/1985). A contribuição sindical, quando autorizada, é um dia de salário
                descontado só em março (CLT, art. 582). O vale-refeição não sai do salário nem é
                tributado.
              </p>
            </SectionCard>

            <SectionCard section={section("irpf")}>
              <p>
                A conta anual do ano-calendário 2026 compara as duas formas de declarar. Na
                completa, a base é a renda tributável menos o INSS,{" "}
                {formatBRL(DEDUCTION_PER_DEPENDENT_ANNUAL)} por dependente, despesas médicas sem
                limite e educação até {formatBRL(MAX_DEDUCTION_EDUCATION_ANNUAL)} por pessoa (Lei
                9.250/1995, art. 8º), além do PGBL até 12% da renda tributável, o limite que a
                Receita Federal informa. Na simplificada, o desconto é de 20% da renda, limitado a{" "}
                {formatBRL(MAX_SIMPLIFIED_DEDUCTION_ANNUAL)}.
              </p>
              <p>
                Nas duas aplica-se a tabela anual e a redução anual da Lei 15.270/2025, integral até
                R$ 60.000 de renda e decrescente até R$ 88.200. A calculadora mostra as duas e qual
                sai mais barata.
              </p>
            </SectionCard>

            <SectionCard section={section("inss")}>
              <p>
                Compara os dois planos do contribuinte individual. No normal, 20% sobre o salário de
                contribuição, entre o salário mínimo ({formatBRL(MINIMUM_WAGE)}) e o teto (
                {formatBRL(INSS_CEILING)}). No simplificado, 11% sobre o salário mínimo:{" "}
                {formatBRL(MINIMUM_WAGE * 0.11)} por mês.
              </p>
              <p>
                Para a aposentadoria, segue a Emenda Constitucional 103/2019: idade mínima de 65
                anos para homens e 62 para mulheres; tempo mínimo de 15 anos para quem se filiou
                antes de 13/11/2019 (art. 18) e, depois disso, 15 anos para mulheres e 20 para
                homens (art. 19); valor de 60% da média, mais 2 pontos por ano além de 20 anos de
                contribuição para homens e de 15 para mulheres (art. 26).
              </p>
            </SectionCard>

            <SectionCard section={section("clt-pj")}>
              <p>
                Do lado CLT, o salário líquido é a mesma conta da calculadora de salário líquido, e
                o pacote soma 13º salário, FGTS, férias com terço e benefícios usuais, estimados em
                1/12 + 15% do salário bruto. Esse percentual é uma premissa da calculadora, não um
                número da lei.
              </p>
              <p>
                Do lado PJ, o modelo é uma empresa de uma pessoa no Simples Nacional. O DAS usa a
                alíquota efetiva da Lei Complementar 123/2006, art. 18, com a receita de 12 meses
                igual a 12 vezes o faturamento: Anexo III quando o pró-labore chega a{" "}
                {FATOR_R_PERCENT}% do faturamento (Fator R), Anexo V abaixo disso. Sobre o
                pró-labore incidem INSS de 11%, até {formatBRL(PARTNER_INSS_CAP)}, e o imposto de
                renda pela tabela mensal. Os lucros distribuídos são isentos até R$ 50.000 por mês;
                acima disso, 10% sobre o total (Lei 9.250/1995, art. 6º-A, incluído pela Lei
                15.270/2025).
              </p>
              <p>
                A calculadora testa as estratégias de pró-labore e fica com a de maior líquido. O
                modelo vai até {formatBRL(SIMPLES_MODEL_REVENUE_LIMIT)} de receita por ano e não
                cobre MEI, Lucro Presumido nem exportação de serviços.
              </p>
            </SectionCard>

            <SectionCard section={section("previdencia")}>
              <p>
                Projeta o saldo de aportes mensais a uma taxa anual informada por você. O benefício
                fiscal do PGBL é a diferença entre o imposto do ano sem e com o aporte, cada um na
                declaração mais vantajosa, pela mesma conta da calculadora de IRPF. A dedução é
                limitada a 12% da renda tributável e só existe na declaração completa.
              </p>
            </SectionCard>

            <SectionCard section={section("beneficios")}>
              <p>
                Mostra quanto de aumento seria preciso para ter o mesmo dinheiro que o vale-refeição
                e a parte da empresa no vale-transporte dão, já que esses benefícios não pagam INSS
                nem imposto de renda (Leis 6.321/1976, 7.418/1985 e 7.713/1988). O aumento
                equivalente é o menor aumento bruto cujo líquido extra, pela calculadora de salário
                líquido, alcança o benefício. Do vale-transporte conta só o que passa de 6% do
                salário, a parte paga pela empresa.
              </p>
            </SectionCard>

            <SectionCard section={section("carro")}>
              <p>
                Soma o combustível, os custos anuais divididos por 12 (IPVA, seguro, licenciamento,
                pneus), os mensais (manutenção, estacionamento, pedágios, lavagem) e a depreciação
                anual informada sobre o valor do carro. O combustível é calculado em litros:
                quilômetros na cidade ÷ consumo na cidade + quilômetros na estrada ÷ consumo na
                estrada.
              </p>
              <p>
                No modo flex, o consumo com etanol é o da gasolina vezes o rendimento do etanol,{" "}
                {ETHANOL_YIELD_PERCENT}% por padrão: a mediana dos 261 carros flex da tabela PBE
                Veicular 2026 do Inmetro. A tabela por estado usa as médias da ANP de uma semana
                indicada na página.
              </p>
            </SectionCard>

            <SectionCard section={section("morar")}>
              <p>
                Soma moradia (aluguel, condomínio, IPTU), contas, alimentação, rotina, compras
                parceladas e a reserva, e compara o total com a renda líquida. A calculadora chama
                de confortável um custo de até {FINANCIAL_STATUS_BANDS.comfortable}% da renda, de
                atenção até {FINANCIAL_STATUS_BANDS.attention}%, de apertado até{" "}
                {FINANCIAL_STATUS_BANDS.tight}% e de muito apertado acima disso. São faixas da
                calculadora, não uma regra oficial.
              </p>
              <p>
                A tabela por capital soma um apartamento de 40 m² ao preço médio por m² do Índice
                FipeZAP e a cesta básica do DIEESE, no mês indicado na página.
              </p>
            </SectionCard>

            <SectionCard section={section("luz")}>
              <p>
                Para cada aparelho:{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm text-foreground">
                  kWh/mês = (potência em watts &times; horas/dia &times; dias/mês) / 1000
                </code>
                , vezes a tarifa em R$/kWh. A tarifa pode ser a da sua conta, já com impostos, ou a
                da distribuidora na ANEEL, que não inclui impostos nem bandeira.
              </p>
              <p>
                Geladeiras e freezer usam a potência média do dia, a partir do consumo mensal que a
                Eletrobrás mede e o IDEC publica, porque o compressor liga e desliga.
              </p>
            </SectionCard>

            <SectionCard section={section("assinaturas")}>
              <p>
                Converte cada assinatura para um valor mensal (semanal &times; 52 ÷ 12, trimestral ÷
                3, anual ÷ 12) e projeta 12, 36 e 60 meses. Para planos vendidos por mês e por ano,
                divide o preço anual pela mensalidade: é o número de meses a partir do qual o anual
                compensa.
              </p>
            </SectionCard>

            <SectionCard section={section("mudanca")}>
              <p>
                Soma transporte e operação, a entrada no imóvel (caução, primeiro aluguel, ligações)
                e as compras, mais uma reserva para imprevistos aplicada ao que o contrato não fixa:
                transporte, instalações e compras. A caução aparece à parte, porque volta ao
                inquilino com o rendimento da poupança (Lei 8.245/1991, art. 38).
              </p>
              <p>
                Para mudanças entre cidades, mostra o piso mínimo de frete da ANTT: distância
                &times; custo por km + custo de carga e descarga, com os coeficientes de carga geral
                em vigor desde {formatLongDate(ANTT_COEFFICIENTS_IN_FORCE_FROM)}.
              </p>
            </SectionCard>

            <SectionCard section={section("pet")}>
              <p>
                A ração é o preço do quilo vezes a porção diária, num mês de 365 ÷ 12 dias. A porção
                pode ser estimada pelo peso do animal e pela energia da ração, com as recomendações
                da FEDIAF: 110 kcal por quilo de peso elevado a 0,75 para um cão de 3 a 7 anos (130
                até 2 anos, 95 acima de 7), e 75 kcal por quilo elevado a 0,67 para um gato castrado
                ou que não sai de casa (100 se ativo).
              </p>
              <p>Vacinas, consultas, antipulgas e vermífugo anuais entram divididos por 12.</p>
            </SectionCard>

            <SectionCard section={section("fontes")}>
              <p>
                Dados públicos servem de ponto de partida: podem ter atraso, mudar de metodologia ou
                ficar indisponíveis. Todos os campos continuam editáveis para você usar os seus
                valores.
              </p>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-muted/50 text-foreground">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Fonte</th>
                      <th className="px-4 py-3 font-semibold">Usada em</th>
                      <th className="px-4 py-3 font-semibold">Dado</th>
                      <th className="px-4 py-3 font-semibold">Atualização</th>
                      <th className="px-4 py-3 font-semibold">Limitações</th>
                    </tr>
                  </thead>
                  <tbody className="text-foreground/85">
                    {SOURCES.map((row) => (
                      <tr key={row.source} className="border-t border-border">
                        <td className="px-4 py-3 font-medium">{row.source}</td>
                        <td className="px-4 py-3">{row.usedIn}</td>
                        <td className="px-4 py-3">{row.data}</td>
                        <td className="px-4 py-3">{row.updated}</td>
                        <td className="px-4 py-3">{row.limits}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <SectionCard section={section("limitacoes")}>
              <ul className="list-disc space-y-2 pl-5">
                <li>Preços variam por região, época e perfil de consumo.</li>
                <li>
                  As calculadoras de imposto seguem as regras gerais de 2026 e não cobrem todos os
                  casos: pensão alimentícia, rendimentos isentos, MEI e Lucro Presumido, por
                  exemplo, ficam de fora.
                </li>
                <li>
                  Não substituem a folha de pagamento, a declaração, um orçamento formal nem um
                  profissional.
                </li>
              </ul>
            </SectionCard>
          </div>
        </article>
      </div>
    </PageShell>
  );
}
