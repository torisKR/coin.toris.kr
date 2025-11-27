"use client";

import { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";

export function Providers({ children }: { children: React.ReactNode }) {
  // 환경 변수에서 네트워크 설정 가져오기 (기본값: devnet)
  const networkEnv = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;

  // 네트워크 결정
  const network = useMemo(() => {
    if (networkEnv === "mainnet-beta" || networkEnv === "mainnet") {
      return WalletAdapterNetwork.Mainnet;
    }
    return WalletAdapterNetwork.Devnet;
  }, [networkEnv]);

  // RPC 엔드포인트 설정
  const endpoint = useMemo(() => {
    // 커스텀 RPC URL이 있으면 사용, 없으면 기본 clusterApiUrl 사용
    if (rpcUrl) {
      return rpcUrl;
    }
    return clusterApiUrl(network);
  }, [network, rpcUrl]);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
