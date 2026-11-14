---
tags: [fetch, 2026-11-14-public-data-pages]
source: https://dadosabertos.aneel.gov.br/dataset/bandeiras-tarifarias
fetched: 2026-11-14
kind: primary
---

# Bandeiras Tarifárias — ANEEL Dados Abertos

> Fetched 2026-11-14 through the CKAN API (`package_show?id=bandeiras-tarifarias`, `datastore_search` on resources `0591b8f6-…` "Acionamento" and `5879ca80-…` "Adicional"). Read for the history of flag activations and their cost.

## What it says

Metadata:
- License: "Open Data Commons Open Database License (ODbL)".
- "Cobertura temporal": "A partir de jan/2015"; "Frequência de atualização": "Mensal"; documentation "Procedimentos de Regulação Tarifária - Proret - Módulo 6.8".
- Resources: "Bandeira Tarifária - Acionamento" (CSV, modified 2026-11-10), "Bandeira Tarifária - Adicional" (CSV, modified 2026-07-15), "Bandeira Tarifária - Conta Bandeira" (CSV), plus PDF dictionaries.

MEASURED from the datastore:
- Acionamento: 143 rows, fields `DatCompetencia`, `NomBandeiraAcionada`, `VlrAdicionalBandeira`; months 2015-01 → 2026-11 (one per month). Latest: Amarela June–September 2026, Verde October and November 2026. Counts over the series: Verde 69, Vermelha P1 26, Amarela 25, Vermelha P2 15, Escassez Hídrica 8.
- Adicional: 27 rows, fields `DscResolucao`, `DatVigencia`, `NomBandeiraAcionada`, `VlrAdicionalBandeiraRSMWh`; `DatVigencia` from 2015-03-02 (Amarela 25,00 R$/MWh, "REH nº 1.859/2015") to 2024-04-01.

## What it does not say

- The Adicional table's latest `DatVigencia` is 2024-04-01; whether later surcharge values exist and are missing, or were unchanged, is not stated.
- No per-distributor breakdown: the flag is national (SIN).
