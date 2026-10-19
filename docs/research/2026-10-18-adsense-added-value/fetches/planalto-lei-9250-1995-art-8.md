---
tags: [fetch, 2026-10-18-adsense-added-value]
source: https://www.planalto.gov.br/ccivil_03/leis/l9250.htm
fetched: 2026-10-18
kind: primary
---

# Lei nº 9.250/1995, art. 8º — Planalto

> Fetched 2026-10-18 in the browser pane. Read for the annual deductions the IRPF calculator applies.

## What it says

"Art. 8º A base de cálculo do imposto devido no ano-calendário será a diferença entre as somas:"
(I) taxable income, and (II) the deductions relating to:

- **a)** payments to doctors, dentists, psychologists, physiotherapists, speech therapists,
  occupational therapists and hospitals, laboratory exams, radiology, orthopaedic devices and
  prostheses. **No limit is stated.**
- **b)** education of the taxpayer and dependants, at establishments of learning, "até o limite
  anual individual". Planalto shows the successive amounts. The 2026 figure, R$ 3.561,50, is in
  `../../2026-09-04-irpf-2026-table/`.

## What it does not say

- How a single "education" total on a form maps to people. "Individual" means each person carries
  their own limit, so the most one total can hold is that limit times the taxpayer plus the
  dependants. That is how `calculateIrpf` now caps it.
- Medicines bought at a pharmacy are not on the list in "a". The page's FAQ should not suggest
  otherwise.
