# Frontend (`apps/frontend`)

Next.js 16 App Router UI for Brevet auth/settings flows.

## Scripts

```sh
pnpm --filter frontend run dev
pnpm --filter frontend run lint
pnpm --filter frontend run check-types
pnpm --filter frontend run build
```

## Pages

- `/login`
- `/signup`
- `/settings/security`
- `/settings/api-keys`

## Logging

- Frontend backend calls propagate `x-request-id` to support backend correlation.
- Backend request failures are logged as structured events (`frontend.backend.request.failed`).
- `FRONTEND_LOG_LEVEL` and `FRONTEND_LOG_JSON` control server-side logging verbosity/format.
- `NEXT_PUBLIC_FRONTEND_LOG_LEVEL` and `NEXT_PUBLIC_FRONTEND_LOG_JSON` control client-side logging.
