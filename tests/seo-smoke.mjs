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
  "/blog/quanto-custa-ter-carro",
  "/blog/quanto-custa-morar-sozinho",
  "/blog/como-economizar-conta-de-luz",
  "/blog/custo-pet-anual",
  "/blog/assinaturas-que-valem-a-pena",
  "/blog/calculadora-irpf-2026",
  "/blog/guia-irpf-2026",
  "/blog/salario-liquido-entenda",
  "/blog/quanto-custa-ser-autonomo",
  "/blog/deducoes-irpf-esqueca",
  "/blog/dependentes-irpf-economia",
  "/blog/recibo-rpa-autonomo",
  "/blog/negociar-salario-melhor",
  "/blog/planejamento-tributario",
  "/blog/clt-vs-pj-comparacao",
  "/blog/salario-por-setor-2026",
  "/blog/mei-vs-pj-custo",
  "/blog/investimentos-isentos-irpf",
  "/blog/quando-virar-pj",
  "/blog/aposentadoria-early-retirement",
  "/blog/despesas-dedutiveis-autonomo",
  "/blog/contador-necessario-pj",
  "/blog/tabela-irpf-2026-completa",
  "/blog/formal-vs-informal",
  "/blog/como-calcular-salario-pj",
  "/blog/simplificado-vs-completo",
  "/comparar",
  "/comparar/streaming",
  "/comparar/academia",
  "/comparar/mudanca",
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
      assert.match(html, /<time\b[^>]*datetime=["']2026-06-23["']/i);
    }
  }

  const missing = await fetch(`${BASE_URL}/route-that-does-not-exist`, { redirect: "manual" });
  assert.equal(missing.status, 404, "An unknown URL must return HTTP 404");

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

  console.log(`SEO smoke test passed for ${PUBLIC_ROUTES.length} routes.`);
} catch (error) {
  console.error(previewOutput);
  throw error;
} finally {
  preview.kill("SIGTERM");
}
