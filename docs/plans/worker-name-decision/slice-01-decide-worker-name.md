---
status: done
kanban: 0eb6e1f5-b8a6-49c4-afb2-3616a75dd8d1
---

# Slice 1 — Decide whether the Worker is renamed

**Outcome: not renamed.** The decision record is
`docs/architecture/worker-name-decision.md`; `wrangler.jsonc` is untouched. If
the decision is ever reversed, the rename is a new slice with the DNS cutover
inside it — not an edit to this one.

**Why it was blocked.** Renaming a Cloudflare Worker is not a repository
change: deploying a changed `name` creates a second Worker and leaves the old
one serving the custom domain, so the cutover happens in the Cloudflare
dashboard, which I cannot open. The decision — pay a DNS cutover for a naming
convention, or write down why not — is a product-owner call, not a code change.

## Delivers

Either a rename, or a recorded refusal. Both are acceptable outcomes; leaving
the question open is not.

**If renamed:** `wrangler.jsonc` line 3 goes from `"name": "calcule-brasil"` to
the `<owner>-<project>-<resource>-<env>` form, the preview env at line 17
follows, the custom domain is moved to the new Worker, the old Worker is
deleted, and the four dashboard build settings recorded in `docs/deploy.md` are
re-pointed — that document names the Worker in its path
(Workers & Pages → `calcule-brasil` → Settings → Builds) and would be stale.

**If not renamed:** a short decision record under `docs/architecture/` saying
the Worker name is deliberately outside the convention, with the reason — one
project, one Worker, deploy by name in a dashboard nobody else operates — so
the next audit stops re-raising it.

## Needs

- **The owner, for the part I cannot do**: opening the Cloudflare dashboard and
  reporting how `https://calculebrasil.com` is attached to this Worker.
  `wrangler.jsonc` declares no `routes` block, so that mapping is dashboard
  state and the cost of the rename depends on it. I could not determine this
  from the repository and did not guess.
- If renamed: a maintenance window, because there is a period during the
  cutover when the domain points at one of two Workers and it may be the wrong
  one.
- `docs/deploy.md` open alongside — it is the only record of the dashboard
  config and it goes stale on a rename.

## Tests

- If renamed: `pnpm run worker:dry-run` succeeds against the new name, and
  `curl -sI https://calculebrasil.com` returns 200 from the new Worker after
  the cutover, before the old one is deleted. Delete the old Worker only after
  that 200.
- If not renamed: no test. The decision record is the artefact.

## Done when

Both branches assert the **value** of `name`, never the presence of the key.
A bare `grep -n '"name"' wrangler.jsonc` exits 0 for having found the key,
whatever it holds — it passes with the unconverted name, it passes with a
typo, and it passes on a file where both names were replaced with garbage:

    $ grep -n '"name"' wrangler.jsonc; echo "exit=$?"
    3:  "name": "calcule-brasil",
    17:      "name": "calcule-brasil-preview",
    exit=0

    $ sed 's/calcule-brasil/totally-wrong-name/' wrangler.jsonc > /tmp/t.jsonc
    $ grep -n '"name"' /tmp/t.jsonc > /dev/null; echo "exit=$?"
    exit=0

That is a stamp, not a measurement. Both gates below were run against a
tampered copy as well as the real file, and each one separates them.

**If renamed:**

```
grep -nE '^ *"name": "[a-z0-9]+(-[a-z0-9]+){2,}-prod",$' wrangler.jsonc &&
grep -nE '^ *"name": "[a-z0-9]+(-[a-z0-9]+){2,}-preview",$' wrangler.jsonc &&
pnpm run worker:dry-run
```

Each grep must print its line — line 3 the new
`<owner>-<project>-<resource>-prod` name, line 17 the matching preview name —
and the chain must exit 0. `{2,}` is what enforces the shape: four or more
`kebab-case` segments, the last of which is the environment. Verified in both
directions: against `wrangler.jsonc` as it stands both patterns exit 1
(`calcule-brasil` has two segments, `calcule-brasil-preview` three, both short
of the four the convention asks for), and against a copy holding
`lucas-hdo-calcule-brasil-worker-prod` / `-preview` the chain exits 0 and
prints lines 3 and 17. Followed by
`curl -sI https://calculebrasil.com | head -1` returning `HTTP/2 200`.

**If not renamed** — this is the branch that ran:

```
grep -nE '^  "name": "calcule-brasil",$' wrangler.jsonc &&
grep -nE '^      "name": "calcule-brasil-preview",$' wrangler.jsonc &&
ls docs/architecture/*worker*name* &&
git diff --stat main...HEAD -- wrangler.jsonc &&
test -z "$(git diff --name-only main...HEAD -- wrangler.jsonc)"
```

The two greps must print lines 3 and 17 with those **exact** values, which is
what proves the config was left alone rather than merely still having a `name`
key; against the tampered copy they exit 1. `ls` must list the decision
record. The `git diff` must print nothing, and `test -z` is what turns "prints
nothing" into an exit code — the diff is taken against `main...HEAD` rather
than the worktree, because a worktree diff is empty after a commit whether or
not the commit changed the file.

## If stuck

The default is **do not rename**. The convention exists so a resource can be
found and attributed among many, and this account has one project, one Worker
and one operator — the name already says the project. If the owner does not
have an appetite for a DNS cutover, write the decision record, close this
slice, and the audit finding is answered.
