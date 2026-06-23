export const SITE_URL = "https://calculadorasbrasil.com.br";

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}
