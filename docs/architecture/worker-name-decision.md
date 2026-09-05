# Decision — the Worker keeps the name `calcule-brasil`

**Date:** 2026-09-03
**Status:** accepted
**Answers:** `docs/pitches/worker-name-decision.md`, `docs/plans/worker-name-decision/slice-01-decide-worker-name.md`
**Record of this decision:** `docs/architecture/ARCHITECTURE.md`, entry `D1`. That file is
the register; this one is the evidence behind it and is not a second record.

The Cloudflare Worker is **not** renamed. `calcule-brasil` and its preview
sibling `calcule-brasil-preview` are recorded here as a **documented exception**
to the `<owner>-<project>-<resource>-<env>` resource convention, so the next
audit finds a reason instead of an omission.

The `naming` skill asks for exactly this: "Every naming scheme needs a short
list of things that are deliberately outside it. Write yours down, with the
reason, or somebody will 'fix' them." This file is that entry.

## What the name actually is

The Worker name is not a label on a resource. It is an **address**, and three
independent places prove it:

| where the literal appears | what it is | measured |
|---|---|---|
| `https://calcule-brasil.lucas-hdo.workers.dev` | live hostname derived from the script name | `HTTP/2 200`, same `<title>` as the apex |
| `wrangler.jsonc` line 19 | `PUBLIC_SITE_URL` for the preview env, hard-coded to the derived hostname | in the repo |
| `docs/deploy.md` line 9 | the dashboard path where four build settings live (Workers & Pages → `calcule-brasil` → Settings → Builds) | in the repo |

That is the test the `naming` skill puts first — "a slug that crosses the repo
boundary is data, not a folder name" — and this slug crosses it into a
hostname, into a config value and into dashboard state. The rename is in the
expensive class, not the `git mv` class.

### Evidence, by execution

```
$ curl -sI https://calcule-brasil.lucas-hdo.workers.dev | head -1
HTTP/2 200

$ curl -sI https://zzz-does-not-exist-9x7.lucas-hdo.workers.dev | head -1   # control
HTTP/2 404                                                                  # body: error code: 1042

$ curl -s https://calculebrasil.com | grep -o '<title>[^<]*</title>'
<title>Calcule Brasil | Decisões do dia a dia</title>
$ curl -s https://calcule-brasil.lucas-hdo.workers.dev | grep -o '<title>[^<]*</title>'
<title>Calcule Brasil | Decisões do dia a dia</title>

$ curl -sI https://calculebrasil.com | head -1
HTTP/2 200
$ dig +short calculebrasil.com NS
elsa.ns.cloudflare.com.
kayden.ns.cloudflare.com.
$ dig +short calculebrasil.com A
172.67.129.241
104.21.2.250
```

An invented script name on the same `workers.dev` subdomain returns 404, so the
200 on `calcule-brasil.lucas-hdo.workers.dev` is not a wildcard: the deployed
production script is named `calcule-brasil` and the account subdomain is
`lucas-hdo`. The custom domain is live, proxied, and serves byte-identical
markup from the same Worker.

## Why not rename

1. **Renaming a Worker does not rename it.** `name` in `wrangler.jsonc` is the
   script's identity. Changing it and deploying creates a **second** Worker and
   leaves the first one serving `https://calculebrasil.com`, which answers 200
   today. The cutover is manual dashboard work with a window in which the wrong
   Worker answers the domain.
2. **The deployment history does not follow the name.** Deployments and versions
   belong to the script. The new script starts empty, and the old script's
   history — every rollback target the site currently has — goes away with the
   old script when it is deleted. There is no undo for that half of the trade.
3. **The route is dashboard state, not repo state.** `wrangler.jsonc` declares
   no `routes` block, so the mapping from the apex to this Worker is configured
   outside the repository and has to be moved by hand onto the new script.
4. **`docs/deploy.md` goes stale.** It names the Worker inside the dashboard
   path for the four build settings that are not in the repo. A rename requires
   re-pointing those settings and rewriting that document in the same change.
5. **The convention buys nothing here.** Its stated purpose is that a resource
   "can be found and attributed among many": the owner prefix separates yours
   from everything else in a shared account, and the env suffix keeps two
   environments apart in a console dropdown. This account has one project, one
   Worker, one operator, and the two environments already read apart —
   `calcule-brasil` and `calcule-brasil-preview`. The prefix would disambiguate
   nothing that is currently ambiguous.
6. **Hostnames are already an exception.** The `naming` skill lists
   "Hostnames — user-facing, no prefix" among its documented exceptions, and
   this name *is* a user-reachable hostname.

The asymmetry noticed in the pitch is real and is accepted: production carries
no `-env` segment while preview carries `-preview`. It reads as an omission and
is not one — it is the default env of a two-env `wrangler.jsonc`, where the
unsuffixed name is production by construction.

## What could not be determined

The Cloudflare API was **not** reached in this round, so two facts remain
unverified and are not asserted above:

- whether `https://calculebrasil.com` is attached as a **Workers Custom Domain**
  or as a **route pattern**. Both are indistinguishable from outside the
  account, and the cost of a cutover differs between them.
- how many deployments the production script actually has, and whether
  `calcule-brasil-preview` exists at all. Its `workers.dev` hostname returns the
  same 404 / `error code: 1042` as an invented name, which is what both "not
  deployed" and "workers.dev disabled for this env" look like.

Reason: the credential is a 1Password reference and the CLI is not signed in on
this machine — `op whoami` reports `account is not signed in`, and every
`op run` attempt ended in `error initializing client: authorization timeout`.
Neither fact changes the decision — both only raise the price of a rename — but
neither should be read here as measured.

## What would reverse this

Any one of these makes the prefix start paying for itself, and the rename should
then be planned as its own slice with the DNS cutover in it:

- a second Worker, project or environment in the account;
- a second operator, or the account being shared;
- the account holding resources for another owner;
- a staging Worker that must coexist with production in the same listing.

Until then, this file is the answer, and the finding is closed.
