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
import { CopyResultButton, ResetButton, ShareResultButton } from "@/components/calculator/actions";
import { Prose } from "@/components/layout/PageShell";
import { getCalculator } from "@/data/calculators";
import { formatBRL } from "@/lib/format";
import { calculateLivingAloneCost, type LivingAloneInput } from "@/lib/calculators/livingAlone";
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

const FAQ: FAQItem[] = [
  {
    question: "Quanto custa morar sozinho no Brasil?",
    answer:
      "Depende muito da cidade e do estilo de vida. Em capitais como SP/RJ, o custo é R$ 2.500-5.000/mês. Em cidades do interior, R$ 1.500-2.500/mês. Fatores: aluguel, condomínio, contas, alimentação, transporte, lazer.",
  },
  {
    question: "O que entra no orçamento de morar sozinho?",
    answer:
      "Custos fixos: aluguel, condomínio, IPTU, luz, água, gás, internet. Variáveis: mercado, delivery, transporte, limpeza, lazer, assinaturas, saúde, emergências. Não esqueça reserva para imprevistos.",
  },
  {
    question: "Quanto custa aluguel em SP, RJ, MG?",
    answer:
      "Estúdio em SP: R$ 800-1.500. 1 quarto em SP: R$ 1.200-2.000. Rio de Janeiro: 10-15% a mais. Belo Horizonte: 20-30% a menos. Preço varia conforme bairro e proximidade do trabalho.",
  },
  {
    question: "Como saber se consigo morar sozinho?",
    answer:
      "Calcule: gastos mensais ÷ renda líquida. Se resultar em menos de 50% da renda, está seguro. 50-70% é apertado. Acima de 70%, espere ganhar mais ou gastar menos. Deixe 30% para emergências e lazer.",
  },
  {
    question: "Quanto guardar antes de sair de casa?",
    answer:
      "Idealmente: 3 meses de custos fixos + gastos iniciais (caução, frete, móveis, utensílios). Exemplo: R$ 2.000/mês em custos fixos = R$ 6.000 + R$ 5.000 (móveis) = R$ 11.000 como piso mínimo.",
  },
  {
    question: "Qual é o melhor bairro para morar sozinho?",
    answer:
      "Critérios: proximidade do trabalho (reduz transporte), segurança, comércio, transportes. Às vezes um bairro mais barato mas distante custa mais em transporte. Use a calculadora para testar diferentes cenários.",
  },
  {
    question: "Quanto custa condomínio + IPTU?",
    answer:
      "Condomínio varia R$ 150-500/mês (mais em áreas nobres). IPTU varia R$ 50-200/mês conforme valor do imóvel. Juntos podem ser R$ 200-700/mês. Negocie esses valores com o proprietário.",
  },
  {
    question: "Como economizar morando sozinho?",
    answer:
      "1) Aluguel é 40-50% do orçamento — escolha bem. 2) Compartilhe (reduz aluguel em 50%). 3) Cozinhe em casa (comida caseira é 60% mais barata). 4) Transporte público vs uber/carro. 5) Corte assinaturas desnecessárias.",
  },
  {
    question: "Vale a pena alugar ou comprar?",
    answer:
      "Aluguel: flexibilidade, sem compromisso. Compra: construir patrimônio, mas exige capital inicial. Com juros altos, alugar é mais barato. Com juros baixos, compra pode ser melhor a longo prazo (10+ anos).",
  },
  {
    question: "Quanto gasto com energia elétrica sozinho?",
    answer:
      "Média: R$ 100-200/mês em apartamento. Varia conforme clima, eletrodomésticos, hábitos (ar-condicionado é o vilão). Use nossa calculadora de conta de luz para ver por aparelho.",
  },
  {
    question: "A calculadora funciona para qualquer cidade?",
    answer:
      "Sim. Ajuste os valores de aluguel, contas, alimentação conforme sua realidade. A estrutura funciona igual — muda só os números. Para cidades maiores, aumente; para menores, reduza.",
  },
  {
    question: "Quanto guardar por mês como emergência?",
    answer:
      "Recomendação: 5-10% da renda ou R$ 200-500/mês. Emergências acontecem (geladeira quebra, dente dói, carro precisa conserto). Ter reserva evita dívida desnecessária.",
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

  const form = (
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
        <ResetButton onReset={() => setInput(DEFAULTS)} />
      </div>
    </form>
  );

  const resultBlock = (
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
            <strong>IPTU:</strong> imposto municipal, geralmente anual mas pode ser parcelado.
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
          condomínio e contas básicas dentro de um percentual confortável da renda líquida — de
          forma que ainda sobre dinheiro para alimentação, transporte, lazer e reserva. Quanto mais
          a moradia consome da renda, menos espaço sobra para o resto e para imprevistos. Trate isso
          como ponto de partida, não como regra fixa.
        </p>

        <h2>Custos iniciais que muita gente esquece</h2>
        <p>Além dos gastos mensais, mudar sozinho exige um valor inicial. Os principais são:</p>
        <ul>
          <li>Caução, depósito ou seguro-fiança</li>
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

      <div className="mx-auto max-w-6xl space-y-10 px-4 pb-16 sm:px-6">
        <FAQSection items={FAQ} />
        <RelatedCalculators
          slugs={["custo-carro", "conta-de-luz", "assinaturas", "custo-mudanca", "custo-pet"]}
        />
      </div>
    </CalculatorLayout>
  );
}
