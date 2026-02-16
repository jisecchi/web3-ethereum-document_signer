"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { ethers } from "ethers";
import { getProvider, getAnvilWallets, createWallet } from "@/utils/ethers";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface AnvilWallet {
  address: string;
  privateKey: string;
}

interface MetaMaskContextType {
  /** Currently selected account address (null if disconnected) */
  account: string | null;
  /** Whether a wallet is connected */
  isConnected: boolean;
  /** Index of the selected wallet (0-9) */
  walletIndex: number | null;
  /** All available Anvil wallets */
  wallets: AnvilWallet[];
  /** Connect to a specific Anvil wallet */
  connect: (walletIndex: number) => void;
  /** Disconnect wallet */
  disconnect: () => void;
  /** Switch to a different wallet */
  switchWallet: (walletIndex: number) => void;
  /** Sign a message with the current wallet */
  signMessage: (message: string | Uint8Array) => Promise<string>;
  /** Get an ethers Signer for the current wallet */
  getSigner: () => ethers.Wallet | null;
  /** JsonRpcProvider */
  provider: ethers.JsonRpcProvider;
  /** ETH balance of the current wallet */
  balance: string | null;
}

const MetaMaskContext = createContext<MetaMaskContextType | undefined>(
  undefined
);

// ──────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────

export function MetaMaskProvider({ children }: { children: React.ReactNode }) {
  const provider = useMemo(() => getProvider(), []);
  const wallets = useMemo(() => getAnvilWallets(), []);

  const [account, setAccount] = useState<string | null>(null);
  const [walletIndex, setWalletIndex] = useState<number | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  const isConnected = account !== null;

  // Fetch balance for an address
  const fetchBalance = useCallback(
    async (address: string) => {
      try {
        const bal = await provider.getBalance(address);
        setBalance(ethers.formatEther(bal));
      } catch {
        setBalance(null);
      }
    },
    [provider]
  );

  const connect = useCallback(
    (index: number) => {
      if (index < 0 || index >= wallets.length) return;
      const wallet = wallets[index];
      setAccount(wallet.address);
      setWalletIndex(index);
      fetchBalance(wallet.address);
      console.log(`🔗 Connected to Wallet ${index}: ${wallet.address}`);
    },
    [wallets, fetchBalance]
  );

  const disconnect = useCallback(() => {
    setAccount(null);
    setWalletIndex(null);
    setBalance(null);
    console.log("🔌 Wallet disconnected");
  }, []);

  const switchWallet = useCallback(
    (index: number) => {
      connect(index);
      console.log(`🔄 Switched to Wallet ${index}`);
    },
    [connect]
  );

  const signMessageFn = useCallback(
    async (message: string | Uint8Array): Promise<string> => {
      if (walletIndex === null) throw new Error("No wallet connected");
      const wallet = new ethers.Wallet(wallets[walletIndex].privateKey);
      const signature = await wallet.signMessage(message);
      console.log("✍️ Message signed:", signature);
      return signature;
    },
    [walletIndex, wallets]
  );

  const getSigner = useCallback((): ethers.Wallet | null => {
    if (walletIndex === null) return null;
    return createWallet(wallets[walletIndex].privateKey, provider);
  }, [walletIndex, wallets, provider]);

  const value: MetaMaskContextType = useMemo(
    () => ({
      account,
      isConnected,
      walletIndex,
      wallets,
      connect,
      disconnect,
      switchWallet,
      signMessage: signMessageFn,
      getSigner,
      provider,
      balance,
    }),
    [
      account,
      isConnected,
      walletIndex,
      wallets,
      connect,
      disconnect,
      switchWallet,
      signMessageFn,
      getSigner,
      provider,
      balance,
    ]
  );

  return (
    <MetaMaskContext.Provider value={value}>{children}</MetaMaskContext.Provider>
  );
}

// ──────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────

export function useMetaMask(): MetaMaskContextType {
  const context = useContext(MetaMaskContext);
  if (!context) {
    throw new Error("useMetaMask must be used within a MetaMaskProvider");
  }
  return context;
}
