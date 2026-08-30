# Automation

## Pull requests

`.github/workflows/ci-deploy.yml` installs the Worker lockfile, runs mocked unit tests, checks JavaScript syntax, validates a Wrangler dry-run, and does not deploy production.

## Main branch

A push to `main` repeats checks, applies D1 migrations when the binding is present, deploys the Worker and Pages through Wrangler, and checks `https://api.steamcommunity.monster/health`. Production jobs use only `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` GitHub secrets.

## First-time Cloudflare setup

```sh
set CLOUDFLARE_ACCOUNT_ID=...
set CLOUDFLARE_API_TOKEN=...
npm run bootstrap:cloudflare
```

Use PowerShell `$env:NAME = 'value'` or Unix `export`. The helper checks auth, finds or creates the `steamcommunity-monster` D1 database, binds its ID, creates the Pages project if absent, applies migrations, deploys, and attempts the Pages custom domain. It never deletes existing resources. DNS-zone ownership and API-token permissions must be supplied by the account owner.

For repository secrets:

```sh
npm run bootstrap:github
```

This reads the same environment variables and pipes each value to `gh secret set`; values are not printed.
