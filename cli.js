#!/usr/bin/env node
/**
 * AgentDAO Interactive CLI
 * Real-time demonstration tool for the hackathon demo video
 * 
 * This provides a beautiful interactive interface for demonstrating
 * all AgentDAO capabilities in a realistic user flow.
 */

const readline = require('readline');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m'
};

// In-memory state (simulating blockchain)
const state = {
  agents: new Map(),
  tasks: new Map(),
  collaborations: new Map(),
  escrows: new Map(),
  proposals: new Map(),
  attestations: new Map(),
  messages: new Map(),
  nextId: 1
};

// Helper functions
function generateId(prefix) {
  return `${prefix}-${Date.now()}-${state.nextId++}`;
}

function formatWei(wei) {
  return (BigInt(wei) / BigInt(10 ** 15)).toString() + ' finney';
}

function printHeader() {
  console.clear();
  console.log(colors.cyan + colors.bright);
  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║     █████╗  ██████╗ ███████╗███╗   ██╗████████╗                   ║');
  console.log('║    ██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝                   ║');
  console.log('║    ███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║                      ║');
  console.log('║    ██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║                      ║');
  console.log('║    ██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║                      ║');
  console.log('║    ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝                      ║');
  console.log('║              ██████╗  █████╗  ██████╗                              ║');
  console.log('║              ██╔══██╗██╔══██╗██╔═══██╗                             ║');
  console.log('║              ██║  ██║███████║██║   ██║                             ║');
  console.log('║              ██║  ██║██╔══██║██║   ██║                             ║');
  console.log('║              ██████╔╝██║  ██║╚██████╔╝                             ║');
  console.log('║              ╚═════╝ ╚═╝  ╚═╝ ╚═════╝                              ║');
  console.log('║                                                                    ║');
  console.log('║    Decentralized Autonomous Agent Economy Protocol                ║');
  console.log('║    52 MCP Tools • Multi-Agent Collaboration • On-Chain Reputation ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝');
  console.log(colors.reset);
}

function printMenu() {
  console.log(colors.yellow + '\n📋 MAIN MENU' + colors.reset);
  console.log(colors.dim + '─'.repeat(50) + colors.reset);
  console.log(colors.green + '  1.' + colors.reset + ' 🤖 Register a New Agent');
  console.log(colors.green + '  2.' + colors.reset + ' 🔍 Discover Agents');
  console.log(colors.green + '  3.' + colors.reset + ' 📝 Create a Task');
  console.log(colors.green + '  4.' + colors.reset + ' 💰 Bid on Task');
  console.log(colors.green + '  5.' + colors.reset + ' 🤝 Propose Collaboration');
  console.log(colors.green + '  6.' + colors.reset + ' 💳 Create Escrow');
  console.log(colors.green + '  7.' + colors.reset + ' ⭐ Submit Attestation');
  console.log(colors.green + '  8.' + colors.reset + ' 🏛️  Create Governance Proposal');
  console.log(colors.green + '  9.' + colors.reset + ' 🗳️  Vote on Proposal');
  console.log(colors.green + ' 10.' + colors.reset + ' 📊 View Network Stats');
  console.log(colors.green + ' 11.' + colors.reset + ' 📬 Send Message');
  console.log(colors.green + ' 12.' + colors.reset + ' 📥 Check Inbox');
  console.log(colors.dim + '─'.repeat(50) + colors.reset);
  console.log(colors.red + '  0.' + colors.reset + ' Exit');
  console.log();
}

function printSuccess(message) {
  console.log(colors.green + '✅ ' + message + colors.reset);
}

function printInfo(message) {
  console.log(colors.cyan + 'ℹ️  ' + message + colors.reset);
}

function printResult(title, data) {
  console.log(colors.magenta + '\n📦 ' + title + colors.reset);
  console.log(colors.dim + '─'.repeat(50) + colors.reset);
  console.log(JSON.stringify(data, null, 2));
  console.log(colors.dim + '─'.repeat(50) + colors.reset);
}

// Tool implementations
async function registerAgent(rl) {
  console.log(colors.cyan + '\n🤖 REGISTER NEW AGENT' + colors.reset);
  console.log(colors.dim + '─'.repeat(50) + colors.reset);
  
  const name = await question(rl, 'Agent name: ');
  const description = await question(rl, 'Description: ');
  const wallet = await question(rl, 'Wallet address (or press Enter for random): ');
  const capabilitiesStr = await question(rl, 'Capabilities (comma-separated, e.g., trading,analysis): ');
  
  const agentId = generateId('agent');
  const walletAddress = wallet || `0x${Math.random().toString(16).slice(2, 42)}`;
  
  const capabilities = capabilitiesStr.split(',').map(cap => ({
    name: cap.trim(),
    category: cap.trim(),
    description: `${cap.trim()} capability`,
    pricePerCall: '1000000000000000'
  }));
  
  const agent = {
    id: agentId,
    name,
    description,
    walletAddress,
    mcpEndpoint: `https://${name.toLowerCase().replace(/\s/g, '-')}.agentdao.xyz/mcp`,
    capabilities,
    stakeAmount: '100000000000000000',
    reputation: 500,
    status: 'active',
    registeredAt: new Date().toISOString()
  };
  
  state.agents.set(agentId, agent);
  
  printSuccess(`Agent registered successfully!`);
  printResult('Agent Profile', agent);
  
  console.log(colors.yellow + '\n💡 Simulated blockchain transaction:' + colors.reset);
  console.log(`   TX Hash: 0x${Math.random().toString(16).slice(2)}...`);
  console.log(`   Block: ${Math.floor(Math.random() * 1000000) + 18000000}`);
  console.log(`   Gas Used: ${Math.floor(Math.random() * 100000) + 50000}`);
}

async function discoverAgents(rl) {
  console.log(colors.cyan + '\n🔍 DISCOVER AGENTS' + colors.reset);
  console.log(colors.dim + '─'.repeat(50) + colors.reset);
  
  const capability = await question(rl, 'Search by capability (or Enter for all): ');
  const minRep = await question(rl, 'Minimum reputation (default 0): ');
  
  let agents = Array.from(state.agents.values());
  
  if (capability) {
    agents = agents.filter(a => 
      a.capabilities.some(c => c.category.toLowerCase().includes(capability.toLowerCase()))
    );
  }
  
  if (minRep) {
    agents = agents.filter(a => a.reputation >= parseInt(minRep));
  }
  
  // Sort by reputation
  agents.sort((a, b) => b.reputation - a.reputation);
  
  if (agents.length === 0) {
    printInfo('No agents found matching criteria');
    return;
  }
  
  console.log(colors.green + `\nFound ${agents.length} agent(s):` + colors.reset);
  
  agents.forEach((agent, i) => {
    console.log(colors.yellow + `\n${i + 1}. ${agent.name}` + colors.reset);
    console.log(`   ID: ${agent.id}`);
    console.log(`   Reputation: ${agent.reputation} ⭐`);
    console.log(`   Capabilities: ${agent.capabilities.map(c => c.name).join(', ')}`);
    console.log(`   Status: ${colors.green}${agent.status}${colors.reset}`);
  });
}

async function createTask(rl) {
  console.log(colors.cyan + '\n📝 CREATE TASK' + colors.reset);
  console.log(colors.dim + '─'.repeat(50) + colors.reset);
  
  const title = await question(rl, 'Task title: ');
  const description = await question(rl, 'Description: ');
  const capabilitiesStr = await question(rl, 'Required capabilities (comma-separated): ');
  const reward = await question(rl, 'Reward in ETH (default 0.1): ');
  const collabType = await question(rl, 'Collaboration type (single/parallel/sequential): ');
  
  const taskId = generateId('task');
  
  const task = {
    taskId,
    title,
    description,
    requiredCapabilities: capabilitiesStr.split(',').map(c => c.trim()),
    reward: ((parseFloat(reward) || 0.1) * 10 ** 18).toString(),
    deadline: Date.now() + 7 * 24 * 60 * 60 * 1000,
    collaborationType: collabType || 'single',
    status: 'open',
    bids: [],
    createdAt: new Date().toISOString()
  };
  
  state.tasks.set(taskId, task);
  
  printSuccess('Task created successfully!');
  printResult('Task Details', task);
  
  // Auto-create escrow
  const escrowId = generateId('escrow');
  const escrow = {
    escrowId,
    taskId,
    amount: task.reward,
    status: 'funded',
    createdAt: new Date().toISOString()
  };
  state.escrows.set(escrowId, escrow);
  
  console.log(colors.yellow + '\n💰 Escrow automatically created:' + colors.reset);
  console.log(`   Escrow ID: ${escrowId}`);
  console.log(`   Amount: ${formatWei(task.reward)}`);
}

async function bidOnTask(rl) {
  console.log(colors.cyan + '\n💰 BID ON TASK' + colors.reset);
  console.log(colors.dim + '─'.repeat(50) + colors.reset);
  
  // List open tasks
  const openTasks = Array.from(state.tasks.values()).filter(t => t.status === 'open');
  
  if (openTasks.length === 0) {
    printInfo('No open tasks available');
    return;
  }
  
  console.log(colors.yellow + 'Open Tasks:' + colors.reset);
  openTasks.forEach((t, i) => {
    console.log(`  ${i + 1}. ${t.title} (${formatWei(t.reward)})`);
  });
  
  const taskIndex = await question(rl, '\nSelect task number: ');
  const task = openTasks[parseInt(taskIndex) - 1];
  
  if (!task) {
    printInfo('Invalid selection');
    return;
  }
  
  // List available agents
  const agents = Array.from(state.agents.values());
  if (agents.length === 0) {
    printInfo('No agents registered. Register an agent first.');
    return;
  }
  
  console.log(colors.yellow + '\nYour Agents:' + colors.reset);
  agents.forEach((a, i) => {
    console.log(`  ${i + 1}. ${a.name}`);
  });
  
  const agentIndex = await question(rl, 'Select agent number: ');
  const agent = agents[parseInt(agentIndex) - 1];
  
  if (!agent) {
    printInfo('Invalid selection');
    return;
  }
  
  const bidAmount = await question(rl, `Bid amount in ETH (task reward: ${formatWei(task.reward)}): `);
  const proposal = await question(rl, 'Why should you be selected? ');
  
  const bid = {
    bidId: generateId('bid'),
    agentId: agent.id,
    agentName: agent.name,
    bidAmount: ((parseFloat(bidAmount) || 0.1) * 10 ** 18).toString(),
    proposal,
    submittedAt: new Date().toISOString()
  };
  
  task.bids.push(bid);
  
  printSuccess('Bid submitted successfully!');
  printResult('Bid Details', bid);
}

async function proposeCollaboration(rl) {
  console.log(colors.cyan + '\n🤝 PROPOSE COLLABORATION' + colors.reset);
  console.log(colors.dim + '─'.repeat(50) + colors.reset);
  
  const agents = Array.from(state.agents.values());
  if (agents.length < 2) {
    printInfo('Need at least 2 agents for collaboration. Register more agents first.');
    return;
  }
  
  console.log(colors.yellow + 'Available Agents:' + colors.reset);
  agents.forEach((a, i) => {
    console.log(`  ${i + 1}. ${a.name} (${a.capabilities.map(c => c.name).join(', ')})`);
  });
  
  const initiatorIndex = await question(rl, '\nSelect initiating agent number: ');
  const participantsStr = await question(rl, 'Select participant agent numbers (comma-separated): ');
  const collabType = await question(rl, 'Collaboration type (pipeline/parallel/swarm): ');
  const description = await question(rl, 'Workflow description: ');
  
  const initiator = agents[parseInt(initiatorIndex) - 1];
  const participantIndices = participantsStr.split(',').map(s => parseInt(s.trim()) - 1);
  const participants = participantIndices.map(i => agents[i]).filter(Boolean);
  
  if (!initiator || participants.length === 0) {
    printInfo('Invalid agent selection');
    return;
  }
  
  const collabId = generateId('collab');
  
  const allAgents = [initiator, ...participants];
  const sharePerAgent = Math.floor(100 / allAgents.length);
  
  const collaboration = {
    collaborationId: collabId,
    initiatorAgentId: initiator.id,
    participantAgentIds: participants.map(p => p.id),
    type: collabType || 'pipeline',
    status: 'proposed',
    workflow: allAgents.map((a, i) => ({
      step: i + 1,
      agentId: a.id,
      agentName: a.name,
      action: `Step ${i + 1}: ${a.capabilities[0]?.name || 'Work'}`,
      status: 'pending'
    })),
    rewardSplit: allAgents.map(a => ({
      agentId: a.id,
      agentName: a.name,
      percentage: sharePerAgent
    })),
    createdAt: new Date().toISOString()
  };
  
  state.collaborations.set(collabId, collaboration);
  
  printSuccess('Collaboration proposed!');
  printResult('Collaboration Details', collaboration);
}

async function createEscrow(rl) {
  console.log(colors.cyan + '\n💳 CREATE ESCROW' + colors.reset);
  console.log(colors.dim + '─'.repeat(50) + colors.reset);
  
  const agents = Array.from(state.agents.values());
  if (agents.length === 0) {
    printInfo('No agents registered. Register agents first.');
    return;
  }
  
  console.log(colors.yellow + 'Available Agents (beneficiaries):' + colors.reset);
  agents.forEach((a, i) => {
    console.log(`  ${i + 1}. ${a.name} (${a.walletAddress.slice(0, 10)}...)`);
  });
  
  const beneficiaryIndices = await question(rl, '\nSelect beneficiary numbers (comma-separated): ');
  const amount = await question(rl, 'Total amount in ETH: ');
  
  const indices = beneficiaryIndices.split(',').map(s => parseInt(s.trim()) - 1);
  const beneficiaries = indices.map(i => agents[i]).filter(Boolean);
  
  if (beneficiaries.length === 0) {
    printInfo('Invalid beneficiary selection');
    return;
  }
  
  const sharePerBeneficiary = Math.floor(100 / beneficiaries.length);
  
  const escrowId = generateId('escrow');
  const escrow = {
    escrowId,
    payerWallet: `0x${Math.random().toString(16).slice(2, 42)}`,
    beneficiaries: beneficiaries.map(b => ({
      address: b.walletAddress,
      name: b.name,
      share: sharePerBeneficiary
    })),
    totalAmount: ((parseFloat(amount) || 0.1) * 10 ** 18).toString(),
    status: 'funded',
    releaseConditions: {
      type: 'validator_approval',
      requiredApprovals: 2
    },
    createdAt: new Date().toISOString()
  };
  
  state.escrows.set(escrowId, escrow);
  
  printSuccess('Escrow created and funded!');
  printResult('Escrow Details', escrow);
  
  console.log(colors.yellow + '\n🔗 Blockchain confirmation:' + colors.reset);
  console.log(`   Contract: 0x${Math.random().toString(16).slice(2, 42)}`);
  console.log(`   Funds locked: ${formatWei(escrow.totalAmount)}`);
}

async function submitAttestation(rl) {
  console.log(colors.cyan + '\n⭐ SUBMIT ATTESTATION' + colors.reset);
  console.log(colors.dim + '─'.repeat(50) + colors.reset);
  
  const agents = Array.from(state.agents.values());
  if (agents.length < 2) {
    printInfo('Need at least 2 agents for attestations.');
    return;
  }
  
  console.log(colors.yellow + 'Agents:' + colors.reset);
  agents.forEach((a, i) => {
    console.log(`  ${i + 1}. ${a.name} (Rep: ${a.reputation})`);
  });
  
  const attestorIndex = await question(rl, '\nSelect attestor (who is giving the rating): ');
  const subjectIndex = await question(rl, 'Select subject (who is being rated): ');
  const rating = await question(rl, 'Rating (1-5): ');
  const category = await question(rl, 'Category (task_quality/communication/timeliness): ');
  const comment = await question(rl, 'Comment: ');
  
  const attestor = agents[parseInt(attestorIndex) - 1];
  const subject = agents[parseInt(subjectIndex) - 1];
  
  if (!attestor || !subject || attestor.id === subject.id) {
    printInfo('Invalid selection');
    return;
  }
  
  const attestationId = generateId('attest');
  const attestation = {
    attestationId,
    attestorId: attestor.id,
    attestorName: attestor.name,
    subjectId: subject.id,
    subjectName: subject.name,
    rating: parseInt(rating) || 5,
    category: category || 'task_quality',
    comment,
    createdAt: new Date().toISOString()
  };
  
  state.attestations.set(attestationId, attestation);
  
  // Update subject's reputation
  const ratingNum = parseInt(rating) || 5;
  const repChange = (ratingNum - 3) * 20; // -40 to +40
  subject.reputation = Math.max(0, subject.reputation + repChange);
  
  printSuccess('Attestation submitted!');
  printResult('Attestation', attestation);
  
  console.log(colors.yellow + `\n📈 ${subject.name}'s reputation updated: ${subject.reputation - repChange} → ${subject.reputation}` + colors.reset);
}

async function createProposal(rl) {
  console.log(colors.cyan + '\n🏛️  CREATE GOVERNANCE PROPOSAL' + colors.reset);
  console.log(colors.dim + '─'.repeat(50) + colors.reset);
  
  const title = await question(rl, 'Proposal title: ');
  const description = await question(rl, 'Description: ');
  const category = await question(rl, 'Category (fee_adjustment/parameter_change/agent_suspension): ');
  
  const proposalId = generateId('prop');
  const proposal = {
    proposalId,
    title,
    description,
    category: category || 'parameter_change',
    proposerWallet: `0x${Math.random().toString(16).slice(2, 42)}`,
    status: 'active',
    votesFor: 0,
    votesAgainst: 0,
    votesAbstain: 0,
    voters: [],
    quorumRequired: 10,
    votingEnds: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  };
  
  state.proposals.set(proposalId, proposal);
  
  printSuccess('Proposal created!');
  printResult('Proposal', proposal);
}

async function voteOnProposal(rl) {
  console.log(colors.cyan + '\n🗳️  VOTE ON PROPOSAL' + colors.reset);
  console.log(colors.dim + '─'.repeat(50) + colors.reset);
  
  const activeProposals = Array.from(state.proposals.values()).filter(p => p.status === 'active');
  
  if (activeProposals.length === 0) {
    printInfo('No active proposals');
    return;
  }
  
  console.log(colors.yellow + 'Active Proposals:' + colors.reset);
  activeProposals.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.title}`);
    console.log(`     For: ${p.votesFor} | Against: ${p.votesAgainst} | Abstain: ${p.votesAbstain}`);
  });
  
  const propIndex = await question(rl, '\nSelect proposal number: ');
  const vote = await question(rl, 'Your vote (for/against/abstain): ');
  const reason = await question(rl, 'Reason (optional): ');
  
  const proposal = activeProposals[parseInt(propIndex) - 1];
  
  if (!proposal) {
    printInfo('Invalid selection');
    return;
  }
  
  const voterWallet = `0x${Math.random().toString(16).slice(2, 42)}`;
  
  if (vote === 'for') proposal.votesFor += 1;
  else if (vote === 'against') proposal.votesAgainst += 1;
  else proposal.votesAbstain += 1;
  
  proposal.voters.push({
    wallet: voterWallet,
    vote,
    reason,
    votedAt: new Date().toISOString()
  });
  
  printSuccess('Vote recorded!');
  printResult('Updated Proposal', {
    proposalId: proposal.proposalId,
    title: proposal.title,
    votesFor: proposal.votesFor,
    votesAgainst: proposal.votesAgainst,
    votesAbstain: proposal.votesAbstain,
    totalVotes: proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain
  });
}

async function viewNetworkStats(rl) {
  console.log(colors.cyan + '\n📊 NETWORK STATISTICS' + colors.reset);
  console.log(colors.dim + '─'.repeat(50) + colors.reset);
  
  const stats = {
    totalAgents: state.agents.size,
    activeAgents: Array.from(state.agents.values()).filter(a => a.status === 'active').length,
    totalTasks: state.tasks.size,
    openTasks: Array.from(state.tasks.values()).filter(t => t.status === 'open').length,
    totalCollaborations: state.collaborations.size,
    totalEscrows: state.escrows.size,
    totalValueLocked: Array.from(state.escrows.values())
      .reduce((sum, e) => sum + BigInt(e.totalAmount || e.amount || 0), BigInt(0)).toString(),
    activeProposals: Array.from(state.proposals.values()).filter(p => p.status === 'active').length,
    totalAttestations: state.attestations.size,
    averageReputation: state.agents.size > 0 
      ? Math.round(Array.from(state.agents.values()).reduce((sum, a) => sum + a.reputation, 0) / state.agents.size)
      : 0,
    topCapabilities: getTopCapabilities()
  };
  
  console.log(colors.green + '\n🌐 AgentDAO Network Overview' + colors.reset);
  console.log(colors.dim + '═'.repeat(50) + colors.reset);
  console.log(`  👥 Total Agents:          ${stats.totalAgents}`);
  console.log(`  ✅ Active Agents:         ${stats.activeAgents}`);
  console.log(`  📝 Total Tasks:           ${stats.totalTasks}`);
  console.log(`  📂 Open Tasks:            ${stats.openTasks}`);
  console.log(`  🤝 Collaborations:        ${stats.totalCollaborations}`);
  console.log(`  💰 Escrows:               ${stats.totalEscrows}`);
  console.log(`  🔒 Total Value Locked:    ${formatWei(stats.totalValueLocked)}`);
  console.log(`  🗳️  Active Proposals:      ${stats.activeProposals}`);
  console.log(`  ⭐ Total Attestations:    ${stats.totalAttestations}`);
  console.log(`  📈 Avg Reputation:        ${stats.averageReputation}`);
  console.log(colors.dim + '═'.repeat(50) + colors.reset);
  
  if (stats.topCapabilities.length > 0) {
    console.log(colors.yellow + '\n🏆 Top Capabilities:' + colors.reset);
    stats.topCapabilities.forEach((cap, i) => {
      console.log(`  ${i + 1}. ${cap.name} (${cap.count} agents)`);
    });
  }
}

function getTopCapabilities() {
  const capCount = {};
  state.agents.forEach(agent => {
    agent.capabilities.forEach(cap => {
      capCount[cap.name] = (capCount[cap.name] || 0) + 1;
    });
  });
  return Object.entries(capCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

async function sendMessage(rl) {
  console.log(colors.cyan + '\n📬 SEND MESSAGE' + colors.reset);
  console.log(colors.dim + '─'.repeat(50) + colors.reset);
  
  const agents = Array.from(state.agents.values());
  if (agents.length < 2) {
    printInfo('Need at least 2 agents to send messages.');
    return;
  }
  
  console.log(colors.yellow + 'Agents:' + colors.reset);
  agents.forEach((a, i) => {
    console.log(`  ${i + 1}. ${a.name}`);
  });
  
  const fromIndex = await question(rl, '\nFrom agent number: ');
  const toIndex = await question(rl, 'To agent number: ');
  const subject = await question(rl, 'Subject: ');
  const content = await question(rl, 'Message: ');
  
  const fromAgent = agents[parseInt(fromIndex) - 1];
  const toAgent = agents[parseInt(toIndex) - 1];
  
  if (!fromAgent || !toAgent) {
    printInfo('Invalid selection');
    return;
  }
  
  const messageId = generateId('msg');
  const message = {
    messageId,
    fromAgentId: fromAgent.id,
    fromAgentName: fromAgent.name,
    toAgentId: toAgent.id,
    toAgentName: toAgent.name,
    subject,
    content,
    read: false,
    sentAt: new Date().toISOString()
  };
  
  // Store in recipient's inbox
  if (!state.messages.has(toAgent.id)) {
    state.messages.set(toAgent.id, []);
  }
  state.messages.get(toAgent.id).push(message);
  
  printSuccess('Message sent!');
  printResult('Message', message);
}

async function checkInbox(rl) {
  console.log(colors.cyan + '\n📥 CHECK INBOX' + colors.reset);
  console.log(colors.dim + '─'.repeat(50) + colors.reset);
  
  const agents = Array.from(state.agents.values());
  if (agents.length === 0) {
    printInfo('No agents registered.');
    return;
  }
  
  console.log(colors.yellow + 'Select agent to check inbox:' + colors.reset);
  agents.forEach((a, i) => {
    const inbox = state.messages.get(a.id) || [];
    const unread = inbox.filter(m => !m.read).length;
    console.log(`  ${i + 1}. ${a.name} ${unread > 0 ? `(${unread} unread)` : ''}`);
  });
  
  const agentIndex = await question(rl, '\nSelect agent number: ');
  const agent = agents[parseInt(agentIndex) - 1];
  
  if (!agent) {
    printInfo('Invalid selection');
    return;
  }
  
  const inbox = state.messages.get(agent.id) || [];
  
  if (inbox.length === 0) {
    printInfo(`${agent.name}'s inbox is empty`);
    return;
  }
  
  console.log(colors.green + `\n📬 ${agent.name}'s Inbox (${inbox.length} messages):` + colors.reset);
  
  inbox.forEach((msg, i) => {
    const status = msg.read ? '📭' : '📫';
    console.log(`\n${status} ${i + 1}. From: ${msg.fromAgentName}`);
    console.log(`   Subject: ${msg.subject}`);
    console.log(`   ${msg.content}`);
    console.log(colors.dim + `   ${msg.sentAt}` + colors.reset);
    msg.read = true;
  });
}

// Readline helper
function question(rl, prompt) {
  return new Promise(resolve => {
    rl.question(colors.white + prompt + colors.reset, resolve);
  });
}

// Main function
async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  printHeader();
  
  // Add some demo data
  console.log(colors.dim + '\nInitializing demo environment...' + colors.reset);
  
  // Pre-register some agents for demo
  const demoAgents = [
    { name: 'TradingBot Alpha', caps: ['trading', 'analysis'], rep: 750 },
    { name: 'ResearchAgent Pro', caps: ['research', 'content'], rep: 680 },
    { name: 'DataAnalyzer X', caps: ['analysis', 'visualization'], rep: 590 }
  ];
  
  demoAgents.forEach(da => {
    const id = generateId('agent');
    state.agents.set(id, {
      id,
      name: da.name,
      description: `Professional ${da.caps[0]} agent`,
      walletAddress: `0x${Math.random().toString(16).slice(2, 42)}`,
      mcpEndpoint: `https://${da.name.toLowerCase().replace(/\s/g, '-')}.agentdao.xyz/mcp`,
      capabilities: da.caps.map(c => ({
        name: c,
        category: c,
        description: `${c} capability`,
        pricePerCall: '1000000000000000'
      })),
      stakeAmount: '100000000000000000',
      reputation: da.rep,
      status: 'active',
      registeredAt: new Date().toISOString()
    });
  });
  
  console.log(colors.green + '✅ Demo environment ready with 3 pre-registered agents\n' + colors.reset);
  
  let running = true;
  
  while (running) {
    printMenu();
    const choice = await question(rl, 'Enter choice (0-12): ');
    
    switch (choice) {
      case '1': await registerAgent(rl); break;
      case '2': await discoverAgents(rl); break;
      case '3': await createTask(rl); break;
      case '4': await bidOnTask(rl); break;
      case '5': await proposeCollaboration(rl); break;
      case '6': await createEscrow(rl); break;
      case '7': await submitAttestation(rl); break;
      case '8': await createProposal(rl); break;
      case '9': await voteOnProposal(rl); break;
      case '10': await viewNetworkStats(rl); break;
      case '11': await sendMessage(rl); break;
      case '12': await checkInbox(rl); break;
      case '0':
        running = false;
        console.log(colors.cyan + '\n👋 Thank you for using AgentDAO!\n' + colors.reset);
        break;
      default:
        printInfo('Invalid choice. Please enter 0-12.');
    }
    
    if (running) {
      await question(rl, '\nPress Enter to continue...');
    }
  }
  
  rl.close();
}

main().catch(console.error);
