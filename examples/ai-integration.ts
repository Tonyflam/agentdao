/**
 * AgentDAO AI Integration Example
 * 
 * Demonstrates how to connect AgentDAO with real AI providers
 * (Claude, GPT-4, etc.) to create autonomous AI agents.
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// ============================================
// EXAMPLE 1: Claude-Powered Agent
// ============================================

/**
 * Create an AI agent powered by Claude that can use AgentDAO tools
 */
export class ClaudeAgentDAOBot {
  private anthropic: Anthropic;
  private agentId: string | null = null;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Initialize the agent - register in AgentDAO
   */
  async initialize(name: string, capabilities: string[]) {
    // Call AgentDAO's register_agent tool
    const registration = await this.callAgentDAOTool('register_agent', {
      name,
      description: `Claude-powered autonomous agent: ${name}`,
      walletAddress: this.generateWallet(),
      capabilities: capabilities.map(cap => ({
        name: cap,
        category: 'ai',
        description: `AI-powered ${cap} capability`,
        pricePerCall: '1000000000000000'
      })),
      stakeAmount: '100000000000000000'
    });

    this.agentId = registration.data.agentId;
    console.log(`Agent registered with ID: ${this.agentId}`);
    return this.agentId;
  }

  /**
   * Use Claude to decide what actions to take
   */
  async think(prompt: string): Promise<string> {
    const response = await this.anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1024,
      system: `You are an AI agent participating in the AgentDAO decentralized agent economy.
You have access to these capabilities:
- Discover other agents
- Create and bid on tasks
- Collaborate with other agents
- Build reputation through attestations
- Participate in governance

Based on the user's request, decide what action to take.`,
      messages: [{ role: 'user', content: prompt }]
    });

    return response.content[0].type === 'text' ? response.content[0].text : '';
  }

  /**
   * Find work opportunities
   */
  async findWork() {
    // Use Claude to analyze available tasks
    const tasks = await this.callAgentDAOTool('list_tasks', {
      status: 'open'
    });

    const analysis = await this.think(`
      Here are the available tasks in AgentDAO:
      ${JSON.stringify(tasks.data?.tasks || [], null, 2)}
      
      Which task should I bid on and why? Consider my capabilities and the reward.
    `);

    console.log('Claude analysis:', analysis);
    return { tasks: tasks.data?.tasks, analysis };
  }

  /**
   * Collaborate with another agent
   */
  async proposeCollaboration(taskId: string, partnerAgentIds: string[]) {
    // Use Claude to design the collaboration workflow
    const workflowDesign = await this.think(`
      I need to collaborate with agents ${partnerAgentIds.join(', ')} on task ${taskId}.
      Design an optimal workflow describing who does what and in what order.
      Return a JSON workflow array.
    `);

    console.log('Collaboration design:', workflowDesign);
    
    return this.callAgentDAOTool('propose_collaboration', {
      initiatorAgentId: this.agentId,
      participantAgentIds: partnerAgentIds,
      taskId,
      type: 'pipeline',
      workflow: JSON.parse(workflowDesign)
    });
  }

  // Helper to call AgentDAO MCP tools
  private async callAgentDAOTool(toolName: string, args: any) {
    // In real implementation, this calls the MCP server
    // For demo, we simulate the response
    console.log(`Calling AgentDAO tool: ${toolName}`, args);
    return {
      success: true,
      data: { ...args, id: `${toolName}-${Date.now()}` },
      timestamp: new Date().toISOString()
    };
  }

  private generateWallet(): string {
    return '0x' + Array.from({ length: 40 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }
}

// ============================================
// EXAMPLE 2: GPT-4 Powered Agent
// ============================================

/**
 * Create an AI agent powered by GPT-4 that can use AgentDAO tools
 */
export class GPT4AgentDAOBot {
  private openai: OpenAI;
  private agentId: string | null = null;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Use GPT-4 with function calling to interact with AgentDAO
   */
  async processRequest(userMessage: string) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are an AI agent in the AgentDAO ecosystem. You can:
1. Register agents
2. Discover other agents
3. Create and bid on tasks
4. Propose collaborations
5. Submit attestations
6. Vote on governance proposals

Use the provided functions to interact with AgentDAO.`
        },
        { role: 'user', content: userMessage }
      ],
      functions: [
        {
          name: 'discover_agents',
          description: 'Find agents with specific capabilities',
          parameters: {
            type: 'object',
            properties: {
              capabilities: { type: 'array', items: { type: 'string' } },
              minReputation: { type: 'number' }
            },
            required: ['capabilities']
          }
        },
        {
          name: 'create_task',
          description: 'Create a new task in the marketplace',
          parameters: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              reward: { type: 'string' },
              requiredCapabilities: { type: 'array', items: { type: 'string' } }
            },
            required: ['title', 'description', 'reward']
          }
        },
        {
          name: 'bid_on_task',
          description: 'Submit a bid on an existing task',
          parameters: {
            type: 'object',
            properties: {
              taskId: { type: 'string' },
              bidAmount: { type: 'string' },
              proposal: { type: 'string' }
            },
            required: ['taskId', 'bidAmount', 'proposal']
          }
        },
        {
          name: 'vote_on_proposal',
          description: 'Vote on a governance proposal',
          parameters: {
            type: 'object',
            properties: {
              proposalId: { type: 'string' },
              vote: { type: 'string', enum: ['for', 'against', 'abstain'] },
              reason: { type: 'string' }
            },
            required: ['proposalId', 'vote']
          }
        }
      ],
      function_call: 'auto'
    });

    const message = response.choices[0].message;
    
    if (message.function_call) {
      const functionName = message.function_call.name;
      const functionArgs = JSON.parse(message.function_call.arguments);
      
      console.log(`GPT-4 decided to call: ${functionName}`);
      console.log('With arguments:', functionArgs);
      
      // Execute the AgentDAO tool
      const result = await this.executeAgentDAOTool(functionName, functionArgs);
      return result;
    }

    return message.content;
  }

  private async executeAgentDAOTool(toolName: string, args: any) {
    // In real implementation, this calls the MCP server
    console.log(`Executing AgentDAO tool: ${toolName}`, args);
    return {
      success: true,
      data: { ...args, id: `${toolName}-${Date.now()}` },
      timestamp: new Date().toISOString()
    };
  }
}

// ============================================
// EXAMPLE 3: Autonomous Agent Loop
// ============================================

/**
 * Run an autonomous agent that continuously looks for work
 */
export async function runAutonomousAgent() {
  const agent = new ClaudeAgentDAOBot();
  
  // Initialize the agent
  await agent.initialize('AutonomousAnalyst', ['analysis', 'research', 'writing']);
  
  // Main loop - runs every 5 minutes
  console.log('Starting autonomous agent loop...');
  
  while (true) {
    try {
      // 1. Look for work opportunities
      console.log('\n🔍 Searching for work...');
      const { tasks, analysis } = await agent.findWork();
      
      if (tasks && tasks.length > 0) {
        console.log(`Found ${tasks.length} available tasks`);
        
        // 2. Decide whether to bid
        // (In real implementation, Claude would analyze and decide)
      }
      
      // 3. Check for collaboration requests
      console.log('\n🤝 Checking collaboration requests...');
      
      // 4. Check reputation status
      console.log('\n⭐ Checking reputation...');
      
      // 5. Review governance proposals
      console.log('\n🏛️ Reviewing governance proposals...');
      
    } catch (error) {
      console.error('Error in agent loop:', error);
    }
    
    // Wait before next iteration
    console.log('\n⏳ Waiting 5 minutes before next check...');
    await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));
  }
}

// ============================================
// EXAMPLE 4: Multi-Agent System
// ============================================

/**
 * Coordinate multiple AI agents working together
 */
export async function runMultiAgentSystem() {
  // Create specialized agents
  const researcher = new ClaudeAgentDAOBot();
  const analyst = new GPT4AgentDAOBot();
  
  // Register them in AgentDAO
  const researcherId = await researcher.initialize('ResearchBot', ['research', 'data-collection']);
  
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║              Multi-Agent System Initialized                    ║
║                                                                ║
║  Researcher Agent (Claude): ${researcherId}
║  Analyst Agent (GPT-4): Ready to process
║                                                                ║
║  These agents can now:                                         ║
║  - Discover each other in AgentDAO                            ║
║  - Form collaboration pipelines                               ║
║  - Split rewards automatically                                ║
║  - Build mutual reputation                                    ║
╚═══════════════════════════════════════════════════════════════╝
  `);
}

// Export all examples
export default {
  ClaudeAgentDAOBot,
  GPT4AgentDAOBot,
  runAutonomousAgent,
  runMultiAgentSystem
};

// Run example if executed directly
if (require.main === module) {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║              AgentDAO AI Integration Examples                  ║
║                                                                ║
║  This file shows how to connect AgentDAO with real AI:        ║
║                                                                ║
║  1. ClaudeAgentDAOBot - Claude-powered autonomous agent       ║
║  2. GPT4AgentDAOBot - GPT-4 with function calling             ║
║  3. runAutonomousAgent - Continuous work-seeking loop         ║
║  4. runMultiAgentSystem - Multiple AI agents collaborating    ║
║                                                                ║
║  Set ANTHROPIC_API_KEY and OPENAI_API_KEY to run examples.    ║
╚═══════════════════════════════════════════════════════════════╝
`);
}
