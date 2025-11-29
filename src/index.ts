/**
 * AgentDAO - Main Entry Point
 * 
 * Decentralized Autonomous Agent Economy Protocol
 */

export * from './types';

// Export MCP tools
export { agentRegistryTools, agentStore } from './mcp/tools/agent-registry';
export { taskMarketplaceTools, taskStore, submissionStore } from './mcp/tools/task-marketplace';
export { collaborationTools, collaborationStore } from './mcp/tools/collaboration';
export { reputationTools, attestationStore } from './mcp/tools/reputation';
export { escrowTools, escrowStore } from './mcp/tools/escrow';
export { governanceTools, proposalStore, voteStore } from './mcp/tools/governance';
export { discoveryTools } from './mcp/tools/discovery';
export { messagingTools, messageStore, inboxStore } from './mcp/tools/messaging';

// Export blockchain integration
export { BlockchainService } from './blockchain/service';
export { ContractInteraction } from './blockchain/contracts';

// Tool counts
const toolCounts = {
  agentRegistry: 4,
  taskMarketplace: 5,
  collaboration: 5,
  reputation: 5,
  escrow: 5,
  governance: 4,
  discovery: 5,
  messaging: 4,
};
const totalTools = Object.values(toolCounts).reduce((a, b) => a + b, 0);

console.log(`
\x1b[36m╔═══════════════════════════════════════════════════════════════════════════╗\x1b[0m
\x1b[36m║\x1b[0m                                                                           \x1b[36m║\x1b[0m
\x1b[36m║\x1b[0m  \x1b[38;5;39m█████╗  ██████╗ ███████╗███╗   ██╗████████╗\x1b[0m \x1b[38;5;99m██████╗  █████╗  ██████╗\x1b[0m  \x1b[36m║\x1b[0m
\x1b[36m║\x1b[0m  \x1b[38;5;39m██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝\x1b[0m \x1b[38;5;99m██╔══██╗██╔══██╗██╔═══██╗\x1b[0m \x1b[36m║\x1b[0m
\x1b[36m║\x1b[0m  \x1b[38;5;39m███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║\x1b[0m   \x1b[38;5;99m██║  ██║███████║██║   ██║\x1b[0m \x1b[36m║\x1b[0m
\x1b[36m║\x1b[0m  \x1b[38;5;39m██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║\x1b[0m   \x1b[38;5;99m██║  ██║██╔══██║██║   ██║\x1b[0m \x1b[36m║\x1b[0m
\x1b[36m║\x1b[0m  \x1b[38;5;39m██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║\x1b[0m   \x1b[38;5;99m██████╔╝██║  ██║╚██████╔╝\x1b[0m \x1b[36m║\x1b[0m
\x1b[36m║\x1b[0m  \x1b[38;5;39m╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝\x1b[0m   \x1b[38;5;99m╚═════╝ ╚═╝  ╚═╝ ╚═════╝\x1b[0m  \x1b[36m║\x1b[0m
\x1b[36m║\x1b[0m                                                                           \x1b[36m║\x1b[0m
\x1b[36m║\x1b[0m        \x1b[1m\x1b[37mDecentralized Autonomous Agent Economy Protocol\x1b[0m                    \x1b[36m║\x1b[0m
\x1b[36m║\x1b[0m     \x1b[2mWhere AI Agents Discover, Collaborate & Transact On-Chain\x1b[0m            \x1b[36m║\x1b[0m
\x1b[36m║\x1b[0m                                                                           \x1b[36m║\x1b[0m
\x1b[36m╠═══════════════════════════════════════════════════════════════════════════╣\x1b[0m
\x1b[36m║\x1b[0m  \x1b[33m📦 Version:\x1b[0m 1.0.0              \x1b[33m🏆 Built for:\x1b[0m NullShot Hacks Season 0   \x1b[36m║\x1b[0m
\x1b[36m╠═══════════════════════════════════════════════════════════════════════════╣\x1b[0m
\x1b[36m║\x1b[0m                                                                           \x1b[36m║\x1b[0m
\x1b[36m║\x1b[0m  \x1b[1m\x1b[32m🔧 MCP TOOLS AVAILABLE: ${totalTools}\x1b[0m                                          \x1b[36m║\x1b[0m
\x1b[36m║\x1b[0m                                                                           \x1b[36m║\x1b[0m
\x1b[36m║\x1b[0m  \x1b[38;5;39m🤖 Agent Registry\x1b[0m ........ ${toolCounts.agentRegistry} tools   \x1b[38;5;208m📋 Task Marketplace\x1b[0m .... ${toolCounts.taskMarketplace} tools  \x1b[36m║\x1b[0m
\x1b[36m║\x1b[0m  \x1b[38;5;99m🤝 Collaboration\x1b[0m ......... ${toolCounts.collaboration} tools   \x1b[38;5;220m⭐ Reputation\x1b[0m ........... ${toolCounts.reputation} tools  \x1b[36m║\x1b[0m
\x1b[36m║\x1b[0m  \x1b[38;5;46m💰 Escrow Payments\x1b[0m ....... ${toolCounts.escrow} tools   \x1b[38;5;201m🏛️  Governance\x1b[0m .......... ${toolCounts.governance} tools  \x1b[36m║\x1b[0m
\x1b[36m║\x1b[0m  \x1b[38;5;51m🔍 Discovery\x1b[0m ............. ${toolCounts.discovery} tools   \x1b[38;5;226m💬 Messaging\x1b[0m ............ ${toolCounts.messaging} tools  \x1b[36m║\x1b[0m
\x1b[36m║\x1b[0m                                                                           \x1b[36m║\x1b[0m
\x1b[36m╠═══════════════════════════════════════════════════════════════════════════╣\x1b[0m
\x1b[36m║\x1b[0m                                                                           \x1b[36m║\x1b[0m
\x1b[36m║\x1b[0m  \x1b[1m⚡ QUICK START:\x1b[0m                                                         \x1b[36m║\x1b[0m
\x1b[36m║\x1b[0m                                                                           \x1b[36m║\x1b[0m
\x1b[36m║\x1b[0m    \x1b[2mnpm run mcp:dev\x1b[0m    → Start MCP server (development)                  \x1b[36m║\x1b[0m
\x1b[36m║\x1b[0m    \x1b[2mnpm run mcp:start\x1b[0m  → Start MCP server (production)                   \x1b[36m║\x1b[0m
\x1b[36m║\x1b[0m    \x1b[2mnpm run build\x1b[0m      → Build TypeScript                               \x1b[36m║\x1b[0m
\x1b[36m║\x1b[0m                                                                           \x1b[36m║\x1b[0m
\x1b[36m║\x1b[0m  \x1b[1m🔗 BLOCKCHAIN:\x1b[0m Thirdweb + Ethers.js (Sepolia Testnet)                   \x1b[36m║\x1b[0m
\x1b[36m║\x1b[0m  \x1b[1m🖼️  LOGO:\x1b[0m agent dao logo.png                                            \x1b[36m║\x1b[0m
\x1b[36m║\x1b[0m                                                                           \x1b[36m║\x1b[0m
\x1b[36m╚═══════════════════════════════════════════════════════════════════════════╝\x1b[0m

\x1b[32m✓ AgentDAO initialized successfully!\x1b[0m
\x1b[2mReady to build the autonomous agent economy...\x1b[0m
`);

