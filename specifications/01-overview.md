## 1. Overview

Brevet is a non-custodial payment orchestration system for agentic commerce. It sits between an AI agent that discovers paid resources on the internet and a human-operated account that authorizes payment using one or more linked payment methods.

Brevet exposes an MCP (Model Context Protocol) server that agents use to request payments on behalf of an account. The public auth contract for that MCP surface is `Authorization: Bearer <account_api_key>`. API keys are used only to authenticate the account to the MCP and are not bound to any network or environment. The account operator reviews the request in the Brevet dashboard, Brevet auto-selects the first eligible payment method according to the account's configured priority, and the operator approves that attempt in the dashboard.

Brevet does not custody user funds or private keys. All signing or payment authorization happens client-side or through the user's connected payment system. The server orchestrates requests, stores audit trails, applies policy, and relays protocol-specific settlement payloads.

### 1.1 Product goals

- Support multichain and multiprotocol payment orchestration from day one.
- The initial runtime surface is Base and Base Sepolia via x402 on EVM rails.
- Keep the data model generic enough to expand to more EVM chains, Ethereum L1, Solana, and Lightning-based protocols such as L402 and LN402.
- Make the account the durable boundary for identity, settings, budgets, API keys, and payment history.
- Treat wallets as linked authentication methods and/or payment methods, not as the account itself.

### 1.2 Design principles

| Principle | Description |
|-----------|-------------|
| **Account-centric** | Accounts own API keys, payments, settings, and payment methods. An actor signs in to an account through one or more auth methods. |
| **Protocol-aware** | x402, L402, LN402, and future protocols are modeled as adapters behind a shared payment orchestration layer. |
| **Network-aware** | Networks are registry-driven and environment-aware (`mainnet`, `testnet`) so Base and Base Sepolia are first-class and never conflated. |
| **Monetary-integrity** | Settlement value is modeled as canonical asset identity plus atomic-unit amount. Symbols, decimals, and display strings are supporting metadata; quoted fiat values may inform policy only when paired with explicit quote source, currency, and timestamp, and must never act as canonical asset identity. |
| **Non-custodial** | Brevet never stores seed phrases, private keys, or payment preimages that would let it spend on behalf of the account without consent. |
| **Incremental runtime, durable model** | The first runtime implementation may be intentionally small, but the schema and service boundaries must not assume a single chain, single protocol, single asset type, or single wallet forever. |

### 1.3 Actors

| Actor | Description |
|-------|-------------|
| **Actor** | A human operator using the Brevet UI. An actor can belong to one or more accounts. |
| **Account** | The durable owner of API keys, payment methods, settings, budgets, notifications, and payment history. Personal accounts; organization accounts are reserved. |
| **AI Agent** | An LLM-based or software agent that calls Brevet through MCP and asks the account to pay for a protected resource. |
| **Brevet Server** | Node.js application (Fastify backend) that orchestrates auth, account sessions, MCP requests, dashboard flows, protocol adapters, and settlement workers. |
| **Protected Resource** | A third-party HTTP endpoint or service that returns payment requirements and later serves data after successful settlement. |
| **Protocol Adapter** | A Brevet module that understands a payment protocol such as x402, L402, or LN402. |
| **Network Adapter** | A Brevet module or registry entry that describes a settlement network such as Base, Base Sepolia, Ethereum, Solana, or Lightning. |
| **Facilitator / Verifier** | An external service that verifies protocol-specific payment payloads and/or helps complete settlement. |

### 1.4 Tech stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, Fastify, Drizzle ORM (deployed in its own container) |
| Frontend | Next.js (App Router), React 19, TypeScript (deployed in its own container) |
| Deployment | Frontend and backend in separate containers; Railway (default) |
| Real-time UI | Next.js with server components and client components; real-time updates via polling, Server-Sent Events, or WebSockets (to be implemented) |
| Background jobs | BullMQ (Redis-backed); not yet implemented |
| Database | PostgreSQL |
| HTTP client | Standard fetch for outbound probe and settlement requests |
| EVM wallet connectivity | Reown AppKit / WalletConnect |
| Authentication abstraction | SIWX (Sign In With X, CAIP-122) via AppKit `siwx`; passkeys (W3C WebAuthn and FIDO CTAP per [passkeys.dev specifications](https://passkeys.dev/docs/reference/specs/)); account API keys; contracts in `@repo/auth-contracts` |
| EVM auth message | SIWE (Sign-In With Ethereum, EIP-4361) |
| Settlement protocol | x402 |
| Payment approval signing | EIP-712 typed data, EIP-3009 transferWithAuthorization |
| Agent transport / MCP runtime | Official MCP TypeScript SDK ([modelcontextprotocol/typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk)), integrated with the Fastify backend |

### 1.5 Capability matrix

| Dimension | Supported | Reserved |
|-----------|-----------|----------|
| Account type | Personal account | Organization / shared account |
| Auth methods | EVM SIWX with Reown AppKit / WalletConnect (current `eip155` message flow: SIWE / EIP-4361); passkey (WebAuthn) for sign-in and account creation | Email/password, OAuth, Solana wallet auth, broader multichain SIWX |
| Public MCP auth contract | `Authorization: Bearer <account_api_key>` | Token exchange, OAuth-backed bearer flows, or other managed auth contracts |
| Payment methods | EVM wallet on Base and Base Sepolia, selected by account-wide priority order | More EVM wallets, Solana wallet, Lightning wallet/node |
| Protocols | x402 exact scheme on EVM rails with explicit V1/V2 codec support | L402, LN402, additional x402 schemes |
| x402 downstream transports | HTTP V1 (`PaymentRequirementsResponse` body, `X-PAYMENT`, `X-PAYMENT-RESPONSE`) and HTTP V2 (`PAYMENT-REQUIRED`, `PAYMENT-SIGNATURE`, `PAYMENT-RESPONSE`) | MCP V1 and MCP V2 downstream resource support |
| Retry / requote | Reserved design only | Actor-facing retry/requote flow |
| Notifications | Reserved design only | Email, then push and webhook delivery |
| Protected-resource response bodies | JSON objects only | Text, HTML, CSV, binary payloads, or richer storage modes |
| Networks | Base mainnet normalized to `eip155:8453` with accepted V1 alias `base`; Base Sepolia normalized to `eip155:84532` with accepted V1 alias `base-sepolia` | Ethereum L1, other EVM L2s, Solana, Lightning |
| Proof types | On-chain tx hash and facilitator receipt | Payment hash, preimage, invoice receipt, protocol-native proofs |

### 1.6 Specification status

This document is a target architecture and requirements specification, not a claim that the checked-in repository already implements every feature described here.

- Statements using `must`, `should`, and Definition of Done checklists describe intended behavior once the corresponding feature is implemented.
- Where this document refers to Brevet's MCP server, the intended runtime strategy is to use the official MCP TypeScript SDK rather than build a bespoke MCP transport layer from scratch.
- Support for x402 V1 and V2 in this document refers to the intended product/runtime scope and adapter contracts.
- MCP protocol revision dates in this document are compatibility targets and documentation aids, not a claim that a specific dated revision must ship before the product contract is valid.
- As of this revision, the current repository does not yet contain the full runtime needed for the x402 lifecycle described here, including downstream x402 adapters/codecs, persistence schema, BullMQ settlement workers, approval flows, or the Brevet MCP runtime surface beyond the initial Fastify/Next.js scaffold (auth and API key scaffolding are in place).

---
