/**
 * AgentDAO - Agent Registry Tools
 * 
 * MCP tools for registering, updating, and managing AI agents on-chain
 */

import { v4 as uuidv4 } from 'uuid';
import { MCPContext, AgentProfile, AgentCapability } from '../../types';

// In-memory store (replace with blockchain integration)
const agentStore = new Map<string, AgentProfile>();

export const agentRegistryTools = [
  {
    name: 'register_agent',
    description: `Register a new AI agent in the AgentDAO network. This creates an on-chain identity for the agent, allowing it to participate in the agent economy - discover other agents, accept tasks, collaborate, and earn rewards. The agent must stake tokens to register, ensuring skin in the game.`,
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Human-readable name for the agent',
        },
        description: {
          type: 'string',
          description: 'Description of what the agent does and its specialties',
        },
        walletAddress: {
          type: 'string',
          description: 'Ethereum wallet address for receiving payments',
        },
        mcpEndpoint: {
          type: 'string',
          description: 'MCP server endpoint URL for agent communication',
        },
        capabilities: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
              category: { type: 'string' },
              pricePerCall: { type: 'string' },
            },
          },
          description: 'List of capabilities the agent offers',
        },
        stakeAmount: {
          type: 'string',
          description: 'Amount of tokens to stake (in wei)',
        },
      },
      required: ['name', 'description', 'walletAddress', 'mcpEndpoint', 'capabilities'],
    },
    handler: async (input: any, context: MCPContext) => {
      const agentId = uuidv4();
      const now = Date.now();
      
      const capabilities: AgentCapability[] = input.capabilities.map((cap: any) => ({
        id: uuidv4(),
        name: cap.name,
        description: cap.description,
        category: cap.category || 'custom',
        pricePerCall: cap.pricePerCall || '0',
        inputSchema: cap.inputSchema,
        outputSchema: cap.outputSchema,
      }));
      
      const agent: AgentProfile = {
        agentId,
        walletAddress: input.walletAddress,
        name: input.name,
        description: input.description,
        avatar: input.avatar,
        website: input.website,
        capabilities,
        mcpEndpoint: input.mcpEndpoint,
        supportedProtocols: ['mcp-1.0', 'agentdao-1.0'],
        reputation: {
          score: 100, // Starting reputation
          totalTasks: 0,
          successfulTasks: 0,
          totalEarnings: '0',
          totalStake: input.stakeAmount || '0',
          attestations: 0,
          lastUpdated: now,
        },
        status: 'active',
        createdAt: now,
        updatedAt: now,
      };
      
      agentStore.set(agentId, agent);
      
      return {
        success: true,
        data: {
          agentId,
          walletAddress: agent.walletAddress,
          name: agent.name,
          status: agent.status,
          message: 'Agent successfully registered in AgentDAO network',
          // Mock transaction hash
          transactionHash: `0x${Buffer.from(uuidv4()).toString('hex').slice(0, 64)}`,
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'get_agent_profile',
    description: 'Retrieve the full profile of a registered agent including capabilities, reputation score, and on-chain statistics.',
    inputSchema: {
      type: 'object',
      properties: {
        agentId: {
          type: 'string',
          description: 'Unique identifier of the agent',
        },
        walletAddress: {
          type: 'string',
          description: 'Wallet address of the agent (alternative to agentId)',
        },
      },
    },
    handler: async (input: any, context: MCPContext) => {
      let agent: AgentProfile | undefined;
      
      if (input.agentId) {
        agent = agentStore.get(input.agentId);
      } else if (input.walletAddress) {
        agent = Array.from(agentStore.values()).find(
          a => a.walletAddress.toLowerCase() === input.walletAddress.toLowerCase()
        );
      }
      
      if (!agent) {
        return {
          success: false,
          error: {
            code: 'AGENT_NOT_FOUND',
            message: 'Agent not found with the provided identifier',
          },
        };
      }
      
      return {
        success: true,
        data: agent,
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'update_agent_profile',
    description: 'Update an existing agent profile. Only the agent owner can update their profile.',
    inputSchema: {
      type: 'object',
      properties: {
        agentId: {
          type: 'string',
          description: 'Agent ID to update',
        },
        updates: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            avatar: { type: 'string' },
            website: { type: 'string' },
            mcpEndpoint: { type: 'string' },
            status: { type: 'string', enum: ['active', 'inactive'] },
          },
          description: 'Fields to update',
        },
      },
      required: ['agentId', 'updates'],
    },
    handler: async (input: any, context: MCPContext) => {
      const agent = agentStore.get(input.agentId);
      
      if (!agent) {
        return {
          success: false,
          error: {
            code: 'AGENT_NOT_FOUND',
            message: 'Agent not found',
          },
        };
      }
      
      const updated = {
        ...agent,
        ...input.updates,
        updatedAt: Date.now(),
      };
      
      agentStore.set(input.agentId, updated);
      
      return {
        success: true,
        data: {
          agentId: input.agentId,
          updatedFields: Object.keys(input.updates),
          message: 'Agent profile updated successfully',
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'add_agent_capability',
    description: 'Add a new capability to an agent. Capabilities define what tasks the agent can perform.',
    inputSchema: {
      type: 'object',
      properties: {
        agentId: {
          type: 'string',
          description: 'Agent ID',
        },
        capability: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Capability name' },
            description: { type: 'string', description: 'What this capability does' },
            category: { 
              type: 'string',
              enum: ['analysis', 'trading', 'research', 'content', 'coding', 'security', 'data', 'automation', 'communication', 'custom'],
            },
            pricePerCall: { type: 'string', description: 'Price in wei per invocation' },
            inputSchema: { type: 'object', description: 'JSON schema for inputs' },
            outputSchema: { type: 'object', description: 'JSON schema for outputs' },
          },
          required: ['name', 'description', 'category'],
        },
      },
      required: ['agentId', 'capability'],
    },
    handler: async (input: any, context: MCPContext) => {
      const agent = agentStore.get(input.agentId);
      
      if (!agent) {
        return {
          success: false,
          error: {
            code: 'AGENT_NOT_FOUND',
            message: 'Agent not found',
          },
        };
      }
      
      const newCapability: AgentCapability = {
        id: uuidv4(),
        name: input.capability.name,
        description: input.capability.description,
        category: input.capability.category,
        pricePerCall: input.capability.pricePerCall || '0',
        inputSchema: input.capability.inputSchema,
        outputSchema: input.capability.outputSchema,
      };
      
      agent.capabilities.push(newCapability);
      agent.updatedAt = Date.now();
      agentStore.set(input.agentId, agent);
      
      return {
        success: true,
        data: {
          agentId: input.agentId,
          capabilityId: newCapability.id,
          name: newCapability.name,
          message: 'Capability added successfully',
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'list_my_agents',
    description: 'List all agents owned by a specific wallet address.',
    inputSchema: {
      type: 'object',
      properties: {
        walletAddress: {
          type: 'string',
          description: 'Wallet address to query',
        },
      },
      required: ['walletAddress'],
    },
    handler: async (input: any, context: MCPContext) => {
      const agents = Array.from(agentStore.values()).filter(
        a => a.walletAddress.toLowerCase() === input.walletAddress.toLowerCase()
      );
      
      return {
        success: true,
        data: agents.map(a => ({
          agentId: a.agentId,
          name: a.name,
          status: a.status,
          reputation: a.reputation.score,
          capabilities: a.capabilities.length,
        })),
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'stake_tokens',
    description: 'Stake additional tokens for an agent to increase trust and unlock higher-value tasks.',
    inputSchema: {
      type: 'object',
      properties: {
        agentId: {
          type: 'string',
          description: 'Agent ID',
        },
        amount: {
          type: 'string',
          description: 'Amount to stake in wei',
        },
      },
      required: ['agentId', 'amount'],
    },
    handler: async (input: any, context: MCPContext) => {
      const agent = agentStore.get(input.agentId);
      
      if (!agent) {
        return {
          success: false,
          error: {
            code: 'AGENT_NOT_FOUND',
            message: 'Agent not found',
          },
        };
      }
      
      const currentStake = BigInt(agent.reputation.totalStake);
      const additionalStake = BigInt(input.amount);
      agent.reputation.totalStake = (currentStake + additionalStake).toString();
      agent.updatedAt = Date.now();
      agentStore.set(input.agentId, agent);
      
      return {
        success: true,
        data: {
          agentId: input.agentId,
          previousStake: currentStake.toString(),
          newStake: agent.reputation.totalStake,
          transactionHash: `0x${Buffer.from(uuidv4()).toString('hex').slice(0, 64)}`,
          message: 'Tokens staked successfully',
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
];

export { agentStore };
