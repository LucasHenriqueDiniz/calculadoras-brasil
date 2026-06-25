import { createFileRoute } from "@tanstack/react-router";
import {
  Car,
  CreditCard,
  Database,
  Home as HomeIcon,
  ListChecks,
  PawPrint,
  ShieldAlert,
  Truck,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageShell, PageHeader } from "@/components/layout/PageShell";
import { absoluteUrl } from "@/lib/site";

interface Section {
  id: string;
  label: string;
  title: string;
  icon: LucideIcon;
}

const sections: Section[] = [
  { id: "principios", label: "Princípios gerais", title: "Princípios gerais", icon: ListChecks },
  { id: "carro", label: "Custo de carro", title: "Custo de carro", icon: Car },
  { id: "morar", label: "Morar sozinho", title: "Morar sozinho", icon: HomeIcon },
  { id: "luz", label: "Conta de luz", title: "Conta de luz", icon: Zap },
  { id: "assinaturas", label: "Assinaturas", title: "Assinaturas", icon: CreditCard },
  { id: "mudanca", label: "Custo de mudança", title: "Custo de mudança", icon: Truck },
  { id: "pet", label: "Custo de pet", title: "Custo de pet", icon: PawPrint },
  { id: "fontes", label: "Dados públicos", title: "Dados públicos e cache", icon: Database },
  { id: "limitacoes", label: "Limitações", title: "Limitações", icon: ShieldAlert },
];

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
        <div className="lg:grid lg:grid-cols-[16rem_1fr] lg:gap-12">
          {/* Índice */}
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

          {/* Conteúdo */}
          <div className="space-y-6">
            <SectionCard section={sections[0]}>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  Toda calculadora trabalha com <strong>valores informados por você</strong> e
                  médias públicas. Nenhum valor é &ldquo;oficial&rdquo; ou personalizado para a sua
                  realidade individual.
                </li>
                <li>
                  Quando usamos uma média, deixamos isso claro no campo e permitimos que você
                  ajuste.
                </li>
                <li>
                  Resultados são sempre tratados como <strong>estimativas mensais</strong>, salvo
                  quando indicado.
                </li>
              </ul>
            </SectionCard>

            <SectionCard section={sections[1]}>
              <p>
                Combinamos quatro blocos: combustível (km rodados &times; consumo &times; preço do
                litro), custos anuais (IPVA + seguro + licenciamento) divididos por 12, manutenção e
                desgaste (revisões, pneus, óleo) e depreciação anual estimada do veículo.
              </p>
            </SectionCard>

            <SectionCard section={sections[2]}>
              <p>
                Somamos custos fixos do imóvel (aluguel, condomínio, IPTU rateado), contas básicas
                (luz, água, gás, internet) e custos variáveis (mercado, transporte, lazer) a partir
                do perfil informado. Recomendamos manter o custo fixo abaixo de 35% da renda
                líquida.
              </p>
            </SectionCard>

            <SectionCard section={sections[3]}>
              <p>
                Para cada aparelho:{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm text-foreground">
                  kWh/mês = (potência em watts &times; horas/dia &times; dias/mês) / 1000
                </code>
                . Em seguida multiplicamos por uma tarifa em R$/kWh informada por você (a partir da
                sua conta de luz) para obter o custo mensal.
              </p>
            </SectionCard>

            <SectionCard section={sections[4]}>
              <p>
                Normalizamos todas as assinaturas para uma base mensal (uma anual de R$ 240 vira R$
                20 por mês) e projetamos o gasto em 12, 36 e 60 meses, permitindo simular cortes.
              </p>
            </SectionCard>

            <SectionCard section={sections[5]}>
              <p>
                Estimamos o frete a partir da distância e do volume aproximado, somamos materiais de
                embalagem, taxas do imóvel novo (caução, vistoria) e uma reserva para móveis e
                eletrodomésticos faltantes.
              </p>
            </SectionCard>

            <SectionCard section={sections[6]}>
              <p>
                Para cada animal, estimamos consumo mensal de ração por porte e idade, banho/tosa,
                vacinas anuais diluídas por mês, vermífugo, antipulgas e — opcional — plano de saúde
                pet.
              </p>
            </SectionCard>

            <SectionCard section={sections[7]}>
              <p>
                Quando disponível, o site pode usar dados públicos para sugerir valores iniciais,
                como preços médios de combustíveis, tarifas de energia ou dados de eficiência
                veicular. Esses dados servem como ponto de partida e podem estar sujeitos a atraso,
                mudanças de metodologia, indisponibilidade ou diferenças regionais. Todos os campos
                continuam editáveis para que você use seus valores reais.
              </p>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-muted/50 text-foreground">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Fonte</th>
                      <th className="px-4 py-3 font-semibold">Usada em</th>
                      <th className="px-4 py-3 font-semibold">Tipo de dado</th>
                      <th className="px-4 py-3 font-semibold">Atualização estimada</th>
                      <th className="px-4 py-3 font-semibold">Limitações</th>
                    </tr>
                  </thead>
                  <tbody className="text-foreground/85">
                    <tr className="border-t border-border">
                      <td className="px-4 py-3 font-medium">ANP</td>
                      <td className="px-4 py-3">Custo de carro</td>
                      <td className="px-4 py-3">Preços médios de combustíveis</td>
                      <td className="px-4 py-3">Planilha semanal, com cache diário no site</td>
                      <td className="px-4 py-3">Preços variam por posto e cidade</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="px-4 py-3 font-medium">ANEEL</td>
                      <td className="px-4 py-3">Conta de luz</td>
                      <td className="px-4 py-3">Tarifa B1 residencial convencional (TUSD + TE)</td>
                      <td className="px-4 py-3">Dataset oficial, com cache semanal no site</td>
                      <td className="px-4 py-3">
                        Não inclui impostos, bandeiras, iluminação pública e regras locais
                      </td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="px-4 py-3 font-medium">Inmetro/PBE Veicular</td>
                      <td className="px-4 py-3">Custo de carro</td>
                      <td className="px-4 py-3">Consumo e eficiência veicular</td>
                      <td className="px-4 py-3">Mensal ou manual</td>
                      <td className="px-4 py-3">O consumo real varia com uso e manutenção</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="px-4 py-3 font-medium">IBGE/dados.gov.br</td>
                      <td className="px-4 py-3">Localização</td>
                      <td className="px-4 py-3">UF, município e datasets</td>
                      <td className="px-4 py-3">Eventual</td>
                      <td className="px-4 py-3">Fonte auxiliar para seleção e normalização</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <SectionCard section={sections[8]}>
              <ul className="list-disc space-y-2 pl-5">
                <li>Preços variam por região, época e perfil de consumo.</li>
                <li>Não consideramos impostos pessoais nem situações tributárias específicas.</li>
                <li>Não substituem orçamentos formais nem consultoria profissional.</li>
              </ul>
            </SectionCard>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
