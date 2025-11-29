/**
 * Thirdweb type declarations
 * These declarations allow TypeScript to work with thirdweb SDK
 */

declare module 'thirdweb' {
  export function createThirdwebClient(config: { clientId: string; secretKey?: string }): any;
  export function getContract(config: { client: any; chain: any; address: string }): any;
  export function defineChain(config: { id: number; rpc: string }): any;
}

declare module 'thirdweb/chains' {
  export const sepolia: any;
  export const ethereum: any;
  export const polygon: any;
  export const base: any;
  export const arbitrum: any;
  export const optimism: any;
}

declare module 'thirdweb/wallets' {
  export function privateKeyToAccount(config: { client: any; privateKey: string }): any;
  export function smartWallet(config: any): any;
}

declare module 'thirdweb/extensions/erc20' {
  export function transfer(config: any): any;
  export function balanceOf(config: any): any;
}
