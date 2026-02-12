import { describe, it, expect } from "vitest";
import type { Hex } from "viem";
import {
  parsePaymentRequired,
  buildPaymentSignatureHeader,
  extractTxHashFromResponse,
} from "../headers";

// Helper to create a Response with given headers and body
function makeResponse(
  status: number,
  headers: Record<string, string>,
  body?: string,
): Response {
  return new Response(body ?? "", {
    status,
    headers: new Headers(headers),
  });
}

describe("parsePaymentRequired", () => {
  it("parses valid X-PAYMENT header with array", () => {
    const requirements = [
      {
        scheme: "exact",
        network: "eip155:84532",
        maxAmountRequired: "50000",
        resource: "https://api.example.com/resource",
        payTo: "0x" + "b".repeat(40),
      },
    ];

    const response = makeResponse(
      402,
      { "X-PAYMENT": JSON.stringify(requirements) },
    );

    const result = parsePaymentRequired(response);
    expect(result).toEqual(requirements);
  });

  it("normalises a single object to an array", () => {
    const requirement = {
      scheme: "exact",
      network: "eip155:84532",
      maxAmountRequired: "50000",
      resource: "https://api.example.com/resource",
      payTo: "0x" + "b".repeat(40),
    };

    const response = makeResponse(
      402,
      { "X-PAYMENT": JSON.stringify(requirement) },
    );

    const result = parsePaymentRequired(response);
    expect(result).toEqual([requirement]);
  });

  it("falls back to PAYMENT-REQUIRED header", () => {
    const requirements = [
      {
        scheme: "exact",
        network: "eip155:84532",
        maxAmountRequired: "100000",
        resource: "https://api.example.com/resource",
        payTo: "0x" + "c".repeat(40),
      },
    ];

    const response = makeResponse(
      402,
      { "PAYMENT-REQUIRED": JSON.stringify(requirements) },
    );

    const result = parsePaymentRequired(response);
    expect(result).toEqual(requirements);
  });

  it("returns null when no payment headers present", () => {
    const response = makeResponse(402, {});
    const result = parsePaymentRequired(response);
    expect(result).toBeNull();
  });

  it("returns null for malformed JSON", () => {
    const response = makeResponse(402, { "X-PAYMENT": "not valid json{" });
    const result = parsePaymentRequired(response);
    expect(result).toBeNull();
  });

  it("returns null for empty header value", () => {
    const response = makeResponse(402, { "X-PAYMENT": "" });
    const result = parsePaymentRequired(response);
    expect(result).toBeNull();
  });
});

describe("buildPaymentSignatureHeader", () => {
  it("produces valid base64-encoded JSON", () => {
    const signature = "0xdeadbeef" as Hex;
    const authorization = {
      from: "0x" + "a".repeat(40) as Hex,
      to: "0x" + "b".repeat(40) as Hex,
      value: BigInt(50000),
      validAfter: BigInt(0),
      validBefore: BigInt(1748736300),
      nonce: "0x" + "0".repeat(63) + "1" as Hex,
    };

    const header = buildPaymentSignatureHeader(signature, authorization);

    // Decode base64
    const decoded = JSON.parse(atob(header));

    expect(decoded.x402Version).toBe(1);
    expect(decoded.scheme).toBe("exact");
    expect(decoded.network).toBe("eip155:84532"); // Base Sepolia from test env
    expect(decoded.payload.signature).toBe(signature);
    expect(decoded.payload.authorization.from).toBe(authorization.from);
    expect(decoded.payload.authorization.to).toBe(authorization.to);
    // BigInt serialised as string
    expect(decoded.payload.authorization.value).toBe("50000");
    expect(decoded.payload.authorization.validAfter).toBe("0");
    expect(decoded.payload.authorization.validBefore).toBe("1748736300");
  });

  it("serialises bigint values as strings in JSON", () => {
    const header = buildPaymentSignatureHeader("0xabc" as Hex, {
      from: "0x" + "a".repeat(40) as Hex,
      to: "0x" + "b".repeat(40) as Hex,
      value: BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935"),
      validAfter: BigInt(0),
      validBefore: BigInt(999999999999),
      nonce: "0x" + "f".repeat(64) as Hex,
    });

    const decoded = JSON.parse(atob(header));
    // max uint256 should be serialised as a string, not lose precision
    expect(decoded.payload.authorization.value).toBe(
      "115792089237316195423570985008687907853269984665640564039457584007913129639935",
    );
  });
});

describe("extractTxHashFromResponse", () => {
  it("extracts tx hash from X-PAYMENT-TX-HASH header", async () => {
    const response = makeResponse(
      200,
      { "X-PAYMENT-TX-HASH": "0x" + "a".repeat(64) },
      "{}",
    );

    const hash = await extractTxHashFromResponse(response);
    expect(hash).toBe("0x" + "a".repeat(64));
  });

  it("extracts tx hash from JSON body when header is absent", async () => {
    const txHash = "0x" + "b".repeat(64);
    const response = makeResponse(
      200,
      { "Content-Type": "application/json" },
      JSON.stringify({ success: true, txHash }),
    );

    const hash = await extractTxHashFromResponse(response);
    expect(hash).toBe(txHash);
  });

  it("prefers header over JSON body", async () => {
    const headerHash = "0x" + "a".repeat(64);
    const bodyHash = "0x" + "b".repeat(64);
    const response = makeResponse(
      200,
      {
        "X-PAYMENT-TX-HASH": headerHash,
        "Content-Type": "application/json",
      },
      JSON.stringify({ txHash: bodyHash }),
    );

    const hash = await extractTxHashFromResponse(response);
    expect(hash).toBe(headerHash);
  });

  it("returns null when no tx hash is present", async () => {
    const response = makeResponse(200, {}, "OK");
    const hash = await extractTxHashFromResponse(response);
    expect(hash).toBeNull();
  });

  it("returns null for non-JSON body without header", async () => {
    const response = makeResponse(
      200,
      { "Content-Type": "text/plain" },
      "Some text response",
    );

    const hash = await extractTxHashFromResponse(response);
    expect(hash).toBeNull();
  });

  it("returns null when JSON body has no txHash field", async () => {
    const response = makeResponse(
      200,
      { "Content-Type": "application/json" },
      JSON.stringify({ success: true }),
    );

    const hash = await extractTxHashFromResponse(response);
    expect(hash).toBeNull();
  });

  it("returns null for invalid JSON body", async () => {
    const response = makeResponse(
      200,
      { "Content-Type": "application/json" },
      "not valid json{",
    );

    const hash = await extractTxHashFromResponse(response);
    expect(hash).toBeNull();
  });

  it("ignores header value that doesn't start with 0x", async () => {
    const response = makeResponse(
      200,
      { "X-PAYMENT-TX-HASH": "not-a-hash" },
      "{}",
    );

    const hash = await extractTxHashFromResponse(response);
    expect(hash).toBeNull();
  });
});
