---
tags: [fetch, 2026-11-14-public-data-pages]
source: https://developers.google.com/search/docs/appearance/structured-data/dataset
fetched: 2026-11-14
kind: primary
---

# Dataset (Dataset, DataCatalog, DataDownload) structured data — Google Search Central

> Fetched 2026-11-14 (footer: "Last updated 2026-09-08 UTC") · Read to see whether `Dataset` markup or its date properties are used for freshness or web ranking.

## What it says

- "Datasets are easier to find in the Dataset Search tool when you provide supporting information such as their name, description, creator and distribution formats as structured data."
- "The purpose of this markup is to improve discovery of datasets from fields such as life sciences, social sciences, machine learning, civic and government data, and more."
- What can qualify includes "A table or a CSV file with some data" and "An organized collection of tables".
- `temporalCoverage`: "The data in the dataset covers a specific time interval." (example value "1950-01-01/2013-12-18")
- `license`: "Provide a URL that unambiguously identifies a specific version of the license used."
- "Google does not guarantee that features that consume structured data will show up in search results."
- The page does not say the feature is deprecated; the tabular-dataset approach is marked "**Beta**".

## What it does not say

- It does not mention `dateModified` or `datePublished` at all (checked by grepping the raw HTML for both strings: 0 hits).
- It does not say Dataset markup affects ranking or appearance in regular web Search; the stated benefit is discovery in the separate Dataset Search tool.
- Nothing on freshness or update cadence.
