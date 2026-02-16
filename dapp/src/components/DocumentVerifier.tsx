"use client";

import React, { useState, useRef } from "react";
import { useContract } from "@/hooks/useContract";
import { useMetaMask } from "@/contexts/MetaMaskContext";
import { hashFile } from "@/utils/hash";
import { shortenAddress } from "@/utils/ethers";
import {
  Search,
  Upload,
  CheckCircle2,
  XCircle,
  Loader2,
  FileText,
} from "lucide-react";

interface VerificationResult {
  isValid: boolean;
  documentFound: boolean;
  hash: string;
  storedSigner?: string;
  storedTimestamp?: string;
  queriedSigner: string;
}

export default function DocumentVerifier() {
  const { isDocumentStored, getDocumentInfo } = useContract();
  const { isConnected } = useMetaMask();

  const inputRef = useRef<HTMLInputElement>(null);
  const [signerAddress, setSignerAddress] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileHash, setFileHash] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);
    setError(null);

    try {
      const hash = await hashFile(file);
      setFileHash(hash);
      setFileName(file.name);
      console.log(`📄 File hash computed: ${hash}`);
    } catch {
      setError("Failed to compute file hash.");
    }
  };

  const handleVerify = async () => {
    if (!fileHash || !signerAddress) return;
    setError(null);
    setIsVerifying(true);

    try {
      // Check if document exists
      const exists = await isDocumentStored(fileHash);

      if (!exists) {
        setResult({
          isValid: false,
          documentFound: false,
          hash: fileHash,
          queriedSigner: signerAddress,
        });
        return;
      }

      // Get document info
      const doc = await getDocumentInfo(fileHash);
      const signerMatches =
        doc.signer.toLowerCase() === signerAddress.toLowerCase();

      setResult({
        isValid: signerMatches,
        documentFound: true,
        hash: fileHash,
        storedSigner: doc.signer,
        storedTimestamp: new Date(
          Number(doc.timestamp) * 1000
        ).toLocaleString(),
        queriedSigner: signerAddress,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Verification failed";
      setError(message);
      console.error("❌ Verification error:", message);
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
        ⚠️ Please connect a wallet to verify documents.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* File Input */}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          File to Verify
        </label>
        {!fileHash ? (
          <div
            onClick={() => inputRef.current?.click()}
            className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 transition-colors hover:border-blue-400 hover:bg-blue-50/50 dark:border-zinc-600 dark:bg-zinc-800/50 dark:hover:border-blue-500"
          >
            <Upload size={20} className="text-zinc-400" />
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Click to upload file for verification
            </span>
            <input
              ref={inputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/50">
            <FileText size={16} className="text-blue-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {fileName}
              </p>
              <p className="mt-0.5 break-all font-mono text-xs text-zinc-500 dark:text-zinc-400">
                {fileHash}
              </p>
            </div>
            <button
              onClick={() => {
                setFileHash(null);
                setFileName(null);
                setResult(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Change
            </button>
          </div>
        )}
      </div>

      {/* Signer Address */}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Signer Address
        </label>
        <input
          type="text"
          value={signerAddress}
          onChange={(e) => setSignerAddress(e.target.value)}
          placeholder="0x..."
          className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 font-mono text-sm text-zinc-800 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:placeholder-zinc-500"
        />
      </div>

      {/* Verify Button */}
      <button
        onClick={handleVerify}
        disabled={!fileHash || !signerAddress || isVerifying}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isVerifying ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Verifying...
          </>
        ) : (
          <>
            <Search size={16} />
            Verify Document
          </>
        )}
      </button>

      {/* Result */}
      {result && (
        <div
          className={`rounded-xl border p-4 ${
            result.isValid
              ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
              : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
          }`}
        >
          <div className="flex items-center gap-2">
            {result.isValid ? (
              <CheckCircle2
                size={20}
                className="text-green-600 dark:text-green-400"
              />
            ) : (
              <XCircle
                size={20}
                className="text-red-600 dark:text-red-400"
              />
            )}
            <p
              className={`text-sm font-semibold ${
                result.isValid
                  ? "text-green-800 dark:text-green-300"
                  : "text-red-800 dark:text-red-300"
              }`}
            >
              {result.isValid
                ? "✅ VALID — Document is authentic"
                : result.documentFound
                ? "❌ INVALID — Signer does not match"
                : "❌ NOT FOUND — Document not on blockchain"}
            </p>
          </div>

          <div className="mt-3 space-y-2 text-xs">
            <div>
              <span className="font-medium text-zinc-600 dark:text-zinc-400">
                Hash:{" "}
              </span>
              <span className="break-all font-mono text-zinc-700 dark:text-zinc-300">
                {result.hash}
              </span>
            </div>
            <div>
              <span className="font-medium text-zinc-600 dark:text-zinc-400">
                Queried Signer:{" "}
              </span>
              <span className="font-mono text-zinc-700 dark:text-zinc-300">
                {shortenAddress(result.queriedSigner)}
              </span>
            </div>
            {result.storedSigner && (
              <div>
                <span className="font-medium text-zinc-600 dark:text-zinc-400">
                  Stored Signer:{" "}
                </span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300">
                  {shortenAddress(result.storedSigner)}
                </span>
              </div>
            )}
            {result.storedTimestamp && (
              <div>
                <span className="font-medium text-zinc-600 dark:text-zinc-400">
                  Signed At:{" "}
                </span>
                <span className="text-zinc-700 dark:text-zinc-300">
                  {result.storedTimestamp}
                </span>
              </div>
            )}
          </div>
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
