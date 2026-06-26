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
    if (child.exitCode !== null) throw new Error(`Preview encerrou com código ${child.exitCode}.`);
    try {
      const response = await fetch(BASE_URL, { redirect: "manual" });
      if (response.status < 500) return;
    } catch {
      // Aguarda o preview ficar disponível.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Preview não iniciou em até 30 segundos.");
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
    assert.equal(response.status, 200, `${path} deve retornar HTTP 200`);

    const html = await response.text();
    const title = decodeHtml(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? "");
    assert.ok(title, `${path} deve conter title`);
    assert.ok(!titles.has(title), `${path} deve ter title exclusivo`);
    titles.add(title);

    const description = readAttribute(
      html,
      /<meta\b[^>]*name=["']description["'][^>]*>/i,
      "content",
    );
    assert.ok(description && description.length >= 50, `${path} deve conter meta description`);

    const canonical = readAttribute(html, /<link\b[^>]*rel=["']canonical["'][^>]*>/i, "href");
    assert.equal(canonical, `${CANONICAL_ORIGIN}${path}`, `${path} deve ter canonical absoluto`);

    const h1Count = (html.match(/<h1\b/gi) ?? []).length;
    assert.equal(h1Count, 1, `${path} deve conter exatamente um H1`);
    assert.ok(textContent(html).length >= 300, `${path} deve conter conteúdo textual no HTML`);

    const jsonLdBlocks = [
      ...html.matchAll(
        /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
      ),
    ];
    assert.ok(jsonLdBlocks.length >= 1, `${path} deve conter JSON-LD`);
    const schemas = jsonLdBlocks.map((match) => JSON.parse(decodeHtml(match[1])));
    const types = schemas.reduce((all, schema) => schemaTypes(schema, all), new Set());
    assert.ok(types.has("WebSite"), `${path} deve relacionar o WebSite`);
    assert.ok(types.has("Organization"), `${path} deve relacionar a Organization`);

    if (CALCULATOR_ROUTES.has(path)) {
      assert.ok(types.has("WebApplication"), `${path} deve conter WebApplication`);
      assert.ok(types.has("BreadcrumbList"), `${path} deve conter BreadcrumbList`);
      assert.ok(types.has("FAQPage"), `${path} deve conter FAQPage`);
      assert.match(html, /<time\b[^>]*datetime=["']2026-06-23["']/i);
    }
  }

  const missing = await fetch(`${BASE_URL}/rota-que-nao-existe`, { redirect: "manual" });
  assert.equal(missing.status, 404, "URL desconhecida deve retornar HTTP 404");

  const invalidFuel = await fetch(`${BASE_URL}/api/fuel-prices`);
  assert.equal(invalidFuel.status, 400, "API de combustível inválida deve retornar HTTP 400");

  const invalidVehicle = await fetch(`${BASE_URL}/api/vehicle-efficiency`);
  assert.equal(invalidVehicle.status, 400, "API veicular inválida deve retornar HTTP 400");

  const health = await fetch(`${BASE_URL}/api/health`);
  assert.equal(health.status, 200, "health check deve retornar HTTP 200");
  const healthPayload = await health.json();
  assert.equal(healthPayload.runtime, "cloudflare-workers");

  const states = await fetch(`${BASE_URL}/api/locations/states`);
  assert.equal(states.status, 200, "API de UFs deve retornar HTTP 200");
  const statesPayload = await states.json();
  assert.equal(statesPayload.states.length, 27, "API de UFs deve manter as 27 unidades");

  const sitemapResponse = await fetch(`${BASE_URL}/sitemap.xml`);
  assert.equal(sitemapResponse.status, 200, "sitemap.xml deve estar disponível");
  const sitemap = await sitemapResponse.text();
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.deepEqual(
    locations,
    PUBLIC_ROUTES.map((path) => `${CANONICAL_ORIGIN}${path}`),
    `sitemap deve conter exatamente as ${PUBLIC_ROUTES.length} URLs canônicas`,
  );

  const ogPath = new URL("../public/og-image.png", import.meta.url);
  const og = await readFile(ogPath);
  const ogStats = await stat(ogPath);
  assert.equal(og.toString("ascii", 1, 4), "PNG", "OG image deve ser PNG");
  assert.equal(og.readUInt32BE(16), 1200, "OG image deve ter 1200 px de largura");
  assert.equal(og.readUInt32BE(20), 630, "OG image deve ter 630 px de altura");
  assert.ok(ogStats.size < 500_000, "OG image deve ter menos de 500 KB");

  console.log(`SEO smoke test aprovado para ${PUBLIC_ROUTES.length} rotas.`);
} catch (error) {
  console.error(previewOutput);
  throw error;
} finally {
  preview.kill("SIGTERM");
}
