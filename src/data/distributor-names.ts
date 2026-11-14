import { DISTRIBUTOR_PAGES } from "./distributor-pages";

/**
 * The name a visitor searches for, where ANEEL's `SigAgente` is a legal acronym nobody types:
 * "ELETROPAULO" trades as Enel São Paulo. Only the distributors with a page of their own have one,
 * checked against their own sites in src/data/distributor-pages.ts; every other distributor shows
 * ANEEL's acronym.
 */
export const DISTRIBUTOR_NAMES: Readonly<Record<string, string>> = Object.fromEntries(
  DISTRIBUTOR_PAGES.map((page) => [page.agent, page.name]),
);

export function distributorName(agent: string): string {
  return DISTRIBUTOR_NAMES[agent] ?? agent;
}
