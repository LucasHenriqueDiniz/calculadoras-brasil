"""Ethanol's km/l as a share of gasoline's, across the flex rows of Inmetro's PBE Veicular 2026.

    pdftotext -layout "Tabela PBEV 2026_25_AGO.pdf" pbev-2026.txt
    python3 -I pbev-2026-ethanol-yield.py pbev-2026.txt

A combustion row ("Combustão") whose fuel column reads "F" is flex. Its first six
decimal values after that are ethanol city / highway / combined, then gasoline
city / highway / combined, as the table's header prints them ("Etanol" over the
first three, "Gasolina ou Diesel" over the next). Output: pbev-2026-ethanol-yield.txt.
"""
import re, sys, statistics as st
rows = []
for line in open(sys.argv[1], encoding="utf-8", errors="replace"):
    toks = line.split()
    if "Combustão" not in toks:
        continue
    i = toks.index("Combustão")
    # transmission, A/C, steering, fuel letter
    fuel = toks[i + 4] if len(toks) > i + 4 else ""
    if fuel != "F":
        continue
    nums = []
    for t in toks[i + 5:]:
        if re.fullmatch(r"\d+,\d+", t):
            nums.append(float(t.replace(",", ".")))
            if len(nums) == 6:
                break
        elif nums:
            nums = []
    if len(nums) != 6:
        print("SKIP", line.strip()[:160], file=sys.stderr)
        continue
    rows.append((line.strip(), nums))
print("flex rows parsed:", len(rows))
for k, name in enumerate(["cidade", "estrada", "combinado"]):
    r = [n[k] / n[k + 3] for _, n in rows]
    print(f"{name}: median {st.median(r):.4f} mean {st.mean(r):.4f} min {min(r):.3f} max {max(r):.3f}  p10 {st.quantiles(r, n=10)[0]:.3f} p90 {st.quantiles(r, n=10)[-1]:.3f}")
comb = sorted(n[2] / n[5] for _, n in rows)
print("share of rows with combined ratio <= 0.70:", sum(x <= 0.70 for x in comb), "/", len(comb))
print("share with ratio in [0.68, 0.74]:", sum(0.68 <= x <= 0.74 for x in comb))
uniq = {tuple(n) for _, n in rows}
print("distinct consumption tuples:", len(uniq), "median combined over distinct:", round(st.median(t[2]/t[5] for t in uniq), 4))
