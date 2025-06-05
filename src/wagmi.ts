import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import { http, createConfig, injected } from "wagmi";
import { base, mainnet, celo, monadTestnet } from "wagmi/chains";

export const config = createConfig({
  chains: [base, mainnet, celo, monadTestnet],
  connectors: [farcasterFrame(), injected()],
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(import.meta.env.VITE_RPC_URL),
    [celo.id]: http(import.meta.env.VITE_CELO_RPC_URL),
    [monadTestnet.id]: http(import.meta.env.VITE_MONAD_TESTNET_RPC_URL),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
