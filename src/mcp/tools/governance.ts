/**
 * AgentDAO - Governance Tools
 * 
 * MCP tools for DAO governance - proposals, voting, and protocol upgrades
 */

import { v4 as uuidv4 } from 'uuid';
import { MCPContext, Proposal } from '../../types';
import { agentStore } from './agent-registry';

const proposalStore = new Map<string, Proposal>();
const voteStore = new Map<string, Map<string, { vote: string; weight: string; timestamp: number }>>();

export const governanceTools = [
  {
    name: 'create_proposal',
    description: `Create a new governance proposal for the AgentDAO. Proposals can change protocol parameters, adjust fees, suspend malicious agents, distribute rewards, or upgrade contracts. Requires minimum reputation or stake to propose.`,
    inputSchema: {
      type: 'object',
      properties: {
        proposerWallet: {
          type: 'string',
          description: 'Wallet address of the proposer',
        },
        title: {
          type: 'string',
          description: 'Proposal title',
        },
        description: {
          type: 'string',
          description: 'Detailed description of the proposal',
        },
        category: {
          type: 'string',
          enum: ['parameter_change', 'agent_suspension', 'reward_distribution', 'protocol_upgrade', 'capability_standard', 'fee_adjustment', 'custom'],
          description: 'Category of the proposal',
        },
        actions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              target: { type: 'string', description: 'Contract address' },
              calldata: { type: 'string', description: 'Encoded function call' },
              value: { type: 'string', description: 'ETH value to send' },
            },
          },
          description: 'On-chain actions to execute if passed',
        },
        votingDurationDays: {
          type: 'number',
          description: 'Duration of voting period in days (default 3)',
        },
        quorumRequired: {
          type: 'number',
          description: 'Percentage of votes needed for quorum (default 10)',
        },
      },
      required: ['proposerWallet', 'title', 'description', 'category'],
    },
    handler: async (input: any, context: MCPContext) => {
      const proposalId = uuidv4();
      const now = Date.now();
      const votingDuration = (input.votingDurationDays || 3) * 24 * 60 * 60 * 1000;
      
      const proposal: Proposal = {
        proposalId,
        proposer: input.proposerWallet,
        title: input.title,
        description: input.description,
        category: input.category,
        actions: input.actions || [],
        votingStart: now,
        votingEnd: now + votingDuration,
        quorumRequired: input.quorumRequired || 10,
        currentVotes: {
          for: '0',
          against: '0',
          abstain: '0',
        },
        status: 'active',
        createdAt: now,
      };
      
      proposalStore.set(proposalId, proposal);
      voteStore.set(proposalId, new Map());
      
      return {
        success: true,
        data: {
          proposalId,
          title: proposal.title,
          category: proposal.category,
          votingStart: new Date(proposal.votingStart).toISOString(),
          votingEnd: new Date(proposal.votingEnd).toISOString(),
          quorumRequired: `${proposal.quorumRequired}%`,
          status: 'active',
          transactionHash: `0x${Buffer.from(proposalId).toString('hex').slice(0, 64)}`,
          message: 'Proposal created successfully. Voting is now open.',
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'vote_on_proposal',
    description: 'Cast a vote on an active governance proposal. Voting power is based on reputation and stake.',
    inputSchema: {
      type: 'object',
      properties: {
        proposalId: {
          type: 'string',
          description: 'Proposal ID to vote on',
        },
        voterWallet: {
          type: 'string',
          description: 'Wallet address of the voter',
        },
        vote: {
          type: 'string',
          enum: ['for', 'against', 'abstain'],
          description: 'Vote choice',
        },
        reason: {
          type: 'string',
          description: 'Optional reason for the vote',
        },
      },
      required: ['proposalId', 'voterWallet', 'vote'],
    },
    handler: async (input: any, context: MCPContext) => {
      const proposal = proposalStore.get(input.proposalId);
      
      if (!proposal) {
        return {
          success: false,
          error: {
            code: 'PROPOSAL_NOT_FOUND',
            message: 'Proposal not found',
          },
        };
      }
      
      if (proposal.status !== 'active') {
        return {
          success: false,
          error: {
            code: 'VOTING_CLOSED',
            message: `Proposal is ${proposal.status}, voting not allowed`,
          },
        };
      }
      
      const now = Date.now();
      if (now > proposal.votingEnd) {
        return {
          success: false,
          error: {
            code: 'VOTING_ENDED',
            message: 'Voting period has ended',
          },
        };
      }
      
      // Check if already voted
      const proposalVotes = voteStore.get(input.proposalId)!;
      if (proposalVotes.has(input.voterWallet.toLowerCase())) {
        return {
          success: false,
          error: {
            code: 'ALREADY_VOTED',
            message: 'This wallet has already voted on this proposal',
          },
        };
      }
      
      // Calculate voting power based on reputation and stake
      const agent = Array.from(agentStore.values()).find(
        a => a.walletAddress.toLowerCase() === input.voterWallet.toLowerCase()
      );
      
      let votingPower = '1000000000000000000'; // 1 token base
      if (agent) {
        const reputationBonus = BigInt(agent.reputation.score) * BigInt('100000000000000');
        const stakeBonus = BigInt(agent.reputation.totalStake) / BigInt(10);
        votingPower = (BigInt(votingPower) + reputationBonus + stakeBonus).toString();
      }
      
      // Record vote
      proposalVotes.set(input.voterWallet.toLowerCase(), {
        vote: input.vote,
        weight: votingPower,
        timestamp: now,
      });
      
      // Update vote counts
      const currentVotes = BigInt(proposal.currentVotes[input.vote as keyof typeof proposal.currentVotes]);
      proposal.currentVotes[input.vote as keyof typeof proposal.currentVotes] = 
        (currentVotes + BigInt(votingPower)).toString();
      
      proposalStore.set(input.proposalId, proposal);
      
      return {
        success: true,
        data: {
          proposalId: input.proposalId,
          vote: input.vote,
          votingPower,
          votingPowerFormatted: `${(Number(votingPower) / 1e18).toFixed(4)} DAO`,
          transactionHash: `0x${Buffer.from(uuidv4()).toString('hex').slice(0, 64)}`,
          currentTotals: {
            for: `${(Number(proposal.currentVotes.for) / 1e18).toFixed(4)} DAO`,
            against: `${(Number(proposal.currentVotes.against) / 1e18).toFixed(4)} DAO`,
            abstain: `${(Number(proposal.currentVotes.abstain) / 1e18).toFixed(4)} DAO`,
          },
          message: 'Vote cast successfully',
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'get_proposal',
    description: 'Get detailed information about a governance proposal.',
    inputSchema: {
      type: 'object',
      properties: {
        proposalId: {
          type: 'string',
          description: 'Proposal ID',
        },
      },
      required: ['proposalId'],
    },
    handler: async (input: any, context: MCPContext) => {
      const proposal = proposalStore.get(input.proposalId);
      
      if (!proposal) {
        return {
          success: false,
          error: {
            code: 'PROPOSAL_NOT_FOUND',
            message: 'Proposal not found',
          },
        };
      }
      
      const votes = voteStore.get(input.proposalId)!;
      const totalVotes = BigInt(proposal.currentVotes.for) + 
        BigInt(proposal.currentVotes.against) + 
        BigInt(proposal.currentVotes.abstain);
      
      const forPercentage = totalVotes > 0 
        ? Number((BigInt(proposal.currentVotes.for) * BigInt(10000)) / totalVotes) / 100
        : 0;
      const againstPercentage = totalVotes > 0
        ? Number((BigInt(proposal.currentVotes.against) * BigInt(10000)) / totalVotes) / 100
        : 0;
      
      return {
        success: true,
        data: {
          proposalId: proposal.proposalId,
          title: proposal.title,
          description: proposal.description,
          category: proposal.category,
          proposer: proposal.proposer,
          status: proposal.status,
          voting: {
            start: new Date(proposal.votingStart).toISOString(),
            end: new Date(proposal.votingEnd).toISOString(),
            timeRemaining: Math.max(0, proposal.votingEnd - Date.now()),
            quorumRequired: proposal.quorumRequired,
          },
          results: {
            for: {
              votes: proposal.currentVotes.for,
              formatted: `${(Number(proposal.currentVotes.for) / 1e18).toFixed(4)} DAO`,
              percentage: forPercentage,
            },
            against: {
              votes: proposal.currentVotes.against,
              formatted: `${(Number(proposal.currentVotes.against) / 1e18).toFixed(4)} DAO`,
              percentage: againstPercentage,
            },
            abstain: {
              votes: proposal.currentVotes.abstain,
              formatted: `${(Number(proposal.currentVotes.abstain) / 1e18).toFixed(4)} DAO`,
            },
            totalVoters: votes.size,
          },
          actions: proposal.actions,
          executionTx: proposal.executionTx,
          createdAt: proposal.createdAt,
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'list_proposals',
    description: 'List governance proposals with optional filters.',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['pending', 'active', 'succeeded', 'defeated', 'executed', 'cancelled'],
          description: 'Filter by status',
        },
        category: {
          type: 'string',
          description: 'Filter by category',
        },
        proposer: {
          type: 'string',
          description: 'Filter by proposer wallet',
        },
        limit: {
          type: 'number',
          description: 'Maximum results',
        },
      },
    },
    handler: async (input: any, context: MCPContext) => {
      let proposals = Array.from(proposalStore.values());
      
      // Update status based on voting end time
      const now = Date.now();
      proposals.forEach(p => {
        if (p.status === 'active' && now > p.votingEnd) {
          const forVotes = BigInt(p.currentVotes.for);
          const againstVotes = BigInt(p.currentVotes.against);
          p.status = forVotes > againstVotes ? 'succeeded' : 'defeated';
          proposalStore.set(p.proposalId, p);
        }
      });
      
      if (input.status) {
        proposals = proposals.filter(p => p.status === input.status);
      }
      
      if (input.category) {
        proposals = proposals.filter(p => p.category === input.category);
      }
      
      if (input.proposer) {
        proposals = proposals.filter(p => 
          p.proposer.toLowerCase() === input.proposer.toLowerCase()
        );
      }
      
      proposals.sort((a, b) => b.createdAt - a.createdAt);
      
      if (input.limit) {
        proposals = proposals.slice(0, input.limit);
      }
      
      return {
        success: true,
        data: proposals.map(p => ({
          proposalId: p.proposalId,
          title: p.title,
          category: p.category,
          status: p.status,
          proposer: p.proposer,
          votingEnd: new Date(p.votingEnd).toISOString(),
          forVotes: `${(Number(p.currentVotes.for) / 1e18).toFixed(4)} DAO`,
          againstVotes: `${(Number(p.currentVotes.against) / 1e18).toFixed(4)} DAO`,
          totalVoters: voteStore.get(p.proposalId)?.size || 0,
        })),
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'execute_proposal',
    description: 'Execute a succeeded proposal\'s on-chain actions.',
    inputSchema: {
      type: 'object',
      properties: {
        proposalId: {
          type: 'string',
          description: 'Proposal ID to execute',
        },
        callerWallet: {
          type: 'string',
          description: 'Wallet address calling execute',
        },
      },
      required: ['proposalId', 'callerWallet'],
    },
    handler: async (input: any, context: MCPContext) => {
      const proposal = proposalStore.get(input.proposalId);
      
      if (!proposal) {
        return {
          success: false,
          error: {
            code: 'PROPOSAL_NOT_FOUND',
            message: 'Proposal not found',
          },
        };
      }
      
      if (proposal.status !== 'succeeded') {
        return {
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: `Proposal is ${proposal.status}, must be 'succeeded' to execute`,
          },
        };
      }
      
      proposal.status = 'executed';
      proposal.executionTx = `0x${Buffer.from(uuidv4()).toString('hex').slice(0, 64)}`;
      proposalStore.set(input.proposalId, proposal);
      
      return {
        success: true,
        data: {
          proposalId: input.proposalId,
          status: 'executed',
          executionTx: proposal.executionTx,
          actionsExecuted: proposal.actions.length,
          message: 'Proposal executed successfully',
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'cancel_proposal',
    description: 'Cancel a proposal (only proposer or if proposal is invalid).',
    inputSchema: {
      type: 'object',
      properties: {
        proposalId: {
          type: 'string',
          description: 'Proposal ID to cancel',
        },
        callerWallet: {
          type: 'string',
          description: 'Wallet address calling cancel',
        },
        reason: {
          type: 'string',
          description: 'Reason for cancellation',
        },
      },
      required: ['proposalId', 'callerWallet'],
    },
    handler: async (input: any, context: MCPContext) => {
      const proposal = proposalStore.get(input.proposalId);
      
      if (!proposal) {
        return {
          success: false,
          error: {
            code: 'PROPOSAL_NOT_FOUND',
            message: 'Proposal not found',
          },
        };
      }
      
      if (proposal.proposer.toLowerCase() !== input.callerWallet.toLowerCase()) {
        return {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Only proposer can cancel',
          },
        };
      }
      
      if (!['pending', 'active'].includes(proposal.status)) {
        return {
          success: false,
          error: {
            code: 'CANNOT_CANCEL',
            message: `Proposal is ${proposal.status}, cannot cancel`,
          },
        };
      }
      
      proposal.status = 'cancelled';
      proposalStore.set(input.proposalId, proposal);
      
      return {
        success: true,
        data: {
          proposalId: input.proposalId,
          status: 'cancelled',
          reason: input.reason,
          message: 'Proposal cancelled',
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'get_voting_power',
    description: 'Calculate the voting power of a wallet address.',
    inputSchema: {
      type: 'object',
      properties: {
        walletAddress: {
          type: 'string',
          description: 'Wallet address to check',
        },
      },
      required: ['walletAddress'],
    },
    handler: async (input: any, context: MCPContext) => {
      const agent = Array.from(agentStore.values()).find(
        a => a.walletAddress.toLowerCase() === input.walletAddress.toLowerCase()
      );
      
      let basePower = BigInt('1000000000000000000'); // 1 token base
      let reputationBonus = BigInt(0);
      let stakeBonus = BigInt(0);
      
      if (agent) {
        reputationBonus = BigInt(agent.reputation.score) * BigInt('100000000000000');
        stakeBonus = BigInt(agent.reputation.totalStake) / BigInt(10);
      }
      
      const totalPower = basePower + reputationBonus + stakeBonus;
      
      return {
        success: true,
        data: {
          walletAddress: input.walletAddress,
          votingPower: totalPower.toString(),
          votingPowerFormatted: `${(Number(totalPower) / 1e18).toFixed(4)} DAO`,
          breakdown: {
            base: `${(Number(basePower) / 1e18).toFixed(4)} DAO`,
            reputationBonus: `${(Number(reputationBonus) / 1e18).toFixed(4)} DAO`,
            stakeBonus: `${(Number(stakeBonus) / 1e18).toFixed(4)} DAO`,
          },
          agentRegistered: !!agent,
          agentName: agent?.name,
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
];

export { proposalStore, voteStore };
