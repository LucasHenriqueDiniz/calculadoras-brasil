---
status: todo
---

# Slice 6 — Close out what the first round left open

## Delivers

| item | artefact |
|---|---|
| the 12 `owner` rows (`ADS-ELIG-01/02`, `ADS-OWN-01/02`, `ADS-SITE-01/02`, `ADS-PROG-01/04/07`, `ADS-PRIV-08/09/10`) | written answers by the account holder in `docs/adsense/owner-attestations.md`, one line per row, dated |
| `ADSENSE-CHECKLIST.md` | deleted. Its replacement is the auditor's report in slice 7, which cannot grade itself |
| `docs/pitches/adsense-low-value-rejection.md` | every scope item ticked with the 2026-10-18 measurement that closed it, or pointed at this plan; `status: done` |
| `/metodologia` | main content separated from nav and footer, so `analyze_text_depth.py` returns a count instead of `ERR` |
| `/sobre` | what the owner decides about authorship and about how the content is produced |

⚠️ **Owner, two decisions this slice cannot make:**
- **the 12 rows.** They attest to things only the account holder knows: eligibility, ownership,
  account history.
- **`/sobre`.** Google's Search guidance asks for bylines where readers expect them, and for a
  disclosure of how content was produced where readers would wonder
  (`fetches/search-creating-helpful-content.md`). Whether the page names an author, and how it
  describes the use of AI in writing the site, is the owner's call. Whatever it says must be true:
  the same guidance calls fabricated author profiles deceptive.

## Needs

Nothing from slices 1–5, except that the old pitch's reconciliation cites their outcomes. It can
run in parallel with them and close last.

## Tests

`pnpm run check` and `pnpm run test:seo` green.

## Done when

```
test ! -e ADSENSE-CHECKLIST.md \
  && grep -q '^status: done' docs/pitches/adsense-low-value-rejection.md \
  && [ "$(grep -c '^| ADS-' docs/adsense/owner-attestations.md)" -eq 12 ] \
  && ~/dev/pessoal/adsense-site-auditor/.venv/bin/python \
       ~/dev/pessoal/adsense-site-auditor/scripts/analyze_text_depth.py \
       https://calculebrasil.com/metodologia | grep -v ERR | grep -q 'ADS-CONTENT-03' \
  && echo OK
```

prints `OK`.

## If stuck

If the owner has not answered the 12 rows, this slice stays open, and slice 7 does not start.
Unanswered owner rows are exactly what the 26 June checklist assumed.
