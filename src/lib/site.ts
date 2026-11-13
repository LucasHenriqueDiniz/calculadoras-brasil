export const SITE_URL = "https://calculebrasil.com";

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

const PRODUCTION_HOSTNAME = new URL(SITE_URL).hostname;

/** Whether a page is served from the production domain, not a dev server or a preview. */
export function isProductionHost(hostname: string): boolean {
  return hostname === PRODUCTION_HOSTNAME;
}
