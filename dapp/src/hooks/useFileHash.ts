"use client";

import { useState, useCallback } from "react";
import { hashFile } from "@/utils/hash";

export function useFileHash() {
  const [hash, setHash] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isHashing, setIsHashing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const computeHash = useCallback(async (file: File) => {
    setIsHashing(true);
    setError(null);
    try {
      console.log(`📄 Computing hash for: ${file.name}`);
      const fileHash = await hashFile(file);
      setHash(fileHash);
      setFileName(file.name);
      console.log(`🔑 Hash computed: ${fileHash}`);
      return fileHash;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to hash file";
      setError(message);
      console.error("❌ Hash error:", message);
      return null;
    } finally {
      setIsHashing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setHash(null);
    setFileName(null);
    setError(null);
  }, []);

  return {
    hash,
    fileName,
    isHashing,
    error,
    computeHash,
    reset,
  };
}
