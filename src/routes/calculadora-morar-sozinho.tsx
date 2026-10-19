import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { CalculatorLayout, FormSection } from "@/components/calculator/CalculatorLayout";
import { CurrencyInput } from "@/components/calculator/fields";
import {
  BreakdownTable,
  DisclaimerBox,
  ResultSummaryCard,
  SimpleBarChart,
  WarningList,
} from "@/components/calculator/results";
import { FAQSection, type FAQItem } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { RelatedPosts } from "@/components/calculator/RelatedPosts";
import { CopyResultButton, ResetButton, ShareResultButton } from "@/components/calculator/actions";
import { Prose } from "@/components/layout/PageShell";
import { CAPITAL_LIVING_COSTS } from "@/data/capital-living-costs";
import { getCalculator, relatedPostsFor } from "@/data/calculators";
import { formatBRL } from "@/lib/format";
import { MINIMUM_WAGE } from "@/lib/calculators/inss-constants";
import {
  FINANCIAL_STATUS_BANDS,
  buildCapitalCostTable,
  calculateLivingAloneCost,
  type LivingAloneInput,
  type LivingAloneResult,
} from "@/lib/calculators/livingAlone";
import { absoluteUrl } from "@/lib/site";
import { calculatorStructuredData } from "@/lib/structured-data";
import { usePersistedState } from "@/lib/usePersistedState";

const meta = getCalculator("morar-sozinho")!;
const PAGE_TITLE = "Calculadora de Custo para Morar Sozinho";
const PAGE_DESCRIPTION =
  "Calcule uma estimativa de gastos mensais para morar sozinho, com aluguel, contas, alimentação, transporte, lazer e reserva.";

const DEFAULTS: LivingAloneInput = {
  rent: 1200,
  condoFee: 250,
  iptuMonthly: 80,
  electricity: 180,
  water: 80,
  gas: 80,
  internet: 120,
  phone: 60,
  groceries: 700,
  deliveryAndRestaurants: 250,
  transportation: 250,
  cleaningAndHygiene: 120,
  laundry: 0,
  furnitureInstallments: 200,
  subscriptions: 80,
  healthAndMedicine: 100,
  leisure: 250,
  emergencyReserve: 300,
  otherCosts: 100,
  netIncome: 3500,
};

// Every figure the FAQ and the table quote comes from the calculator or a cited report.
const DEFAULT_RESULT = calculateLivingAloneCost(DEFAULTS);

/** The flat the capitals table prices: the page's scenario, not a source's figure. */
const RENT_AREA_M2 = 40;
const CAPITAL_TABLE = buildCapitalCostTable(
  CAPITAL_LIVING_COSTS.capitals,
  RENT_AREA_M2,
  MINIMUM_WAGE,
);
const DEAREST = CAPITAL_TABLE[0];
const CHEAPEST = CAPITAL_TABLE[CAPITAL_TABLE.length - 1];

function capital(city: string) {
  const row = CAPITAL_TABLE.find((candidate) => candidate.city === city);
  const source = CAPITAL_LIVING_COSTS.capitals.find((candidate) => candidate.city === city);
  if (!row || !source) throw new Error(`No capital row for ${city}`);
  return { ...row, rentPerSquareMetre: source.rentPerSquareMetre };
}
const SAO_PAULO = capital("São Paulo");
const RIO = capital("Rio de Janeiro");
const BELO_HORIZONTE = capital("Belo Horizonte");

/**
 * FipeZAP, informe de setembro de 2026, across its 36 cities: one-bedroom flats
 * asked R$ 72,68/m² against R$ 54,77/m² for all sizes. Only the national split
 * is published, so the table uses each city's average and says so.
 */
const ONE_BEDROOM_RENT_PER_M2 = 72.68;
const ALL_SIZES_RENT_PER_M2 = 54.77;

/** FipeZAP, same report: rent a year as a share of the sale price, on average. */
const RENTAL_YIELD_PERCENT = 6.13;

function perSquareMetre(value: number): string {
  return `${formatBRL(value)}/m²`;
}

function minimumWages(value: number): string {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

const FAQ: FAQItem[] = [
  {
    question: "Quanto custa morar sozinho no Brasil?",
    answer: `Depende da cidade e do padrão de vida. Só o aluguel de um apartamento de ${RENT_AREA_M2} m² e a cesta básica custavam, em setembro de 2026, de ${formatBRL(CHEAPEST.monthlyTotal)} em ${CHEAPEST.city} a ${formatBRL(DEAREST.monthlyTotal)} em ${DEAREST.city}, como mostra a tabela por capital. Condomínio, contas, transporte e o resto vêm por cima: no exemplo da calculadora, o total chega a ${formatBRL(DEFAULT_RESULT.monthlyTotal)} por mês.`,
  },
  {
    question: "O que entra no orçamento de morar sozinho?",
    answer:
      "Custos fixos: aluguel, condomínio, IPTU, luz, água, gás e internet. Variáveis: mercado, delivery, transporte, limpeza, lazer, assinaturas, saúde e emergências. Não esqueça uma reserva para imprevistos.",
  },
  {
    question: "Quanto custa o aluguel em São Paulo, no Rio e em Belo Horizonte?",
    answer: `No Índice FipeZAP de setembro de 2026, o preço médio pedido nos anúncios de aluguel era de ${perSquareMetre(SAO_PAULO.rentPerSquareMetre)} em São Paulo, ${perSquareMetre(RIO.rentPerSquareMetre)} no Rio de Janeiro e ${perSquareMetre(BELO_HORIZONTE.rentPerSquareMetre)} em Belo Horizonte: ${formatBRL(SAO_PAULO.rent)}, ${formatBRL(RIO.rent)} e ${formatBRL(BELO_HORIZONTE.rent)} por um apartamento de ${RENT_AREA_M2} m². É a média de apartamentos de todos os tamanhos e bairros; os de um dormitório custam mais por m².`,
  },
  {
    question: "Como saber se consigo morar sozinho?",
    answer: `Divida o custo mensal pela renda líquida. A calculadora chama de confortável um custo de até ${FINANCIAL_STATUS_BANDS.comfortable}% da renda, de atenção até ${FINANCIAL_STATUS_BANDS.attention}%, de apertado até ${FINANCIAL_STATUS_BANDS.tight}% e de muito apertado acima disso ou quando a conta não fecha. São faixas da calculadora, não uma regra oficial: o que importa é sobrar o bastante para imprevistos.`,
  },
  {
    question: "Quais são os custos para sair de casa e alugar?",
    answer:
      "Além de móveis, eletrodomésticos e mudança, o contrato pode pedir uma garantia: caução, fiador, seguro-fiança ou cessão de cotas de fundo, e só uma delas (Lei 8.245/1991, art. 37). A caução em dinheiro não pode passar de três aluguéis (art. 38). O aluguel antecipado só pode ser cobrado quando não há garantia ou na locação para temporada (arts. 20 e 42). As taxas de intermediação e de administração da imobiliária são do proprietário, não do inquilino (art. 22, VII), e cobrar valores além do aluguel e dos encargos permitidos é contravenção penal (art. 43).",
  },
  {
    question: "Qual é o melhor bairro para morar sozinho?",
    answer:
      "Pese a distância do trabalho, a segurança, o comércio e o transporte. Um bairro mais barato e distante pode sair mais caro somando o transporte. Use a calculadora para comparar os cenários.",
  },
  {
    question: "Quem paga o condomínio e o IPTU?",
    answer:
      "Pela Lei do Inquilinato, o inquilino paga as despesas ordinárias de condomínio (Lei 8.245/1991, art. 23, XII), e o proprietário as extraordinárias, como obras, pintura da fachada e fundo de reserva (art. 22, X). O IPTU é do proprietário, salvo se o contrato passar a obrigação ao inquilino (art. 22, VIII): confira o contrato antes de assinar.",
  },
  {
    question: "Como economizar morando sozinho?",
    answer:
      "Comece pela maior categoria do resultado. Comparar o aluguel com o preço por m² da sua cidade, dividir o imóvel, cozinhar em casa, trocar viagens de aplicativo por transporte público e cortar assinaturas que você não usa são os ajustes que mais mexem no total.",
  },
  {
    question: "Vale a pena alugar ou comprar?",
    answer: `Depende do preço do imóvel, dos juros e de quanto tempo você vai ficar. Uma referência: em setembro de 2026, o FipeZAP estimou o aluguel residencial, em média, em ${RENTAL_YIELD_PERCENT.toLocaleString("pt-BR")}% ao ano do preço de venda. Se o dinheiro da compra rende mais do que isso aplicado, alugar tende a sair mais barato, sem contar a valorização do imóvel; financiar acrescenta os juros do contrato.`,
  },
  {
    question: "Quanto gasto com energia elétrica morando sozinho?",
    answer:
      "Depende dos aparelhos que você usa e da tarifa da sua distribuidora. A calculadora de conta de luz calcula aparelho por aparelho, com a tarifa da ANEEL para o seu estado.",
  },
  {
    question: "A calculadora funciona para qualquer cidade?",
    answer: `Sim: ajuste aluguel, contas e alimentação à sua realidade. A tabela por capital cobre as ${CAPITAL_TABLE.length} capitais que o Índice FipeZAP acompanha.`,
  },
  {
    question: "Quanto guardar por mês como reserva de emergência?",
    answer: `Não há percentual oficial. O exemplo da calculadora guarda ${formatBRL(DEFAULTS.emergencyReserve)} por mês; o que importa é o total guardado cobrir alguns meses de custos fixos se a renda parar.`,
  },
];

export const Route = createFileRoute("/calculadora-morar-sozinho")({
  head: () => ({
    meta: [
      { title: `${PAGE_TITLE} | Calcule Brasil` },
      { name: "description", content: PAGE_DESCRIPTION },
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: PAGE_DESCRIPTION },
      { property: "og:url", content: absoluteUrl(meta.path) },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl(meta.path) }],
    scripts: calculatorStructuredData({
      name: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      path: meta.path,
      applicationCategory: "FinanceApplication",
      faq: FAQ,
    }),
  }),
  component: LivingAlonePage,
});

const STATUS_TONE: Record<string, "primary" | "neutral"> = {
  comfortable: "primary",
  attention: "neutral",
  tight: "neutral",
  critical: "neutral",
  unknown: "neutral",
};

function LivingAloneForm({
  input,
  update,
  onReset,
}: {
  input: LivingAloneInput;
  update: <K extends keyof LivingAloneInput>(key: K, value: LivingAloneInput[K]) => void;
  onReset: () => void;
}) {
  return (
    <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
      <FormSection title="Moradia">
        <CurrencyInput label="Aluguel" value={input.rent} onChange={(v) => update("rent", v)} />
        <CurrencyInput
          label="Condomínio"
          value={input.condoFee}
          onChange={(v) => update("condoFee", v)}
        />
        <CurrencyInput
          label="IPTU mensal"
          value={input.iptuMonthly}
          onChange={(v) => update("iptuMonthly", v)}
          hint="Se o IPTU for anual, divida por 12 antes de preencher."
        />
      </FormSection>

      <FormSection title="Contas básicas">
        <CurrencyInput
          label="Conta de luz"
          value={input.electricity}
          onChange={(v) => update("electricity", v)}
        />
        <CurrencyInput label="Água" value={input.water} onChange={(v) => update("water", v)} />
        <CurrencyInput label="Gás" value={input.gas} onChange={(v) => update("gas", v)} />
        <CurrencyInput
          label="Internet"
          value={input.internet}
          onChange={(v) => update("internet", v)}
        />
        <CurrencyInput label="Celular" value={input.phone} onChange={(v) => update("phone", v)} />
      </FormSection>

      <FormSection title="Alimentação">
        <CurrencyInput
          label="Mercado / alimentação em casa"
          value={input.groceries}
          onChange={(v) => update("groceries", v)}
        />
        <CurrencyInput
          label="Delivery e restaurantes"
          value={input.deliveryAndRestaurants}
          onChange={(v) => update("deliveryAndRestaurants", v)}
        />
      </FormSection>

      <FormSection title="Rotina">
        <CurrencyInput
          label="Transporte"
          value={input.transportation}
          onChange={(v) => update("transportation", v)}
        />
        <CurrencyInput
          label="Limpeza e higiene"
          value={input.cleaningAndHygiene}
          onChange={(v) => update("cleaningAndHygiene", v)}
        />
        <CurrencyInput
          label="Lavanderia"
          value={input.laundry}
          onChange={(v) => update("laundry", v)}
        />
        <CurrencyInput
          label="Assinaturas"
          value={input.subscriptions}
          onChange={(v) => update("subscriptions", v)}
        />
        <CurrencyInput
          label="Saúde e remédios"
          value={input.healthAndMedicine}
          onChange={(v) => update("healthAndMedicine", v)}
        />
        <CurrencyInput label="Lazer" value={input.leisure} onChange={(v) => update("leisure", v)} />
        <CurrencyInput
          label="Outros custos"
          value={input.otherCosts}
          onChange={(v) => update("otherCosts", v)}
        />
      </FormSection>

      <FormSection title="Estrutura e reserva">
        <CurrencyInput
          label="Parcelas de móveis e eletrodomésticos"
          value={input.furnitureInstallments}
          onChange={(v) => update("furnitureInstallments", v)}
        />
        <CurrencyInput
          label="Reserva de emergência mensal"
          value={input.emergencyReserve}
          onChange={(v) => update("emergencyReserve", v)}
          hint="Quanto você pretende guardar por mês como reserva."
        />
      </FormSection>

      <FormSection title="Renda">
        <CurrencyInput
          label="Renda líquida mensal"
          value={input.netIncome}
          onChange={(v) => update("netIncome", v)}
          hint="Opcional. Se informada, mostramos o percentual da renda e a sobra mensal."
        />
      </FormSection>

      <DisclaimerBox>
        Os valores padrão acima são apenas exemplos editáveis. O custo real varia muito por cidade,
        bairro, contrato de aluguel, estilo de vida e renda. Substitua pelos seus próprios números.
      </DisclaimerBox>

      <div className="flex flex-wrap gap-2">
        <ResetButton onReset={onReset} />
      </div>
    </form>
  );
}

function LivingAloneResults({
  result,
  shareText,
}: {
  result: LivingAloneResult;
  shareText: string;
}) {
  return (
    <div className="space-y-3">
      <ResultSummaryCard
        title="Custo mensal total"
        value={formatBRL(result.monthlyTotal)}
        description={`Status: ${result.financialStatusLabel}`}
        tone={STATUS_TONE[result.financialStatus] ?? "primary"}
      />
      <div className="grid grid-cols-2 gap-3">
        <ResultSummaryCard title="Custo anual" value={formatBRL(result.annualTotal)} />
        <ResultSummaryCard
          title="% da renda"
          value={
            result.incomePercentage !== null
              ? `${result.incomePercentage.toFixed(1).replace(".", ",")}%`
              : "—"
          }
          description={result.incomePercentage === null ? "Informe a renda líquida" : undefined}
        />
      </div>
      <ResultSummaryCard
        title="Sobra mensal"
        value={result.remainingIncome !== null ? formatBRL(result.remainingIncome) : "—"}
        description={
          result.remainingIncome === null
            ? "Informe a renda líquida"
            : result.remainingIncome < 0
              ? "Cenário negativo — gastos acima da renda"
              : undefined
        }
        tone={result.remainingIncome !== null && result.remainingIncome < 0 ? "neutral" : "neutral"}
      />

      {result.highlights.length > 0 ? (
        <ul className="space-y-2 rounded-xl border border-border bg-surface p-4 text-sm text-foreground/85">
          {result.highlights.map((h) => (
            <li key={h}>• {h}</li>
          ))}
        </ul>
      ) : null}

      <WarningList warnings={result.warnings} />

      <div className="flex flex-wrap gap-2">
        <CopyResultButton text={shareText} />
        <ShareResultButton title={PAGE_TITLE} text={shareText} />
      </div>
    </div>
  );
}

/** The editorial section under the calculator. Static, so it takes no props. */
function CapitalCostSection() {
  return (
    <Prose>
      <h2>Quanto custa morar sozinho em cada capital</h2>
      <p>
        A tabela foi calculada pela própria calculadora com só dois custos: o aluguel de um
        apartamento de {RENT_AREA_M2} m² ao preço médio por m² da cidade no Índice FipeZAP de
        setembro de 2026, e a cesta básica do DIEESE no mesmo mês, a quantidade de alimentos que a
        lei define para um adulto por mês. Condomínio, contas e transporte ficam de fora, por isso é
        um piso, não o custo total.
      </p>
      <div className="not-prose overflow-x-auto rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)]">
        <table className="w-full min-w-[600px] text-sm">
          <caption className="sr-only">
            Aluguel de {RENT_AREA_M2} m² e cesta básica por capital, setembro de 2026
          </caption>
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th scope="col" className="px-3 py-2.5">
                Capital
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Aluguel de {RENT_AREA_M2} m²
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Cesta básica
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Aluguel + cesta
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Em salários mínimos
              </th>
            </tr>
          </thead>
          <tbody>
            {CAPITAL_TABLE.map((row) => (
              <tr key={row.city} className="border-t border-border/70">
                <th scope="row" className="px-3 py-2 text-left font-medium text-foreground">
                  {row.city} ({row.uf})
                </th>
                <td className="px-3 py-2 text-right">{formatBRL(row.rent)}</td>
                <td className="px-3 py-2 text-right">{formatBRL(row.basicBasket)}</td>
                <td className="px-3 py-2 text-right font-semibold text-foreground">
                  {formatBRL(row.monthlyTotal)}
                </td>
                <td className="px-3 py-2 text-right">{minimumWages(row.minimumWages)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        O FipeZAP mede o preço pedido em anúncios de novos aluguéis de apartamentos de todos os
        tamanhos. Os de um dormitório custam mais por m²: no país,{" "}
        {perSquareMetre(ONE_BEDROOM_RENT_PER_M2)} contra {perSquareMetre(ALL_SIZES_RENT_PER_M2)} da
        média. Boa Vista, Macapá, Palmas, Porto Velho e Rio Branco têm cesta básica, mas não têm
        índice de aluguel, e ficaram de fora. O salário mínimo usado é o de 2026,{" "}
        {formatBRL(MINIMUM_WAGE)}.
      </p>
      <p>
        Fontes:{" "}
        <a href={CAPITAL_LIVING_COSTS.rentSourceUrl} target="_blank" rel="noreferrer">
          {CAPITAL_LIVING_COSTS.rentSource}
        </a>{" "}
        e{" "}
        <a href={CAPITAL_LIVING_COSTS.basketSourceUrl} target="_blank" rel="noreferrer">
          {CAPITAL_LIVING_COSTS.basketSource}
        </a>
        .
      </p>
    </Prose>
  );
}

function LivingAloneArticle() {
  return (
    <Prose collapsibleTitle="Saiba mais sobre morar sozinho">
      <h2>O que considerar antes de morar sozinho?</h2>
      <p>
        Morar sozinho envolve muito mais do que o valor do aluguel. Para ter uma estimativa
        realista, vale considerar todos os gastos recorrentes que aparecem no fim do mês.
      </p>
      <ul>
        <li>
          <strong>Aluguel:</strong> a base do orçamento de moradia.
        </li>
        <li>
          <strong>Condomínio:</strong> obrigatório em apartamentos, varia muito por prédio.
        </li>
        <li>
          <strong>IPTU:</strong> imposto municipal, anual ou parcelado. No aluguel, é do
          proprietário, salvo se o contrato disser o contrário (Lei 8.245/1991, art. 22, VIII).
        </li>
        <li>
          <strong>Luz:</strong> depende do consumo e da tarifa local.
        </li>
        <li>
          <strong>Água:</strong> normalmente cobrada por consumo, com mínimo mensal.
        </li>
        <li>
          <strong>Gás:</strong> encanado ou botijão, conforme o imóvel.
        </li>
        <li>
          <strong>Internet:</strong> essencial para trabalho e lazer.
        </li>
        <li>
          <strong>Mercado:</strong> compras de alimentos e itens básicos.
        </li>
        <li>
          <strong>Transporte:</strong> ônibus, metrô, app ou combustível.
        </li>
        <li>
          <strong>Limpeza e higiene:</strong> produtos de casa e cuidados pessoais.
        </li>
        <li>
          <strong>Lazer:</strong> sair, cinema, restaurantes, hobbies.
        </li>
        <li>
          <strong>Móveis:</strong> parcelas de compras feitas para montar a casa.
        </li>
        <li>
          <strong>Reserva:</strong> valor guardado todo mês para imprevistos.
        </li>
      </ul>

      <h2>Quanto da renda pode ir para moradia?</h2>
      <p>
        Não existe uma regra oficial, mas uma referência usada por muita gente é manter aluguel,
        condomínio e contas básicas dentro de um percentual confortável da renda líquida — de forma
        que ainda sobre dinheiro para alimentação, transporte, lazer e reserva. Quanto mais a
        moradia consome da renda, menos espaço sobra para o resto e para imprevistos. Trate isso
        como ponto de partida, não como regra fixa.
      </p>

      <h2>Custos iniciais que muita gente esquece</h2>
      <p>Além dos gastos mensais, mudar sozinho exige um valor inicial. Os principais são:</p>
      <ul>
        <li>
          A garantia do contrato: caução de até três aluguéis, fiador ou seguro-fiança, só uma delas
          (Lei 8.245/1991, arts. 37 e 38)
        </li>
        <li>Frete da mudança</li>
        <li>Móveis essenciais (cama, mesa, sofá, armários)</li>
        <li>Eletrodomésticos (geladeira, fogão, micro-ondas, máquina de lavar)</li>
        <li>Utensílios de cozinha (panelas, talheres, pratos, copos)</li>
        <li>Instalação de internet e ajuste de medidores</li>
        <li>Produtos de limpeza e materiais para a primeira semana</li>
        <li>Pequenos reparos, pintura, cortinas e iluminação</li>
      </ul>

      <h2>Como interpretar o resultado</h2>
      <p>A calculadora mostra cinco informações principais para ajudar a decisão:</p>
      <ul>
        <li>
          <strong>Total mensal:</strong> soma de todas as categorias informadas.
        </li>
        <li>
          <strong>Total anual:</strong> total mensal multiplicado por 12.
        </li>
        <li>
          <strong>Percentual da renda:</strong> quanto o custo representa da renda líquida.
        </li>
        <li>
          <strong>Sobra mensal:</strong> diferença entre renda líquida e custo mensal.
        </li>
        <li>
          <strong>Maior categoria:</strong> destaca onde está o maior peso do orçamento.
        </li>
      </ul>

      <h2>Exemplo prático</h2>
      <p>
        Uma pessoa com renda líquida de R$ 3.500, aluguel de R$ 1.200 e condomínio de R$ 250 já
        parte com cerca de R$ 1.450 só em moradia. Somando luz, água, gás, internet, mercado,
        transporte, lazer e uma reserva mínima, o orçamento pode terminar apertado — ainda mais se
        houver delivery frequente, parcelas de móveis ou assinaturas acumuladas. Por isso é
        importante simular o cenário antes de assinar o contrato.
      </p>

      <h2>Limitações</h2>
      <p>
        O resultado é uma estimativa educativa. Os valores variam por cidade, bairro, contrato,
        padrão de consumo e estilo de vida. A calculadora não substitui planejamento financeiro
        profissional, nem consulta a corretores, contadores ou instituições financeiras. Use como
        ponto de partida para conversar sobre o seu orçamento.
      </p>
    </Prose>
  );
}

function LivingAlonePage() {
  const [input, setInput] = usePersistedState<LivingAloneInput>(
    "calculadoras-brasil:morar-sozinho:v1",
    DEFAULTS,
  );
  const result = useMemo(() => calculateLivingAloneCost(input), [input]);

  function update<K extends keyof LivingAloneInput>(key: K, value: LivingAloneInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  const shareText =
    result.incomePercentage !== null && result.remainingIncome !== null
      ? `Meu custo estimado para morar sozinho é de ${formatBRL(result.monthlyTotal)} por mês, ou ${formatBRL(result.annualTotal)} por ano. Isso representa ${result.incomePercentage.toFixed(1).replace(".", ",")}% da minha renda líquida informada, com sobra estimada de ${formatBRL(result.remainingIncome)}.`
      : `Meu custo estimado para morar sozinho é de ${formatBRL(result.monthlyTotal)} por mês, ou ${formatBRL(result.annualTotal)} por ano.`;
  const form = <LivingAloneForm input={input} update={update} onReset={() => setInput(DEFAULTS)} />;
  const resultBlock = <LivingAloneResults result={result} shareText={shareText} />;

  return (
    <CalculatorLayout
      title="Calculadora de custo para morar sozinho"
      description={PAGE_DESCRIPTION}
      form={form}
      result={resultBlock}
    >
      <section className="mx-auto max-w-6xl px-4 pb-6 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <SimpleBarChart rows={result.breakdown} title="Composição do custo mensal" />
          <BreakdownTable
            rows={result.breakdown}
            caption="Breakdown de custos mensais e anuais por categoria"
          />
        </div>
      </section>

      <CapitalCostSection />

      <LivingAloneArticle />

      <div className="mx-auto max-w-6xl space-y-10 px-4 pb-16 sm:px-6">
        <FAQSection items={FAQ} />
        <RelatedCalculators
          slugs={["custo-carro", "conta-de-luz", "assinaturas", "custo-mudanca", "custo-pet"]}
        />
        <RelatedPosts slugs={relatedPostsFor("morar-sozinho")} />
      </div>
    </CalculatorLayout>
  );
}
