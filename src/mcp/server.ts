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
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
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

// Import resources and prompts
import { agentDAOResources, getResourceContent } from './resources';
import { agentDAOPrompts, getPromptDetails } from './prompts';

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
      prompts: {},
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
    resources: agentDAOResources,
  };
});

// Handle read resource request
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  
  const content = getResourceContent(uri);
  if (!content) {
    throw new Error(`Unknown resource: ${uri}`);
  }
  
  return {
    contents: [
      {
        uri,
        mimeType: 'text/markdown',
        text: content,
      },
    ],
  };
});

// Handle list prompts request
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: agentDAOPrompts.map(p => ({
      name: p.name,
      description: p.description,
      arguments: p.arguments,
    })),
  };
});

// Handle get prompt request
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  const promptDetails = getPromptDetails(name, args || {});
  if (!promptDetails) {
    throw new Error(`Unknown prompt: ${name}`);
  }
  
  return promptDetails;
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
\x1b[36m│\x1b[0m  \x1b[34m🔧\x1b[0m Tools: \x1b[1m${allTools.length}\x1b[0m                                              \x1b[36m│\x1b[0m
\x1b[36m│\x1b[0m  \x1b[35m📚\x1b[0m Resources: \x1b[1m${agentDAOResources.length}\x1b[0m                                          \x1b[36m│\x1b[0m
\x1b[36m│\x1b[0m  \x1b[38;5;208m💡\x1b[0m Prompts: \x1b[1m${agentDAOPrompts.length}\x1b[0m                                            \x1b[36m│\x1b[0m
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
