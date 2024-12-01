import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import type { AppProps } from 'next/app';
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig, Chain } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';

const nft1: Chain = {
  id: 57993,
  name: 'NFT-1',
  network: 'NFT-1',
  nativeCurrency: {
    decimals: 18,
    name: 'FAZ',
    symbol: 'FAZ',
  },
  rpcUrls: {
    default: { http: ['https://subnets.avax.network/formalmocc/testnet/rpc'] },
    public: { http: ['https://subnets.avax.network/formalmocc/testnet/rpc'] },
  },
  blockExplorers: {
    default: { name: 'NFT-1', url: 'https://subnets-test.avax.network/formalmocc' },
  },
  testnet: true,
};

const { chains, publicClient } = configureChains(
  [nft1],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'Betting DApp',
  projectId: 'cfcfff3713397dd7fc0883ae81502256',
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;