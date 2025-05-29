import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import { http, createConfig, injected } from "wagmi";
import { base, mainnet } from "wagmi/chains";

export const config = createConfig({
  chains: [base, mainnet],
  connectors: [farcasterFrame(), injected()],
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(import.meta.env.VITE_RPC_URL),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
