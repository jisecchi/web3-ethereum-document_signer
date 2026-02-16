import { ethers } from "ethers";

/**
 * Calculate keccak256 hash from a file's ArrayBuffer
 */
export function hashFileBuffer(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return ethers.keccak256(bytes);
}

/**
 * Read a file and compute its keccak256 hash
 */
export async function hashFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  return hashFileBuffer(buffer);
}

/**
 * Compute keccak256 of a UTF-8 string
 */
export function hashString(value: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(value));
}

/**
 * Format a bytes32 hex for display
 */
export function formatBytes32(hash: string): string {
  if (hash.startsWith("0x")) return hash;
  return `0x${hash}`;
}
