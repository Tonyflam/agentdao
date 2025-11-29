/**
 * AgentDAO - Discovery Tools
 * 
 * MCP tools for discovering and searching for agents and capabilities
 */

import { v4 as uuidv4 } from 'uuid';
import { MCPContext } from '../../types';
import { agentStore } from './agent-registry';

export const discoveryTools = [
  {
    name: 'discover_agents',
    description: `Discover AI agents in the AgentDAO network. Search by capabilities, reputation, price range, or specialization. This is the primary way for agents to find collaborators or for tasks to be matched with suitable agents.`,
    inputSchema: {
      type: 'object',
      properties: {
        capabilities: {
          type: 'array',
          items: { type: 'string' },
          description: 'Required capability categories (e.g., ["analysis", "trading"])',
        },
        minReputation: {
          type: 'number',
          description: 'Minimum reputation score (0-1000)',
        },
        maxPricePerCall: {
          type: 'string',
          description: 'Maximum price per call in wei',
        },
        status: {
          type: 'string',
          enum: ['active', 'inactive', 'all'],
          description: 'Filter by agent status',
        },
        searchText: {
          type: 'string',
          description: 'Free text search in agent names and descriptions',
        },
        sortBy: {
          type: 'string',
          enum: ['reputation', 'price', 'tasks_completed', 'earnings'],
          description: 'How to sort results',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results',
        },
      },
    },
    handler: async (input: any, context: MCPContext) => {
      let agents = Array.from(agentStore.values());
      
      // Filter by status
      if (input.status && input.status !== 'all') {
        agents = agents.filter(a => a.status === input.status);
      } else if (!input.status) {
        agents = agents.filter(a => a.status === 'active');
      }
      
      // Filter by capabilities
      if (input.capabilities?.length) {
        agents = agents.filter(a => 
          input.capabilities.some((cap: string) => 
            a.capabilities.some(c => c.category === cap || c.name.toLowerCase().includes(cap.toLowerCase()))
          )
        );
      }
      
      // Filter by minimum reputation
      if (input.minReputation !== undefined) {
        agents = agents.filter(a => a.reputation.score >= input.minReputation);
      }
      
      // Filter by max price
      if (input.maxPricePerCall) {
        const maxPrice = BigInt(input.maxPricePerCall);
        agents = agents.filter(a => 
          a.capabilities.some(c => BigInt(c.pricePerCall) <= maxPrice)
        );
      }
      
      // Search text
      if (input.searchText) {
        const search = input.searchText.toLowerCase();
        agents = agents.filter(a => 
          a.name.toLowerCase().includes(search) ||
          a.description.toLowerCase().includes(search) ||
          a.capabilities.some(c => 
            c.name.toLowerCase().includes(search) ||
            c.description.toLowerCase().includes(search)
          )
        );
      }
      
      // Sort
      switch (input.sortBy) {
        case 'reputation':
          agents.sort((a, b) => b.reputation.score - a.reputation.score);
          break;
        case 'price':
          agents.sort((a, b) => {
            const aMin = Math.min(...a.capabilities.map(c => Number(c.pricePerCall)));
            const bMin = Math.min(...b.capabilities.map(c => Number(c.pricePerCall)));
            return aMin - bMin;
          });
          break;
        case 'tasks_completed':
          agents.sort((a, b) => b.reputation.totalTasks - a.reputation.totalTasks);
          break;
        case 'earnings':
          agents.sort((a, b) => 
            Number(BigInt(b.reputation.totalEarnings) - BigInt(a.reputation.totalEarnings))
          );
          break;
        default:
          agents.sort((a, b) => b.reputation.score - a.reputation.score);
      }
      
      // Limit
      const limit = input.limit || 20;
      agents = agents.slice(0, limit);
      
      return {
        success: true,
        data: {
          agents: agents.map(a => ({
            agentId: a.agentId,
            name: a.name,
            description: a.description.slice(0, 200) + (a.description.length > 200 ? '...' : ''),
            walletAddress: a.walletAddress,
            reputation: {
              score: a.reputation.score,
              totalTasks: a.reputation.totalTasks,
              successRate: a.reputation.totalTasks > 0
                ? Math.round((a.reputation.successfulTasks / a.reputation.totalTasks) * 100)
                : 0,
            },
            capabilities: a.capabilities.map(c => ({
              name: c.name,
              category: c.category,
              pricePerCall: c.pricePerCall,
            })),
            mcpEndpoint: a.mcpEndpoint,
            status: a.status,
          })),
          totalFound: agents.length,
          filters: {
            capabilities: input.capabilities,
            minReputation: input.minReputation,
            maxPricePerCall: input.maxPricePerCall,
            status: input.status,
            searchText: input.searchText,
          },
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'search_capabilities',
    description: 'Search for specific capabilities across all agents in the network.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for capability name or description',
        },
        category: {
          type: 'string',
          enum: ['analysis', 'trading', 'research', 'content', 'coding', 'security', 'data', 'automation', 'communication', 'custom'],
          description: 'Filter by category',
        },
        maxPrice: {
          type: 'string',
          description: 'Maximum price per call in wei',
        },
        limit: {
          type: 'number',
          description: 'Maximum results',
        },
      },
    },
    handler: async (input: any, context: MCPContext) => {
      const results: Array<{
        capability: any;
        agent: { agentId: string; name: string; reputation: number; walletAddress: string };
      }> = [];
      
      const agents = Array.from(agentStore.values()).filter(a => a.status === 'active');
      
      for (const agent of agents) {
        for (const cap of agent.capabilities) {
          let matches = true;
          
          if (input.query) {
            const query = input.query.toLowerCase();
            matches = cap.name.toLowerCase().includes(query) ||
              cap.description.toLowerCase().includes(query);
          }
          
          if (matches && input.category) {
            matches = cap.category === input.category;
          }
          
          if (matches && input.maxPrice) {
            matches = BigInt(cap.pricePerCall) <= BigInt(input.maxPrice);
          }
          
          if (matches) {
            results.push({
              capability: {
                id: cap.id,
                name: cap.name,
                description: cap.description,
                category: cap.category,
                pricePerCall: cap.pricePerCall,
                inputSchema: cap.inputSchema,
                outputSchema: cap.outputSchema,
              },
              agent: {
                agentId: agent.agentId,
                name: agent.name,
                reputation: agent.reputation.score,
                walletAddress: agent.walletAddress,
              },
            });
          }
        }
      }
      
      // Sort by agent reputation
      results.sort((a, b) => b.agent.reputation - a.agent.reputation);
      
      // Limit
      const limit = input.limit || 50;
      const limited = results.slice(0, limit);
      
      return {
        success: true,
        data: {
          capabilities: limited,
          totalFound: results.length,
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'get_network_stats',
    description: 'Get overall statistics about the AgentDAO network.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    handler: async (input: any, context: MCPContext) => {
      const agents = Array.from(agentStore.values());
      const activeAgents = agents.filter(a => a.status === 'active');
      
      const totalEarnings = agents.reduce(
        (sum, a) => sum + BigInt(a.reputation.totalEarnings),
        BigInt(0)
      );
      
      const totalStaked = agents.reduce(
        (sum, a) => sum + BigInt(a.reputation.totalStake),
        BigInt(0)
      );
      
      const totalTasks = agents.reduce(
        (sum, a) => sum + a.reputation.totalTasks,
        0
      );
      
      const totalSuccessful = agents.reduce(
        (sum, a) => sum + a.reputation.successfulTasks,
        0
      );
      
      const totalCapabilities = agents.reduce(
        (sum, a) => sum + a.capabilities.length,
        0
      );
      
      const avgReputation = agents.length > 0
        ? Math.round(agents.reduce((sum, a) => sum + a.reputation.score, 0) / agents.length)
        : 0;
      
      // Category distribution
      const categoryCount: Record<string, number> = {};
      agents.forEach(a => {
        a.capabilities.forEach(c => {
          categoryCount[c.category] = (categoryCount[c.category] || 0) + 1;
        });
      });
      
      return {
        success: true,
        data: {
          network: {
            totalAgents: agents.length,
            activeAgents: activeAgents.length,
            totalCapabilities,
            averageReputation: avgReputation,
          },
          economics: {
            totalEarnings: totalEarnings.toString(),
            totalEarningsFormatted: `${(Number(totalEarnings) / 1e18).toFixed(4)} ETH`,
            totalStaked: totalStaked.toString(),
            totalStakedFormatted: `${(Number(totalStaked) / 1e18).toFixed(4)} ETH`,
          },
          tasks: {
            totalTasks,
            successfulTasks: totalSuccessful,
            successRate: totalTasks > 0 ? Math.round((totalSuccessful / totalTasks) * 100) : 0,
          },
          categoryDistribution: categoryCount,
          topCategories: Object.entries(categoryCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([category, count]) => ({ category, count })),
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'find_best_agent_for_task',
    description: 'Find the best matching agent for a specific task based on capabilities, reputation, price, and availability.',
    inputSchema: {
      type: 'object',
      properties: {
        taskDescription: {
          type: 'string',
          description: 'Description of the task to be done',
        },
        requiredCapabilities: {
          type: 'array',
          items: { type: 'string' },
          description: 'Required capability categories',
        },
        budget: {
          type: 'string',
          description: 'Maximum budget in wei',
        },
        prioritize: {
          type: 'string',
          enum: ['reputation', 'price', 'speed'],
          description: 'What to prioritize in matching',
        },
      },
      required: ['taskDescription'],
    },
    handler: async (input: any, context: MCPContext) => {
      let agents = Array.from(agentStore.values())
        .filter(a => a.status === 'active');
      
      // Filter by capabilities if specified
      if (input.requiredCapabilities?.length) {
        agents = agents.filter(a => 
          input.requiredCapabilities.every((cap: string) => 
            a.capabilities.some(c => 
              c.category === cap || 
              c.name.toLowerCase().includes(cap.toLowerCase())
            )
          )
        );
      }
      
      // Filter by budget
      if (input.budget) {
        const budget = BigInt(input.budget);
        agents = agents.filter(a => 
          a.capabilities.some(c => BigInt(c.pricePerCall) <= budget)
        );
      }
      
      // Score agents
      const scoredAgents = agents.map(a => {
        let score = 0;
        
        // Reputation score (0-40 points)
        score += (a.reputation.score / 1000) * 40;
        
        // Success rate (0-30 points)
        if (a.reputation.totalTasks > 0) {
          score += (a.reputation.successfulTasks / a.reputation.totalTasks) * 30;
        }
        
        // Capability match (0-20 points)
        const keywords = input.taskDescription.toLowerCase().split(' ');
        const matchingCaps = a.capabilities.filter(c =>
          keywords.some((kw: string) => 
            c.name.toLowerCase().includes(kw) ||
            c.description.toLowerCase().includes(kw)
          )
        ).length;
        score += Math.min(matchingCaps * 5, 20);
        
        // Price score (0-10 points) - lower is better
        if (input.budget) {
          const avgPrice = a.capabilities.reduce(
            (sum, c) => sum + Number(c.pricePerCall),
            0
          ) / a.capabilities.length;
          const priceRatio = avgPrice / Number(input.budget);
          score += (1 - Math.min(priceRatio, 1)) * 10;
        } else {
          score += 5;
        }
        
        return { agent: a, score };
      });
      
      // Sort by priority
      if (input.prioritize === 'price') {
        scoredAgents.sort((a, b) => {
          const aPrice = Math.min(...a.agent.capabilities.map(c => Number(c.pricePerCall)));
          const bPrice = Math.min(...b.agent.capabilities.map(c => Number(c.pricePerCall)));
          return aPrice - bPrice;
        });
      } else {
        scoredAgents.sort((a, b) => b.score - a.score);
      }
      
      const bestMatch = scoredAgents[0];
      const alternatives = scoredAgents.slice(1, 4);
      
      if (!bestMatch) {
        return {
          success: true,
          data: {
            found: false,
            message: 'No agents found matching the criteria',
            suggestion: 'Try broadening your search or adjusting the budget',
          },
          meta: {
            requestId: context.requestId,
            timestamp: context.timestamp,
          },
        };
      }
      
      return {
        success: true,
        data: {
          found: true,
          bestMatch: {
            agentId: bestMatch.agent.agentId,
            name: bestMatch.agent.name,
            description: bestMatch.agent.description,
            matchScore: Math.round(bestMatch.score),
            reputation: bestMatch.agent.reputation.score,
            successRate: bestMatch.agent.reputation.totalTasks > 0
              ? Math.round((bestMatch.agent.reputation.successfulTasks / bestMatch.agent.reputation.totalTasks) * 100)
              : 0,
            relevantCapabilities: bestMatch.agent.capabilities.slice(0, 3).map(c => ({
              name: c.name,
              category: c.category,
              price: c.pricePerCall,
            })),
            mcpEndpoint: bestMatch.agent.mcpEndpoint,
            walletAddress: bestMatch.agent.walletAddress,
          },
          alternatives: alternatives.map(a => ({
            agentId: a.agent.agentId,
            name: a.agent.name,
            matchScore: Math.round(a.score),
            reputation: a.agent.reputation.score,
          })),
          totalCandidates: scoredAgents.length,
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'get_capability_categories',
    description: 'Get all available capability categories and their descriptions.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    handler: async (input: any, context: MCPContext) => {
      const categories = [
        {
          id: 'analysis',
          name: 'Analysis',
          description: 'Data analysis, market analysis, blockchain analysis, pattern recognition',
          examples: ['Token analysis', 'Whale tracking', 'Sentiment analysis'],
        },
        {
          id: 'trading',
          name: 'Trading',
          description: 'DEX trading, arbitrage, portfolio management, order execution',
          examples: ['Token swaps', 'Limit orders', 'DCA strategies'],
        },
        {
          id: 'research',
          name: 'Research',
          description: 'Web research, document analysis, fact-checking, summarization',
          examples: ['Project research', 'Whitepaper analysis', 'News aggregation'],
        },
        {
          id: 'content',
          name: 'Content',
          description: 'Content creation, writing, translation, formatting',
          examples: ['Report writing', 'Social posts', 'Documentation'],
        },
        {
          id: 'coding',
          name: 'Coding',
          description: 'Smart contract development, code review, debugging, automation',
          examples: ['Contract audits', 'Script writing', 'Integration'],
        },
        {
          id: 'security',
          name: 'Security',
          description: 'Security audits, vulnerability detection, monitoring',
          examples: ['Contract audits', 'Rug detection', 'Risk assessment'],
        },
        {
          id: 'data',
          name: 'Data',
          description: 'Data collection, processing, storage, retrieval',
          examples: ['Price feeds', 'On-chain data', 'API aggregation'],
        },
        {
          id: 'automation',
          name: 'Automation',
          description: 'Task automation, scheduling, workflow orchestration',
          examples: ['Auto-trading', 'Notifications', 'Batch operations'],
        },
        {
          id: 'communication',
          name: 'Communication',
          description: 'Messaging, notifications, social media management',
          examples: ['Telegram bots', 'Discord integration', 'Alerts'],
        },
        {
          id: 'custom',
          name: 'Custom',
          description: 'Custom capabilities that don\'t fit other categories',
          examples: ['Specialized tools', 'Unique integrations'],
        },
      ];
      
      // Get counts from agents
      const agents = Array.from(agentStore.values());
      const categoryCounts = categories.map(cat => {
        const count = agents.reduce(
          (sum, a) => sum + a.capabilities.filter(c => c.category === cat.id).length,
          0
        );
        const agentCount = agents.filter(
          a => a.capabilities.some(c => c.category === cat.id)
        ).length;
        return {
          ...cat,
          capabilityCount: count,
          agentCount,
        };
      });
      
      return {
        success: true,
        data: {
          categories: categoryCounts,
          totalCategories: categories.length,
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
];
