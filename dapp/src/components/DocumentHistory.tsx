"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useContract, DocumentInfo } from "@/hooks/useContract";
import { useMetaMask } from "@/contexts/MetaMaskContext";
import { shortenAddress, shortenHash } from "@/utils/ethers";
import { RefreshCw, FileText, Loader2 } from "lucide-react";

export default function DocumentHistory() {
  const { getAllDocuments, getDocumentCount } = useContract();
  const { isConnected } = useMetaMask();

  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const count = await getDocumentCount();
      setTotalCount(count);

      if (count > 0) {
        const docs = await getAllDocuments();
        setDocuments(docs);
        console.log(`📋 Loaded ${docs.length} documents`);
      } else {
        setDocuments([]);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch documents";
      setError(message);
      console.error("❌ Fetch error:", message);
    } finally {
      setLoading(false);
    }
  }, [getAllDocuments, getDocumentCount]);

  useEffect(() => {
    if (isConnected) {
      fetchDocuments();
    }
  }, [isConnected]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isConnected) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
        ⚠️ Please connect a wallet to view document history.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Stored Documents
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {totalCount} document{totalCount !== 1 ? "s" : ""} on blockchain
          </p>
        </div>
        <button
          onClick={fetchDocuments}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-700"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2
            size={24}
            className="animate-spin text-zinc-400 dark:text-zinc-500"
          />
        </div>
      )}

      {/* Empty State */}
      {!loading && documents.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 py-10 dark:border-zinc-700 dark:bg-zinc-800/50">
          <FileText size={32} className="text-zinc-300 dark:text-zinc-600" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No documents stored yet.
          </p>
        </div>
      )}

      {/* Document List */}
      {!loading && documents.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-100 dark:bg-zinc-800">
              <tr>
                <th className="px-4 py-3 text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                  #
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                  Document Hash
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                  Signer
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                  Timestamp
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                  Signature
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {documents.map((doc, i) => (
                <tr
                  key={doc.hash}
                  className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {i + 1}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="font-mono text-xs text-zinc-700 dark:text-zinc-300"
                      title={doc.hash}
                    >
                      {shortenHash(doc.hash)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="font-mono text-xs text-zinc-700 dark:text-zinc-300"
                      title={doc.signer}
                    >
                      {shortenAddress(doc.signer)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400">
                    {new Date(
                      Number(doc.timestamp) * 1000
                    ).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="font-mono text-xs text-zinc-500 dark:text-zinc-400"
                      title={doc.signature}
                    >
                      {shortenHash(doc.signature, 6)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
