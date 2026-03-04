import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { mainnet, sepolia } from "@reown/appkit/networks";
import type { AppKitNetwork } from "@reown/appkit/networks";
import { frontendClientEnv } from "./env.client";

export const projectId = frontendClientEnv.reownProjectId;
export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [mainnet, sepolia];

export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  projectId,
  networks,
});

export const config = wagmiAdapter.wagmiConfig;
