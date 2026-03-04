# Brevet CLI (`apps/cli`)

Oclif-based CLI for interacting with Brevet backend auth endpoints.

## Commands

```sh
pnpm --filter cli exec ./bin/dev.js hello
pnpm --filter cli exec ./bin/dev.js auth whoami
```

## Scripts

```sh
pnpm --filter cli run build
pnpm --filter cli run test
pnpm --filter cli run lint
```

## Configuration

- `BREVET_BACKEND_URL` (default: `http://localhost:4000`)
- `BREVET_API_KEY` (optional)
- `BREVET_LOG_LEVEL` (`debug|info|warn|error|fatal`, default: `info`)
- `BREVET_LOG_JSON` (`1`/`0`, default: `1`)
