import { Link } from "@tanstack/react-router";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-base font-semibold text-foreground">
            Calcule Brasil
          </p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Calculadoras simples para custos do dia a dia. Estimativas baseadas em médias públicas
            — sempre confira valores reais antes de tomar uma decisão.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Calculadoras
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link
                to="/calculadora-custo-carro"
                className="text-foreground/80 hover:text-foreground"
              >
                Custo de carro
              </Link>
            </li>
            <li>
              <Link
                to="/calculadora-morar-sozinho"
                className="text-foreground/80 hover:text-foreground"
              >
                Morar sozinho
              </Link>
            </li>
            <li>
              <Link
                to="/calculadora-conta-de-luz"
                className="text-foreground/80 hover:text-foreground"
              >
                Conta de luz
              </Link>
            </li>
            <li>
              <Link
                to="/calculadora-assinaturas"
                className="text-foreground/80 hover:text-foreground"
              >
                Assinaturas
              </Link>
            </li>
            <li>
              <Link
                to="/calculadora-custo-mudanca"
                className="text-foreground/80 hover:text-foreground"
              >
                Mudança
              </Link>
            </li>
            <li>
              <Link
                to="/calculadora-custo-pet"
                className="text-foreground/80 hover:text-foreground"
              >
                Pet
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Institucional
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/sobre" className="text-foreground/80 hover:text-foreground">
                Sobre
              </Link>
            </li>
            <li>
              <Link to="/metodologia" className="text-foreground/80 hover:text-foreground">
                Metodologia
              </Link>
            </li>
            <li>
              <Link to="/privacidade" className="text-foreground/80 hover:text-foreground">
                Privacidade
              </Link>
            </li>
            <li>
              <Link to="/termos" className="text-foreground/80 hover:text-foreground">
                Termos
              </Link>
            </li>
            <li>
              <Link to="/contato" className="text-foreground/80 hover:text-foreground">
                Contato
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {year} Calcule Brasil. Todos os direitos reservados.</p>
          <p>
            Conteúdo informativo. Não constitui aconselhamento financeiro, jurídico ou veterinário.
          </p>
        </div>
      </div>
    </footer>
  );
}
