---
tags: [adsense, attestation]
answered: 2026-10-19
---

# Owner attestations for the 12 `owner` rows

The `adsense-site-auditor` reference marks these 12 requirements `owner`: only the account holder
can answer them. In June the self-graded checklist ticked all 12 as "confirmed", and nobody had
been asked. These are the account holder's answers, given in writing on 2026-10-19 in the
working session for [[adsense-reapplication]] slice 6. Each statement below was put to the owner
as worded, and the owner ticked every one.

Where the repository or the AdSense panel also shows something, the evidence column says what.
Evidence supports an answer; it does not replace it.

| row | the owner confirms | evidence outside the owner's word | date |
|---|---|---|---|
| ADS-ELIG-01 | is 18 or older | none possible from the repository | 2026-10-19 |
| ADS-ELIG-02 | this is their only AdSense account, and the site was added to it rather than to a duplicate | none possible from the repository | 2026-10-19 |
| ADS-OWN-01 | controls the repository that puts the AdSense code in `<head>` | `src/routes/__root.tsx` loads `adsbygoogle.js?client=ca-pub-2600827684802809` | 2026-10-19 |
| ADS-OWN-02 | owns `calculebrasil.com` and controls its registration and DNS | this repository's Worker serves the domain; who holds the registration is not visible from here | 2026-10-19 |
| ADS-SITE-01 | the site is on the account's site list and has been reviewed | the panel showed "Requer atenção", "Conteúdo de baixo valor" on 2026-09-07 | 2026-10-19 |
| ADS-SITE-02 | the site is verified through `ads.txt` | `public/ads.txt` holds `google.com, pub-2600827684802809, DIRECT, f08c47fec0942fa0`; the panel shows ads.txt "Autorizado" | 2026-10-19 |
| ADS-PROG-01 | has never clicked their own ads, nor used bots or automation to inflate impressions or clicks | none possible from the repository | 2026-10-19 |
| ADS-PROG-04 | all traffic is legitimate: no paid-to-click, auto-surf, click exchange, spam, or ads with poor landing pages | none possible from the repository; Search Console reports only search traffic, so it cannot rule out other sources | 2026-10-19 |
| ADS-PROG-07 | does not apply: the site is web only, with no app or WebView | the repository builds a website and no app | 2026-10-19 |
| ADS-PRIV-08 | uses no remarketing, audience lists or targeting on sensitive data, in Google Ads, Analytics or AdSense | no gtag, remarketing or audience code in `src/` | 2026-10-19 |
| ADS-PRIV-09 | does not apply: places no housing, employment or credit ads targeted in the US or Canada | none possible from the repository | 2026-10-19 |
| ADS-PRIV-10 | personalised ads may run, and `/privacidade` explains personalisation and how to opt out | `/privacidade`, section "Anúncios personalizados e como desativá-los"; Funding Choices serves `__tcfapi` (measured 2026-10-18) | 2026-10-19 |

## What this file is not

- **A verdict.** It records the owner's answers. Slice 7's auditor run decides what passes, and
  any row it cannot decide stays `Unknown` in its report.
- **Permanent.** An answer can stop being true, for example if an ad campaign starts buying
  traffic. A change goes in a new dated line, not an edit to an old one.
