"use client";

import React, { useState } from "react";
import { useMetaMask } from "@/contexts/MetaMaskContext";
import { useContract } from "@/hooks/useContract";
import { shortenHash } from "@/utils/ethers";
import { PenLine, Save, Loader2, CheckCircle2 } from "lucide-react";

interface DocumentSignerProps {
  hash: string | null;
  fileName: string | null;
}

export default function DocumentSigner({ hash, fileName }: DocumentSignerProps) {
  const { account, isConnected, signMessage } = useMetaMask();
  const { storeDocumentHash } = useContract();

  const [signature, setSignature] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [isStoring, setIsStoring] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSign = async () => {
    if (!hash || !isConnected) return;
    setError(null);

    // Alert de confirmación
    const confirmSign = window.confirm(
      `🔏 Sign Document\n\nYou are about to sign:\n\nFile: ${fileName}\nHash: ${hash}\nWallet: ${account}\n\nDo you want to proceed?`
    );
    if (!confirmSign) return;

    setIsSigning(true);
    try {
      // Sign the hash (as raw bytes32 message)
      const sig = await signMessage(hash);
      setSignature(sig);
      console.log("✍️ Document signed successfully");
      window.alert(
        `✅ Document Signed!\n\nSignature:\n${sig}`
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to sign document";
      setError(message);
      console.error("❌ Signing error:", message);
    } finally {
      setIsSigning(false);
    }
  };

  const handleStore = async () => {
    if (!hash || !signature || !account) return;
    setError(null);

    // Alert de confirmación
    const confirmStore = window.confirm(
      `📦 Store on Blockchain\n\nDetails:\n\nFile: ${fileName}\nHash: ${shortenHash(hash)}\nSigner: ${account}\nSignature: ${shortenHash(signature)}\n\nThis will send a transaction. Continue?`
    );
    if (!confirmStore) return;

    setIsStoring(true);
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const receipt = await storeDocumentHash(
        hash,
        timestamp,
        signature,
        account
      );
      if (receipt) {
        setTxHash(receipt.hash);
        console.log("✅ Document stored on blockchain");
        window.alert(
          `✅ Stored on Blockchain!\n\nTransaction Hash:\n${receipt.hash}\nBlock: ${receipt.blockNumber}`
        );
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to store document";
      setError(message);
      console.error("❌ Store error:", message);
    } finally {
      setIsStoring(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
        ⚠️ Please connect a wallet to sign documents.
      </div>
    );
  }

  if (!hash) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400">
        Upload a file first to sign it.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sign Button */}
      {!signature && (
        <button
          onClick={handleSign}
          disabled={isSigning}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSigning ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Signing...
            </>
          ) : (
            <>
              <PenLine size={16} />
              Sign Document
            </>
          )}
        </button>
      )}

      {/* Signature Display */}
      {signature && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <p className="mb-1 text-xs font-medium uppercase text-blue-600 dark:text-blue-400">
            Signature
          </p>
          <p className="break-all font-mono text-xs text-blue-800 dark:text-blue-300">
            {signature}
          </p>
        </div>
      )}

      {/* Store Button */}
      {signature && !txHash && (
        <button
          onClick={handleStore}
          disabled={isStoring}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isStoring ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Storing...
            </>
          ) : (
            <>
              <Save size={16} />
              Store on Blockchain
            </>
          )}
        </button>
      )}

      {/* Transaction Hash */}
      {txHash && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <div className="flex items-center gap-2">
            <CheckCircle2
              size={16}
              className="text-green-600 dark:text-green-400"
            />
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              Stored on Blockchain
            </p>
          </div>
          <p className="mt-2 break-all font-mono text-xs text-green-700 dark:text-green-400">
            TX: {txHash}
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          ❌ {error}
        </div>
      )}
    </div>
  );
}
