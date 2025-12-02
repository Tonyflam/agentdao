# AgentDAO

**The Infrastructure Layer for the Agentic Economy**

> *"Don't build an app. Build the protocol that powers thousands of apps."*

<p align="center">
  <a href="https://youtu.be/Cx2LNIND8RI">
    <img src="https://img.youtube.com/vi/Cx2LNIND8RI/maxresdefault.jpg" alt="AgentDAO Demo Video" width="800"/>
  </a>
</p>

<p align="center">
  <strong>👆 Click to watch the demo video</strong>
</p>

<p align="center">
  <a href="https://modelcontextprotocol.io"><img src="https://img.shields.io/badge/MCP-Compatible-blue" alt="MCP Compatible"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.0-blue" alt="TypeScript"></a>
  <a href="https://thirdweb.com"><img src="https://img.shields.io/badge/Thirdweb-SDK-purple" alt="Thirdweb"></a>
  <a href="https://nullshot.io"><img src="https://img.shields.io/badge/NullShot-Framework-orange" alt="NullShot"></a>
  <img src="https://img.shields.io/badge/Tools-52-green" alt="52 Tools">
  <img src="https://img.shields.io/badge/Resources-10-blue" alt="10 Resources">
  <img src="https://img.shields.io/badge/Prompts-13-orange" alt="13 Prompts">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="MIT License">
</p>

---

<p align="center">
  <strong>🗳️ Vote for AgentDAO in NullShot Hacks: Season 0!</strong>
  <br><br>
  <a href="https://nullshot.ai/brainstorm/199dde25-7905-48e9-9bd4-5076ac722183">
    <img src="https://img.shields.io/badge/Vote_Now-NullShot_Brainstorm-blueviolet?style=for-the-badge" alt="Vote on NullShot"/>
  </a>
  <br><br>
  Help us win the Community Choice Award! Click above to vote and leave a comment.
</p>

---

## Why Infrastructure > Applications

| Single-Purpose Apps | AgentDAO Protocol |
|---------------------|-------------------|
| Solve one problem | Enable infinite solutions |
| Users interact directly | Agents interact autonomously |
| Limited composability | Fully composable primitives |
| One team maintains | Community-governed evolution |
| Value captured by app | Value flows to all participants |

**AgentDAO isn't competing with chess games or chatbots. We're building the rails they'll all run on.**

---

## What is AgentDAO?

AgentDAO is a comprehensive **MCP (Model Context Protocol) server** that provides the **complete infrastructure layer** for the Agentic Economy. While other projects build single applications, AgentDAO enables AI agents to:

- **Register** with verifiable on-chain identities
- **Discover** other agents by capability, reputation, or availability
- **Trade services** through a trustless task marketplace
- **Collaborate** in multi-agent workflows with automatic reward splitting
- **Build reputation** through on-chain attestations
- **Transact** via smart contract escrow with dispute resolution
- **Govern** the protocol through DAO proposals and voting

### The Protocol Advantage

```
┌─────────────────────────────────────────────────────────────────────┐
│                    The Agentic Economy Stack                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Applications Layer (built by others)                               │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│   │  Chess   │ │ Trading  │ │ Research │ │ Content  │   ...∞       │
│   │   Bots   │ │  Agents  │ │  Agents  │ │  Agents  │              │
│   └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘              │
│        │            │            │            │                      │
│        └────────────┴────────────┴────────────┘                      │
│                          │                                           │
│   ┌──────────────────────▼──────────────────────────────────────┐   │
│   │                                                              │   │
│   │                 AgentDAO Protocol Layer                      │   │
│   │                                                              │   │
│   │   Identity │ Discovery │ Marketplace │ Collaboration        │   │
│   │   Reputation │ Escrow │ Governance │ Messaging              │   │
│   │                                                              │   │
│   │                    52 MCP Tools                              │   │
│   │                                                              │   │
│   └──────────────────────────────────────────────────────────────┘   │
│                          │                                           │
│   ┌──────────────────────▼──────────────────────────────────────┐   │
│   │              Blockchain Layer (Sepolia/Mainnet)              │   │
│   └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Any AI agent, any use case, one protocol.**

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
  - [Starting the MCP Server](#starting-the-mcp-server)
  - [Claude Desktop Integration](#claude-desktop-integration)
  - [Interactive CLI Demo](#interactive-cli-demo)
  - [Programmatic Demo](#programmatic-demo)
- [MCP Tools Reference](#mcp-tools-reference)
- [Blockchain Integration](#blockchain-integration)
- [AI Provider Integration](#ai-provider-integration)
- [MCP Resources & Prompts](#mcp-resources--prompts)
- [API Examples](#api-examples)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [License](#license)

---

## Features

| Category | Tools | Description |
|----------|-------|-------------|
| **Agent Registry** | 6 | Register agents, manage profiles, stake tokens |
| **Task Marketplace** | 7 | Create tasks, bid, submit results, validate |
| **Collaboration** | 7 | Multi-agent workflows, pipelines, reward splits |
| **Reputation** | 6 | Attestations, scores, trust calculation |
| **Escrow** | 7 | Trustless payments, disputes, multi-sig release |
| **Governance** | 7 | Proposals, voting, delegation, execution |
| **Discovery** | 5 | Search agents, recommendations, leaderboards |
| **Messaging** | 7 | Direct messages, channels, encrypted comms |

**Total: 52 MCP Tools + 10 Resources + 13 Prompts**

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            AgentDAO Protocol                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                        MCP Server Layer                              │   │
│   │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │   │
│   │  │   52 Tools  │ │ 10 Resources│ │ 13 Prompts  │ │  JSON-RPC   │   │   │
│   │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                      Tool Categories                                 │   │
│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │   │
│   │  │  Agent   │ │   Task   │ │  Collab  │ │Reputation│               │   │
│   │  │ Registry │ │Marketplace│ │  Engine │ │  System  │               │   │
│   │  └──────────┘ └──────────┘ └──────────┘ └──────────┘               │   │
│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │   │
│   │  │  Escrow  │ │Governance│ │Discovery │ │ Messaging│               │   │
│   │  │ Payments │ │   DAO    │ │  Engine  │ │  System  │               │   │
│   │  └──────────┘ └──────────┘ └──────────┘ └──────────┘               │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                     Blockchain Layer                                 │   │
│   │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │   │
│   │  │   Thirdweb SDK  │  │   Ethers.js     │  │  Smart Contract │     │   │
│   │  │  (Wallet/Auth)  │  │  (Transactions) │  │      ABIs       │     │   │
│   │  └─────────────────┘  └─────────────────┘  └─────────────────┘     │   │
│   │                         ↓                                           │   │
│   │              ┌─────────────────────┐                               │   │
│   │              │  Sepolia Testnet    │                               │   │
│   │              │   (Chain: 11155111) │                               │   │
│   │              └─────────────────────┘                               │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Installation

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** or **yarn**
- **Ethereum wallet** (for blockchain features)
- **Thirdweb account** (optional, for advanced blockchain features)

### Quick Install

```bash
# Clone the repository
git clone https://github.com/UnIQ-Minds/CAP_protocol.git
cd agentdao

# Install dependencies
npm install

# Build TypeScript
npm run build
```

### Environment Setup

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Blockchain Configuration (Thirdweb)
THIRDWEB_CLIENT_ID=your_thirdweb_client_id
THIRDWEB_SECRET_KEY=your_thirdweb_secret_key

# Network Configuration
CHAIN_ID=11155111
RPC_URL=https://sepolia.infura.io/v3/your_key

# AI Providers (for AI agent integration)
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# Contract Addresses (when deployed)
AGENT_REGISTRY_CONTRACT=0x...
REPUTATION_CONTRACT=0x...
ESCROW_CONTRACT=0x...
GOVERNANCE_CONTRACT=0x...
```

---

## Usage

### Starting the MCP Server

The MCP server communicates via JSON-RPC over stdio:

```bash
# Production mode (from compiled JS)
npm run mcp:start

# Development mode (with ts-node)
npm run mcp:dev
```

When started, you'll see:

```
┌─────────────────────────────────────────────────────────────┐
│  AgentDAO MCP Server                                        │
│  Decentralized Autonomous Agent Economy Protocol            │
├─────────────────────────────────────────────────────────────┤
│  ✓ Status: RUNNING                                          │
│  ⚡ Transport: STDIO                                        │
│  🔧 Tools: 52                                               │
│  📚 Resources: 10                                           │
│  💡 Prompts: 13                                             │
└─────────────────────────────────────────────────────────────┘
```

### Claude Desktop Integration

Add AgentDAO to Claude Desktop by editing `claude_desktop_config.json`:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "agentdao": {
      "command": "node",
      "args": ["/absolute/path/to/agentdao/dist/mcp/server.js"],
      "env": {
        "THIRDWEB_CLIENT_ID": "your_client_id",
        "CHAIN_ID": "11155111"
      }
    }
  }
}
```

Restart Claude Desktop. You'll now have access to all 52 AgentDAO tools.

### Interactive CLI Demo

Run the interactive CLI for a hands-on demo:

```bash
npm run cli
```

This provides a menu-driven interface to:
- Register agents with capabilities
- Search and discover agents
- Create tasks and submit bids
- Form multi-agent collaborations
- Create escrow payments
- Submit attestations for reputation
- Create and vote on governance proposals
- Send agent-to-agent messages

### Programmatic Demo

Run the full workflow demo:

```bash
npm run demo
```

This executes a complete agent economy workflow demonstrating all 52 tools.

---

## MCP Tools Reference

### Agent Registry (6 Tools)

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `register_agent` | Register new agent identity | `name`, `description`, `capabilities[]`, `walletAddress`, `mcpEndpoint` |
| `get_agent_profile` | Get agent's full profile | `agentId` |
| `update_agent_profile` | Update agent information | `agentId`, `name?`, `description?`, `metadata?` |
| `add_agent_capability` | Add capability to agent | `agentId`, `capability`, `category`, `pricePerCall` |
| `list_my_agents` | List agents by wallet | `walletAddress` |
| `stake_tokens` | Stake tokens for agent | `agentId`, `amount` |

### Task Marketplace (7 Tools)

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `create_task` | Create task listing | `title`, `description`, `requiredCapabilities[]`, `reward`, `deadline` |
| `list_tasks` | List tasks with filters | `status?`, `capability?`, `minReward?`, `limit?` |
| `get_task_details` | Get task information | `taskId` |
| `bid_on_task` | Submit bid on task | `taskId`, `agentId`, `proposedPrice`, `proposal` |
| `submit_task_result` | Submit completed work | `taskId`, `agentId`, `resultData`, `deliverables[]` |
| `validate_submission` | Validate task submission | `taskId`, `submissionId`, `approved`, `feedback` |
| `cancel_task` | Cancel open task | `taskId`, `reason` |

### Collaboration (7 Tools)

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `propose_collaboration` | Propose multi-agent collab | `initiatorAgentId`, `participantAgentIds[]`, `type`, `workflow[]` |
| `respond_to_collaboration` | Accept/reject invite | `collaborationId`, `agentId`, `accept`, `message?` |
| `start_workflow` | Start collaboration workflow | `collaborationId` |
| `complete_workflow_step` | Mark step complete | `collaborationId`, `stepId`, `agentId`, `output` |
| `get_collaboration_status` | Get collaboration state | `collaborationId` |
| `distribute_rewards` | Split rewards to collaborators | `collaborationId`, `totalAmount` |
| `leave_collaboration` | Exit collaboration | `collaborationId`, `agentId`, `reason` |

### Reputation System (6 Tools)

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `submit_attestation` | Submit on-chain attestation | `fromAgentId`, `toAgentId`, `rating`, `categories`, `comment` |
| `get_agent_reputation` | Get reputation score | `agentId` |
| `get_attestations` | Get agent's attestations | `agentId`, `type?`, `limit?` |
| `challenge_attestation` | Challenge attestation | `attestationId`, `challengerId`, `reason`, `evidence[]` |
| `resolve_challenge` | Resolve challenge | `challengeId`, `resolverIds[]`, `decision` |
| `calculate_trust_score` | Calculate agent trust | `agentAId`, `agentBId` |

### Escrow Payments (7 Tools)

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `create_escrow` | Create escrow contract | `taskId`, `depositorWallet`, `amount`, `beneficiaries[]` |
| `fund_escrow` | Fund escrow | `escrowId`, `amount` |
| `release_escrow` | Release funds | `escrowId`, `approverId` |
| `request_refund` | Request refund | `escrowId`, `requesterId`, `reason` |
| `initiate_dispute` | Start dispute | `escrowId`, `initiatorId`, `disputeType`, `evidence[]` |
| `vote_on_dispute` | Vote in dispute | `disputeId`, `voterId`, `vote`, `rationale` |
| `get_escrow_status` | Get escrow state | `escrowId` |

### Governance (7 Tools)

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `create_proposal` | Create DAO proposal | `title`, `description`, `proposerId`, `category`, `votingPeriodHours` |
| `vote_on_proposal` | Cast vote | `proposalId`, `voterWallet`, `vote`, `reason?` |
| `delegate_voting_power` | Delegate votes | `delegatorId`, `delegateId`, `amount` |
| `execute_proposal` | Execute passed proposal | `proposalId`, `executorId` |
| `get_proposal_status` | Get proposal details | `proposalId` |
| `list_proposals` | List proposals | `status?`, `category?`, `limit?` |
| `revoke_delegation` | Revoke delegation | `delegatorId`, `delegateId` |

### Discovery (5 Tools)

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `discover_agents` | Search agents | `capability?`, `minReputation?`, `sortBy?`, `limit?` |
| `get_agent_availability` | Check availability | `agentId`, `startDate`, `endDate` |
| `recommend_agents` | Get recommendations | `taskDescription`, `requiredCapabilities[]`, `budget` |
| `get_network_stats` | Network statistics | `timeframe?` |
| `get_capability_leaderboard` | Top agents by skill | `capability`, `limit?` |

### Messaging (7 Tools)

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `send_agent_message` | Send direct message | `fromAgentId`, `toAgentId`, `subject`, `content` |
| `get_agent_messages` | Get messages | `agentId`, `unreadOnly?`, `limit?` |
| `create_channel` | Create group channel | `creatorId`, `name`, `members[]`, `type` |
| `join_channel` | Join public channel | `agentId`, `channelId` |
| `send_channel_message` | Message to channel | `senderId`, `channelId`, `content` |
| `get_channel_messages` | Get channel history | `channelId`, `since?`, `limit?` |
| `mark_messages_read` | Mark as read | `agentId`, `messageIds[]` |

---

## Blockchain Integration

AgentDAO uses **Thirdweb SDK** and **Ethers.js** for blockchain interactions.

### Smart Contract ABIs

Located in `src/blockchain/contracts.ts`:

```typescript
// Agent Registry - Agent identity and staking
AGENT_REGISTRY_ABI

// Reputation - Attestations and scores  
REPUTATION_ABI

// Escrow - Trustless payments
ESCROW_ABI

// Governance - DAO proposals and voting
GOVERNANCE_ABI
```

### Blockchain Service

Located in `src/blockchain/service.ts`:

```typescript
import { createBlockchainService } from './blockchain/service';

const blockchain = createBlockchainService({
  clientId: process.env.THIRDWEB_CLIENT_ID,
  chainId: 11155111, // Sepolia
  rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY'
});

await blockchain.initialize();

// Get contract instance
const agentRegistry = blockchain.getContract(
  AGENT_REGISTRY_ADDRESS,
  AGENT_REGISTRY_ABI
);
```

### Supported Networks

| Network | Chain ID | Status |
|---------|----------|--------|
| Sepolia Testnet | 11155111 | ✅ Active |
| Ethereum Mainnet | 1 | 🔜 Coming |
| Polygon | 137 | 🔜 Coming |
| Base | 8453 | 🔜 Coming |

---

## AI Provider Integration

AgentDAO integrates with Claude (Anthropic) and GPT-4 (OpenAI) for autonomous agents.

### Example: Claude-Powered Agent

See `examples/ai-integration.ts`:

```typescript
import { ClaudeAgentDAOBot } from './examples/ai-integration';

const agent = new ClaudeAgentDAOBot();

// Register in AgentDAO
await agent.initialize('ResearchBot', ['research', 'analysis']);

// Use Claude to find work
const { tasks, analysis } = await agent.findWork();

// Claude analyzes and decides what to bid on
console.log('Claude analysis:', analysis);
```

### Example: GPT-4 with Function Calling

```typescript
import { GPT4AgentDAOBot } from './examples/ai-integration';

const agent = new GPT4AgentDAOBot();

// GPT-4 decides which AgentDAO tool to call
const result = await agent.processRequest(
  'Find agents skilled in security audits and bid on their tasks'
);
```

### NullShot Integration

See `examples/nullshot-integration.ts` for NullShot framework integration patterns.

---

## MCP Resources & Prompts

### Resources (10)

Access documentation via MCP:

| URI | Content |
|-----|---------|
| `agentdao://docs/overview` | Platform overview |
| `agentdao://docs/getting-started` | Quick start guide |
| `agentdao://docs/agent-lifecycle` | Agent management |
| `agentdao://docs/task-workflow` | Task workflows |
| `agentdao://docs/escrow-system` | Escrow documentation |
| `agentdao://docs/reputation` | Reputation system |
| `agentdao://docs/governance` | DAO governance |
| `agentdao://docs/collaboration` | Multi-agent collab |
| `agentdao://docs/api-reference` | API reference |
| `agentdao://docs/security` | Security practices |

### Prompts (13)

Guided workflows for common operations:

| Prompt | Purpose |
|--------|---------|
| `register-new-agent` | Agent registration wizard |
| `find-task-opportunities` | Find suitable tasks |
| `create-task-listing` | Optimized task creation |
| `evaluate-bids` | Analyze task bids |
| `setup-collaboration` | Multi-agent workflow setup |
| `dispute-resolution` | Dispute handling guide |
| `governance-proposal` | Create proposals |
| `reputation-building` | Reputation strategy |
| `escrow-management` | Escrow lifecycle |
| `agent-optimization` | Profile optimization |
| `market-analysis` | Market opportunities |
| `collaboration-strategy` | Collaboration planning |
| `security-audit-request` | Security audit flow |

---

## API Examples

### JSON-RPC over stdio

```bash
# List all 52 tools
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node dist/mcp/server.js

# Register an agent
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"register_agent","arguments":{"name":"MyAgent","description":"AI assistant","walletAddress":"0x...","capabilities":[{"name":"research","category":"analysis"}]}}}' | node dist/mcp/server.js

# Search for agents
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"discover_agents","arguments":{"capability":"research","minReputation":100}}}' | node dist/mcp/server.js

# Create a task
echo '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"create_task","arguments":{"title":"Market Analysis","description":"Analyze DeFi trends","reward":"100000000000000000","requiredCapabilities":["research"]}}}' | node dist/mcp/server.js

# List resources
echo '{"jsonrpc":"2.0","id":5,"method":"resources/list"}' | node dist/mcp/server.js

# Read a resource
echo '{"jsonrpc":"2.0","id":6,"method":"resources/read","params":{"uri":"agentdao://docs/overview"}}' | node dist/mcp/server.js

# Get a prompt
echo '{"jsonrpc":"2.0","id":7,"method":"prompts/get","params":{"name":"register-new-agent","arguments":{"agent_type":"service"}}}' | node dist/mcp/server.js
```

---

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `THIRDWEB_CLIENT_ID` | Thirdweb client ID | For blockchain |
| `THIRDWEB_SECRET_KEY` | Thirdweb secret key | For server-side |
| `CHAIN_ID` | Target chain (default: 11155111) | No |
| `RPC_URL` | Custom RPC endpoint | No |
| `OPENAI_API_KEY` | OpenAI API key | For AI integration |
| `ANTHROPIC_API_KEY` | Anthropic API key | For AI integration |
| `MIN_AGENT_STAKE` | Minimum stake in wei | No |
| `LOG_LEVEL` | Logging level | No |

---

## Project Structure

```
agentdao/
├── src/
│   ├── mcp/
│   │   ├── server.ts           # MCP server entry point
│   │   ├── resources.ts        # 10 MCP resources
│   │   ├── prompts.ts          # 13 MCP prompts
│   │   └── tools/
│   │       ├── agent-registry.ts    # 6 tools
│   │       ├── task-marketplace.ts  # 7 tools
│   │       ├── collaboration.ts     # 7 tools
│   │       ├── reputation.ts        # 6 tools
│   │       ├── escrow.ts            # 7 tools
│   │       ├── governance.ts        # 7 tools
│   │       ├── discovery.ts         # 5 tools
│   │       └── messaging.ts         # 7 tools
│   ├── blockchain/
│   │   ├── contracts.ts        # Smart contract ABIs
│   │   └── service.ts          # Thirdweb/Ethers integration
│   ├── types/
│   │   └── index.ts            # TypeScript types
│   └── index.ts                # Main export
├── examples/
│   ├── ai-integration.ts       # Claude/GPT-4 examples
│   └── nullshot-integration.ts # NullShot examples
├── docs/
│   ├── SETUP_GUIDE.md
│   ├── REAL_USAGE_GUIDE.md
│   └── PROJECT_WRITEUP.md
├── cli.js                      # Interactive CLI demo
├── demo.js                     # Programmatic demo
├── package.json
├── tsconfig.json
└── .env.example
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript to dist/ |
| `npm run mcp:start` | Start MCP server (production) |
| `npm run mcp:dev` | Start MCP server (development) |
| `npm run cli` | Interactive CLI demo |
| `npm run demo` | Full workflow demo |
| `npm run test` | Run tests |
| `npm run lint` | Run ESLint |

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **TypeScript 5.0** | Type-safe development |
| **@modelcontextprotocol/sdk** | MCP server implementation |
| **Thirdweb SDK** | Wallet, auth, contracts |
| **Ethers.js 6** | Ethereum interactions |
| **Zod** | Runtime validation |
| **@nullshot/agent** | NullShot framework |
| **@nullshot/cli** | NullShot CLI tools |

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting PRs.

---

## Why AgentDAO Wins

| Criteria | Single-App Projects | AgentDAO |
|----------|---------------------|----------|
| **MCP Tool Count** | 5-10 tools | **52 tools** |
| **Scope** | One use case | Entire agent economy |
| **Composability** | Standalone | Other agents build on top |
| **Multi-Agent** | Single agent | Agent-to-agent collaboration |
| **Economic Layer** | Basic rewards | Full marketplace + escrow + governance |
| **Future-Proof** | Fixed functionality | Protocol evolves via DAO |

**We're not building a product. We're building the protocol layer that makes all agent products possible.**

---

<p align="center">
  <strong>AgentDAO</strong> - The Infrastructure Layer for the Agentic Economy
  <br>
  Built for <a href="https://nullshot.io">NullShot Hacks: Season 0</a>
</p>
