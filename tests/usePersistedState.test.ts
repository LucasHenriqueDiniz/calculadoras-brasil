import { afterEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readPersistedValue, usePersistedState } from "../src/lib/usePersistedState";
import type { IrpfInput } from "../src/lib/calculators/irpf";
import type { NetSalaryInput } from "../src/lib/calculators/salarioLiquido";

/**
 * What `usePersistedState` does with a saved form when the shape it was saved in
 * no longer exists.
 *
 * ⚠️ The read (`readPersistedValue`, which the hook restores through) does a raw
 * `JSON.parse` and a cast — it validates nothing. Measured
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
const NET_SALARY_KEY = "salario-liquido-input-v4";

const ROUTE_KEYS: ReadonlyArray<readonly [string, string, string]> = [
  ["src/routes/calculadora-irpf-2026.tsx", IRPF_KEY, OLD_IRPF_KEY],
  ["src/routes/calculadora-salario-liquido.tsx", NET_SALARY_KEY, OLD_NET_SALARY_KEY],
  // v3: health and education left the monthly calculation and the private
  // pension became a monthly amount (docs/plans/adsense-reapplication, slice 3).
  // A v2 form would hand the page a pension figure read on the wrong axis.
  ["src/routes/calculadora-salario-liquido.tsx", NET_SALARY_KEY, "salario-liquido-input-v2"],
  // v4: the meal and transport booleans became amounts, a vale-transporte that
  // took min(6%, R$ 250) and a meal allowance fixed at R$ 360 (slice 6). A v3
  // form would read monthlyTransportCost as undefined.
  ["src/routes/calculadora-salario-liquido.tsx", NET_SALARY_KEY, "salario-liquido-input-v3"],
  // Slices 3 and 4 of docs/plans/english-domain-identifiers/ bumped three more
  // keys for the same reason. Without a row here, a revert to an unbumped key
  // would pass the suite and hand a returning visitor a form of undefineds.
  ["src/routes/calculadora-inss-autonomo.tsx", "inss-autonomo-input-v3", "inss-autonomo-input"],
  // v3: affiliatedBeforeReform joined the input; a v2 form would read undefined
  // and apply art. 19's 20 years to every man.
  ["src/routes/calculadora-inss-autonomo.tsx", "inss-autonomo-input-v3", "inss-autonomo-input-v2"],
  ["src/routes/calculadora-clt-vs-pj.tsx", "clt-vs-pj-input-v3", "clt-vs-pj-input"],
  // v3: the PJ field became company costs, which shelter no tax under the
  // Simples (decision D6); a v2 form would hand it a deductible-expense figure.
  ["src/routes/calculadora-clt-vs-pj.tsx", "clt-vs-pj-input-v3", "clt-vs-pj-input-v2"],
  ["src/routes/calculadora-beneficios-fiscais.tsx", "beneficios-input-v3", "beneficios-input"],
  // v3: the salary and the commute cost replaced a typed income-tax rate; a v2
  // form would hand the module an undefined salary.
  ["src/routes/calculadora-beneficios-fiscais.tsx", "beneficios-input-v3", "beneficios-input-v2"],
  [
    "src/routes/calculadora-previdencia-complementar.tsx",
    "previdencia-input-v3",
    "previdencia-input",
  ],
  // v3: grossAnnualIncome replaced the fixed marginal rate; a v2 form would hand
  // the module an undefined income.
  [
    "src/routes/calculadora-previdencia-complementar.tsx",
    "previdencia-input-v3",
    "previdencia-input-v2",
  ],
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
  monthlyPrivatePension: 0,
  monthlyMealAllowance: 0,
  monthlyTransportCost: 0,
  hasUnionDue: false,
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

/** Runs `read` with a `window.localStorage` whose `getItem` serves `storage`. */
function withStorage<R>(
  storage: Record<string, string>,
  read: () => R,
  getItem = (name: string) => (name in storage ? storage[name] : null),
): R {
  const previousWindow = (globalThis as { window?: unknown }).window;
  (globalThis as { window?: unknown }).window = { localStorage: { getItem, setItem: () => {} } };

  try {
    return read();
  } finally {
    if (previousWindow === undefined) {
      delete (globalThis as { window?: unknown }).window;
    } else {
      (globalThis as { window?: unknown }).window = previousWindow;
    }
  }
}

/** What the hook's layout effect restores: the same read, called the same way. */
function readFromStorage<T>(storage: Record<string, string>, key: string, defaultValue: T): T {
  return withStorage(storage, () => readPersistedValue(key, defaultValue));
}

/**
 * The hook's first render, with `window` present the way it is in the browser.
 *
 * A static render runs no effects, so this is the render the server sends and
 * the hydration render has to reproduce attribute for attribute.
 */
function firstRender<T>(storage: Record<string, string>, key: string, defaultValue: T) {
  let observed: { value: T; isRestored: boolean } | undefined;

  function Probe() {
    const [value, , isRestored] = usePersistedState<T>(key, defaultValue);
    observed = { value, isRestored };
    return null;
  }

  withStorage(storage, () => renderToStaticMarkup(createElement(Probe)));
  return observed!;
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
    const restored = readFromStorage(storage, OLD_IRPF_KEY, IRPF_DEFAULTS);

    expect(restored).toEqual(OLD_IRPF_SHAPE);
    expect((restored as Partial<IrpfInput>).grossAnnualIncome).toBeUndefined();
  });

  it("gives the IRPF form its defaults when only the pre-rename key is stored", () => {
    const storage = { [OLD_IRPF_KEY]: JSON.stringify(OLD_IRPF_SHAPE) };

    expect(readFromStorage(storage, IRPF_KEY, IRPF_DEFAULTS)).toEqual(IRPF_DEFAULTS);
  });

  it("gives the net-salary form its defaults when only the pre-rename key is stored", () => {
    const storage = { [OLD_NET_SALARY_KEY]: JSON.stringify(OLD_NET_SALARY_SHAPE) };

    expect(readFromStorage(storage, NET_SALARY_KEY, NET_SALARY_DEFAULTS)).toEqual(
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

    expect(readFromStorage(storage, IRPF_KEY, IRPF_DEFAULTS)).toEqual(saved);
  });

  it("falls back to the defaults when the stored value is not JSON", () => {
    const storage = { [IRPF_KEY]: "{not json" };

    expect(readFromStorage(storage, IRPF_KEY, IRPF_DEFAULTS)).toEqual(IRPF_DEFAULTS);
  });
});

describe("usePersistedState — the first render is the one the server sent", () => {
  /**
   * The hydration mismatch this guards against: reading localStorage while
   * rendering made a returning visitor's first client render differ from the
   * server HTML, and React threw it away and rendered the page again.
   */
  it("renders the default even when a value is stored under the key", () => {
    const saved: IrpfInput = { ...IRPF_DEFAULTS, grossAnnualIncome: 90_000, dependants: 2 };
    const storage = { [IRPF_KEY]: JSON.stringify(saved) };

    expect(firstRender(storage, IRPF_KEY, IRPF_DEFAULTS)).toEqual({
      value: IRPF_DEFAULTS,
      isRestored: false,
    });
  });

  it("restores the default when localStorage refuses the read", () => {
    const restored = withStorage(
      {},
      () => readPersistedValue(IRPF_KEY, IRPF_DEFAULTS),
      () => {
        throw new Error("SecurityError: localStorage is disabled");
      },
    );

    expect(restored).toEqual(IRPF_DEFAULTS);
  });
});
