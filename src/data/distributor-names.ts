/**
 * The name a visitor searches for, where ANEEL's `SigAgente` is a legal acronym nobody types:
 * "ELETROPAULO" has traded as Enel São Paulo since 2018. Only the ten distributors of the pilot
 * in docs/plans/organic-traffic/slice-04-distributor-pilot.md are here; every other distributor
 * shows ANEEL's own acronym. Slice 4 checks each name against the distributor's own site.
 */
export const DISTRIBUTOR_NAMES: Readonly<Record<string, string>> = {
  ELETROPAULO: "Enel São Paulo",
  "CEMIG-D": "Cemig",
  "COPEL-DIS": "Copel",
  "CPFL-PAULISTA": "CPFL Paulista",
  "LIGHT SESA": "Light",
  "ENEL RJ": "Enel Rio",
  COELBA: "Neoenergia Coelba",
  CELESC: "Celesc",
  "EQUATORIAL GO": "Equatorial Goiás",
  "Neoenergia PE": "Neoenergia Pernambuco",
};

export function distributorName(agent: string): string {
  return DISTRIBUTOR_NAMES[agent] ?? agent;
}
