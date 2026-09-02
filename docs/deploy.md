# Deploy

This Worker is published by Cloudflare **Workers Builds**, triggered by a push
to Git. There is no deploy GitHub Action: `ci.yml` only verifies.

## What is configured in the dashboard

These four lines **do not live in the repository** — they live in Workers & Pages →
`calcule-brasil` → Settings → Builds. They are written down here because
invisible config is config that breaks without anyone seeing it: the migration
from npm to pnpm broke the build precisely because the command said `npm ci` and
nothing in the repo gave that away.

| field | value |
|---|---|
| Build command | `pnpm run build` |
| Deploy command | `npx wrangler deploy` |
| Version command | `npx wrangler versions upload` |
| Root directory | `/` |

The **Deploy command** runs on a push to the production branch. The **Version
command** runs on a pull request and uploads a version without promoting it —
that is what makes the "Workers Builds" check appear on PRs.

The install step is automatic and is **not** part of the build command:
Cloudflare detects `pnpm-lock.yaml`, reads the `packageManager` field of
`package.json` and runs the same version the local machines run. The log
confirms it (`Done in 16.2s using pnpm v11.24.0`). That is why the build command
only calls the build — an `install` there would be a second install of the same
tree.

## When changing package manager or Node version

Touching `packageManager` or `.nvmrc` does **not** update the dashboard. Check
the four lines above in the same change, or the deploy breaks after the merge
with CI green.

A note on Node: pnpm 11 requires **Node ≥ 22.13** (it uses `node:sqlite`). This
repo's `.nvmrc` asks for 24.19.0.

## Two dashboard traps

**"Retry build" does not use the current configuration.** It repeats the build
with that build's configuration snapshot. Fixing the command and retrying an old
build fails identically, and the log still shows the old command — which makes
it look like the fix did not take. To test a configuration change you need a new
build, triggered by a push.

**A change takes a while to take effect.** A push made a few minutes after
saving may still run with the previous command. If the build fails right after a
configuration change, check in the log which command actually ran
(`Executing user build command: ...`) before concluding that the fix is wrong.
