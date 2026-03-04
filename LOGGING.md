# Logging Runbook

## Required Fields

Every structured log entry should include:

- `service`
- `env`
- `event.name`
- `event.category`
- `event.outcome`
- `request.id`

Additional recommended fields:

- `http.method`
- `http.route`
- `http.status_code`
- `duration_ms`
- `user.id`
- `error.code`
- `error.message`

## Event Naming

Use stable, dotted event names from `@repo/auth-contracts/logging`:

- `http.request.completed`
- `http.request.failed`
- `auth.login.succeeded`
- `auth.login.failed`
- `auth.method.linked`
- `auth.method.unlinked`
- `auth.api_key.issued`
- `auth.api_key.revoked`
- `frontend.backend.request.failed`
- `cli.backend.request.failed`

## Forbidden Fields

Never log any of the following raw values:

- `authorization` headers
- cookies (`cookie`, `set-cookie`, session cookies)
- API keys
- wallet signatures or SIWX message payloads
- passkey challenges/credential payloads
- secrets and secret hashes

Backend redaction is enabled by default and should stay enabled in production.

## Level Policy

- `debug`: local diagnostics and deep troubleshooting.
- `info`: successful state transitions and normal request lifecycle.
- `warn`: abnormal but recoverable conditions.
- `error`: failed operations requiring attention.
- `fatal`: unrecoverable failures prior to shutdown.

## Sampling

- Keep `LOG_SAMPLE_RATE=1` by default during rollout.
- Reduce only high-volume success logs if needed.
- Never sample out security failures or backend errors.

## Query Cheatsheet

Examples (adapt to your log backend query syntax):

- Find failed auth logins:
  - `event.name = "auth.login.failed"`
- Trace one request:
  - `request.id = "<request-id>"`
- Find API-key actions:
  - `event.name IN ("auth.api_key.issued", "auth.api_key.revoked")`
