import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Building2,
  Cookie,
  Database,
  Megaphone,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  UserCheck,
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
  {
    id: "controlador",
    label: "Quem somos",
    title: "Quem é o controlador dos dados",
    icon: Building2,
  },
  { id: "dados", label: "Dados das calculadoras", title: "Dados que você informa", icon: Database },
  {
    id: "coleta-automatica",
    label: "Dados coletados automaticamente",
    title: "Dados coletados automaticamente",
    icon: Database,
  },
  { id: "cookies", label: "Cookies", title: "Cookies e tecnologias similares", icon: Cookie },
  {
    id: "publicidade",
    label: "Publicidade (AdSense)",
    title: "Publicidade e Google AdSense",
    icon: Megaphone,
  },
  {
    id: "anuncios-personalizados",
    label: "Anúncios personalizados",
    title: "Anúncios personalizados e como desativá-los",
    icon: SlidersHorizontal,
  },
  {
    id: "direitos",
    label: "Direitos (LGPD)",
    title: "Bases legais e direitos do titular (LGPD)",
    icon: UserCheck,
  },
  { id: "alteracoes", label: "Alterações", title: "Alterações nesta política", icon: RefreshCw },
];

const LAST_UPDATE = "6 de agosto de 2026";
const PRIVACY_EMAIL = "lucas.hdo@hotmail.com";

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  const isMailto = href.startsWith("mailto:");
  return (
    <a
      href={href}
      {...(isMailto ? {} : { target: "_blank", rel: "noopener noreferrer" })}
      className="font-medium text-primary underline underline-offset-2"
    >
      {children}
    </a>
  );
}

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade | Calcule Brasil" },
      {
        name: "description",
        content:
          "Como o Calcule Brasil trata seus dados: sem cadastro, cálculos no seu navegador, cookies próprios e de terceiros, Google AdSense, anúncios personalizados e direitos LGPD.",
      },
      { property: "og:title", content: "Política de Privacidade | Calcule Brasil" },
      { property: "og:url", content: absoluteUrl("/privacidade") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/privacidade") }],
  }),
  component: PrivacidadePage,
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

function PrivacidadePage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Privacidade"
        title="Política de Privacidade"
        description="Resumo direto de como tratamos dados e cookies neste site."
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="lg:grid lg:grid-cols-[16rem_1fr] lg:gap-12">
          <nav aria-label="Índice da política" className="mb-10 lg:mb-0">
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

          <div className="space-y-6">
            <p className="px-1 text-sm text-muted-foreground">Última atualização: {LAST_UPDATE}.</p>

            <SectionCard section={sections[0]}>
              <p>
                O Calcule Brasil (<strong>calculebrasil.com</strong>) é um projeto editorial
                independente mantido por Lucas Henrique Diniz, pessoa física, no Brasil. Para
                efeitos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018), ele é o{" "}
                <strong>controlador</strong> dos dados pessoais tratados neste site.
              </p>
              <p>
                Contato para assuntos de privacidade:{" "}
                <ExternalLink href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</ExternalLink> ou
                pela{" "}
                <Link
                  to="/contato"
                  className="font-medium text-primary underline underline-offset-2"
                >
                  página de contato
                </Link>
                .
              </p>
              <p>
                O site é hospedado na Cloudflare, que atua como operadora de infraestrutura e pode
                processar dados de conexão (como endereço IP) para entregar as páginas e proteger o
                serviço contra abuso.
              </p>
            </SectionCard>

            <SectionCard section={sections[1]}>
              <p>
                Os valores que você digita nas calculadoras (quilometragem, salário, lista de
                assinaturas, etc.) são processados no <strong>seu próprio navegador</strong>. Esses
                valores não são enviados aos nossos servidores, não são gravados em banco de dados e
                não são compartilhados com anunciantes.
              </p>
              <p>
                Para sua conveniência, algumas calculadoras guardam os últimos valores preenchidos
                no <strong>armazenamento local do navegador</strong> (<code>localStorage</code>),
                para que você não precise digitar tudo de novo ao voltar. Esses dados ficam apenas
                no seu dispositivo e podem ser apagados a qualquer momento limpando os dados de
                navegação do site.
              </p>
              <p>
                O site não exige cadastro, não cria conta de usuário e não solicita CPF, documentos
                ou dados bancários.
              </p>
            </SectionCard>

            <SectionCard section={sections[2]}>
              <p>
                Mesmo sem cadastro, alguns dados são coletados automaticamente quando você acessa
                qualquer página — por nós, pela infraestrutura de hospedagem e, principalmente,
                pelos provedores de publicidade descritos abaixo. Entre eles:
              </p>
              <ul className="ml-4 space-y-2">
                <li>
                  • <strong>Endereço IP</strong> (usado inclusive para inferir localização
                  aproximada, em geral no nível de cidade ou região)
                </li>
                <li>
                  • <strong>Identificadores de cookie e identificadores de dispositivo</strong>
                </li>
                <li>
                  • <strong>Dados do navegador e do dispositivo</strong>: user agent, sistema
                  operacional, idioma, resolução de tela
                </li>
                <li>
                  • <strong>Dados de navegação</strong>: páginas visitadas, data e hora do acesso,
                  página de origem (referrer) e interações com anúncios
                </li>
              </ul>
              <p>
                Esses dados são usados para entregar o site, medir audiência de forma agregada,
                prevenir fraude e abuso e viabilizar a exibição de publicidade.
              </p>
            </SectionCard>

            <SectionCard section={sections[3]}>
              <p>
                Este site utiliza cookies próprios e de terceiros. Cookies são pequenos arquivos
                gravados no seu navegador; tecnologias similares incluem{" "}
                <strong>web beacons</strong> (também chamados de pixels de rastreamento),{" "}
                <strong>tags</strong>, <strong>scripts</strong> e o armazenamento local do
                navegador.
              </p>
              <p>
                <strong>Cookies próprios (first-party):</strong> usados apenas para lembrar
                preferências de uso, como o tema claro/escuro e os últimos valores preenchidos nas
                calculadoras. Não são usados para rastrear você em outros sites.
              </p>
              <p>
                <strong>Cookies e identificadores de terceiros:</strong> empresas parceiras,
                incluindo o Google, colocam e leem cookies no seu navegador e utilizam web beacons,
                endereços IP e outros identificadores quando você acessa o Calcule Brasil. Esses
                terceiros fazem isso a partir de seus próprios servidores, sob suas próprias
                políticas de privacidade — não temos acesso nem controle sobre os cookies que eles
                colocam ou leem.
              </p>
              <p>
                Você pode bloquear ou apagar cookies a qualquer momento nas configurações do seu
                navegador. Bloquear cookies de terceiros não impede o uso das calculadoras, que
                continuam funcionando normalmente.
              </p>
            </SectionCard>

            <SectionCard section={sections[4]}>
              <p>
                O Calcule Brasil é gratuito e se sustenta com publicidade. Utilizamos o{" "}
                <strong>Google AdSense</strong>, serviço de publicidade do Google, para exibir
                anúncios nas páginas. Além do Google, outras redes e fornecedores parceiros podem
                participar da entrega e da medição desses anúncios.
              </p>
              <ul className="ml-4 space-y-2">
                <li>
                  • Fornecedores terceiros, <strong>incluindo o Google</strong>, usam cookies para
                  veicular anúncios com base em visitas anteriores do usuário a este site ou a
                  outros sites.
                </li>
                <li>
                  • O uso de cookies de publicidade pelo Google — como o{" "}
                  <strong>cookie de publicidade do Google</strong> — permite que ele e seus
                  parceiros veiculem anúncios para os usuários com base na visita a este e/ou a
                  outros sites na Internet.
                </li>
                <li>
                  • Esses fornecedores podem coletar e usar endereço IP, identificadores de cookie e
                  de dispositivo, localização aproximada e dados de navegação para selecionar,
                  entregar, medir e limitar a frequência dos anúncios, bem como para detectar fraude
                  de cliques.
                </li>
                <li>
                  • Não compartilhamos com anunciantes os valores que você digita nas calculadoras,
                  nem qualquer cadastro (que não existe neste site).
                </li>
              </ul>
              <p>
                Para entender como o Google trata os dados coletados em sites que usam seus
                serviços, consulte{" "}
                <ExternalLink href="https://policies.google.com/technologies/partner-sites">
                  Como o Google usa informações de sites ou apps que usam nossos serviços
                </ExternalLink>{" "}
                e a{" "}
                <ExternalLink href="https://policies.google.com/privacy">
                  Política de Privacidade do Google
                </ExternalLink>
                .
              </p>
            </SectionCard>

            <SectionCard section={sections[5]}>
              <p>
                Os anúncios exibidos podem ser <strong>personalizados</strong>, isto é, selecionados
                com base no seu histórico de navegação e nos interesses inferidos a partir dele, por
                meio de cookies e tecnologias similares. Você não é obrigado a aceitar isso.
              </p>
              <p>
                <strong>Como desativar ou limitar a personalização:</strong>
              </p>
              <ul className="ml-4 space-y-2">
                <li>
                  • Desative os anúncios personalizados do Google em{" "}
                  <ExternalLink href="https://adssettings.google.com">
                    Configurações de anúncios do Google
                  </ExternalLink>
                  .
                </li>
                <li>
                  • Recuse o uso de cookies por fornecedores terceiros em{" "}
                  <ExternalLink href="https://www.aboutads.info/choices/">
                    aboutads.info/choices
                  </ExternalLink>{" "}
                  ou em{" "}
                  <ExternalLink href="https://optout.networkadvertising.org/">
                    optout.networkadvertising.org
                  </ExternalLink>
                  .
                </li>
                <li>
                  • Gerencie a atividade associada à sua conta Google em{" "}
                  <ExternalLink href="https://myaccount.google.com/data-and-privacy">
                    Dados e privacidade
                  </ExternalLink>
                  .
                </li>
                <li>
                  • Bloqueie cookies de terceiros nas configurações do seu navegador a qualquer
                  momento.
                </li>
              </ul>
              <p>
                Ao desativar a personalização você continua vendo anúncios, mas eles passam a ser
                selecionados por contexto (o assunto da página) em vez do seu histórico.
              </p>
            </SectionCard>

            <SectionCard section={sections[6]}>
              <p>
                Tratamos dados com base no <strong>legítimo interesse</strong> (manter o site no ar,
                medir audiência de forma agregada, prevenir fraude e sustentar o projeto com
                publicidade) e no <strong>consentimento</strong>, quando aplicável à publicidade
                personalizada e a cookies não essenciais.
              </p>
              <p>Como titular, a LGPD garante que você pode solicitar, entre outros direitos:</p>
              <ul className="ml-4 space-y-2">
                <li>• Confirmação da existência de tratamento e acesso aos dados</li>
                <li>• Correção de dados incompletos, inexatos ou desatualizados</li>
                <li>
                  • Anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos
                </li>
                <li>• Informação sobre com quem os dados foram compartilhados</li>
                <li>• Revogação do consentimento e oposição a tratamentos feitos sem ele</li>
              </ul>
              <p>
                Para exercer qualquer desses direitos, escreva para{" "}
                <ExternalLink href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</ExternalLink>.
                Responderemos no menor prazo possível. Como não mantemos cadastro, na maior parte
                dos casos não há dados pessoais armazenados por nós sobre você — pedidos relativos a
                dados coletados por terceiros (como o Google) devem ser dirigidos também a eles,
                pelos canais indicados nas respectivas políticas.
              </p>
              <p>
                <strong>Crianças:</strong> o Calcule Brasil não é direcionado a menores de 18 anos e
                não coleta intencionalmente dados de crianças e adolescentes.
              </p>
              <p>
                <strong>Retenção:</strong> não mantemos base de dados pessoais própria. Registros
                técnicos de acesso gerados pela hospedagem são mantidos por período curto, apenas
                para segurança e diagnóstico. Dados coletados por terceiros seguem os prazos das
                políticas deles.
              </p>
            </SectionCard>

            <SectionCard section={sections[7]}>
              <p>
                Esta política pode ser atualizada para refletir mudanças nas ferramentas que usamos
                ou na legislação aplicável. A data da última revisão fica sempre indicada no topo
                desta página. Recomendamos revisá-la periodicamente.
              </p>
            </SectionCard>

            <p className="flex items-center gap-2 px-1 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
              Sem cadastro e sem venda de dados. Os cálculos ficam no seu navegador.
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
