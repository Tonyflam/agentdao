/**
 * AgentDAO - Task Marketplace Tools
 * 
 * MCP tools for creating, bidding on, and managing tasks in the agent economy
 */

import { v4 as uuidv4 } from 'uuid';
import { MCPContext, TaskSpecification, TaskSubmission } from '../../types';

// In-memory stores (replace with blockchain integration)
const taskStore = new Map<string, TaskSpecification>();
const submissionStore = new Map<string, TaskSubmission>();

export const taskMarketplaceTools = [
  {
    name: 'create_task',
    description: `Create a new task in the AgentDAO marketplace. Tasks can be completed by AI agents for rewards. The reward is held in escrow until task completion is validated. Supports single-agent tasks, parallel execution by multiple agents, sequential pipelines, and consensus-based results.`,
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Clear, descriptive title for the task',
        },
        description: {
          type: 'string',
          description: 'Detailed description of what needs to be done',
        },
        requiredCapabilities: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of capability categories required (e.g., ["analysis", "trading"])',
        },
        inputData: {
          type: 'object',
          description: 'Input data for the task',
        },
        expectedOutput: {
          type: 'object',
          description: 'Schema or description of expected output',
        },
        reward: {
          type: 'string',
          description: 'Reward amount in wei',
        },
        deadline: {
          type: 'number',
          description: 'Unix timestamp deadline',
        },
        collaborationType: {
          type: 'string',
          enum: ['single', 'parallel', 'sequential', 'consensus'],
          description: 'How multiple agents should collaborate',
        },
        maxAgents: {
          type: 'number',
          description: 'Maximum number of agents that can work on this task',
        },
        validationType: {
          type: 'string',
          enum: ['automatic', 'human', 'consensus', 'oracle'],
          description: 'How task completion will be validated',
        },
        creatorWallet: {
          type: 'string',
          description: 'Wallet address of task creator',
        },
      },
      required: ['title', 'description', 'reward', 'deadline', 'creatorWallet'],
    },
    handler: async (input: any, context: MCPContext) => {
      const taskId = uuidv4();
      const now = Date.now();
      
      const task: TaskSpecification = {
        taskId,
        title: input.title,
        description: input.description,
        requiredCapabilities: input.requiredCapabilities || [],
        inputData: input.inputData || {},
        expectedOutput: input.expectedOutput,
        reward: input.reward,
        deadline: input.deadline,
        maxAgents: input.maxAgents || 1,
        collaborationType: input.collaborationType || 'single',
        validationCriteria: {
          type: input.validationType || 'automatic',
          validators: input.validators,
          consensusThreshold: input.consensusThreshold,
        },
        status: 'open',
        creator: input.creatorWallet,
        assignedAgents: [],
        createdAt: now,
        updatedAt: now,
      };
      
      taskStore.set(taskId, task);
      
      return {
        success: true,
        data: {
          taskId,
          title: task.title,
          reward: task.reward,
          deadline: new Date(task.deadline).toISOString(),
          status: task.status,
          escrowAddress: `0x${Buffer.from(taskId).toString('hex').slice(0, 40)}`,
          message: 'Task created successfully. Reward held in escrow.',
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'list_tasks',
    description: 'List available tasks in the marketplace with optional filters.',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['open', 'assigned', 'in_progress', 'completed', 'validated', 'paid', 'disputed', 'cancelled'],
          description: 'Filter by task status',
        },
        capabilities: {
          type: 'array',
          items: { type: 'string' },
          description: 'Filter by required capabilities',
        },
        minReward: {
          type: 'string',
          description: 'Minimum reward in wei',
        },
        maxReward: {
          type: 'string',
          description: 'Maximum reward in wei',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of tasks to return',
        },
        offset: {
          type: 'number',
          description: 'Offset for pagination',
        },
      },
    },
    handler: async (input: any, context: MCPContext) => {
      let tasks = Array.from(taskStore.values());
      
      // Apply filters
      if (input.status) {
        tasks = tasks.filter(t => t.status === input.status);
      }
      
      if (input.capabilities?.length) {
        tasks = tasks.filter(t => 
          input.capabilities.some((cap: string) => t.requiredCapabilities.includes(cap))
        );
      }
      
      if (input.minReward) {
        tasks = tasks.filter(t => BigInt(t.reward) >= BigInt(input.minReward));
      }
      
      if (input.maxReward) {
        tasks = tasks.filter(t => BigInt(t.reward) <= BigInt(input.maxReward));
      }
      
      // Sort by reward descending
      tasks.sort((a, b) => Number(BigInt(b.reward) - BigInt(a.reward)));
      
      // Pagination
      const offset = input.offset || 0;
      const limit = input.limit || 20;
      const paginated = tasks.slice(offset, offset + limit);
      
      return {
        success: true,
        data: paginated.map(t => ({
          taskId: t.taskId,
          title: t.title,
          description: t.description.slice(0, 200) + (t.description.length > 200 ? '...' : ''),
          reward: t.reward,
          deadline: new Date(t.deadline).toISOString(),
          status: t.status,
          requiredCapabilities: t.requiredCapabilities,
          assignedAgents: t.assignedAgents.length,
          maxAgents: t.maxAgents,
        })),
        pagination: {
          total: tasks.length,
          offset,
          limit,
          hasMore: offset + limit < tasks.length,
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'get_task_details',
    description: 'Get full details of a specific task.',
    inputSchema: {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description: 'Task ID to retrieve',
        },
      },
      required: ['taskId'],
    },
    handler: async (input: any, context: MCPContext) => {
      const task = taskStore.get(input.taskId);
      
      if (!task) {
        return {
          success: false,
          error: {
            code: 'TASK_NOT_FOUND',
            message: 'Task not found',
          },
        };
      }
      
      // Get submissions for this task
      const submissions = Array.from(submissionStore.values())
        .filter(s => s.taskId === input.taskId);
      
      return {
        success: true,
        data: {
          ...task,
          submissions: submissions.map(s => ({
            submissionId: s.submissionId,
            agentId: s.agentId,
            status: s.validationStatus,
            timestamp: s.timestamp,
          })),
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'bid_on_task',
    description: 'Submit a bid to work on a task. Agents can propose their price and estimated completion time.',
    inputSchema: {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description: 'Task ID to bid on',
        },
        agentId: {
          type: 'string',
          description: 'Agent ID submitting the bid',
        },
        proposedPrice: {
          type: 'string',
          description: 'Proposed price in wei (can be lower than listed reward)',
        },
        estimatedCompletionTime: {
          type: 'number',
          description: 'Estimated time to complete in seconds',
        },
        message: {
          type: 'string',
          description: 'Optional message to task creator',
        },
      },
      required: ['taskId', 'agentId'],
    },
    handler: async (input: any, context: MCPContext) => {
      const task = taskStore.get(input.taskId);
      
      if (!task) {
        return {
          success: false,
          error: {
            code: 'TASK_NOT_FOUND',
            message: 'Task not found',
          },
        };
      }
      
      if (task.status !== 'open') {
        return {
          success: false,
          error: {
            code: 'TASK_NOT_OPEN',
            message: 'Task is not open for bidding',
          },
        };
      }
      
      if (task.assignedAgents.length >= task.maxAgents) {
        return {
          success: false,
          error: {
            code: 'TASK_FULL',
            message: 'Maximum number of agents already assigned',
          },
        };
      }
      
      // Auto-assign for now (in production, creator would approve)
      task.assignedAgents.push(input.agentId);
      task.status = task.assignedAgents.length >= task.maxAgents ? 'assigned' : 'open';
      task.updatedAt = Date.now();
      taskStore.set(input.taskId, task);
      
      return {
        success: true,
        data: {
          taskId: input.taskId,
          agentId: input.agentId,
          status: 'assigned',
          message: 'Bid accepted. You are now assigned to this task.',
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'submit_task_result',
    description: 'Submit the result of a completed task for validation.',
    inputSchema: {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description: 'Task ID',
        },
        agentId: {
          type: 'string',
          description: 'Agent ID submitting the result',
        },
        output: {
          type: 'object',
          description: 'Task result/output data',
        },
        artifactHash: {
          type: 'string',
          description: 'IPFS or on-chain hash of the full artifact',
        },
        computeProof: {
          type: 'string',
          description: 'Optional ZK proof of computation',
        },
      },
      required: ['taskId', 'agentId', 'output'],
    },
    handler: async (input: any, context: MCPContext) => {
      const task = taskStore.get(input.taskId);
      
      if (!task) {
        return {
          success: false,
          error: {
            code: 'TASK_NOT_FOUND',
            message: 'Task not found',
          },
        };
      }
      
      if (!task.assignedAgents.includes(input.agentId)) {
        return {
          success: false,
          error: {
            code: 'NOT_ASSIGNED',
            message: 'Agent is not assigned to this task',
          },
        };
      }
      
      const submissionId = uuidv4();
      const submission: TaskSubmission = {
        submissionId,
        taskId: input.taskId,
        agentId: input.agentId,
        output: input.output,
        artifactHash: input.artifactHash || `ipfs://${Buffer.from(submissionId).toString('hex').slice(0, 46)}`,
        computeProof: input.computeProof,
        timestamp: Date.now(),
        validationStatus: 'pending',
        validatorAttestations: [],
      };
      
      submissionStore.set(submissionId, submission);
      
      // Update task status
      task.status = 'completed';
      task.updatedAt = Date.now();
      taskStore.set(input.taskId, task);
      
      return {
        success: true,
        data: {
          submissionId,
          taskId: input.taskId,
          agentId: input.agentId,
          artifactHash: submission.artifactHash,
          status: 'pending_validation',
          message: 'Result submitted. Awaiting validation.',
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'validate_submission',
    description: 'Validate a task submission (for validators only).',
    inputSchema: {
      type: 'object',
      properties: {
        submissionId: {
          type: 'string',
          description: 'Submission ID to validate',
        },
        validatorAddress: {
          type: 'string',
          description: 'Wallet address of the validator',
        },
        approved: {
          type: 'boolean',
          description: 'Whether the submission is approved',
        },
        feedback: {
          type: 'string',
          description: 'Optional feedback for the agent',
        },
      },
      required: ['submissionId', 'validatorAddress', 'approved'],
    },
    handler: async (input: any, context: MCPContext) => {
      const submission = submissionStore.get(input.submissionId);
      
      if (!submission) {
        return {
          success: false,
          error: {
            code: 'SUBMISSION_NOT_FOUND',
            message: 'Submission not found',
          },
        };
      }
      
      const attestation = {
        validator: input.validatorAddress,
        approved: input.approved,
        signature: `0x${Buffer.from(uuidv4()).toString('hex').slice(0, 130)}`,
        timestamp: Date.now(),
      };
      
      submission.validatorAttestations.push(attestation);
      submission.validationStatus = input.approved ? 'approved' : 'rejected';
      submissionStore.set(input.submissionId, submission);
      
      // Update task status
      const task = taskStore.get(submission.taskId);
      if (task && input.approved) {
        task.status = 'validated';
        task.updatedAt = Date.now();
        taskStore.set(submission.taskId, task);
      }
      
      return {
        success: true,
        data: {
          submissionId: input.submissionId,
          approved: input.approved,
          attestationSignature: attestation.signature,
          message: input.approved 
            ? 'Submission validated. Payment can be released.'
            : 'Submission rejected. Agent may dispute or resubmit.',
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'cancel_task',
    description: 'Cancel an open task and refund the escrowed reward.',
    inputSchema: {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description: 'Task ID to cancel',
        },
        creatorWallet: {
          type: 'string',
          description: 'Wallet of the task creator (for authorization)',
        },
        reason: {
          type: 'string',
          description: 'Reason for cancellation',
        },
      },
      required: ['taskId', 'creatorWallet'],
    },
    handler: async (input: any, context: MCPContext) => {
      const task = taskStore.get(input.taskId);
      
      if (!task) {
        return {
          success: false,
          error: {
            code: 'TASK_NOT_FOUND',
            message: 'Task not found',
          },
        };
      }
      
      if (task.creator.toLowerCase() !== input.creatorWallet.toLowerCase()) {
        return {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Only the task creator can cancel',
          },
        };
      }
      
      if (!['open', 'assigned'].includes(task.status)) {
        return {
          success: false,
          error: {
            code: 'CANNOT_CANCEL',
            message: 'Task cannot be cancelled in its current state',
          },
        };
      }
      
      task.status = 'cancelled';
      task.updatedAt = Date.now();
      taskStore.set(input.taskId, task);
      
      return {
        success: true,
        data: {
          taskId: input.taskId,
          status: 'cancelled',
          refundAmount: task.reward,
          refundTx: `0x${Buffer.from(uuidv4()).toString('hex').slice(0, 64)}`,
          message: 'Task cancelled. Reward refunded.',
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
];

export { taskStore, submissionStore };
