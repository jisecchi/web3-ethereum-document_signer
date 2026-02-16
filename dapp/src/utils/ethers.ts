import { ethers } from "ethers";

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "http://localhost:8545";
const MNEMONIC =
  process.env.NEXT_PUBLIC_MNEMONIC ||
  "test test test test test test test test test test test junk";

/**
 * Create a JsonRpcProvider connected to Anvil
 */
export function getProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(RPC_URL);
}

/**
 * Derive Anvil wallets from mnemonic
 */
export function getAnvilWallets(): {
  address: string;
  privateKey: string;
}[] {
  return Array.from({ length: 10 }, (_, i) => {
    const path = `m/44'/60'/0'/0/${i}`;
    const wallet = ethers.HDNodeWallet.fromPhrase(MNEMONIC, undefined, path);
    return { address: wallet.address, privateKey: wallet.privateKey };
  });
}

/**
 * Create a Wallet instance connected to the provider
 */
export function createWallet(
  privateKey: string,
  provider?: ethers.JsonRpcProvider
): ethers.Wallet {
  const p = provider || getProvider();
  return new ethers.Wallet(privateKey, p);
}

/**
 * Sign a message using a wallet
 */
export async function signMessage(
  privateKey: string,
  message: string | Uint8Array
): Promise<string> {
  const wallet = new ethers.Wallet(privateKey);
  return wallet.signMessage(message);
}

/**
 * Verify a signed message
 */
export function verifyMessage(
  message: string | Uint8Array,
  signature: string
): string {
  return ethers.verifyMessage(message, signature);
}

/**
 * Shorten an address for display
 */
export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Shorten a hash/signature for display
 */
export function shortenHash(hash: string, chars = 8): string {
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}
