/**
 * AgentDAO - MCP Server Implementation
 * 
 * Main entry point for the Model Context Protocol server
 * Implements the NullShot framework for AI agent interoperability
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { v4 as uuidv4 } from 'uuid';

// Import all tools
import { agentRegistryTools } from './tools/agent-registry';
import { taskMarketplaceTools } from './tools/task-marketplace';
import { collaborationTools } from './tools/collaboration';
import { reputationTools } from './tools/reputation';
import { escrowTools } from './tools/escrow';
import { governanceTools } from './tools/governance';
import { discoveryTools } from './tools/discovery';
import { messagingTools } from './tools/messaging';

// Combine all tools
const allTools = [
  ...agentRegistryTools,
  ...taskMarketplaceTools,
  ...collaborationTools,
  ...reputationTools,
  ...escrowTools,
  ...governanceTools,
  ...discoveryTools,
  ...messagingTools,
];

// Create the MCP server
const server = new Server(
  {
    name: 'agentdao-protocol',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: allTools.map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    })),
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  const tool = allTools.find(t => t.name === name);
  if (!tool) {
    throw new Error(`Unknown tool: ${name}`);
  }
  
  const context = {
    sessionId: uuidv4(),
    requestId: uuidv4(),
    timestamp: Date.now(),
  };
  
  try {
    const result = await tool.handler(args, context);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: {
              code: 'TOOL_EXECUTION_ERROR',
              message: error.message,
            },
          }),
        },
      ],
      isError: true,
    };
  }
});

// Handle list resources request
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'agentdao://registry/agents',
        mimeType: 'application/json',
        name: 'Agent Registry',
        description: 'List of all registered AI agents in the network',
      },
      {
        uri: 'agentdao://marketplace/tasks',
        mimeType: 'application/json',
        name: 'Task Marketplace',
        description: 'Active tasks available for agents',
      },
      {
        uri: 'agentdao://governance/proposals',
        mimeType: 'application/json',
        name: 'Governance Proposals',
        description: 'Active DAO governance proposals',
      },
      {
        uri: 'agentdao://stats/network',
        mimeType: 'application/json',
        name: 'Network Statistics',
        description: 'Overall network statistics and metrics',
      },
    ],
  };
});

// Handle read resource request
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  
  // Handle different resource URIs
  switch (uri) {
    case 'agentdao://registry/agents':
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
              description: 'Agent Registry - Query registered agents using discovery tools',
              availableTools: ['discover_agents', 'get_agent_profile', 'search_capabilities'],
            }),
          },
        ],
      };
    
    case 'agentdao://marketplace/tasks':
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
              description: 'Task Marketplace - Browse and create tasks',
              availableTools: ['list_tasks', 'create_task', 'bid_on_task', 'submit_task_result'],
            }),
          },
        ],
      };
    
    case 'agentdao://governance/proposals':
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
              description: 'Governance System - Participate in DAO decisions',
              availableTools: ['list_proposals', 'create_proposal', 'vote_on_proposal'],
            }),
          },
        ],
      };
    
    case 'agentdao://stats/network':
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
              totalAgents: 0,
              activeAgents: 0,
              totalTasks: 0,
              completedTasks: 0,
              totalVolume: '0',
              averageReputation: 0,
            }),
          },
        ],
      };
    
    default:
      throw new Error(`Unknown resource: ${uri}`);
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Enhanced startup message
  console.error(`
\x1b[36m┌─────────────────────────────────────────────────────────────┐\x1b[0m
\x1b[36m│\x1b[0m  \x1b[1m\x1b[38;5;39mAgentDAO\x1b[0m \x1b[38;5;99mMCP Server\x1b[0m                                       \x1b[36m│\x1b[0m
\x1b[36m│\x1b[0m  \x1b[2mDecentralized Autonomous Agent Economy Protocol\x1b[0m             \x1b[36m│\x1b[0m
\x1b[36m├─────────────────────────────────────────────────────────────┤\x1b[0m
\x1b[36m│\x1b[0m                                                             \x1b[36m│\x1b[0m
\x1b[36m│\x1b[0m  \x1b[32m✓\x1b[0m Status: \x1b[1m\x1b[32mRUNNING\x1b[0m                                          \x1b[36m│\x1b[0m
\x1b[36m│\x1b[0m  \x1b[33m⚡\x1b[0m Transport: STDIO                                        \x1b[36m│\x1b[0m
\x1b[36m│\x1b[0m  \x1b[34m🔧\x1b[0m Tools Loaded: \x1b[1m${allTools.length}\x1b[0m                                        \x1b[36m│\x1b[0m
\x1b[36m│\x1b[0m  \x1b[35m📚\x1b[0m Resources: 4                                             \x1b[36m│\x1b[0m
\x1b[36m│\x1b[0m                                                             \x1b[36m│\x1b[0m
\x1b[36m├─────────────────────────────────────────────────────────────┤\x1b[0m
\x1b[36m│\x1b[0m  \x1b[1mTOOL CATEGORIES:\x1b[0m                                          \x1b[36m│\x1b[0m
\x1b[36m│\x1b[0m                                                             \x1b[36m│\x1b[0m
\x1b[36m│\x1b[0m  🤖 Agent Registry     📋 Task Marketplace                 \x1b[36m│\x1b[0m
\x1b[36m│\x1b[0m  🤝 Collaboration      ⭐ Reputation System                 \x1b[36m│\x1b[0m
\x1b[36m│\x1b[0m  💰 Escrow Payments    🏛️  DAO Governance                   \x1b[36m│\x1b[0m
\x1b[36m│\x1b[0m  🔍 Agent Discovery    💬 Agent Messaging                   \x1b[36m│\x1b[0m
\x1b[36m│\x1b[0m                                                             \x1b[36m│\x1b[0m
\x1b[36m├─────────────────────────────────────────────────────────────┤\x1b[0m
\x1b[36m│\x1b[0m  \x1b[2mReady to accept MCP requests...\x1b[0m                           \x1b[36m│\x1b[0m
\x1b[36m│\x1b[0m  \x1b[2mPress Ctrl+C to stop\x1b[0m                                      \x1b[36m│\x1b[0m
\x1b[36m└─────────────────────────────────────────────────────────────┘\x1b[0m
`);
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export { server };
