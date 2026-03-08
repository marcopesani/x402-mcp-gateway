# Brevet Specifications

`specifications/INDEX.md` is the canonical specification entrypoint for Brevet.

Use this file as the repo-local handoff for agents and contributors that are
expected to "read SPECS.md" before planning or implementing work.

## Reading order

1. `specifications/INDEX.md`
2. `specifications/06-acceptance-matrix.md`

## Scope rules

- Treat the currently approved product scope as the default boundary for active
  work.
- Treat later or reserved work as out of scope unless the user explicitly asks
  to pull it into active work.
- When there is tension between code and specs, treat the specification set as
  the source of truth for intended architecture and acceptance behavior.

## Key invariants

- Accounts are the durable owner boundary.
- `/mcp` bearer auth uses account API keys in the current design.
- Monetary comparisons use canonical `asset_ref + amount_atomic`.
- Base and Base Sepolia must remain distinct everywhere.
- Payment proofs and request or delivery records must remain generic and
  transport-neutral even when runtime support is intentionally narrow.
