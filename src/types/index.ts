/**
 * AgentDAO - Decentralized Autonomous Agent Economy Protocol
 * 
 * Core type definitions for the agent economy infrastructure
 */

import { z } from 'zod';

// ===========================================
// AGENT IDENTITY & REGISTRATION
// ===========================================

export const AgentCapabilitySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(1000),
  category: z.enum([
    'analysis',
    'trading',
    'research',
    'content',
    'coding',
    'security',
    'data',
    'automation',
    'communication',
    'custom'
  ]),
  inputSchema: z.record(z.any()).optional(),
  outputSchema: z.record(z.any()).optional(),
  pricePerCall: z.string(), // In wei, as string for precision
  averageLatency: z.number().optional(), // milliseconds
  successRate: z.number().min(0).max(100).optional(),
});

export type AgentCapability = z.infer<typeof AgentCapabilitySchema>;

export const AgentProfileSchema = z.object({
  // On-chain identity
  agentId: z.string().uuid(),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  registrationTx: z.string().optional(),
  
  // Metadata
  name: z.string().min(1).max(100),
  description: z.string().max(2000),
  avatar: z.string().url().optional(),
  website: z.string().url().optional(),
  
  // Capabilities
  capabilities: z.array(AgentCapabilitySchema),
  mcpEndpoint: z.string().url(),
  supportedProtocols: z.array(z.string()),
  
  // Reputation (on-chain verified)
  reputation: z.object({
    score: z.number().min(0).max(1000),
    totalTasks: z.number(),
    successfulTasks: z.number(),
    totalEarnings: z.string(), // In wei
    totalStake: z.string(), // In wei
    attestations: z.number(),
    lastUpdated: z.number(), // Unix timestamp
  }),
  
  // Status
  status: z.enum(['active', 'inactive', 'suspended', 'pending']),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type AgentProfile = z.infer<typeof AgentProfileSchema>;

// ===========================================
// TASK & COLLABORATION SYSTEM
// ===========================================

export const TaskSpecificationSchema = z.object({
  taskId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(5000),
  
  // Requirements
  requiredCapabilities: z.array(z.string()),
  inputData: z.record(z.any()),
  expectedOutput: z.record(z.any()).optional(),
  
  // Economics
  reward: z.string(), // In wei
  deadline: z.number(), // Unix timestamp
  escrowTx: z.string().optional(),
  
  // Collaboration settings
  maxAgents: z.number().min(1).max(100).default(1),
  collaborationType: z.enum(['single', 'parallel', 'sequential', 'consensus']),
  
  // Validation
  validationCriteria: z.object({
    type: z.enum(['automatic', 'human', 'consensus', 'oracle']),
    validators: z.array(z.string()).optional(),
    consensusThreshold: z.number().min(0).max(100).optional(),
  }),
  
  // Status tracking
  status: z.enum([
    'open',
    'assigned',
    'in_progress',
    'completed',
    'validated',
    'paid',
    'disputed',
    'cancelled'
  ]),
  
  // Participants
  creator: z.string(), // Wallet address
  assignedAgents: z.array(z.string()).default([]),
  
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type TaskSpecification = z.infer<typeof TaskSpecificationSchema>;

export const TaskSubmissionSchema = z.object({
  submissionId: z.string().uuid(),
  taskId: z.string().uuid(),
  agentId: z.string().uuid(),
  
  // Result
  output: z.record(z.any()),
  artifactHash: z.string(), // IPFS or on-chain hash
  
  // Proof of work
  computeProof: z.string().optional(), // ZK proof of computation
  timestamp: z.number(),
  
  // Validation
  validationStatus: z.enum(['pending', 'approved', 'rejected', 'disputed']),
  validatorAttestations: z.array(z.object({
    validator: z.string(),
    approved: z.boolean(),
    signature: z.string(),
    timestamp: z.number(),
  })).default([]),
  
  // Payment
  paymentTx: z.string().optional(),
  paymentAmount: z.string().optional(),
});

export type TaskSubmission = z.infer<typeof TaskSubmissionSchema>;

// ===========================================
// AGENT-TO-AGENT MESSAGING
// ===========================================

export const AgentMessageSchema = z.object({
  messageId: z.string().uuid(),
  
  // Routing
  from: z.string().uuid(), // Agent ID
  to: z.string().uuid(), // Agent ID
  
  // Content
  type: z.enum([
    'capability_query',
    'task_proposal',
    'task_acceptance',
    'task_rejection',
    'collaboration_request',
    'collaboration_response',
    'result_delivery',
    'payment_request',
    'payment_confirmation',
    'reputation_attestation',
    'custom'
  ]),
  payload: z.record(z.any()),
  
  // Signatures for verification
  signature: z.string(),
  
  // Timing
  timestamp: z.number(),
  expiresAt: z.number().optional(),
  
  // Status
  status: z.enum(['sent', 'delivered', 'read', 'responded', 'expired']),
});

export type AgentMessage = z.infer<typeof AgentMessageSchema>;

// ===========================================
// REPUTATION & ATTESTATION
// ===========================================

export const ReputationAttestationSchema = z.object({
  attestationId: z.string().uuid(),
  
  // Parties
  attestor: z.string(), // Agent ID or wallet
  subject: z.string(), // Agent ID being attested
  
  // Attestation details
  taskId: z.string().uuid().optional(),
  rating: z.number().min(1).max(5),
  category: z.enum([
    'task_quality',
    'communication',
    'timeliness',
    'collaboration',
    'technical_skill',
    'reliability'
  ]),
  comment: z.string().max(500).optional(),
  
  // On-chain proof
  transactionHash: z.string(),
  blockNumber: z.number(),
  timestamp: z.number(),
  
  // Signature
  signature: z.string(),
});

export type ReputationAttestation = z.infer<typeof ReputationAttestationSchema>;

// ===========================================
// GOVERNANCE & DAO
// ===========================================

export const ProposalSchema = z.object({
  proposalId: z.string().uuid(),
  
  // Proposer
  proposer: z.string(), // Agent ID or wallet
  
  // Proposal details
  title: z.string().min(1).max(200),
  description: z.string().max(10000),
  category: z.enum([
    'parameter_change',
    'agent_suspension',
    'reward_distribution',
    'protocol_upgrade',
    'capability_standard',
    'fee_adjustment',
    'custom'
  ]),
  
  // Actions to execute
  actions: z.array(z.object({
    target: z.string(), // Contract address
    calldata: z.string(),
    value: z.string(),
  })),
  
  // Voting
  votingStart: z.number(),
  votingEnd: z.number(),
  quorumRequired: z.number(), // Percentage
  currentVotes: z.object({
    for: z.string(),
    against: z.string(),
    abstain: z.string(),
  }),
  
  // Status
  status: z.enum([
    'pending',
    'active',
    'succeeded',
    'defeated',
    'executed',
    'cancelled'
  ]),
  
  executionTx: z.string().optional(),
  createdAt: z.number(),
});

export type Proposal = z.infer<typeof ProposalSchema>;

// ===========================================
// ESCROW & PAYMENTS
// ===========================================

export const EscrowSchema = z.object({
  escrowId: z.string().uuid(),
  
  // Task reference
  taskId: z.string().uuid(),
  
  // Parties
  depositor: z.string(), // Wallet address
  beneficiaries: z.array(z.object({
    address: z.string(),
    share: z.number(), // Percentage
  })),
  
  // Funds
  amount: z.string(), // In wei
  token: z.string(), // Token address (0x0 for native)
  
  // Conditions
  releaseConditions: z.array(z.object({
    type: z.enum(['validation', 'deadline', 'oracle', 'multisig']),
    parameters: z.record(z.any()),
    met: z.boolean(),
  })),
  
  // Status
  status: z.enum(['funded', 'released', 'refunded', 'disputed']),
  
  // Transactions
  depositTx: z.string(),
  releaseTx: z.string().optional(),
  
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Escrow = z.infer<typeof EscrowSchema>;

// ===========================================
// MCP TOOL DEFINITIONS
// ===========================================

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: z.ZodType<any>;
  handler: (input: any, context: MCPContext) => Promise<any>;
}

export interface MCPContext {
  agentId?: string;
  walletAddress?: string;
  sessionId: string;
  requestId: string;
  timestamp: number;
}

// ===========================================
// API RESPONSES
// ===========================================

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    requestId: string;
    timestamp: number;
    executionTime: number;
  };
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}
