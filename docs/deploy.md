# Deploy

Este Worker é publicado pelo **Workers Builds** da Cloudflare, disparado por push
no Git. Não há GitHub Action de deploy: o `ci.yml` só verifica.

## O que está configurado no dashboard

Estas quatro linhas **não vivem no repositório** — moram em Workers & Pages →
`calcule-brasil` → Settings → Builds. Estão anotadas aqui porque config
invisível é config que quebra sem ninguém ver: a migração de npm para pnpm
derrubou o build justamente porque o comando dizia `npm ci` e nada no repo
denunciava isso.

| campo | valor |
|---|---|
| Build command | `pnpm run build` |
| Deploy command | `npx wrangler deploy` |
| Version command | `npx wrangler versions upload` |
| Root directory | `/` |

O **Deploy command** roda em push na branch de produção. O **Version command**
roda em pull request e sobe uma versão sem promovê-la — é o que faz o check
"Workers Builds" aparecer nos PRs.

O passo de install é automático e **não** faz parte do build command: a
Cloudflare detecta o `pnpm-lock.yaml`, lê o campo `packageManager` do
`package.json` e roda a mesma versão que as máquinas locais. O log confirma
(`Done in 16.2s using pnpm v11.24.0`). Por isso o build command chama só o
build — um `install` ali seria a segunda instalação da mesma árvore.

## Ao mudar de gerenciador de pacotes ou de versão de Node

Mexer no `packageManager` ou no `.nvmrc` **não** atualiza o dashboard. Conferir
as quatro linhas acima na mesma mudança, ou o deploy quebra depois do merge, com
o CI verde.

Nota sobre Node: o pnpm 11 exige **Node ≥ 22.13** (usa `node:sqlite`). O
`.nvmrc` deste repo pede 24.19.0.

## Duas armadilhas do dashboard

**"Retry build" não usa a configuração atual.** Ele repete o build com o
snapshot de configuração daquele build. Corrigir o comando e mandar repetir um
build antigo falha idêntico, e o log ainda mostra o comando velho — o que faz
parecer que a correção não pegou. Para testar uma mudança de configuração, é
preciso um build novo, disparado por push.

**A mudança leva um tempo para valer.** Um push feito poucos minutos depois de
salvar ainda pode rodar com o comando anterior. Se o build falhar logo após uma
mudança de configuração, conferir no log qual comando foi realmente executado
(`Executing user build command: ...`) antes de concluir que a correção está
errada.
