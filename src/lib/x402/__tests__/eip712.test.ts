import { describe, it, expect, vi, beforeEach } from "vitest";
import { verifyTypedData, type Hex } from "viem";
import {
  buildTransferAuthorization,
  signTransferAuthorization,
  USDC_DOMAIN,
  TRANSFER_WITH_AUTHORIZATION_TYPES,
} from "../eip712";
import { TEST_PRIVATE_KEY, TEST_WALLET_ADDRESS } from "../../../test/helpers/crypto";

describe("buildTransferAuthorization", () => {
  const from = TEST_WALLET_ADDRESS;
  const to = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" as Hex;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-01T00:00:00Z"));
  });

  it("produces correct typed data structure", () => {
    const auth = buildTransferAuthorization(from, to, BigInt(50000));

    expect(auth.from).toBe(from);
    expect(auth.to).toBe(to);
    expect(auth.value).toBe(BigInt(50000));
    expect(auth.validAfter).toBe(BigInt(0));
    // validBefore should be now + 300 seconds
    const expectedValidBefore =
      BigInt(Math.floor(new Date("2025-06-01T00:00:00Z").getTime() / 1000)) +
      BigInt(300);
    expect(auth.validBefore).toBe(expectedValidBefore);
    // nonce should be a 66-char hex string (0x + 64 hex chars)
    expect(auth.nonce).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it("generates unique nonces on each call", () => {
    const auth1 = buildTransferAuthorization(from, to, BigInt(50000));
    const auth2 = buildTransferAuthorization(from, to, BigInt(50000));

    expect(auth1.nonce).not.toBe(auth2.nonce);
  });

  it("handles zero amount", () => {
    const auth = buildTransferAuthorization(from, to, BigInt(0));
    expect(auth.value).toBe(BigInt(0));
  });

  it("handles max uint256 amount", () => {
    const maxUint256 = BigInt(2) ** BigInt(256) - BigInt(1);
    const auth = buildTransferAuthorization(from, to, maxUint256);
    expect(auth.value).toBe(maxUint256);
  });
});

describe("signTransferAuthorization", () => {
  const from = TEST_WALLET_ADDRESS;
  const to = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" as Hex;

  it("produces a deterministic signature for fixed inputs", async () => {
    const authorization = {
      from,
      to,
      value: BigInt(50000),
      validAfter: BigInt(0),
      validBefore: BigInt(1748736300), // fixed timestamp
      nonce: "0x0000000000000000000000000000000000000000000000000000000000000001" as Hex,
    };

    const sig1 = await signTransferAuthorization(authorization, TEST_PRIVATE_KEY);
    const sig2 = await signTransferAuthorization(authorization, TEST_PRIVATE_KEY);

    expect(sig1).toBe(sig2);
    expect(sig1).toMatch(/^0x[0-9a-f]+$/);
  });

  it("signature can be recovered to the signer address", async () => {
    const authorization = {
      from,
      to,
      value: BigInt(100000),
      validAfter: BigInt(0),
      validBefore: BigInt(1748736300),
      nonce: "0x0000000000000000000000000000000000000000000000000000000000000002" as Hex,
    };

    const signature = await signTransferAuthorization(authorization, TEST_PRIVATE_KEY);

    const recovered = await verifyTypedData({
      address: TEST_WALLET_ADDRESS,
      domain: USDC_DOMAIN,
      types: TRANSFER_WITH_AUTHORIZATION_TYPES,
      primaryType: "TransferWithAuthorization",
      message: {
        from: authorization.from,
        to: authorization.to,
        value: authorization.value,
        validAfter: authorization.validAfter,
        validBefore: authorization.validBefore,
        nonce: authorization.nonce,
      },
      signature,
    });

    expect(recovered).toBe(true);
  });

  it("uses the Sepolia USDC domain", () => {
    // Tests run with CHAIN_ID=84532 (Base Sepolia)
    expect(USDC_DOMAIN.name).toBe("USD Coin");
    expect(USDC_DOMAIN.version).toBe("2");
    expect(USDC_DOMAIN.chainId).toBe(84532);
    expect(USDC_DOMAIN.verifyingContract).toBe(
      "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    );
  });
});
