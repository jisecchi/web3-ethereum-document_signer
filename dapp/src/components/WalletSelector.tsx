"use client";

import React from "react";
import { useMetaMask } from "@/contexts/MetaMaskContext";
import { shortenAddress } from "@/utils/ethers";
import { ChevronDown, Wallet, LogOut } from "lucide-react";

export default function WalletSelector() {
  const {
    account,
    isConnected,
    walletIndex,
    wallets,
    connect,
    disconnect,
    switchWallet,
    balance,
  } = useMetaMask();

  const [isOpen, setIsOpen] = React.useState(false);

  if (!isConnected) {
    return (
      <button
        onClick={() => connect(0)}
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        <Wallet size={16} />
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
      >
        <div className="h-2 w-2 rounded-full bg-green-500" />
        <span>Wallet {walletIndex}</span>
        <span className="text-zinc-500 dark:text-zinc-400">
          {account ? shortenAddress(account) : ""}
        </span>
        {balance && (
          <span className="text-xs text-zinc-400">
            {parseFloat(balance).toFixed(2)} ETH
          </span>
        )}
        <ChevronDown size={14} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 z-20 mt-2 w-80 rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
            <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
              <p className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                Anvil Wallets
              </p>
            </div>

            <div className="max-h-64 overflow-y-auto py-1">
              {wallets.map((w, i) => (
                <button
                  key={i}
                  onClick={() => {
                    switchWallet(i);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700 ${
                    i === walletIndex
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : ""
                  }`}
                >
                  <div
                    className={`h-2 w-2 rounded-full ${
                      i === walletIndex ? "bg-green-500" : "bg-zinc-300 dark:bg-zinc-600"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-zinc-800 dark:text-zinc-200">
                      Wallet {i}
                    </p>
                    <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                      {shortenAddress(w.address)}
                    </p>
                  </div>
                  {i === walletIndex && (
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      Active
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="border-t border-zinc-200 px-4 py-2 dark:border-zinc-700">
              <button
                onClick={() => {
                  disconnect();
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <LogOut size={14} />
                Disconnect
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
