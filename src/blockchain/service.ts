/**
 * AgentDAO - Blockchain Service
 * 
 * Thirdweb + Ethers.js integration for on-chain operations
 * Supports Sepolia testnet and other EVM chains
 * 
 * Thirdweb provides:
 * - Easy wallet connection & management
 * - Gasless transactions (sponsored)
 * - Contract deployment & interaction
 * - Cross-chain support
 */

import { ethers } from 'ethers';

// Thirdweb SDK - using dynamic import to avoid type issues
let thirdwebClient: any = null;
let thirdwebContract: any = null;

export interface BlockchainConfig {
  clientId?: string;  // Thirdweb client ID
  secretKey?: string; // Thirdweb secret key (for server-side)
  chainId: number;
  rpcUrl?: string;
  contracts: {
    agentRegistry?: string;
    reputation?: string;
    escrow?: string;
    governance?: string;
  };
}

export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  explorer: string;
  thirdwebChain: string; // Thirdweb chain identifier
}

// Supported chains with Thirdweb integration
export const SUPPORTED_CHAINS: Record<string, ChainConfig> = {
  sepolia: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: 'https://rpc.sepolia.org',
    explorer: 'https://sepolia.etherscan.io',
    thirdwebChain: 'sepolia',
  },
  mainnet: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://eth.llamarpc.com',
    explorer: 'https://etherscan.io',
    thirdwebChain: 'ethereum',
  },
  polygon: {
    chainId: 137,
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com',
    explorer: 'https://polygonscan.com',
    thirdwebChain: 'polygon',
  },
  base: {
    chainId: 8453,
    name: 'Base Mainnet',
    rpcUrl: 'https://mainnet.base.org',
    explorer: 'https://basescan.org',
    thirdwebChain: 'base',
  },
};

export class BlockchainService {
  private provider: ethers.JsonRpcProvider | null = null;
  private config: BlockchainConfig;
  private chainConfig: ChainConfig;
  private thirdwebInitialized: boolean = false;
  
  constructor(config: BlockchainConfig) {
    this.config = config;
    this.chainConfig = SUPPORTED_CHAINS.sepolia; // Default to Sepolia
  }
  
  /**
   * Initialize the blockchain service with Thirdweb + Ethers
   */
  async initialize(): Promise<void> {
    // Initialize ethers provider
    const rpcUrl = this.config.rpcUrl || this.chainConfig.rpcUrl;
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Initialize Thirdweb SDK (dynamic import)
    if (this.config.clientId) {
      try {
        const thirdweb = await import('thirdweb');
        thirdwebClient = thirdweb.createThirdwebClient({
          clientId: this.config.clientId,
        });
        thirdwebContract = thirdweb.getContract;
        this.thirdwebInitialized = true;
        console.log('✓ Thirdweb SDK initialized');
      } catch (err) {
        console.warn('Thirdweb initialization skipped (using ethers fallback)');
      }
    }
    
    console.log(`BlockchainService initialized on ${this.chainConfig.name}`);
  }
  
  /**
   * Check if Thirdweb is available
   */
  isThirdwebEnabled(): boolean {
    return this.thirdwebInitialized && thirdwebClient !== null;
  }
  
  /**
   * Get Thirdweb client (for advanced operations)
   */
  getThirdwebClient(): any {
    return thirdwebClient;
  }
  
  /**
   * Get ethers provider
   */
  getProvider() {
    return this.provider;
  }
  
  /**
   * Get chain configuration
   */
  getChainConfig(): ChainConfig {
    return this.chainConfig;
  }
  
  /**
   * Get a Thirdweb contract instance
   */
  async getThirdwebContract(address: string): Promise<any> {
    if (!this.thirdwebInitialized || !thirdwebClient) {
      throw new Error('Thirdweb not initialized - set clientId in config');
    }
    
    const { sepolia } = await import('thirdweb/chains');
    return thirdwebContract({
      client: thirdwebClient,
      chain: sepolia,
      address,
    });
  }
  
  /**
   * Get an ethers contract instance
   */
  getContract(address: string, abi: ethers.InterfaceAbi): ethers.Contract {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    
    return new ethers.Contract(address, abi, this.provider);
  }
  
  /**
   * Get current block number
   */
  async getBlockNumber(): Promise<number> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    return this.provider.getBlockNumber();
  }
  
  /**
   * Get wallet balance
   */
  async getBalance(address: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }
  
  /**
   * Verify a signature
   */
  verifySignature(message: string, signature: string, expectedSigner: string): boolean {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === expectedSigner.toLowerCase();
    } catch {
      return false;
    }
  }
  
  /**
   * Create a hash for data storage
   */
  hashData(data: any): string {
    const json = JSON.stringify(data);
    return ethers.keccak256(ethers.toUtf8Bytes(json));
  }
  
  /**
   * Encode function call data
   */
  encodeFunctionData(abi: any[], functionName: string, args: any[]): string {
    const iface = new ethers.Interface(abi);
    return iface.encodeFunctionData(functionName, args);
  }
  
  /**
   * Decode function result
   */
  decodeFunctionResult(abi: any[], functionName: string, data: string): any {
    const iface = new ethers.Interface(abi);
    return iface.decodeFunctionResult(functionName, data);
  }
}

// Export singleton instance creator
export function createBlockchainService(config: BlockchainConfig): BlockchainService {
  return new BlockchainService(config);
}
