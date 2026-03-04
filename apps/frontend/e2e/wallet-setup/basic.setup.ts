import { defineWalletSetup } from "@synthetixio/synpress";
import { MetaMask } from "@synthetixio/synpress/playwright";

const DEFAULT_WALLET_PASSWORD = "Tester@1234";
const DEFAULT_SEED_PHRASE = "test test test test test test test test test test test junk";

const walletPassword = process.env.E2E_WALLET_PASSWORD ?? DEFAULT_WALLET_PASSWORD;
const seedPhrase = process.env.E2E_WALLET_SEED ?? DEFAULT_SEED_PHRASE;

export default defineWalletSetup(walletPassword, async (context, walletPage) => {
  const metamask = new MetaMask(context, walletPage, walletPassword);
  await metamask.importWallet(seedPhrase);
});
