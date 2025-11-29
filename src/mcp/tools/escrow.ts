/**
 * AgentDAO - Escrow Tools
 * 
 * MCP tools for managing trustless escrow payments between agents
 */

import { v4 as uuidv4 } from 'uuid';
import { MCPContext, Escrow } from '../../types';
import { agentStore } from './agent-registry';
import { taskStore } from './task-marketplace';

const escrowStore = new Map<string, Escrow>();

export const escrowTools = [
  {
    name: 'create_escrow',
    description: `Create a new escrow contract to hold funds for a task. Funds are locked until release conditions are met - validation, deadline, or multi-sig approval. This enables trustless payments between agents who don't know each other.`,
    inputSchema: {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description: 'Associated task ID',
        },
        depositorWallet: {
          type: 'string',
          description: 'Wallet address depositing funds',
        },
        amount: {
          type: 'string',
          description: 'Amount to escrow in wei',
        },
        token: {
          type: 'string',
          description: 'Token address (0x0 for native ETH)',
        },
        beneficiaries: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              address: { type: 'string' },
              share: { type: 'number' },
            },
          },
          description: 'List of beneficiaries and their reward shares (percentages)',
        },
        releaseConditions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['validation', 'deadline', 'oracle', 'multisig'] },
              parameters: { type: 'object' },
            },
          },
          description: 'Conditions that must be met to release funds',
        },
      },
      required: ['taskId', 'depositorWallet', 'amount', 'beneficiaries'],
    },
    handler: async (input: any, context: MCPContext) => {
      const escrowId = uuidv4();
      const now = Date.now();
      
      const escrow: Escrow = {
        escrowId,
        taskId: input.taskId,
        depositor: input.depositorWallet,
        beneficiaries: input.beneficiaries,
        amount: input.amount,
        token: input.token || '0x0000000000000000000000000000000000000000',
        releaseConditions: (input.releaseConditions || [{ type: 'validation', parameters: {} }])
          .map((c: any) => ({ ...c, met: false })),
        status: 'funded',
        depositTx: `0x${Buffer.from(escrowId).toString('hex').slice(0, 64)}`,
        createdAt: now,
        updatedAt: now,
      };
      
      escrowStore.set(escrowId, escrow);
      
      return {
        success: true,
        data: {
          escrowId,
          taskId: input.taskId,
          amount: input.amount,
          beneficiaries: input.beneficiaries.length,
          depositTx: escrow.depositTx,
          escrowAddress: `0x${Buffer.from(escrowId).toString('hex').slice(0, 40)}`,
          status: 'funded',
          message: 'Escrow created and funded successfully',
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'get_escrow_status',
    description: 'Get the current status and details of an escrow.',
    inputSchema: {
      type: 'object',
      properties: {
        escrowId: {
          type: 'string',
          description: 'Escrow ID to query',
        },
        taskId: {
          type: 'string',
          description: 'Task ID to find associated escrow',
        },
      },
    },
    handler: async (input: any, context: MCPContext) => {
      let escrow: Escrow | undefined;
      
      if (input.escrowId) {
        escrow = escrowStore.get(input.escrowId);
      } else if (input.taskId) {
        escrow = Array.from(escrowStore.values()).find(e => e.taskId === input.taskId);
      }
      
      if (!escrow) {
        return {
          success: false,
          error: {
            code: 'ESCROW_NOT_FOUND',
            message: 'Escrow not found',
          },
        };
      }
      
      const conditionsMet = escrow.releaseConditions.filter(c => c.met).length;
      const totalConditions = escrow.releaseConditions.length;
      
      return {
        success: true,
        data: {
          escrowId: escrow.escrowId,
          taskId: escrow.taskId,
          status: escrow.status,
          amount: escrow.amount,
          token: escrow.token,
          depositor: escrow.depositor,
          beneficiaries: escrow.beneficiaries,
          releaseProgress: {
            conditionsMet,
            totalConditions,
            percentage: totalConditions > 0 ? Math.round((conditionsMet / totalConditions) * 100) : 0,
          },
          conditions: escrow.releaseConditions,
          depositTx: escrow.depositTx,
          releaseTx: escrow.releaseTx,
          createdAt: escrow.createdAt,
          updatedAt: escrow.updatedAt,
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'update_release_condition',
    description: 'Update the status of a release condition (for validators/oracles).',
    inputSchema: {
      type: 'object',
      properties: {
        escrowId: {
          type: 'string',
          description: 'Escrow ID',
        },
        conditionIndex: {
          type: 'number',
          description: 'Index of the condition to update',
        },
        met: {
          type: 'boolean',
          description: 'Whether the condition is now met',
        },
        validatorWallet: {
          type: 'string',
          description: 'Wallet of the validator updating the condition',
        },
        proof: {
          type: 'string',
          description: 'Optional proof or signature',
        },
      },
      required: ['escrowId', 'conditionIndex', 'met', 'validatorWallet'],
    },
    handler: async (input: any, context: MCPContext) => {
      const escrow = escrowStore.get(input.escrowId);
      
      if (!escrow) {
        return {
          success: false,
          error: {
            code: 'ESCROW_NOT_FOUND',
            message: 'Escrow not found',
          },
        };
      }
      
      if (input.conditionIndex < 0 || input.conditionIndex >= escrow.releaseConditions.length) {
        return {
          success: false,
          error: {
            code: 'INVALID_CONDITION_INDEX',
            message: 'Condition index out of range',
          },
        };
      }
      
      escrow.releaseConditions[input.conditionIndex].met = input.met;
      escrow.updatedAt = Date.now();
      escrowStore.set(input.escrowId, escrow);
      
      // Check if all conditions are met
      const allMet = escrow.releaseConditions.every(c => c.met);
      
      return {
        success: true,
        data: {
          escrowId: input.escrowId,
          conditionIndex: input.conditionIndex,
          conditionMet: input.met,
          allConditionsMet: allMet,
          message: allMet 
            ? 'All conditions met! Funds can now be released.'
            : 'Condition updated. Waiting for remaining conditions.',
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'release_escrow',
    description: 'Release escrowed funds to beneficiaries when all conditions are met.',
    inputSchema: {
      type: 'object',
      properties: {
        escrowId: {
          type: 'string',
          description: 'Escrow ID to release',
        },
        callerWallet: {
          type: 'string',
          description: 'Wallet address calling release',
        },
      },
      required: ['escrowId', 'callerWallet'],
    },
    handler: async (input: any, context: MCPContext) => {
      const escrow = escrowStore.get(input.escrowId);
      
      if (!escrow) {
        return {
          success: false,
          error: {
            code: 'ESCROW_NOT_FOUND',
            message: 'Escrow not found',
          },
        };
      }
      
      if (escrow.status !== 'funded') {
        return {
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: `Escrow is ${escrow.status}, cannot release`,
          },
        };
      }
      
      const allMet = escrow.releaseConditions.every(c => c.met);
      if (!allMet) {
        return {
          success: false,
          error: {
            code: 'CONDITIONS_NOT_MET',
            message: 'Not all release conditions have been met',
          },
        };
      }
      
      // Calculate payments
      const totalAmount = BigInt(escrow.amount);
      const payments = escrow.beneficiaries.map(b => ({
        address: b.address,
        amount: (totalAmount * BigInt(b.share) / BigInt(100)).toString(),
      }));
      
      // Update escrow status
      escrow.status = 'released';
      escrow.releaseTx = `0x${Buffer.from(uuidv4()).toString('hex').slice(0, 64)}`;
      escrow.updatedAt = Date.now();
      escrowStore.set(input.escrowId, escrow);
      
      // Update agent earnings
      for (const payment of payments) {
        const agent = Array.from(agentStore.values()).find(
          a => a.walletAddress.toLowerCase() === payment.address.toLowerCase()
        );
        if (agent) {
          const currentEarnings = BigInt(agent.reputation.totalEarnings);
          agent.reputation.totalEarnings = (currentEarnings + BigInt(payment.amount)).toString();
          agent.reputation.successfulTasks += 1;
          agent.reputation.totalTasks += 1;
          agentStore.set(agent.agentId, agent);
        }
      }
      
      return {
        success: true,
        data: {
          escrowId: input.escrowId,
          status: 'released',
          releaseTx: escrow.releaseTx,
          payments,
          message: 'Escrow released successfully. Funds distributed to beneficiaries.',
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'refund_escrow',
    description: 'Refund escrowed funds to the depositor (only if task is cancelled or conditions cannot be met).',
    inputSchema: {
      type: 'object',
      properties: {
        escrowId: {
          type: 'string',
          description: 'Escrow ID to refund',
        },
        callerWallet: {
          type: 'string',
          description: 'Wallet address calling refund (must be depositor)',
        },
        reason: {
          type: 'string',
          description: 'Reason for refund',
        },
      },
      required: ['escrowId', 'callerWallet'],
    },
    handler: async (input: any, context: MCPContext) => {
      const escrow = escrowStore.get(input.escrowId);
      
      if (!escrow) {
        return {
          success: false,
          error: {
            code: 'ESCROW_NOT_FOUND',
            message: 'Escrow not found',
          },
        };
      }
      
      if (escrow.depositor.toLowerCase() !== input.callerWallet.toLowerCase()) {
        return {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Only depositor can request refund',
          },
        };
      }
      
      if (escrow.status !== 'funded') {
        return {
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: `Escrow is ${escrow.status}, cannot refund`,
          },
        };
      }
      
      // Check if task is cancelled or deadline passed
      const task = taskStore.get(escrow.taskId);
      const canRefund = task?.status === 'cancelled' || 
        (task?.deadline && Date.now() > task.deadline);
      
      if (!canRefund) {
        return {
          success: false,
          error: {
            code: 'REFUND_NOT_ALLOWED',
            message: 'Refund only allowed for cancelled tasks or after deadline',
          },
        };
      }
      
      escrow.status = 'refunded';
      escrow.releaseTx = `0x${Buffer.from(uuidv4()).toString('hex').slice(0, 64)}`;
      escrow.updatedAt = Date.now();
      escrowStore.set(input.escrowId, escrow);
      
      return {
        success: true,
        data: {
          escrowId: input.escrowId,
          status: 'refunded',
          refundTx: escrow.releaseTx,
          refundAmount: escrow.amount,
          refundTo: escrow.depositor,
          reason: input.reason,
          message: 'Escrow refunded successfully',
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'dispute_escrow',
    description: 'Raise a dispute on an escrow, triggering governance resolution.',
    inputSchema: {
      type: 'object',
      properties: {
        escrowId: {
          type: 'string',
          description: 'Escrow ID to dispute',
        },
        disputerWallet: {
          type: 'string',
          description: 'Wallet raising the dispute',
        },
        reason: {
          type: 'string',
          description: 'Reason for the dispute',
        },
        evidence: {
          type: 'array',
          items: { type: 'string' },
          description: 'IPFS hashes or URLs of evidence',
        },
      },
      required: ['escrowId', 'disputerWallet', 'reason'],
    },
    handler: async (input: any, context: MCPContext) => {
      const escrow = escrowStore.get(input.escrowId);
      
      if (!escrow) {
        return {
          success: false,
          error: {
            code: 'ESCROW_NOT_FOUND',
            message: 'Escrow not found',
          },
        };
      }
      
      // Verify disputer is involved in the escrow
      const isDepositor = escrow.depositor.toLowerCase() === input.disputerWallet.toLowerCase();
      const isBeneficiary = escrow.beneficiaries.some(
        b => b.address.toLowerCase() === input.disputerWallet.toLowerCase()
      );
      
      if (!isDepositor && !isBeneficiary) {
        return {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Only depositor or beneficiaries can raise disputes',
          },
        };
      }
      
      escrow.status = 'disputed';
      escrow.updatedAt = Date.now();
      escrowStore.set(input.escrowId, escrow);
      
      // Update task status
      const task = taskStore.get(escrow.taskId);
      if (task) {
        task.status = 'disputed';
        task.updatedAt = Date.now();
        taskStore.set(escrow.taskId, task);
      }
      
      return {
        success: true,
        data: {
          escrowId: input.escrowId,
          status: 'disputed',
          disputeId: uuidv4(),
          disputedBy: input.disputerWallet,
          reason: input.reason,
          evidence: input.evidence || [],
          message: 'Dispute raised. Governance resolution process initiated.',
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'list_escrows',
    description: 'List escrows with optional filters.',
    inputSchema: {
      type: 'object',
      properties: {
        walletAddress: {
          type: 'string',
          description: 'Filter by depositor or beneficiary wallet',
        },
        status: {
          type: 'string',
          enum: ['funded', 'released', 'refunded', 'disputed'],
          description: 'Filter by status',
        },
        limit: {
          type: 'number',
          description: 'Maximum results',
        },
      },
    },
    handler: async (input: any, context: MCPContext) => {
      let escrows = Array.from(escrowStore.values());
      
      if (input.walletAddress) {
        const wallet = input.walletAddress.toLowerCase();
        escrows = escrows.filter(e => 
          e.depositor.toLowerCase() === wallet ||
          e.beneficiaries.some(b => b.address.toLowerCase() === wallet)
        );
      }
      
      if (input.status) {
        escrows = escrows.filter(e => e.status === input.status);
      }
      
      escrows.sort((a, b) => b.createdAt - a.createdAt);
      
      if (input.limit) {
        escrows = escrows.slice(0, input.limit);
      }
      
      return {
        success: true,
        data: escrows.map(e => ({
          escrowId: e.escrowId,
          taskId: e.taskId,
          status: e.status,
          amount: e.amount,
          depositor: e.depositor,
          beneficiaryCount: e.beneficiaries.length,
          createdAt: e.createdAt,
        })),
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
];

export { escrowStore };
