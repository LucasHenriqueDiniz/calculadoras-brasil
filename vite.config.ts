import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { SEO_PAGES, SITE_REVIEW_DATE } from "./src/lib/seo-pages";
import { SITE_URL } from "./src/lib/site";

export default defineConfig({
  plugins: [
    tailwindcss(),
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tanstackStart({
      pages: SEO_PAGES.map((page) => ({
        path: page.path,
        sitemap: {
          lastmod: SITE_REVIEW_DATE,
          changefreq: page.changefreq,
          priority: page.priority,
        },
      })),
      sitemap: {
        enabled: true,
        host: SITE_URL,
        outputPath: "sitemap.xml",
      },
      prerender: {
        enabled: true,
        autoStaticPathsDiscovery: false,
        crawlLinks: false,
        failOnError: true,
      },
    }),
    react(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    host: true,
    port: 8080,
  },
  preview: {
    host: true,
    port: 4173,
  },
});
