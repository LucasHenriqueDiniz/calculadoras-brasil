"""Each capital's average asking rent per m² from FipeZAP's September 2026 rental report.

    pdftotext -layout fipezap-202609-residencial-locacao.pdf fipezap.txt
    python3 -I fipezap-2026-09-city-prices.py fipezap.txt

Each city's summary page prints "Preço médio (setembro/2026) R$ X / m²" under a
"CITY (UF)" heading. Output: fipezap-2026-09-city-prices.txt. The 22 values agree
with the report's own summary paragraph, which lists them all on page 2.
"""
import re, sys
lines = open(sys.argv[1], encoding="utf-8", errors="replace").read().split("\f")
for page in lines:
    m = re.search(r"Preço médio \((\w+/\d{4})\)\s+R\$ ([\d.,]+) / m²", page)
    if not m:
        continue
    # the page heading names the city: "RESUMO ... | SÃO PAULO (SP)" or a line with "CIDADE (UF)"
    heads = re.findall(r"\b([A-ZÁÉÍÓÚÂÊÔÃÕÇ][A-ZÁÉÍÓÚÂÊÔÃÕÇ .]+) \(([A-Z]{2})\)", page)
    print(m.group(1), "|", heads[:3], "|", m.group(2))
