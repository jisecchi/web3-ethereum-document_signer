"use client";

import { useState } from "react";
import WalletSelector from "@/components/WalletSelector";
import FileUploader from "@/components/FileUploader";
import DocumentSigner from "@/components/DocumentSigner";
import DocumentVerifier from "@/components/DocumentVerifier";
import DocumentHistory from "@/components/DocumentHistory";
import { useFileHash } from "@/hooks/useFileHash";
import { Upload, Search, History } from "lucide-react";

const tabs = [
  { id: "upload", label: "Upload & Sign", icon: Upload },
  { id: "verify", label: "Verify", icon: Search },
  { id: "history", label: "History", icon: History },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("upload");
  const { hash, fileName, isHashing, computeHash, reset } = useFileHash();

  const handleHashComputed = (computedHash: string, name: string) => {
    console.log(`📄 Hash computed for ${name}: ${computedHash}`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              📄 ETH Document Signer
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Decentralized document verification on Ethereum
            </p>
          </div>
          <WalletSelector />
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-6">
        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          {activeTab === "upload" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                  Upload & Sign Document
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Upload a file to compute its hash, sign it, and store it on the
                  blockchain.
                </p>
              </div>

              <FileUploader
                onHashComputed={handleHashComputed}
                hash={hash}
                fileName={fileName}
                isHashing={isHashing}
                computeHash={computeHash}
                reset={reset}
              />

              <DocumentSigner hash={hash} fileName={fileName} />
            </div>
          )}

          {activeTab === "verify" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                  Verify Document
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Upload a file and provide the signer address to verify its
                  authenticity on the blockchain.
                </p>
              </div>

              <DocumentVerifier />
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                  Document History
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Browse all documents stored on the blockchain.
                </p>
              </div>

              <DocumentHistory />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-4xl px-4 py-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
          ETH Document Signer — Anvil Local Development · Chain ID 31337
        </div>
      </footer>
    </div>
  );
}
