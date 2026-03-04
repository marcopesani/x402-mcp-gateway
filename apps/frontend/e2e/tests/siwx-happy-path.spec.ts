import { testWithSynpress } from "@synthetixio/synpress";
import {
  MetaMask,
  metaMaskFixtures,
} from "@synthetixio/synpress/playwright";
import walletSetup from "../wallet-setup/basic.setup";

const test = testWithSynpress(metaMaskFixtures(walletSetup));
const { expect } = test;

test("SIWX signin redirects to API Keys", async ({
  context,
  page,
  metamaskPage,
  extensionId,
}) => {
  test.setTimeout(90_000);
  const metamask = new MetaMask(
    context,
    metamaskPage,
    walletSetup.walletPassword,
    extensionId,
  );

  await page.goto("/login");
  await page.getByTestId("walletconnect-signin-button").click();

  // AppKit modal opens: select MetaMask / injected wallet so MetaMask extension is used
  const modal = page.locator("w3m-modal, [role='dialog']").first();
  await modal.waitFor({ state: "visible", timeout: 15_000 });
  await page.getByRole("button", { name: /MetaMask|Injected|Browser Wallet/i }).first().click({ timeout: 10_000 });

  await metamask.connectToDapp();
  await metamask.confirmSignature();

  await page.waitForURL("**/settings/api-keys");
  await expect(page.getByRole("heading", { name: "API Keys" })).toBeVisible();
});
