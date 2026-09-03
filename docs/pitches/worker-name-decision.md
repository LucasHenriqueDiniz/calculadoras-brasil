---
status: active
epic: worker-name
---

# Does the Worker name join the naming convention?

## The problem

The `naming` skill asks for `<owner>-<project>-<resource>-<env>`. The Worker has
neither an owner prefix nor an environment suffix:

```
$ grep -n '"name"' wrangler.jsonc
3:  "name": "calcule-brasil",
17:      "name": "calcule-brasil-preview",
```

Production is `calcule-brasil`. Preview is `calcule-brasil-preview` — so the
environment suffix exists on one of the two, which is the shape that makes the
production name look like an omission rather than a choice.

## Why it is a decision and not a task

Renaming a Worker on Cloudflare does not rename it. Changing `name` in
`wrangler.jsonc` and deploying creates a **second** Worker under the new name
and leaves the old one serving traffic, which means the custom domain has to be
moved between them by hand and there is a window where the wrong one answers.

The rest of the deploy is configured outside the repository, which makes the
change wider than the one line suggests. `docs/deploy.md` records that Build
command, Deploy command, Version command and Root directory live in the
dashboard under Workers & Pages → `calcule-brasil` → Settings → Builds, and that
"a change takes a while to take effect" — the same lag applies to anything
touched there during a rename.

## What I could not verify

I did not confirm how the custom domain is attached. `wrangler.jsonc` declares
no `routes` block, so the mapping from `https://calculebrasil.com` (the value of
`PUBLIC_SITE_URL`) to this Worker is configured in the Cloudflare dashboard,
which I cannot read from the repository. The cost of the rename depends on
whether that is a Custom Domain or a route pattern, and the owner is the only
one who can look.

## The case for leaving it

The convention exists so that a resource can be found and attributed among many.
This account has one project and one Worker, the name already says the project,
and the deploy is by Worker name in a dashboard nobody else operates. Paying a
DNS cutover for a prefix that disambiguates nothing is a real question, not a
formality — which is why this is a decision card and not a rename card.

## Appetite

One slice, blocked on the owner.
