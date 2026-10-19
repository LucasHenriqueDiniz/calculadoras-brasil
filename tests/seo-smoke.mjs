import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import process from "node:process";

const HOST = "127.0.0.1";
const PORT = 4173;
const BASE_URL = `http://${HOST}:${PORT}`;
const CANONICAL_ORIGIN = "https://calculebrasil.com";
const PUBLIC_ROUTES = [
  "/",
  "/calculadoras",
  "/calculadora-custo-carro",
  "/calculadora-morar-sozinho",
  "/calculadora-conta-de-luz",
  "/calculadora-assinaturas",
  "/calculadora-custo-mudanca",
  "/calculadora-custo-pet",
  "/calculadora-irpf-2026",
  "/calculadora-salario-liquido",
  "/calculadora-inss-autonomo",
  "/calculadora-clt-vs-pj",
  "/calculadora-previdencia-complementar",
  "/calculadora-beneficios-fiscais",
  "/blog",
  "/blog/como-economizar-conta-de-luz",
  "/blog/custo-pet-anual",
  "/blog/assinaturas-que-valem-a-pena",
  "/blog/deducoes-irpf-esqueca",
  "/blog/investimentos-isentos-irpf",
  "/blog/despesas-dedutiveis-autonomo",
  "/blog/contador-necessario-pj",
  "/comparar/energia",
  "/sobre",
  "/metodologia",
  "/privacidade",
  "/termos",
  "/contato",
];
const CALCULATOR_ROUTES = new Set(PUBLIC_ROUTES.filter((path) => path.startsWith("/calculadora-")));

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function textContent(html) {
  return decodeHtml(
    html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function readAttribute(html, selectorPattern, attribute) {
  const tag = html.match(selectorPattern)?.[0];
  if (!tag) return null;
  return tag.match(new RegExp(`${attribute}=["']([^"']+)["']`, "i"))?.[1] ?? null;
}

function schemaTypes(value, result = new Set()) {
  if (Array.isArray(value)) {
    for (const item of value) schemaTypes(item, result);
  } else if (value && typeof value === "object") {
    if (typeof value["@type"] === "string") result.add(value["@type"]);
    for (const nested of Object.values(value)) schemaTypes(nested, result);
  }
  return result;
}

async function waitForServer(child) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Preview exited with code ${child.exitCode}.`);
    try {
      const response = await fetch(BASE_URL, { redirect: "manual" });
      if (response.status < 500) return;
    } catch {
      // Wait for the preview to become available.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Preview did not start within 30 seconds.");
}

const preview = spawn(
  process.execPath,
  ["node_modules/vite/bin/vite.js", "preview", "--host", HOST, "--port", String(PORT)],
  {
    cwd: process.cwd(),
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  },
);

let previewOutput = "";
preview.stdout.on("data", (chunk) => {
  previewOutput += chunk.toString();
});
preview.stderr.on("data", (chunk) => {
  previewOutput += chunk.toString();
});

try {
  await waitForServer(preview);

  const titles = new Set();
  const internalLinks = new Map();
  const dateModifiedByPath = new Map();
  for (const path of PUBLIC_ROUTES) {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: { "user-agent": "seo-smoke-test" },
    });
    assert.equal(response.status, 200, `${path} must return HTTP 200`);

    const html = await response.text();
    const title = decodeHtml(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? "");
    assert.ok(title, `${path} must have a title`);
    assert.ok(!titles.has(title), `${path} must have a unique title`);
    titles.add(title);

    const description = readAttribute(
      html,
      /<meta\b[^>]*name=["']description["'][^>]*>/i,
      "content",
    );
    assert.ok(description && description.length >= 50, `${path} must have a meta description`);

    const canonical = readAttribute(html, /<link\b[^>]*rel=["']canonical["'][^>]*>/i, "href");
    assert.equal(
      canonical,
      `${CANONICAL_ORIGIN}${path}`,
      `${path} must have an absolute canonical`,
    );

    internalLinks.set(
      path,
      new Set(
        [...html.matchAll(/<a\b[^>]*href=["'](\/[^"'#?]*)["']/gi)].map((match) =>
          match[1] === "/" ? "/" : match[1].replace(/\/$/, ""),
        ),
      ),
    );

    const h1Count = (html.match(/<h1\b/gi) ?? []).length;
    assert.equal(h1Count, 1, `${path} must have exactly one H1`);
    assert.ok(textContent(html).length >= 300, `${path} must carry text content in the HTML`);

    const jsonLdBlocks = [
      ...html.matchAll(
        /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
      ),
    ];
    assert.ok(jsonLdBlocks.length >= 1, `${path} must carry JSON-LD`);
    const schemas = jsonLdBlocks.map((match) => JSON.parse(decodeHtml(match[1])));
    const types = schemas.reduce((all, schema) => schemaTypes(schema, all), new Set());
    assert.ok(types.has("WebSite"), `${path} must declare WebSite`);
    assert.ok(types.has("Organization"), `${path} must declare Organization`);

    if (CALCULATOR_ROUTES.has(path)) {
      assert.ok(types.has("WebApplication"), `${path} must declare WebApplication`);
      assert.ok(types.has("BreadcrumbList"), `${path} must declare BreadcrumbList`);
      assert.ok(types.has("FAQPage"), `${path} must declare FAQPage`);
    }

    // The "Revisado em" a calculator shows is its own lastmod, held to the
    // sitemap with dateModified below.
    const reviewedAt = [...html.matchAll(/<time\b[^>]*datetime=["']([^"']+)["']/gi)].map(
      (m) => m[1],
    );
    if (CALCULATOR_ROUTES.has(path)) {
      assert.ok(reviewedAt.length >= 1, `${path} must show when it was reviewed`);
    }

    // Collected for every route, not only the calculators: a page whose JSON-LD
    // contradicts its own sitemap entry is what teaches Google to ignore
    // `lastmod` altogether.
    dateModifiedByPath.set(path, [
      ...new Set([
        ...[...decodeHtml(html).matchAll(/"dateModified":"([^"]+)"/g)].map((m) => m[1]),
        ...reviewedAt,
      ]),
    ]);
  }

  // Every `dateModified` a page publishes must be the date the sitemap publishes
  // for that URL: a disagreement here is invisible on the page itself.
  const sitemapForDates = await (await fetch(`${BASE_URL}/sitemap.xml`)).text();
  const lastmodByUrl = new Map(
    [...sitemapForDates.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)].map(
      (match) => [match[1], match[2]],
    ),
  );
  for (const [path, dates] of dateModifiedByPath) {
    for (const dateModified of dates) {
      assert.equal(
        dateModified,
        lastmodByUrl.get(`${CANONICAL_ORIGIN}${path}`),
        `${path} must publish the same dateModified and "Revisado em" as its sitemap lastmod`,
      );
    }
  }

  // A URL that only the sitemap points at is a URL Google can decline to crawl.
  const linkedFromElsewhere = new Set();
  for (const [source, hrefs] of internalLinks) {
    for (const href of hrefs) {
      if (href !== source) linkedFromElsewhere.add(href);
    }
  }
  const orphans = PUBLIC_ROUTES.filter((path) => path !== "/" && !linkedFromElsewhere.has(path));
  assert.deepEqual(
    orphans,
    [],
    `every public route must be reachable by an internal link: ${orphans.join(", ")}`,
  );

  // The salary table is content Google reads, so it must be in the prerendered
  // HTML rather than appear after hydration. Two figures computed by hand in
  // tests/calculators/salario-liquido.test.ts: the R$ 5.000 net and the R$ 6.000
  // withholding.
  const salaryPage = textContent(
    await (await fetch(`${BASE_URL}/calculadora-salario-liquido`)).text(),
  ).replaceAll("\u00a0", " ");
  assert.ok(
    salaryPage.includes("Quanto sobra do salário em 2026, faixa a faixa"),
    "the salary table must be prerendered",
  );
  assert.ok(salaryPage.includes("R$ 4.498,49"), "the R$ 5.000 row must show its net salary");
  assert.ok(salaryPage.includes("R$ 385,10"), "the R$ 6.000 row must show its withholding");

  // The CLT vs PJ break-even table, prerendered with the R$ 5.000 row the module
  // tests pin through buildBreakEvenTable.
  const cltVsPjPage = textContent(
    await (await fetch(`${BASE_URL}/calculadora-clt-vs-pj`)).text(),
  ).replaceAll("\u00a0", " ");
  assert.ok(
    cltVsPjPage.includes("Quanto faturar como PJ para empatar com a CLT"),
    "the CLT vs PJ break-even table must be prerendered",
  );
  assert.ok(cltVsPjPage.includes("R$ 6.560,89"), "the R$ 5.000 row must show its break-even");

  // The IRPF regime table: the R$ 120.000 row, whose simplified tax the IRPF tests
  // derive by hand (102.360 × 27,5% − 10.904,66).
  const irpfPage = textContent(
    await (await fetch(`${BASE_URL}/calculadora-irpf-2026`)).text(),
  ).replaceAll("\u00a0", " ");
  assert.ok(
    irpfPage.includes("Quando a declaração completa compensa"),
    "the IRPF regime table must be prerendered",
  );
  assert.ok(irpfPage.includes("R$ 17.244,34"), "the R$ 120.000 row must show its simplified tax");
  assert.ok(
    irpfPage.includes("ano-calendário 2026"),
    "the IRPF page must say which tax year it models",
  );

  // The INSS plan table, with the R$ 3.500 row's 20% contribution (R$ 700,00).
  const inssPage = textContent(
    await (await fetch(`${BASE_URL}/calculadora-inss-autonomo`)).text(),
  ).replaceAll("\u00a0", " ");
  assert.ok(
    inssPage.includes("Quanto custa a mais o plano de 20%"),
    "the INSS plan table must be prerendered",
  );
  assert.ok(inssPage.includes("R$ 700,00"), "the R$ 3.500 row must show its 20% contribution");

  // The PGBL table, with the R$ 120.000 row's saving at a full 12% contribution.
  const pensionPage = textContent(
    await (await fetch(`${BASE_URL}/calculadora-previdencia-complementar`)).text(),
  ).replaceAll("\u00a0", " ");
  assert.ok(
    pensionPage.includes("Quanto um PGBL reduz o imposto de verdade"),
    "the PGBL table must be prerendered",
  );
  assert.ok(pensionPage.includes("R$ 2.369,70"), "the R$ 120.000 row must show its saving");

  // The benefits table: R$ 800 of meal benefit at R$ 20.000 is a R$ 1.103,45 raise
  // (800 / 0,725), the hand case in tests/calculators/beneficios-fiscais.test.ts.
  const benefitsPage = textContent(
    await (await fetch(`${BASE_URL}/calculadora-beneficios-fiscais`)).text(),
  ).replaceAll("\u00a0", " ");
  assert.ok(
    benefitsPage.includes("Quanto aumento vale um vale-refeição"),
    "the benefits table must be prerendered",
  );
  assert.ok(benefitsPage.includes("R$ 1.103,45"), "the R$ 20.000 row must show its raise");

  // The appliance table, with the two-door refrigerator at Eletrobrás's 56,9 kWh.
  const electricityPage = textContent(
    await (await fetch(`${BASE_URL}/calculadora-conta-de-luz`)).text(),
  ).replaceAll("\u00a0", " ");
  assert.ok(
    electricityPage.includes("Quanto cada aparelho gasta por mês"),
    "the appliance table must be prerendered",
  );
  assert.ok(electricityPage.includes("56,9 kWh"), "the refrigerator row must show 56,9 kWh");

  // The fuel table, built from the dated ANP snapshot: one row per state.
  const carHtml = await (await fetch(`${BASE_URL}/calculadora-custo-carro`)).text();
  const carPage = textContent(carHtml).replaceAll("\u00a0", " ");
  assert.ok(
    carPage.includes("Etanol ou gasolina em cada estado"),
    "the fuel table must be prerendered",
  );
  assert.ok(
    carPage.includes("levantamento semanal da ANP de"),
    "the fuel table must say which ANP week it is",
  );
  const fuelTable = carHtml.slice(carHtml.indexOf("Etanol ou gasolina em cada estado"));
  const stateRows = fuelTable.slice(0, fuelTable.indexOf("</table>")).match(/<th scope="row"/g);
  assert.equal(stateRows?.length, 27, "the fuel table must have a row for each of the 27 states");

  // The capitals table: FipeZAP rent and DIEESE basket, one row per capital both cover.
  const livingHtml = await (await fetch(`${BASE_URL}/calculadora-morar-sozinho`)).text();
  const capitalsTable = livingHtml.slice(
    livingHtml.indexOf("Quanto custa morar sozinho em cada capital"),
  );
  const capitalRows = capitalsTable
    .slice(0, capitalsTable.indexOf("</table>"))
    .match(/<th scope="row"/g);
  assert.equal(
    capitalRows?.length,
    22,
    "the capitals table must have a row for each of 22 capitals",
  );
  assert.ok(
    textContent(livingHtml).replaceAll("\u00a0", " ").includes("R$ 3.553,71"),
    "São Paulo's row must show R$ 3.553,71",
  );

  // The annual-plan table: six plans, each with the month the annual one pays off.
  const subscriptionsHtml = await (await fetch(`${BASE_URL}/calculadora-assinaturas`)).text();
  const plansTable = subscriptionsHtml.slice(
    subscriptionsHtml.indexOf("a partir de quantos meses o anual compensa"),
  );
  const planRows = plansTable.slice(0, plansTable.indexOf("</table>")).match(/<th scope="row"/g);
  assert.equal(planRows?.length, 6, "the annual-plan table must have its six plans");
  assert.ok(
    textContent(subscriptionsHtml).replaceAll("\u00a0", " ").includes("8,4 meses"),
    "Amazon Prime's row must show 8,4 meses",
  );

  // The ANTT freight-floor table: six distances, 500 km on two axles at R$ 2.488,74.
  const movingHtml = await (await fetch(`${BASE_URL}/calculadora-custo-mudanca`)).text();
  const freightTable = movingHtml.slice(
    movingHtml.indexOf("Piso mínimo de frete da ANTT por distância"),
  );
  const freightRows = freightTable
    .slice(0, freightTable.indexOf("</table>"))
    .match(/<th scope="row"/g);
  assert.equal(freightRows?.length, 6, "the freight-floor table must have its six distances");
  assert.ok(
    textContent(movingHtml).replaceAll("\u00a0", " ").includes("R$ 2.488,74"),
    "500 km on two axles must show R$ 2.488,74",
  );

  const missing = await fetch(`${BASE_URL}/route-that-does-not-exist`, { redirect: "manual" });
  assert.equal(missing.status, 404, "An unknown URL must return HTTP 404");

  // `_redirects` is applied by the Workers asset server, which the Cloudflare
  // Vite plugin runs under `vite preview`, so every rule is exercised for real:
  // the source answers 301 to a route that renders, and is not itself public.
  const redirectRules = (
    await readFile(new URL("../dist/client/_redirects", import.meta.url), "utf8")
  )
    .split("\n")
    .filter((line) => line.trim() && !line.startsWith("#"))
    .map((line) => line.trim().split(/\s+/));
  assert.ok(redirectRules.length > 0, "dist/client/_redirects must carry its rules");
  for (const [source, target, status] of redirectRules) {
    assert.equal(status, "301", `${source} must redirect permanently`);
    assert.ok(!PUBLIC_ROUTES.includes(source), `${source} is redirected and must not be public`);
    assert.ok(PUBLIC_ROUTES.includes(target), `${source} must redirect to a public route`);
    const response = await fetch(`${BASE_URL}${source}`, { redirect: "manual" });
    assert.equal(response.status, 301, `${source} must answer 301`);
    assert.equal(
      new URL(response.headers.get("location") ?? "", BASE_URL).pathname,
      target,
      `${source} must redirect to ${target}`,
    );
  }

  const invalidFuel = await fetch(`${BASE_URL}/api/fuel-prices`);
  assert.equal(invalidFuel.status, 400, "The fuel API must return HTTP 400 on invalid input");

  const invalidVehicle = await fetch(`${BASE_URL}/api/vehicle-efficiency`);
  assert.equal(invalidVehicle.status, 400, "The vehicle API must return HTTP 400 on invalid input");

  const health = await fetch(`${BASE_URL}/api/health`);
  assert.equal(health.status, 200, "The health check must return HTTP 200");
  const healthPayload = await health.json();
  assert.equal(healthPayload.runtime, "cloudflare-workers");

  const states = await fetch(`${BASE_URL}/api/locations/states`);
  assert.equal(states.status, 200, "The states API must return HTTP 200");
  const statesPayload = await states.json();
  assert.equal(statesPayload.states.length, 27, "The states API must keep all 27 states");

  const sitemapResponse = await fetch(`${BASE_URL}/sitemap.xml`);
  assert.equal(sitemapResponse.status, 200, "sitemap.xml must be available");
  const sitemap = await sitemapResponse.text();
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.deepEqual(
    locations,
    PUBLIC_ROUTES.map((path) => `${CANONICAL_ORIGIN}${path}`),
    `the sitemap must carry exactly the ${PUBLIC_ROUTES.length} canonical URLs`,
  );

  const ogPath = new URL("../public/og-image.png", import.meta.url);
  const og = await readFile(ogPath);
  const ogStats = await stat(ogPath);
  assert.equal(og.toString("ascii", 1, 4), "PNG", "The OG image must be a PNG");
  assert.equal(og.readUInt32BE(16), 1200, "The OG image must be 1200 px wide");
  assert.equal(og.readUInt32BE(20), 630, "The OG image must be 630 px tall");
  assert.ok(ogStats.size < 500_000, "The OG image must be under 500 KB");

  console.log(`SEO smoke test passed for ${PUBLIC_ROUTES.length} routes, none of them orphaned.`);
} catch (error) {
  console.error(previewOutput);
  throw error;
} finally {
  preview.kill("SIGTERM");
}
