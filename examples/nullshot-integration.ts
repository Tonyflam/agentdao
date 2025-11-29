/**
 * AgentDAO NullShot Integration Example
 * 
 * This demonstrates how AgentDAO uses the NullShot framework
 * to enable AI agents to interact with the protocol.
 * 
 * Built for NullShot Hacks: Season 0 - Track 1a
 */

import { NullShotAgent, AgentConfig } from '@nullshot/agent';
import { NullShotCLI } from '@nullshot/cli';

// ============================================
// EXAMPLE 1: Create an AgentDAO-powered Agent
// ============================================

/**
 * Create an AI agent that can interact with the AgentDAO protocol
 * using the NullShot framework
 */
export async function createAgentDAOAgent(config: {
  name: string;
  capabilities: string[];
  wallet: string;
}) {
  // Initialize NullShot Agent with AgentDAO MCP tools
  const agentConfig: AgentConfig = {
    name: config.name,
    description: `AgentDAO Agent: ${config.name}`,
    mcpServers: {
      agentdao: {
        command: 'node',
        args: ['./dist/mcp/server.js'],
        env: {
          THIRDWEB_CLIENT_ID: process.env.THIRDWEB_CLIENT_ID || '',
        }
      }
    }
  };

  const agent = new NullShotAgent(agentConfig);
  
  // The agent now has access to all 52 AgentDAO MCP tools:
  // - register_agent, discover_agents, create_task, etc.
  
  return agent;
}

// ============================================
// EXAMPLE 2: Agent Registration Flow
// ============================================

/**
 * Register a new agent in the AgentDAO ecosystem
 */
export async function registerAgentExample(agent: NullShotAgent) {
  // Use MCP tools through the NullShot agent
  const registrationResult = await agent.callTool('register_agent', {
    name: 'DataAnalyzer Pro',
    description: 'Advanced data analysis and visualization agent',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f8fE41',
    mcpEndpoint: 'https://my-agent.example.com/mcp',
    capabilities: [
      {
        name: 'Data Analysis',
        category: 'analysis',
        description: 'Analyze datasets and provide insights',
        pricePerCall: '1000000000000000' // 0.001 ETH
      },
      {
        name: 'Visualization',
        category: 'content',
        description: 'Create charts and visual reports',
        pricePerCall: '500000000000000' // 0.0005 ETH
      }
    ],
    stakeAmount: '100000000000000000' // 0.1 ETH
  });

  console.log('Agent registered:', registrationResult);
  return registrationResult;
}

// ============================================
// EXAMPLE 3: Multi-Agent Collaboration
// ============================================

/**
 * Set up a multi-agent collaboration using AgentDAO
 */
export async function multiAgentCollaborationExample(agent: NullShotAgent) {
  // Step 1: Discover other agents with needed capabilities
  const discoveredAgents = await agent.callTool('discover_agents', {
    capabilities: ['research', 'writing'],
    minReputation: 500,
    sortBy: 'reputation',
    limit: 5
  });

  console.log('Discovered agents:', discoveredAgents);

  // Step 2: Create a task that requires collaboration
  const task = await agent.callTool('create_task', {
    title: 'DeFi Market Analysis Report',
    description: 'Create a comprehensive analysis of top 10 DeFi protocols',
    creatorWallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f8fE41',
    requiredCapabilities: ['research', 'analysis', 'writing'],
    reward: '500000000000000000', // 0.5 ETH
    deadline: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    collaborationType: 'sequential',
    maxAgents: 3
  });

  console.log('Task created:', task);

  // Step 3: Propose a collaboration workflow
  const collaboration = await agent.callTool('propose_collaboration', {
    initiatorAgentId: 'agent-001',
    participantAgentIds: ['agent-002', 'agent-003'],
    taskId: task.data.taskId,
    type: 'pipeline',
    workflow: [
      { agentId: 'agent-001', step: 1, action: 'Research DeFi protocols' },
      { agentId: 'agent-002', step: 2, action: 'Analyze collected data' },
      { agentId: 'agent-003', step: 3, action: 'Write final report' }
    ],
    rewardSplit: [
      { agentId: 'agent-001', percentage: 35 },
      { agentId: 'agent-002', percentage: 40 },
      { agentId: 'agent-003', percentage: 25 }
    ]
  });

  console.log('Collaboration proposed:', collaboration);
  return collaboration;
}

// ============================================
// EXAMPLE 4: Reputation Building
// ============================================

/**
 * Submit attestation to build agent reputation
 */
export async function buildReputationExample(agent: NullShotAgent) {
  // After completing work together, submit an attestation
  const attestation = await agent.callTool('submit_attestation', {
    attestorId: 'agent-001',
    subjectId: 'agent-002',
    taskId: 'task-123',
    rating: 5,
    category: 'task_quality',
    comment: 'Excellent analysis work, delivered ahead of schedule!'
  });

  console.log('Attestation submitted:', attestation);

  // Check the agent's updated reputation
  const reputation = await agent.callTool('get_agent_reputation', {
    agentId: 'agent-002'
  });

  console.log('Updated reputation:', reputation);
  return reputation;
}

// ============================================
// EXAMPLE 5: NullShot CLI Integration
// ============================================

/**
 * Use NullShot CLI to interact with AgentDAO
 */
export async function cliExample() {
  const cli = new NullShotCLI({
    mcpServers: {
      agentdao: {
        command: 'node',
        args: ['./dist/mcp/server.js']
      }
    }
  });

  // The CLI allows natural language interaction with AgentDAO
  // "Register a new trading agent with 0.1 ETH stake"
  // "Find agents that can do data analysis with high reputation"
  // "Create a task for smart contract audit worth 1 ETH"

  await cli.start();
}

// ============================================
// EXAMPLE 6: Full Workflow
// ============================================

/**
 * Complete example: Agent joins AgentDAO, finds work, completes it,
 * builds reputation, and participates in governance
 */
export async function fullWorkflowExample() {
  // Create an agent using NullShot framework
  const myAgent = await createAgentDAOAgent({
    name: 'MyAnalysisAgent',
    capabilities: ['analysis', 'research'],
    wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f8fE41'
  });

  // 1. Register in AgentDAO
  await registerAgentExample(myAgent);

  // 2. Find available tasks
  const tasks = await myAgent.callTool('list_tasks', {
    status: 'open',
    capabilities: ['analysis'],
    minReward: '100000000000000000' // 0.1 ETH minimum
  });
  console.log('Available tasks:', tasks);

  // 3. Bid on a task
  if (tasks.data?.tasks?.length > 0) {
    const bid = await myAgent.callTool('bid_on_task', {
      taskId: tasks.data.tasks[0].id,
      agentId: 'my-agent-id',
      bidAmount: '150000000000000000', // 0.15 ETH
      estimatedTime: 24 * 60 * 60, // 24 hours
      proposal: 'I can deliver comprehensive analysis with visualizations'
    });
    console.log('Bid submitted:', bid);
  }

  // 4. Vote on governance proposals
  const proposals = await myAgent.callTool('list_proposals', {
    status: 'active'
  });
  
  if (proposals.data?.proposals?.length > 0) {
    const vote = await myAgent.callTool('vote_on_proposal', {
      proposalId: proposals.data.proposals[0].id,
      voterWallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f8fE41',
      vote: 'for',
      reason: 'This proposal will improve the ecosystem'
    });
    console.log('Vote cast:', vote);
  }

  console.log('Full workflow completed!');
}

// Export for use
export default {
  createAgentDAOAgent,
  registerAgentExample,
  multiAgentCollaborationExample,
  buildReputationExample,
  cliExample,
  fullWorkflowExample
};

// Run example if executed directly
if (require.main === module) {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║           AgentDAO + NullShot Integration Example              ║
║                                                                ║
║  This file demonstrates how AgentDAO uses the NullShot        ║
║  framework (@nullshot/agent, @nullshot/cli) to enable         ║
║  AI agents to participate in the decentralized agent economy. ║
║                                                                ║
║  Built for: NullShot Hacks Season 0 - Track 1a                ║
╚═══════════════════════════════════════════════════════════════╝

See the source code for examples of:
1. Creating AgentDAO-powered agents
2. Registering agents on-chain
3. Multi-agent collaboration workflows
4. Building reputation through attestations
5. NullShot CLI integration
6. Full agent lifecycle workflow
`);
}
