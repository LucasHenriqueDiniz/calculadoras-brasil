import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/blog/recibo-rpa-autonomo")({
  head: () => ({
    meta: [
      { title: "Como Emitir Recibo de Autônomo (RPA) em 2026 | Calcule Brasil" },
      {
        name: "description",
        content:
          "Guia completo: como emitir recibo de autônomo (RPA), obrigações, prazos e erros comuns.",
      },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/blog/recibo-rpa-autonomo") }],
  }),
  component: BlogPost,
});

function BlogPost() {
  return (
    <PageShell>
      <article>
        <PageHeader
          eyebrow="guia • 8 min"
          title="Como Emitir Recibo de Autônomo (RPA)"
          description="Passo a passo para emitir RPA, comprovar ganhos e se regularizar como autônomo."
        />
        <Prose>
          <h2>O Que é RPA?</h2>
          <p>
            Recibo de Pagamento Autônomo (RPA) é um documento que comprova que você recebeu como
            autônomo. Cliente paga, você emite RPA.
          </p>

          <h2>Obrigação Legal</h2>
          <p>
            Autônomos DEVEM emitir RPA. É obrigatório por lei. Sem RPA, não há registro de renda -
            problema na Receita Federal.
          </p>

          <h2>Como Emitir</h2>
          <p>Opções:</p>
          <ul>
            <li>Manualmente (papel + caneta) - simples mas desatualizado</li>
            <li>Por App - Prefeitura tem apps oficiais</li>
            <li>Plataformas online - exemplo: Nota Fiscal Paulista, e-Recibo</li>
            <li>Contador - mais caro, mas regulariza tudo</li>
          </ul>

          <h2>Informações Essenciais no RPA</h2>
          <ul>
            <li>Seu nome e CPF</li>
            <li>Nome e CNPJ de quem pagou</li>
            <li>Valor bruto e descontos (INSS, Imposto de Renda)</li>
            <li>Descrição do serviço prestado</li>
            <li>Data de emissão</li>
          </ul>

          <h2>Prazos</h2>
          <p>Emita RPA até o 5º dia útil do mês seguinte ao da prestação do serviço.</p>

          <h2>Erros Comuns</h2>
          <p>
            Não emitir RPA, editar RPA depois de emitido, valores inconsistentes com ganhos reais.
          </p>
        </Prose>
        <RelatedCalculators />
      </article>
    </PageShell>
  );
}
