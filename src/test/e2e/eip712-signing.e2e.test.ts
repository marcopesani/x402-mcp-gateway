import { describe, it, expect } from "vitest";
import type { Hex } from "viem";
import { verifyTypedData } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  TEST_PRIVATE_KEY,
  TEST_WALLET_ADDRESS,
} from "@/test/helpers/crypto";
import { chainConfig } from "@/lib/chain-config";
import {
  buildTransferAuthorization,
  signTransferAuthorization,
  USDC_DOMAIN,
  TRANSFER_WITH_AUTHORIZATION_TYPES,
} from "@/lib/x402/eip712";
import {
  buildPaymentSignatureHeader,
} from "@/lib/x402/headers";

describe("E2E: EIP-712 Signing", () => {
  const RECIPIENT = ("0x" + "b".repeat(40)) as Hex;

  describe("TransferWithAuthorization signing and verification", () => {
    it("should sign and verify a TransferWithAuthorization message", async () => {
      const authorization = buildTransferAuthorization(
        TEST_WALLET_ADDRESS,
        RECIPIENT,
        BigInt(50000), // 0.05 USDC
      );

      const signature = await signTransferAuthorization(
        authorization,
        TEST_PRIVATE_KEY,
      );

      // Verify the signature recovers to the test wallet address
      const isValid = await verifyTypedData({
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

      expect(isValid).toBe(true);
    });

    it("should use the correct Sepolia USDC domain", () => {
      expect(USDC_DOMAIN.name).toBe("USD Coin");
      expect(USDC_DOMAIN.version).toBe("2");
      expect(USDC_DOMAIN.chainId).toBe(84532);
      expect(USDC_DOMAIN.verifyingContract).toBe(
        "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      );
    });

    it("should produce a valid signature for different amounts", async () => {
      const amounts = [
        BigInt(1), // 0.000001 USDC
        BigInt(100000), // 0.1 USDC
        BigInt(1000000), // 1.0 USDC
        BigInt(5000000), // 5.0 USDC
      ];

      for (const amount of amounts) {
        const authorization = buildTransferAuthorization(
          TEST_WALLET_ADDRESS,
          RECIPIENT,
          amount,
        );

        const signature = await signTransferAuthorization(
          authorization,
          TEST_PRIVATE_KEY,
        );

        const isValid = await verifyTypedData({
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

        expect(isValid).toBe(true);
      }
    });

    it("should produce a valid signature for different recipients", async () => {
      const recipients: Hex[] = [
        ("0x" + "a".repeat(40)) as Hex,
        ("0x" + "c".repeat(40)) as Hex,
        "0x1234567890abcdef1234567890abcdef12345678" as Hex,
      ];

      for (const to of recipients) {
        const authorization = buildTransferAuthorization(
          TEST_WALLET_ADDRESS,
          to,
          BigInt(50000),
        );

        const signature = await signTransferAuthorization(
          authorization,
          TEST_PRIVATE_KEY,
        );

        const isValid = await verifyTypedData({
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

        expect(isValid).toBe(true);
      }
    });

    it("should fail verification with a different signer address", async () => {
      const authorization = buildTransferAuthorization(
        TEST_WALLET_ADDRESS,
        RECIPIENT,
        BigInt(50000),
      );

      const signature = await signTransferAuthorization(
        authorization,
        TEST_PRIVATE_KEY,
      );

      // Verify with a WRONG address should fail
      const wrongAddress = ("0x" + "d".repeat(40)) as Hex;
      const isValid = await verifyTypedData({
        address: wrongAddress,
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

      expect(isValid).toBe(false);
    });
  });

  describe("Authorization field validation", () => {
    it("should set from address to the hot wallet address", () => {
      const authorization = buildTransferAuthorization(
        TEST_WALLET_ADDRESS,
        RECIPIENT,
        BigInt(50000),
      );

      expect(authorization.from).toBe(TEST_WALLET_ADDRESS);
    });

    it("should set validAfter to 0 (immediately valid)", () => {
      const authorization = buildTransferAuthorization(
        TEST_WALLET_ADDRESS,
        RECIPIENT,
        BigInt(50000),
      );

      expect(authorization.validAfter).toBe(BigInt(0));
    });

    it("should set validBefore to ~5 minutes in the future", () => {
      const beforeBuild = BigInt(Math.floor(Date.now() / 1000));
      const authorization = buildTransferAuthorization(
        TEST_WALLET_ADDRESS,
        RECIPIENT,
        BigInt(50000),
      );
      const afterBuild = BigInt(Math.floor(Date.now() / 1000));

      // validBefore should be between now+299 and now+301
      expect(authorization.validBefore).toBeGreaterThanOrEqual(
        beforeBuild + BigInt(299),
      );
      expect(authorization.validBefore).toBeLessThanOrEqual(
        afterBuild + BigInt(301),
      );
    });

    it("should generate unique nonces for each authorization", () => {
      const auth1 = buildTransferAuthorization(
        TEST_WALLET_ADDRESS,
        RECIPIENT,
        BigInt(50000),
      );
      const auth2 = buildTransferAuthorization(
        TEST_WALLET_ADDRESS,
        RECIPIENT,
        BigInt(50000),
      );

      expect(auth1.nonce).not.toBe(auth2.nonce);
      // Nonces should be valid 32-byte hex values
      expect(auth1.nonce.startsWith("0x")).toBe(true);
      expect(auth1.nonce.length).toBe(66); // 0x + 64 hex chars
    });
  });

  describe("Payment signature header encoding", () => {
    it("should produce a valid base64-encoded payment header", async () => {
      const authorization = buildTransferAuthorization(
        TEST_WALLET_ADDRESS,
        RECIPIENT,
        BigInt(50000),
      );

      const signature = await signTransferAuthorization(
        authorization,
        TEST_PRIVATE_KEY,
      );

      const header = buildPaymentSignatureHeader(signature, authorization);

      // Should be valid base64
      expect(typeof header).toBe("string");
      const decoded = JSON.parse(atob(header));

      expect(decoded.x402Version).toBe(1);
      expect(decoded.scheme).toBe("exact");
      expect(decoded.network).toBe("eip155:84532");
      expect(decoded.payload.signature).toBe(signature);
      expect(decoded.payload.authorization.from).toBe(TEST_WALLET_ADDRESS);
      expect(decoded.payload.authorization.to).toBe(RECIPIENT);
      // BigInt serialized as string
      expect(decoded.payload.authorization.value).toBe("50000");
    });

    it("should include the correct network string for Sepolia", async () => {
      const authorization = buildTransferAuthorization(
        TEST_WALLET_ADDRESS,
        RECIPIENT,
        BigInt(1000000),
      );

      const signature = await signTransferAuthorization(
        authorization,
        TEST_PRIVATE_KEY,
      );

      const header = buildPaymentSignatureHeader(signature, authorization);
      const decoded = JSON.parse(atob(header));

      expect(decoded.network).toBe(chainConfig.networkString);
      expect(decoded.network).toBe("eip155:84532");
    });
  });
});
