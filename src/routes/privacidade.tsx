import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Calculadoras Brasil" },
      {
        name: "description",
        content:
          "Como o Calculadoras Brasil trata seus dados: nada de cadastro, cálculos no seu navegador e uso responsável de cookies.",
      },
      { property: "og:title", content: "Política de Privacidade — Calculadoras Brasil" },
      { property: "og:url", content: absoluteUrl("/privacidade") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/privacidade") }],
  }),
  component: PrivacidadePage,
});

function PrivacidadePage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Privacidade"
        title="Política de Privacidade"
        description="Resumo direto de como tratamos dados e cookies neste site."
      />
      <Prose>
        <h2>Dados que você informa nas calculadoras</h2>
        <p>
          Os valores que você digita nas calculadoras (quilometragem, salário, lista de assinaturas,
          etc.) são processados no <strong>seu próprio navegador</strong>. Não enviamos esses dados
          aos nossos servidores e não armazenamos eles em banco de dados.
        </p>

        <h2>Cookies e medição de audiência</h2>
        <p>
          Podemos utilizar cookies próprios e de terceiros (como provedores de analytics e
          publicidade) para entender o uso do site de forma agregada, sem identificar você
          pessoalmente. Você pode bloquear cookies nas configurações do seu navegador.
        </p>

        <h2>Publicidade</h2>
        <p>
          Quando exibirmos anúncios, eles poderão ser fornecidos por redes parceiras como o Google
          AdSense, que utilizam cookies para apresentar publicidade relevante. Não compartilhamos
          dados pessoais identificáveis com anunciantes.
        </p>

        <h2>Direitos do titular (LGPD)</h2>
        <p>
          Você pode solicitar informações sobre o tratamento de dados pelo nosso site escrevendo
          para o canal indicado na <a href="/contato">página de contato</a>. Como não criamos
          cadastros, normalmente não há dados pessoais armazenados sobre você.
        </p>

        <h2>Alterações</h2>
        <p>
          Esta política pode ser atualizada para refletir mudanças nas ferramentas que usamos.
          Recomendamos revisá-la periodicamente.
        </p>
      </Prose>
    </PageShell>
  );
}
