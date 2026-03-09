## 5. Cross-Cutting Concerns

### 5.1 Security

| ID | Requirement |
|----|-------------|
| SEC-01 | The server must never hold, store, or derive any private key, seed phrase, or secret material that would let it spend funds without the actor's consent. |
| SEC-02 | All signing or interactive payment approval must happen client-side or through the actor's chosen payment app. |
| SEC-03 | API keys must be hashed before storage using SHA-256. |
| SEC-04 | Session tokens must be hashed before storage using SHA-256. |
| SEC-05 | For the self-managed EVM SIWX path, auth nonces must be single-use and expire after 5 minutes. |
| SEC-06 | Passkey registration and authentication challenges must be single-use and expire within 5 minutes. |
| SEC-07 | All account data must be scoped to the authenticated account. Actors must not access requests, keys, or methods belonging to another account. |
| SEC-08 | The MCP endpoint must reject requests without valid bearer authentication and must expose protected resource metadata needed for client discovery. |
| SEC-09 | HTTPS must be enforced on all Brevet endpoints. |
| SEC-10 | CSRF protection must be enabled on all dashboard forms and state-changing web forms (e.g. Next.js form submissions), for example via same-site cookies, CSRF tokens, or double-submit cookie. |
| SEC-11 | Rate limiting must be applied to self-managed EVM SIWX nonce generation, passkey options endpoints (registration and authentication), API key creation, and MCP tool calls. |
| SEC-12 | Environment separation must be enforced so testnet payment methods cannot accidentally authorize mainnet flows, and mainnet payment methods cannot authorize testnet-only flows. |
| SEC-13 | The system must treat destination changes across protocol, network, asset, or recipient as high-signal events during retry and requote. |
| SEC-14 | Money comparisons and authorization decisions must use canonical asset identity and atomic-unit amounts. Symbols, display strings, and decimals snapshots are informational only. |
| SEC-15 | If a fiat quote is used for policy or budget enforcement, the system must persist the quote amount, quote currency, quote source, and quote timestamp used for the decision. |
| SEC-16 | Server-declared x402 V2 extension data must not be silently dropped or rewritten. Brevet must either forward it unchanged where safe or reject the flow deterministically before settlement. |
| SEC-17 | Outbound probe and settlement requests must use HTTPS only. Plain HTTP targets are rejected before network I/O begins. |
| SEC-18 | Brevet must not follow redirects automatically for outbound paid-resource requests. Redirect responses are treated as failures unless a later revision defines a safe redirect policy explicitly. |
| SEC-19 | Outbound requests must reject localhost, loopback, link-local, multicast, and private or otherwise non-public IP ranges, including hostnames that resolve to such ranges. |
| SEC-20 | User-supplied outbound headers must be filtered so callers cannot set privileged or hop-by-hop transport headers such as `Host`, `Authorization`, `Connection`, `Proxy-*`, `X-Forwarded-*`, `Content-Length`, or `Transfer-Encoding`. |
| SEC-21 | Outbound request bodies are limited to JSON payloads up to 256 KiB, and payment-required or paid-resource response bodies retained by Brevet are limited to 1 MiB. Exceeding the limit fails deterministically. |
| SEC-22 | TLS certificate validation must remain enabled for all outbound HTTPS requests. |

### 5.2 Observability

| ID | Requirement |
|----|-------------|
| OBS-01 | Every payment request and payment attempt state transition must be logged in `payment_events` with a timestamp and metadata. |
| OBS-02 | Settlement and other background job success and failure must be tracked via telemetry. |
| OBS-03 | MCP tool call latency must be tracked via telemetry. |
| OBS-04 | MCP credential validation latency must be tracked via telemetry. |
| OBS-05 | Protocol normalization, ranking, payment-method selection, recovery, and settlement latency must be tracked via telemetry. |
| OBS-06 | Structured logs must be emitted for major lifecycle events. |
| OBS-07 | Idempotent request reuse, idempotency conflicts, and quote-based budget decisions must be emitted as structured lifecycle metadata. |
| OBS-08 | `payment_events` metadata must capture protocol family, `x402_version` when applicable, downstream transport kind, carrier provenance, and structured settlement outcome details when available. |
| OBS-09 | Recovery-path entry, recovery success, and moves to `manual_review` must be emitted as explicit lifecycle events and telemetry counters. |
| OBS-10 | Outbound request safety rejections, including blocked hosts, forbidden headers, and oversize payloads, must be observable as structured events without leaking secrets. |

### 5.3 Data retention

| ID | Requirement |
|----|-------------|
| DATA-01 | Settled payment requests, attempts, receipts, and lifecycle events must be retained indefinitely for auditability unless policy changes later. |
| DATA-02 | Dismissed and expired payment requests must be retained for 90 days, then deleted together with dependent payment options, payment attempts, settlement receipts, payment events, and persisted review payload data. |
| DATA-03 | Successful protected-resource delivery bodies and transport-specific delivery metadata containing headers or body details must be retained for 30 days, then nullified. After nullification, agent-facing status APIs must return `response_body = null`, `response_headers = null`, and `response_retained = false` while preserving content type, proof, and core audit facts. |
| DATA-04 | Expired account sessions must be deleted. |
| DATA-05 | Raw auth challenge material, expired nonces, and passkey challenges must be deleted after their retention window. |
| DATA-06 | Quote metadata and external settlement references used for budget or settlement decisions must be retained with their request and attempt records for auditability. |
| DATA-07 | Raw x402 payment-requirement snapshots and structured settlement responses must be retained with the request or attempt records for auditability, even when the final delivery outcome is failure or `manual_review`. |

### 5.4 Deployment and configuration

| ID | Requirement |
|----|-------------|
| DEPLOY-01 | The application must be deployable with frontend and backend in separate containers (e.g. separate Next.js and Fastify containers). |
| DEPLOY-02 | The application must support horizontal scaling through shared PostgreSQL and Redis-backed BullMQ queues. |
| DEPLOY-03 | Database migrations must remain forward-compatible and must not assume a permanent 1:1 relationship between account and wallet. |
| DEPLOY-04 | Target hosting is Railway (default). |
| DEPLOY-05 | Protocol registry, network registry, and capability matrix configuration must be environment-driven and testable. |
| DEPLOY-06 | Monetary amount columns must use integer-safe storage for atomic units and must not rely on floating-point types. |
| DEPLOY-07 | Schema changes for credential audit fields, API key schema, review states, manual-review states, and delivery nullification must preserve existing auditability and support zero-downtime rollout sequencing. |

---
