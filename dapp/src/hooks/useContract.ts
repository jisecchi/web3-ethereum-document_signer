"use client";

import { useCallback } from "react";
import { ethers } from "ethers";
import { useMetaMask } from "@/contexts/MetaMaskContext";
import { DOCUMENT_REGISTRY_ABI } from "@/utils/contractABI";

const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export interface DocumentInfo {
  hash: string;
  timestamp: bigint;
  signer: string;
  signature: string;
}

export function useContract() {
  const { provider, getSigner } = useMetaMask();

  /** Get a read-only contract instance */
  const getReadContract = useCallback(() => {
    return new ethers.Contract(
      CONTRACT_ADDRESS,
      DOCUMENT_REGISTRY_ABI,
      provider
    );
  }, [provider]);

  /** Get a contract instance connected to the signer (for write ops) */
  const getWriteContract = useCallback(() => {
    const signer = getSigner();
    if (!signer) throw new Error("No wallet connected");
    return new ethers.Contract(CONTRACT_ADDRESS, DOCUMENT_REGISTRY_ABI, signer);
  }, [getSigner]);

  // ─── Write Functions ───────────────────────

  const storeDocumentHash = useCallback(
    async (
      hash: string,
      timestamp: number,
      signature: string,
      signer: string
    ): Promise<ethers.TransactionReceipt | null> => {
      console.log("📝 Storing document hash on blockchain...");
      const contract = getWriteContract();
      const tx = await contract.storeDocumentHash(
        hash,
        timestamp,
        signature,
        signer
      );
      console.log("⏳ Transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("✅ Document stored! Block:", receipt.blockNumber);
      return receipt;
    },
    [getWriteContract]
  );

  const verifyDocument = useCallback(
    async (
      hash: string,
      signer: string,
      signature: string
    ): Promise<boolean> => {
      console.log("🔍 Verifying document...");
      const contract = getWriteContract();
      const isValid = await contract.verifyDocument.staticCall(
        hash,
        signer,
        signature
      );
      console.log("🔍 Verification result:", isValid);
      return isValid;
    },
    [getWriteContract]
  );

  // ─── Read Functions ────────────────────────

  const getDocumentInfo = useCallback(
    async (hash: string): Promise<DocumentInfo> => {
      const contract = getReadContract();
      const doc = await contract.getDocumentInfo(hash);
      return {
        hash: doc.hash,
        timestamp: doc.timestamp,
        signer: doc.signer,
        signature: doc.signature,
      };
    },
    [getReadContract]
  );

  const isDocumentStored = useCallback(
    async (hash: string): Promise<boolean> => {
      const contract = getReadContract();
      return contract.isDocumentStored(hash);
    },
    [getReadContract]
  );

  const getDocumentSignature = useCallback(
    async (hash: string): Promise<string> => {
      const contract = getReadContract();
      return contract.getDocumentSignature(hash);
    },
    [getReadContract]
  );

  const getDocumentCount = useCallback(async (): Promise<number> => {
    const contract = getReadContract();
    const count = await contract.getDocumentCount();
    return Number(count);
  }, [getReadContract]);

  const getDocumentHashByIndex = useCallback(
    async (index: number): Promise<string> => {
      const contract = getReadContract();
      return contract.getDocumentHashByIndex(index);
    },
    [getReadContract]
  );

  const getAllDocuments = useCallback(async (): Promise<DocumentInfo[]> => {
    const count = await getDocumentCount();
    const documents: DocumentInfo[] = [];

    for (let i = 0; i < count; i++) {
      const hash = await getDocumentHashByIndex(i);
      const doc = await getDocumentInfo(hash);
      documents.push(doc);
    }

    return documents;
  }, [getDocumentCount, getDocumentHashByIndex, getDocumentInfo]);

  return {
    storeDocumentHash,
    verifyDocument,
    getDocumentInfo,
    isDocumentStored,
    getDocumentSignature,
    getDocumentCount,
    getDocumentHashByIndex,
    getAllDocuments,
  };
}
