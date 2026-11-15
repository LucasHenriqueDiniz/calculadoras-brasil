/**
 * The internal link graph of a built site, as a crawler starting at the home page would walk it.
 *
 *   pnpm run build && node scripts/link-graph.mjs dist/client [url-inspection.txt]
 *
 * Reads every prerendered page under dist/client, follows only internal <a href="/..."> links, and
 * prints, for every URL the sitemap lists: how many links point at it, from how many distinct
 * pages, and how many clicks it is from "/". With a URL Inspection listing (the format
 * `sitestats inspect` prints), it also marks which of those source pages Google had indexed.
 *
 * tests/seo-smoke.mjs imports `linkGraph` to hold the tariff pages to their bar.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ORIGIN = "https://calculebrasil.com";

async function pageHtml(dist, path) {
  const file = path === "/" ? join(dist, "index.html") : join(dist, path, "index.html");
  try {
    return await readFile(file, "utf8");
  } catch {
    return null;
  }
}

function internalLinks(html) {
  const links = new Set();
  for (const match of html.matchAll(/<a\b[^>]*href=["'](\/[^"'#?]*)["']/gi)) {
    const href = match[1] === "/" ? "/" : match[1].replace(/\/$/, "");
    if (!href.startsWith("/api/") && !href.startsWith("/assets/")) links.add(href);
  }
  return links;
}

/** Inbound links, distinct sources and click depth from "/" for every sitemap URL. */
export async function linkGraph(dist) {
  const sitemap = await readFile(join(dist, "sitemap.xml"), "utf8");
  const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
    m[1].replace(ORIGIN, "") === "" ? "/" : m[1].replace(ORIGIN, ""),
  );

  const outbound = new Map();
  for (const path of paths) {
    const html = await pageHtml(dist, path);
    outbound.set(path, html === null ? new Set() : internalLinks(html));
  }

  const inbound = new Map(paths.map((path) => [path, { links: 0, sources: new Set() }]));
  for (const [source, targets] of outbound) {
    for (const target of targets) {
      if (target === source || !inbound.has(target)) continue;
      inbound.get(target).links += 1;
      inbound.get(target).sources.add(source);
    }
  }

  const depth = new Map([["/", 0]]);
  const queue = ["/"];
  while (queue.length > 0) {
    const page = queue.shift();
    for (const target of outbound.get(page) ?? []) {
      if (inbound.has(target) && !depth.has(target)) {
        depth.set(target, depth.get(page) + 1);
        queue.push(target);
      }
    }
  }

  return paths.map((path) => ({
    path,
    links: inbound.get(path).links,
    sources: [...inbound.get(path).sources].sort(),
    depth: depth.get(path) ?? null,
  }));
}

async function indexedPaths(file) {
  const text = await readFile(file, "utf8");
  return new Set(
    [...text.matchAll(/Submitted and indexed\s+\S+\s+(\S+)/g)].map((m) =>
      m[1].replace(ORIGIN, "") === "" ? "/" : m[1].replace(ORIGIN, ""),
    ),
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [dist = "dist/client", inspection] = process.argv.slice(2);
  const graph = await linkGraph(dist);
  const indexed = inspection ? await indexedPaths(inspection) : null;
  console.log("depth  sources  links  indexed-sources  path");
  for (const row of graph) {
    const fromIndexed = indexed ? row.sources.filter((s) => indexed.has(s)).length : "-";
    console.log(
      `${String(row.depth ?? "∞").padStart(5)}  ${String(row.sources.length).padStart(7)}  ${String(row.links).padStart(5)}  ${String(fromIndexed).padStart(15)}  ${row.path}`,
    );
  }
  const orphans = graph.filter((row) => row.path !== "/" && row.sources.length === 0);
  const deepest = Math.max(...graph.map((row) => row.depth ?? Infinity));
  console.log(`\n${graph.length} URLs, ${orphans.length} orphans, deepest ${deepest}`);
}
