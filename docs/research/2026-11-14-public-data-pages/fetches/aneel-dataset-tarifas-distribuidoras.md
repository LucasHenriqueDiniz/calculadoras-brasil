---
tags: [fetch, 2026-11-14-public-data-pages]
source: https://dadosabertos.aneel.gov.br/dataset/tarifas-distribuidoras-energia-eletrica
fetched: 2026-11-14
kind: primary
---

# Tarifas de aplicação das distribuidoras de energia elétrica — ANEEL Dados Abertos

> Fetched 2026-11-14 through the portal's CKAN API (`/api/3/action/package_show?id=tarifas-distribuidoras-energia-eletrica` and `/api/action/datastore_search` on resource `fcf2906c-7c32-4b9b-a637-054e7a5234f4`, the one the site already uses). Read to check licence, cadence and whether past tariffs are kept so a per-distributor history can be built.

## What it says

Metadata (verbatim from `package_show`):
- License: "Open Data Commons Open Database License (ODbL)" (`http://www.opendefinition.org/licenses/odc-odbl`).
- Description: "Apresenta os valores das Tarifas de Energia - TE e das Tarifas de Uso do Sistema de Distribuição - TUSD, resultantes dos processos de reajustes tarifários das distribuidoras de energia elétrica."
- "Cobertura temporal": "2010 em diante"; "Frequência de atualização": "Semanal".
- Resources: CSV (datastore active, modified 2026-11-14T10:15), XML, Parquet, and a PDF data dictionary.

MEASURED from the datastore:
- 303,694 rows in total. Fields: `DatGeracaoConjuntoDados`, `DscREH`, `SigAgente`, `NumCNPJDistribuidora`, `DatInicioVigencia`, `DatFimVigencia`, `DscBaseTarifaria`, `DscSubGrupo`, `DscModalidadeTarifaria`, `DscClasse`, `DscSubClasse`, `DscDetalhe`, `NomPostoTarifario`, `DscUnidadeTerciaria`, `SigAgenteAcessante`, `VlrTUSD`, `VlrTE`.
- With the site's residential filter (Tarifa de Aplicação, B1, Convencional, Residencial/Residencial, "Não se aplica", MWh): 1,927 rows, 116 distinct `SigAgente`, 103 with a row in force on 2026-11-14 (same 103 the site lists).
- History is kept: earliest `DatInicioVigencia` 2010-02-03; 101 of 116 agents have a first row in 2010–2011; rows per agent range 6 (CERR) to 20.
- Example, CEMIG-D: 20 rows from 2010-04-08 (TUSD 253,37 + TE 112,26 R$/MWh) to 2026-05-28→2027-05-27, "RESOLUÇÃO HOMOLOGATÓRIA Nº 3.589, DE 26 DE MAIO DE 2026" (TUSD 593,08 + TE 310,21 = R$ 0,903/kWh before taxes).
- ELETROPAULO (Enel SP): current row 2026-07-04→2027-07-03, REH 3.596/2026, TUSD 472,42 + TE 316,96 = R$ 0,789/kWh — identical to the site's `/api/energy-tariffs?uf=SP&distributor=ELETROPAULO` (`tariffKwh` 0.78938).
- COPEL-DIS: current row 2026-06-24→2027-06-23, REH 3.592/2026, TUSD 457,17 + TE 310,85 = R$ 0,768/kWh.
- Quirk: for the 2025 cycle several agents have the same values split into two rows (e.g. CEMIG-D 2025-05-28→2025-12-31 and 2026-01-01→2026-05-27), so "history" must be de-duplicated by REH/value, not by row.
- Quirks in names: Enel SP is `ELETROPAULO`; Light is `LIGHT SESA`; both `CPFL SANTA CRUZ` and `CPFL Santa Cruz` exist. Values use a comma decimal (`"541,30"`, `",00"`).
- `datastore_search_sql` is disabled ("Action name not known").

## What it does not say

- No UF column: the dataset cannot map a distributor to a state by itself (the ANEEL ranking panel shows UF — see `aneel-portalrelatorios-ranking-tarifa-residencial.md`).
- Values are before ICMS/PIS/COFINS and before bandeira; taxes are not in this dataset.
- The PDF data dictionary was not read.
