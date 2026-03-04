# Frontend (`apps/frontend`)

Next.js 16 App Router UI for Brevet auth/settings flows.

## Scripts

```sh
pnpm --filter frontend run dev
pnpm --filter frontend run lint
pnpm --filter frontend run check-types
pnpm --filter frontend run build
pnpm --filter frontend run test:e2e:cache
pnpm --filter frontend run test:e2e
```

## Pages

- `/login`
- `/signup`
- `/settings/security`
- `/settings/api-keys`

## Browser E2E (Synpress)

The SIWX browser happy-path test lives in `e2e/tests/siwx-happy-path.spec.ts`.

Required services before running e2e:

- PostgreSQL/Redis (`pnpm db:up`)
- backend API at `http://localhost:4000`
- frontend app at `http://127.0.0.1:3000`

Optional env vars for e2e:

- `E2E_BASE_URL` (default `http://127.0.0.1:3000`)
- `E2E_WALLET_SEED` (defaults to the standard test mnemonic)
- `E2E_WALLET_PASSWORD` (default `Tester@1234`)

Run:

```sh
pnpm --filter frontend run test:e2e:cache
pnpm --filter frontend run test:e2e
```

## Logging

- Frontend backend calls propagate `x-request-id` to support backend correlation.
- Backend request failures are logged as structured events (`frontend.backend.request.failed`).
- `FRONTEND_LOG_LEVEL` and `FRONTEND_LOG_JSON` control server-side logging verbosity/format.
- `NEXT_PUBLIC_FRONTEND_LOG_LEVEL` and `NEXT_PUBLIC_FRONTEND_LOG_JSON` control client-side logging.
