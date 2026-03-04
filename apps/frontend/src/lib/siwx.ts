"use client";

import type { SiwxIntent } from "./types";
import { requestSiwxChallenge, verifySiwx } from "./auth-client";
import { getAccount, signMessage } from "wagmi/actions";
import { config } from "./wagmi";

export async function signInWithSiwx(intent: SiwxIntent): Promise<void> {
  const account = getAccount(config);
  if (!account.address || account.chainId === undefined) {
    throw new Error("Wallet not connected");
  }

  const challenge = await requestSiwxChallenge({
    address: account.address,
    chainId: account.chainId,
    intent,
  });

  // Backend already returns the prepared message string
  const message = challenge.message;
  const signature = await signMessage(config, { message });

  await verifySiwx({
    address: account.address,
    chainId: account.chainId,
    intent,
    message,
    signature,
  });
}
