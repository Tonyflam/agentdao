/**
 * AgentDAO MCP Prompts
 * Pre-configured AI prompts for common workflows
 */

export const prompts = [
  // Core Agent Economy Prompts
  {
    name: 'register_new_agent',
    description: 'Guide for registering a new AI agent in the AgentDAO network',
    arguments: [
      { name: 'agentName', description: 'Name for your agent', required: true },
      { name: 'capabilities', description: 'Comma-separated list of capabilities', required: true },
      { name: 'walletAddress', description: 'Ethereum wallet address', required: true }
    ],
    template: `You are helping a user register a new AI agent in AgentDAO.

Agent Details:
- Name: {{agentName}}
- Capabilities: {{capabilities}}
- Wallet: {{walletAddress}}

Steps to complete:
1. Use register_agent to create the agent with the provided details
2. Set appropriate pricing for each capability (suggest reasonable wei amounts)
3. Recommend a stake amount based on the agent's intended activity level
4. After registration, use get_agent_profile to verify the registration
5. Suggest next steps: discover similar agents, create first task, or join collaborations

Provide clear explanations for each step and confirm successful registration.`
  },
  {
    name: 'find_agents_for_task',
    description: 'Find the best agents for a specific task',
    arguments: [
      { name: 'taskDescription', description: 'What needs to be done', required: true },
      { name: 'budget', description: 'Budget in ETH', required: false },
      { name: 'capabilities', description: 'Required capabilities', required: true }
    ],
    template: `You are helping find the best agents for a task.

Task: {{taskDescription}}
Required Capabilities: {{capabilities}}
Budget: {{budget}} ETH

Steps:
1. Use discover_agents to search for agents with the required capabilities
2. Filter by reputation (minimum 500 recommended)
3. Compare pricing against the budget
4. Use find_best_agent_for_task for AI-recommended matches
5. Present top 3-5 candidates with their:
   - Reputation scores
   - Pricing
   - Relevant capabilities
   - Recent activity
6. Recommend the best match with reasoning`
  },
  {
    name: 'create_collaborative_task',
    description: 'Create a multi-agent collaborative task',
    arguments: [
      { name: 'taskTitle', description: 'Task title', required: true },
      { name: 'taskDescription', description: 'Detailed description', required: true },
      { name: 'collaborationType', description: 'pipeline/parallel/consensus', required: true },
      { name: 'reward', description: 'Total reward in ETH', required: true }
    ],
    template: `You are helping create a collaborative multi-agent task.

Task: {{taskTitle}}
Description: {{taskDescription}}
Collaboration Type: {{collaborationType}}
Reward: {{reward}} ETH

Steps:
1. Analyze the task to identify required capabilities
2. Use create_task with appropriate collaboration settings
3. Automatically create escrow for the reward amount
4. Search for suitable agents using discover_agents
5. If pipeline type, design the workflow sequence
6. Create collaboration proposal using propose_collaboration
7. Set up reward split based on work distribution
8. Monitor with get_collaboration_status

Provide the complete workflow setup with all parameters.`
  },
  {
    name: 'check_agent_reputation',
    description: 'Comprehensive reputation check for an agent',
    arguments: [
      { name: 'agentId', description: 'Agent ID to check', required: true }
    ],
    template: `You are performing a comprehensive reputation check.

Agent ID: {{agentId}}

Analysis Steps:
1. Use get_agent_reputation for overall scores
2. Use list_agent_attestations to see detailed feedback
3. Check recent task completions
4. Analyze rating trends over time
5. Compare to network averages using get_network_stats
6. Check for any disputed attestations

Provide:
- Overall trust assessment (Low/Medium/High/Very High)
- Strengths identified from attestations
- Any concerns or red flags
- Recommendation for collaboration
- Suggested caution level for high-value tasks`
  },
  {
    name: 'setup_escrow_payment',
    description: 'Set up secure escrow payment for a task',
    arguments: [
      { name: 'taskId', description: 'Task ID', required: true },
      { name: 'amount', description: 'Payment amount in ETH', required: true },
      { name: 'beneficiaries', description: 'Comma-separated wallet addresses', required: true }
    ],
    template: `You are setting up secure escrow payment.

Task: {{taskId}}
Amount: {{amount}} ETH
Beneficiaries: {{beneficiaries}}

Setup Steps:
1. Verify the task exists with get_task_details
2. Parse beneficiaries and calculate fair splits
3. Use create_escrow with:
   - Total amount in wei
   - Beneficiary addresses with share percentages
   - Appropriate release conditions (validator or automatic)
   - Reasonable expiration time
4. Add validators if needed using add_validator
5. Confirm escrow creation with get_escrow_status
6. Provide escrow ID to all parties

Security Checklist:
- [ ] Beneficiary addresses verified
- [ ] Amount matches agreed terms
- [ ] Release conditions are fair
- [ ] Expiration allows sufficient time`
  },
  {
    name: 'submit_work_and_claim',
    description: 'Submit completed work and claim payment',
    arguments: [
      { name: 'taskId', description: 'Task ID', required: true },
      { name: 'agentId', description: 'Your agent ID', required: true },
      { name: 'resultSummary', description: 'Summary of completed work', required: true }
    ],
    template: `You are submitting completed work and claiming payment.

Task: {{taskId}}
Agent: {{agentId}}
Work Summary: {{resultSummary}}

Submission Process:
1. Get task details with get_task_details
2. Submit results using submit_task_result with:
   - Comprehensive result data
   - Any deliverable links/hashes
   - Completion timestamp
3. Request verification from task creator
4. Once verified, check escrow status
5. If validator approval needed, notify validators
6. Track release with get_escrow_status
7. After payment, request attestation from task creator

Follow-up:
- Update your agent profile with completed task
- Your reputation will update automatically
- Consider submitting attestation for collaborators`
  },
  {
    name: 'create_governance_proposal',
    description: 'Create a DAO governance proposal',
    arguments: [
      { name: 'title', description: 'Proposal title', required: true },
      { name: 'description', description: 'Detailed proposal description', required: true },
      { name: 'category', description: 'fee_adjustment/parameter_change/agent_suspension', required: true }
    ],
    template: `You are creating a governance proposal.

Title: {{title}}
Description: {{description}}
Category: {{category}}

Proposal Creation:
1. Check existing proposals with list_proposals to avoid duplicates
2. Verify your wallet has voting power
3. Use create_proposal with:
   - Clear, actionable title
   - Detailed description with rationale
   - Specific actions to execute
   - Appropriate voting duration (3-7 days recommended)
   - Realistic quorum requirement
4. After creation, monitor with get_proposal

Best Practices:
- Provide clear reasoning for the change
- Include impact analysis
- Suggest implementation timeline
- Address potential concerns proactively

Promotion:
- Use broadcast_message to notify stakeholders
- Engage with the community
- Respond to questions and feedback`
  },
  {
    name: 'vote_on_proposals',
    description: 'Review and vote on active governance proposals',
    arguments: [
      { name: 'walletAddress', description: 'Your voting wallet', required: true }
    ],
    template: `You are reviewing and voting on governance proposals.

Voter Wallet: {{walletAddress}}

Voting Process:
1. Use list_proposals with status "active" to see current proposals
2. For each proposal, analyze:
   - What changes would it make?
   - Who benefits/is affected?
   - What are the risks?
   - Is the proposer reputable?
3. Use vote_on_proposal for each decision:
   - "for" if you support it
   - "against" if you oppose it
   - "abstain" if you're neutral but want quorum
4. Include reasoning for transparency
5. Check vote confirmation with get_proposal

Voting Considerations:
- Protocol health and sustainability
- Impact on agent ecosystem
- Precedent being set
- Community sentiment`
  },
  {
    name: 'network_health_check',
    description: 'Comprehensive health check of the AgentDAO network',
    arguments: [],
    template: `You are performing a network health check.

Analysis Areas:
1. Use get_network_stats for overall metrics
2. Check active task volume with list_tasks
3. Review reputation leaderboard with get_reputation_leaderboard
4. Check governance activity with list_proposals
5. Sample agent discovery to test search functionality

Report Sections:
- **Network Activity**: Tasks, agents, transactions
- **Economic Health**: TVL, escrow volume, average rewards
- **Governance**: Active proposals, participation rate
- **Quality**: Average reputation scores, dispute rate
- **Growth**: New agent registrations, capability expansion

Recommendations:
- Identify any concerning trends
- Suggest improvements
- Highlight successful patterns`
  },
  {
    name: 'onboard_new_user',
    description: 'Complete onboarding flow for a new AgentDAO user',
    arguments: [
      { name: 'userType', description: 'agent_owner/task_creator/both', required: true },
      { name: 'interests', description: 'What they want to do', required: true }
    ],
    template: `You are onboarding a new user to AgentDAO.

User Type: {{userType}}
Interests: {{interests}}

Onboarding Flow:

**For Agent Owners:**
1. Explain the agent economy concept
2. Help register their first agent
3. Guide capability selection and pricing
4. Recommend initial stake amount
5. Show how to discover other agents
6. Explain reputation building

**For Task Creators:**
1. Explain task marketplace
2. Help create first task
3. Guide escrow setup
4. Show agent discovery
5. Explain validation process
6. Walk through payment flow

**For Both:**
1. Explain governance participation
2. Show messaging system
3. Demonstrate collaboration features
4. Provide resource links for deeper learning

End with:
- Summary of what they can now do
- Suggested next actions
- How to get help`
  },
  // Quick Action Prompts
  {
    name: 'quick_agent_search',
    description: 'Quick search for agents with specific capabilities',
    arguments: [
      { name: 'capability', description: 'Capability to search for', required: true }
    ],
    template: `Search for agents with {{capability}} capability.

Use discover_agents with:
- capabilities: ["{{capability}}"]
- minReputation: 100
- sortBy: "reputation"
- limit: 5

Present results as a ranked list with key metrics.`
  },
  {
    name: 'quick_task_status',
    description: 'Quick status check for a task',
    arguments: [
      { name: 'taskId', description: 'Task ID to check', required: true }
    ],
    template: `Check status of task {{taskId}}.

Steps:
1. get_task_details for current state
2. Check associated escrow if exists
3. Check collaboration status if multi-agent
4. Summarize: Status, Progress, Next Steps`
  },
  {
    name: 'quick_reputation_check',
    description: 'Quick reputation lookup',
    arguments: [
      { name: 'agentId', description: 'Agent to check', required: true }
    ],
    template: `Quick reputation check for {{agentId}}.

Use get_agent_reputation and provide:
- Overall score
- Trust level (Low/Medium/High)
- Number of attestations
- Quick recommendation`
  }
];

export function getPrompt(name: string) {
  return prompts.find(p => p.name === name);
}

export function listPrompts() {
  return prompts.map(p => ({
    name: p.name,
    description: p.description,
    arguments: p.arguments
  }));
}

export function renderPrompt(name: string, args: Record<string, string>) {
  const prompt = getPrompt(name);
  if (!prompt) return null;
  
  let rendered = prompt.template;
  for (const [key, value] of Object.entries(args)) {
    rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return rendered;
}

// Aliases for server.ts imports
export const agentDAOPrompts = prompts;

export function getPromptDetails(name: string, args: Record<string, string>): {
  messages: Array<{ role: string; content: { type: string; text: string } }>;
} | null {
  const prompt = getPrompt(name);
  if (!prompt) return null;
  
  let rendered = prompt.template;
  for (const [key, value] of Object.entries(args)) {
    rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), value || `[${key}]`);
  }
  
  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: rendered
        }
      }
    ]
  };
}
