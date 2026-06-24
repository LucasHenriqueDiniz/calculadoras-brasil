export const SITE_URL = "https://calculebrasil.com";

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}
