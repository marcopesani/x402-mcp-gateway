# AGENTS.md

## Scope
- Applies to the whole repo.
- Optimize for minimal, correct, low-churn changes.

## Non-Negotiables
- Use `pnpm` from repo root; do not switch package manager.
- Prefer existing root scripts over ad-hoc commands.
- Keep edits scoped to the request; avoid unrelated refactors.
- Never commit secrets, credentials, or populated `.env` values.
- Ask first before: new dependencies, migrations, CI/workflow changes, or destructive ops.
- Keep code simple and small: prefer pure functions and split complex logic.

## Code Structure Rules
- No barrel files (`index.ts`/`index.js` re-exports, `export * from ...`).
- Use direct imports from concrete modules (for example `@repo/db/schema`, `@repo/auth-contracts/siwx`).
- Centralize env defaults per boundary (backend, frontend server/client, cli, db tooling).
- Do not scatter env fallbacks (`process.env.X ?? ...`) across handlers/pages/plugins/commands.
- Keep security-sensitive defaults (for example cookie secret guards) in centralized env modules.

## Validation
- After import/env structural changes: run `pnpm check-types`, then `pnpm build`.
- For cross-cutting changes: run `pnpm lint && pnpm check-types && pnpm test && pnpm build`.

## Canonical Commands
- Install: `pnpm install --no-frozen-lockfile`
- Dev: `pnpm dev`
- Build: `pnpm build`
- Lint: `pnpm lint`
- Typecheck: `pnpm check-types`
- DB: `pnpm db:up`, `pnpm db:down`, `pnpm db:logs`
- CLI example: `pnpm --filter cli exec ./bin/dev.js hello`
