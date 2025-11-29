/**
 * AgentDAO - Smart Contract Interactions
 * 
 * Contract ABIs and interaction helpers
 */

import { ethers } from 'ethers';

// Agent Registry Contract ABI
export const AGENT_REGISTRY_ABI = [
  // Events
  'event AgentRegistered(bytes32 indexed agentId, address indexed owner, string name, string mcpEndpoint)',
  'event AgentUpdated(bytes32 indexed agentId, string name, string mcpEndpoint)',
  'event AgentDeactivated(bytes32 indexed agentId)',
  'event CapabilityAdded(bytes32 indexed agentId, bytes32 capabilityId, string name)',
  'event StakeDeposited(bytes32 indexed agentId, uint256 amount)',
  'event StakeWithdrawn(bytes32 indexed agentId, uint256 amount)',
  
  // View functions
  'function getAgent(bytes32 agentId) view returns (tuple(bytes32 agentId, address owner, string name, string description, string mcpEndpoint, uint256 stake, uint256 reputation, bool active, uint256 createdAt))',
  'function getAgentByOwner(address owner) view returns (bytes32[] agentIds)',
  'function getCapabilities(bytes32 agentId) view returns (tuple(bytes32 id, string name, string category, uint256 price)[])',
  'function isActiveAgent(bytes32 agentId) view returns (bool)',
  'function getAgentCount() view returns (uint256)',
  
  // Write functions
  'function registerAgent(string name, string description, string mcpEndpoint) returns (bytes32 agentId)',
  'function updateAgent(bytes32 agentId, string name, string description, string mcpEndpoint)',
  'function addCapability(bytes32 agentId, string name, string category, uint256 price) returns (bytes32 capabilityId)',
  'function removeCapability(bytes32 agentId, bytes32 capabilityId)',
  'function stake(bytes32 agentId) payable',
  'function unstake(bytes32 agentId, uint256 amount)',
  'function deactivateAgent(bytes32 agentId)',
];

// Reputation Contract ABI
export const REPUTATION_ABI = [
  // Events
  'event AttestationSubmitted(bytes32 indexed attestationId, bytes32 indexed subject, address indexed attestor, uint8 rating, string category)',
  'event ReputationUpdated(bytes32 indexed agentId, uint256 newScore)',
  
  // View functions
  'function getReputation(bytes32 agentId) view returns (uint256 score, uint256 totalTasks, uint256 successfulTasks, uint256 attestationCount)',
  'function getAttestation(bytes32 attestationId) view returns (tuple(bytes32 id, bytes32 subject, address attestor, uint8 rating, string category, string comment, uint256 timestamp))',
  'function getAttestationsFor(bytes32 agentId) view returns (bytes32[] attestationIds)',
  
  // Write functions
  'function submitAttestation(bytes32 subject, uint8 rating, string category, string comment) returns (bytes32 attestationId)',
  'function updateTaskCompletion(bytes32 agentId, bool success)',
];

// Escrow Contract ABI
export const ESCROW_ABI = [
  // Events
  'event EscrowCreated(bytes32 indexed escrowId, bytes32 indexed taskId, address indexed depositor, uint256 amount)',
  'event EscrowReleased(bytes32 indexed escrowId, address[] beneficiaries, uint256[] amounts)',
  'event EscrowRefunded(bytes32 indexed escrowId, address depositor, uint256 amount)',
  'event EscrowDisputed(bytes32 indexed escrowId, address disputedBy)',
  
  // View functions
  'function getEscrow(bytes32 escrowId) view returns (tuple(bytes32 id, bytes32 taskId, address depositor, uint256 amount, address token, uint8 status, uint256 createdAt))',
  'function getEscrowByTask(bytes32 taskId) view returns (bytes32 escrowId)',
  'function getBeneficiaries(bytes32 escrowId) view returns (address[] addresses, uint256[] shares)',
  
  // Write functions
  'function createEscrow(bytes32 taskId, address[] beneficiaries, uint256[] shares) payable returns (bytes32 escrowId)',
  'function release(bytes32 escrowId)',
  'function refund(bytes32 escrowId)',
  'function dispute(bytes32 escrowId, string reason)',
];

// Governance Contract ABI
export const GOVERNANCE_ABI = [
  // Events
  'event ProposalCreated(bytes32 indexed proposalId, address indexed proposer, string title)',
  'event VoteCast(bytes32 indexed proposalId, address indexed voter, uint8 vote, uint256 weight)',
  'event ProposalExecuted(bytes32 indexed proposalId)',
  'event ProposalCancelled(bytes32 indexed proposalId)',
  
  // View functions
  'function getProposal(bytes32 proposalId) view returns (tuple(bytes32 id, address proposer, string title, string description, uint256 forVotes, uint256 againstVotes, uint256 abstainVotes, uint8 status, uint256 votingStart, uint256 votingEnd))',
  'function getVotingPower(address account) view returns (uint256)',
  'function hasVoted(bytes32 proposalId, address account) view returns (bool)',
  'function getActiveProposals() view returns (bytes32[] proposalIds)',
  
  // Write functions
  'function createProposal(string title, string description, address[] targets, bytes[] calldatas, uint256[] values) returns (bytes32 proposalId)',
  'function vote(bytes32 proposalId, uint8 voteType)',
  'function execute(bytes32 proposalId)',
  'function cancel(bytes32 proposalId)',
];

/**
 * Contract interaction helper class
 */
export class ContractInteraction {
  private provider: ethers.JsonRpcProvider;
  private signer?: ethers.Wallet;
  
  constructor(rpcUrl: string, privateKey?: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    if (privateKey) {
      this.signer = new ethers.Wallet(privateKey, this.provider);
    }
  }
  
  /**
   * Get Agent Registry contract instance
   */
  getAgentRegistry(address: string): ethers.Contract {
    const contract = new ethers.Contract(
      address,
      AGENT_REGISTRY_ABI,
      this.signer || this.provider
    );
    return contract;
  }
  
  /**
   * Get Reputation contract instance
   */
  getReputation(address: string): ethers.Contract {
    return new ethers.Contract(
      address,
      REPUTATION_ABI,
      this.signer || this.provider
    );
  }
  
  /**
   * Get Escrow contract instance
   */
  getEscrow(address: string): ethers.Contract {
    return new ethers.Contract(
      address,
      ESCROW_ABI,
      this.signer || this.provider
    );
  }
  
  /**
   * Get Governance contract instance
   */
  getGovernance(address: string): ethers.Contract {
    return new ethers.Contract(
      address,
      GOVERNANCE_ABI,
      this.signer || this.provider
    );
  }
  
  /**
   * Generate agent ID from parameters
   */
  generateAgentId(owner: string, name: string, timestamp: number): string {
    return ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ['address', 'string', 'uint256'],
        [owner, name, timestamp]
      )
    );
  }
  
  /**
   * Generate task ID
   */
  generateTaskId(creator: string, title: string, timestamp: number): string {
    return ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ['address', 'string', 'uint256'],
        [creator, title, timestamp]
      )
    );
  }
  
  /**
   * Wait for transaction and get receipt
   */
  async waitForTransaction(txHash: string, confirmations: number = 1) {
    const receipt = await this.provider.waitForTransaction(txHash, confirmations);
    return receipt;
  }
  
  /**
   * Estimate gas for a transaction
   */
  async estimateGas(contract: ethers.Contract, method: string, args: any[]): Promise<bigint> {
    const gasEstimate = await contract[method].estimateGas(...args);
    return gasEstimate;
  }
}

// Export factory function
export function createContractInteraction(rpcUrl: string, privateKey?: string): ContractInteraction {
  return new ContractInteraction(rpcUrl, privateKey);
}
