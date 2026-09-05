import { afterEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { usePersistedState } from "../src/lib/usePersistedState";
import type { IrpfInput } from "../src/lib/calculators/irpf";
import type { NetSalaryInput } from "../src/lib/calculators/salarioLiquido";

/**
 * What `usePersistedState` does with a saved form when the shape it was saved in
 * no longer exists.
 *
 * ⚠️ The hook does a raw `JSON.parse` and a cast — it validates nothing. Measured
 * before this suite was written: it falls back to the default only when the key
 * is absent or the parse throws, so an object saved under the OLD field names is
 * handed straight back and every renamed field reads `undefined`. That is why the
 * English-identifier rename bumped both storage keys rather than trusting the
 * hook to notice.
 *
 * The plan for that slice asked for a test that the hook returns `DEFAULTS` when
 * the stored value is an object of old keys. It does not, and cannot without
 * shape validation the hook does not have. So the test below asserts what the key
 * bump actually buys: under the NEW key the old object is not there, so `DEFAULTS`
 * is what a returning visitor gets. The second case in each pair keeps that from
 * passing vacuously — the same hook, same storage, reading the key that IS present
 * does return the stored object.
 */

/** The keys these forms were persisted under before the rename. */
const OLD_IRPF_KEY = "irpf-2026-input";
const OLD_NET_SALARY_KEY = "salario-liquido-input";

/**
 * The keys the routes use today.
 *
 * Pinned to the route sources below rather than only copied from them: a
 * constant here that drifted from the literal a route passes would leave this
 * whole file testing a key nobody stores under, and passing.
 */
const IRPF_KEY = "irpf-2026-input-v2";
const NET_SALARY_KEY = "salario-liquido-input-v2";

const ROUTE_KEYS: ReadonlyArray<readonly [string, string, string]> = [
  ["src/routes/calculadora-irpf-2026.tsx", IRPF_KEY, OLD_IRPF_KEY],
  ["src/routes/calculadora-salario-liquido.tsx", NET_SALARY_KEY, OLD_NET_SALARY_KEY],
];

const IRPF_DEFAULTS: IrpfInput = {
  grossAnnualIncome: 48000,
  dependants: 0,
  educationDeduction: 0,
  healthDeduction: 0,
  supplementaryPensionDeduction: 0,
  simplifiedRegime: false,
};

const NET_SALARY_DEFAULTS: NetSalaryInput = {
  monthlyGrossSalary: 5000,
  dependants: 0,
  educationDeduction: 0,
  healthDeduction: 0,
  supplementaryPensionDeduction: 0,
  hasMealAllowance: false,
  hasTransportAllowance: false,
  hasUnionDue: false,
  simplifiedRegime: false,
};

/** A form saved by the pre-rename build, field for field. */
const OLD_IRPF_SHAPE = {
  rendaBrutaAnual: 120_000,
  dependentes: 3,
  deducaoEducacao: 2000,
  deducaoSaude: 1500,
  deducaoPrevidenciaComplementar: 900,
  regimeSimplificado: true,
};

const OLD_NET_SALARY_SHAPE = {
  salarioBrutoMensal: 9000,
  dependentes: 3,
  deducaoEducacao: 2000,
  deducaoSaude: 1500,
  deducaoPrevidenciaComplementar: 900,
  temValeRefeicao: true,
  temValeTransporte: true,
  temSindicato: true,
  regimeSimplificado: true,
};

/**
 * Reads the hook exactly as a route does, in a real React render.
 *
 * A static server render runs the lazy `useState` initialiser — which is the
 * whole of the read path — and skips the `useEffect` that writes back, so the
 * stored value is observed rather than overwritten.
 */
function readThroughHook<T>(storage: Record<string, string>, key: string, defaultValue: T): T {
  const previousWindow = (globalThis as { window?: unknown }).window;
  (globalThis as { window?: unknown }).window = {
    localStorage: {
      getItem: (name: string) => (name in storage ? storage[name] : null),
      setItem: () => {},
    },
  };

  let observed: T | undefined;

  function Probe() {
    const [value] = usePersistedState<T>(key, defaultValue);
    observed = value;
    return null;
  }

  try {
    renderToStaticMarkup(createElement(Probe));
  } finally {
    if (previousWindow === undefined) {
      delete (globalThis as { window?: unknown }).window;
    } else {
      (globalThis as { window?: unknown }).window = previousWindow;
    }
  }

  return observed as T;
}

afterEach(() => {
  delete (globalThis as { window?: unknown }).window;
});

describe("usePersistedState — the key is the only shape check there is", () => {
  it.each(ROUTE_KEYS)("%s persists under the bumped key, not the old one", (path, key, oldKey) => {
    const source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

    expect(source).toContain(`usePersistedState`);
    expect(source).toContain(`"${key}"`);
    expect(source).not.toContain(`"${oldKey}"`);
  });

  /**
   * The failure the key bump exists to prevent, measured rather than assumed.
   * If the routes ever moved back to the old key, this is what they would be
   * handing their form: an object typed `IrpfInput` with not one of its fields.
   */
  it("hands back a stale object unchanged when the key still matches", () => {
    const storage = { [OLD_IRPF_KEY]: JSON.stringify(OLD_IRPF_SHAPE) };
    const restored = readThroughHook(storage, OLD_IRPF_KEY, IRPF_DEFAULTS);

    expect(restored).toEqual(OLD_IRPF_SHAPE);
    expect((restored as Partial<IrpfInput>).grossAnnualIncome).toBeUndefined();
  });

  it("gives the IRPF form its defaults when only the pre-rename key is stored", () => {
    const storage = { [OLD_IRPF_KEY]: JSON.stringify(OLD_IRPF_SHAPE) };

    expect(readThroughHook(storage, IRPF_KEY, IRPF_DEFAULTS)).toEqual(IRPF_DEFAULTS);
  });

  it("gives the net-salary form its defaults when only the pre-rename key is stored", () => {
    const storage = { [OLD_NET_SALARY_KEY]: JSON.stringify(OLD_NET_SALARY_SHAPE) };

    expect(readThroughHook(storage, NET_SALARY_KEY, NET_SALARY_DEFAULTS)).toEqual(
      NET_SALARY_DEFAULTS,
    );
  });

  /**
   * Keeps the two cases above from passing for the wrong reason. A hook that
   * always returned its default would satisfy them and restore nothing.
   */
  it("still restores a form saved under the current key", () => {
    const saved: IrpfInput = { ...IRPF_DEFAULTS, grossAnnualIncome: 90_000, dependants: 2 };
    const storage = { [IRPF_KEY]: JSON.stringify(saved) };

    expect(readThroughHook(storage, IRPF_KEY, IRPF_DEFAULTS)).toEqual(saved);
  });

  it("falls back to the defaults when the stored value is not JSON", () => {
    const storage = { [IRPF_KEY]: "{not json" };

    expect(readThroughHook(storage, IRPF_KEY, IRPF_DEFAULTS)).toEqual(IRPF_DEFAULTS);
  });
});
