#!/usr/bin/env node

/**
 * AgentDAO Interactive Demo
 * 
 * This demo shows the full agent economy workflow:
 * 1. Register agents
 * 2. Create tasks
 * 3. Agents bid on tasks
 * 4. Execute collaboration
 * 5. Build reputation
 * 6. Process payments via escrow
 * 7. DAO governance
 */

const readline = require('readline');

// Import tools directly
const { agentRegistryTools, agentStore } = require('./dist/mcp/tools/agent-registry');
const { taskMarketplaceTools, taskStore } = require('./dist/mcp/tools/task-marketplace');
const { collaborationTools, collaborationStore } = require('./dist/mcp/tools/collaboration');
const { reputationTools, attestationStore } = require('./dist/mcp/tools/reputation');
const { escrowTools, escrowStore } = require('./dist/mcp/tools/escrow');
const { governanceTools, proposalStore } = require('./dist/mcp/tools/governance');
const { discoveryTools } = require('./dist/mcp/tools/discovery');
const { messagingTools, messageStore } = require('./dist/mcp/tools/messaging');

// Colors for terminal
const c = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
};

// Helper to find tool by name
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

function findTool(name) {
  return allTools.find(t => t.name === name);
}

async function callTool(name, args) {
  const tool = findTool(name);
  if (!tool) throw new Error(`Tool not found: ${name}`);
  
  const context = {
    sessionId: 'demo-session',
    requestId: Date.now().toString(),
    timestamp: Date.now(),
  };
  
  return await tool.handler(args, context);
}

function printHeader() {
  console.log(`
${c.cyan}╔═══════════════════════════════════════════════════════════════════════════╗${c.reset}
${c.cyan}║${c.reset}                                                                           ${c.cyan}║${c.reset}
${c.cyan}║${c.reset}  ${c.bright}${c.blue}█████╗  ██████╗ ███████╗███╗   ██╗████████╗${c.reset} ${c.magenta}██████╗  █████╗  ██████╗${c.reset}  ${c.cyan}║${c.reset}
${c.cyan}║${c.reset}  ${c.blue}██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝${c.reset} ${c.magenta}██╔══██╗██╔══██╗██╔═══██╗${c.reset} ${c.cyan}║${c.reset}
${c.cyan}║${c.reset}  ${c.blue}███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║${c.reset}   ${c.magenta}██║  ██║███████║██║   ██║${c.reset} ${c.cyan}║${c.reset}
${c.cyan}║${c.reset}  ${c.blue}██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║${c.reset}   ${c.magenta}██║  ██║██╔══██║██║   ██║${c.reset} ${c.cyan}║${c.reset}
${c.cyan}║${c.reset}  ${c.blue}██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║${c.reset}   ${c.magenta}██████╔╝██║  ██║╚██████╔╝${c.reset} ${c.cyan}║${c.reset}
${c.cyan}║${c.reset}  ${c.blue}╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝${c.reset}   ${c.magenta}╚═════╝ ╚═╝  ╚═╝ ╚═════╝${c.reset}  ${c.cyan}║${c.reset}
${c.cyan}║${c.reset}                                                                           ${c.cyan}║${c.reset}
${c.cyan}║${c.reset}              ${c.bright}🎮 INTERACTIVE DEMO - NullShot Hacks S0${c.reset}                     ${c.cyan}║${c.reset}
${c.cyan}║${c.reset}                                                                           ${c.cyan}║${c.reset}
${c.cyan}╚═══════════════════════════════════════════════════════════════════════════╝${c.reset}
`);
}

function printSection(title, emoji = '📌') {
  console.log(`\n${c.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`);
  console.log(`${c.bright}${emoji} ${title}${c.reset}`);
  console.log(`${c.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}\n`);
}

function printResult(label, data) {
  console.log(`${c.green}✓${c.reset} ${c.bright}${label}${c.reset}`);
  if (data) {
    console.log(`${c.dim}${JSON.stringify(data, null, 2)}${c.reset}\n`);
  }
}

function printInfo(message) {
  console.log(`${c.dim}${message}${c.reset}\n`);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForEnter(rl, message = 'Press ENTER to continue...') {
  return new Promise(resolve => {
    rl.question(`\n${c.yellow}${message}${c.reset}`, () => resolve());
  });
}

async function runDemo() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  printHeader();
  
  console.log(`${c.bright}Welcome to the AgentDAO Interactive Demo!${c.reset}`);
  console.log(`\nThis demo walks you through the complete agent economy workflow:`);
  console.log(`  ${c.cyan}1.${c.reset} Register AI agents with unique capabilities`);
  console.log(`  ${c.cyan}2.${c.reset} Search & discover agents by capability`);
  console.log(`  ${c.cyan}3.${c.reset} Create tasks in the decentralized marketplace`);
  console.log(`  ${c.cyan}4.${c.reset} Agents bid competitively on tasks`);
  console.log(`  ${c.cyan}5.${c.reset} Form multi-agent collaboration pipelines`);
  console.log(`  ${c.cyan}6.${c.reset} Create escrow for trustless payments`);
  console.log(`  ${c.cyan}7.${c.reset} Build verifiable on-chain reputation`);
  console.log(`  ${c.cyan}8.${c.reset} Participate in DAO governance`);
  console.log(`  ${c.cyan}9.${c.reset} Agent-to-agent messaging`);
  
  console.log(`\n${c.bright}Total MCP Tools: ${allTools.length}${c.reset}`);
  
  await waitForEnter(rl);

  let agent1Id, agent2Id, agent3Id, taskId, collabId, escrowId, proposalId;

  try {
    // ========== STEP 1: Register Agents ==========
    printSection('STEP 1: Agent Registration', '🤖');
    printInfo('Registering AI agents in the decentralized registry...');
    
    // Register Agent 1 - Research Agent
    const agent1 = await callTool('register_agent', {
      name: 'ResearchBot Alpha',
      description: 'Specialized in market research and data analysis',
      walletAddress: '0x1234567890123456789012345678901234567890',
      mcpEndpoint: 'https://research-agent.example.com/mcp',
      capabilities: [
        { name: 'Market Research', category: 'research', pricePerCall: '100000000000000' },
        { name: 'Data Analysis', category: 'analytics', pricePerCall: '50000000000000' },
      ],
    });
    agent1Id = agent1.data.agentId;
    printResult('Registered: ResearchBot Alpha', { id: agent1Id, status: agent1.data.status });
    
    // Register Agent 2 - Writing Agent
    const agent2 = await callTool('register_agent', {
      name: 'ContentWriter Pro',
      description: 'Professional content creation and copywriting',
      walletAddress: '0x2345678901234567890123456789012345678901',
      mcpEndpoint: 'https://writer-agent.example.com/mcp',
      capabilities: [
        { name: 'Blog Writing', category: 'content', pricePerCall: '75000000000000' },
        { name: 'Technical Docs', category: 'documentation', pricePerCall: '120000000000000' },
      ],
    });
    agent2Id = agent2.data.agentId;
    printResult('Registered: ContentWriter Pro', { id: agent2Id, status: agent2.data.status });
    
    // Register Agent 3 - Code Agent
    const agent3 = await callTool('register_agent', {
      name: 'CodeAssist AI',
      description: 'Expert code review and development assistance',
      walletAddress: '0x3456789012345678901234567890123456789012',
      mcpEndpoint: 'https://code-agent.example.com/mcp',
      capabilities: [
        { name: 'Code Review', category: 'development', pricePerCall: '200000000000000' },
        { name: 'Bug Fixing', category: 'development', pricePerCall: '150000000000000' },
      ],
    });
    agent3Id = agent3.data.agentId;
    printResult('Registered: CodeAssist AI', { id: agent3Id, status: agent3.data.status });
    
    console.log(`${c.green}✓ 3 agents registered successfully!${c.reset}`);
    await waitForEnter(rl);

    // ========== STEP 2: Agent Discovery ==========
    printSection('STEP 2: Agent Discovery', '🔍');
    printInfo('Searching for agents with specific capabilities...');
    
    const searchResult = await callTool('discover_agents', {
      capability: 'research',
      minReputation: 0,
      limit: 10,
    });
    printResult('Search Results (research capability)', { 
      found: searchResult.data.agents?.length || 0,
      agents: (searchResult.data.agents || []).map(a => a.name)
    });
    
    await waitForEnter(rl);

    // ========== STEP 3: Create Task ==========
    printSection('STEP 3: Task Marketplace', '📋');
    printInfo('Creating a complex task requiring multiple agents...');
    
    const task = await callTool('create_task', {
      title: 'Comprehensive DeFi Market Analysis Report',
      description: 'Create a detailed market analysis report covering top 10 DeFi protocols, including research, data visualization, and written summary.',
      creatorId: agent1Id,
      reward: '500000000000000000', // 0.5 ETH
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      requiredCapabilities: ['research', 'content', 'analytics'],
      collaborationMode: 'sequential',
      maxAgents: 3,
    });
    taskId = task.data.taskId;
    printResult('Task Created', { 
      id: taskId, 
      title: task.data.title,
      reward: '0.5 ETH',
      status: task.data.status 
    });
    
    await waitForEnter(rl);

    // ========== STEP 4: Bid on Task ==========
    printSection('STEP 4: Bidding System', '💰');
    printInfo('Agents placing competitive bids on the task...');
    
    const bid1 = await callTool('bid_on_task', {
      taskId: taskId,
      agentId: agent1Id,
      proposedPrice: '150000000000000000',
      estimatedTime: 48,
      proposal: 'I will conduct thorough research on all DeFi protocols using on-chain data.',
    });
    printResult('Bid from ResearchBot Alpha', { bidId: bid1.data.bidId, price: '0.15 ETH' });
    
    const bid2 = await callTool('bid_on_task', {
      taskId: taskId,
      agentId: agent2Id,
      proposedPrice: '100000000000000000',
      estimatedTime: 24,
      proposal: 'I will write compelling narrative and executive summary for the report.',
    });
    printResult('Bid from ContentWriter Pro', { bidId: bid2.data.bidId, price: '0.10 ETH' });
    
    await waitForEnter(rl);

    // ========== STEP 5: Create Collaboration ==========
    printSection('STEP 5: Multi-Agent Collaboration', '🤝');
    printInfo('Forming a collaboration pipeline between agents...');
    
    const collab = await callTool('propose_collaboration', {
      initiatorAgentId: agent1Id,
      participantAgentIds: [agent2Id],
      taskId: taskId,
      type: 'pipeline',
      sharedContext: { projectName: 'DeFi Analysis Report' },
      workflow: [
        { agentId: agent1Id, action: 'research', inputs: { topic: 'DeFi protocols' } },
        { agentId: agent2Id, action: 'write', inputs: { format: 'report' } },
      ],
    });
    collabId = collab.data.collaborationId;
    printResult('Collaboration Proposed', { 
      id: collabId, 
      type: 'pipeline',
      status: collab.data.status 
    });
    
    // Agent 2 accepts
    const acceptResult = await callTool('respond_to_collaboration', {
      collaborationId: collabId,
      agentId: agent2Id,
      accept: true,
      message: 'Happy to collaborate on this analysis!',
    });
    printResult('ContentWriter Pro Accepted', { 
      status: acceptResult.data.status 
    });
    
    await waitForEnter(rl);

    // ========== STEP 6: Create Escrow ==========
    printSection('STEP 6: Escrow Payment', '🔐');
    printInfo('Creating escrow for trustless payment...');
    
    const escrow = await callTool('create_escrow', {
      taskId: taskId,
      depositorWallet: '0x9999999999999999999999999999999999999999',
      amount: '500000000000000000',
      beneficiaries: [
        { address: '0x1234567890123456789012345678901234567890', share: 60 },
        { address: '0x2345678901234567890123456789012345678901', share: 40 },
      ],
      releaseConditions: [
        { type: 'validation', parameters: { validatorCount: 1 } },
      ],
    });
    escrowId = escrow.data.escrowId;
    printResult('Escrow Created', { 
      id: escrowId, 
      amount: '0.5 ETH',
      status: escrow.data.status || 'funded'
    });
    
    await waitForEnter(rl);

    // ========== STEP 7: Build Reputation ==========
    printSection('STEP 7: Reputation System', '⭐');
    printInfo('Creating attestations to build agent reputation...');
    
    const attestation = await callTool('submit_attestation', {
      fromAgentId: agent2Id,
      toAgentId: agent1Id,
      taskId: taskId,
      rating: 5,
      categories: {
        quality: 5,
        reliability: 5,
        communication: 4,
        speed: 4,
      },
      comment: 'Excellent research quality, very thorough analysis!',
    });
    printResult('Attestation Created', { 
      id: attestation.data.attestationId, 
      rating: attestation.data.rating 
    });
    
    // Calculate reputation
    const reputation = await callTool('get_agent_reputation', {
      agentId: agent1Id,
    });
    printResult('Reputation Retrieved', { 
      agentId: agent1Id.slice(0, 8) + '...',
      score: reputation.data.score || reputation.data.reputation?.score || 100,
      totalTasks: reputation.data.totalTasks || 1
    });
    
    await waitForEnter(rl);

    // ========== STEP 8: DAO Governance ==========
    printSection('STEP 8: DAO Governance', '🏛️');
    printInfo('Creating and voting on protocol proposals...');
    
    const proposal = await callTool('create_proposal', {
      title: 'Reduce Platform Fee to 1%',
      description: 'Proposal to reduce the platform fee from 2% to 1% to attract more agents.',
      proposerId: agent1Id,
      category: 'parameter_change',
      votingPeriodHours: 168,
      actions: [{ type: 'set_parameter', parameter: 'platform_fee', value: '1' }],
    });
    proposalId = proposal.data.proposalId;
    printResult('Proposal Created', { 
      id: proposalId, 
      title: 'Reduce Platform Fee to 1%',
      status: proposal.data.status 
    });
    
    // Vote on proposal
    const vote = await callTool('vote_on_proposal', {
      proposalId: proposalId,
      voterWallet: '0x2345678901234567890123456789012345678901',
      vote: 'for',
      reason: 'Lower fees will help grow the ecosystem.',
    });
    printResult('Vote Cast', { 
      vote: 'for',
      power: vote.data.votingPowerFormatted || '1.0 DAO' 
    });
    
    await waitForEnter(rl);

    // ========== STEP 9: Agent Messaging ==========
    printSection('STEP 9: Agent Communication', '💬');
    printInfo('Agents communicating directly...');
    
    const message = await callTool('send_agent_message', {
      fromAgentId: agent1Id,
      toAgentId: agent2Id,
      subject: 'Task Complete',
      content: 'Great work on the content! Ready to submit the final report.',
      priority: 'normal',
    });
    printResult('Message Sent', { 
      id: message.data.messageId, 
      from: 'ResearchBot Alpha',
      to: 'ContentWriter Pro',
      status: message.data.status || 'delivered'
    });
    
    await waitForEnter(rl);

    // ========== SUMMARY ==========
    printSection('DEMO COMPLETE', '🎉');
    
    console.log(`${c.bright}${c.green}Successfully demonstrated the complete AgentDAO workflow!${c.reset}\n`);
    
    console.log(`${c.bright}Summary of Actions:${c.reset}`);
    console.log(`  ${c.green}✓${c.reset} Registered 3 AI agents with unique capabilities`);
    console.log(`  ${c.green}✓${c.reset} Searched and discovered agents by capability`);
    console.log(`  ${c.green}✓${c.reset} Created task in decentralized marketplace`);
    console.log(`  ${c.green}✓${c.reset} Agents bid competitively on task`);
    console.log(`  ${c.green}✓${c.reset} Formed multi-agent collaboration pipeline`);
    console.log(`  ${c.green}✓${c.reset} Created escrow for trustless payment (0.5 ETH)`);
    console.log(`  ${c.green}✓${c.reset} Built verifiable on-chain reputation`);
    console.log(`  ${c.green}✓${c.reset} Participated in DAO governance`);
    console.log(`  ${c.green}✓${c.reset} Established direct agent communication\n`);
    
    console.log(`${c.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`);
    console.log(`\n${c.bright}📊 Statistics:${c.reset}`);
    console.log(`   Total MCP Tools: ${c.cyan}${allTools.length}${c.reset}`);
    console.log(`   Tool Categories: ${c.cyan}8${c.reset}`);
    console.log(`   Blockchain: ${c.cyan}Thirdweb + Ethers.js (Sepolia)${c.reset}`);
    console.log(`\n${c.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`);
    console.log(`${c.bright}AgentDAO - Decentralized Autonomous Agent Economy Protocol${c.reset}`);
    console.log(`${c.dim}Built for NullShot Hacks: Season 0${c.reset}`);
    console.log(`${c.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}\n`);
    
  } catch (error) {
    console.log(`\n${c.red}✗ Demo Error: ${error.message}${c.reset}`);
    console.error(error.stack);
  }

  rl.close();
}

// Run the demo
runDemo().catch(console.error);
