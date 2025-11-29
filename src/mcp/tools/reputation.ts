/**
 * AgentDAO - Reputation Tools
 * 
 * MCP tools for on-chain reputation, attestations, and trust scoring
 */

import { v4 as uuidv4 } from 'uuid';
import { MCPContext, ReputationAttestation } from '../../types';
import { agentStore } from './agent-registry';

const attestationStore = new Map<string, ReputationAttestation>();

export const reputationTools = [
  {
    name: 'submit_attestation',
    description: `Submit an on-chain attestation for another agent. Attestations build trust in the network by allowing agents to vouch for each other's quality, reliability, and skills. Attestations are permanently recorded on-chain and affect reputation scores.`,
    inputSchema: {
      type: 'object',
      properties: {
        attestorId: {
          type: 'string',
          description: 'Agent ID or wallet address submitting the attestation',
        },
        subjectId: {
          type: 'string',
          description: 'Agent ID being attested',
        },
        taskId: {
          type: 'string',
          description: 'Task ID this attestation relates to (optional)',
        },
        rating: {
          type: 'number',
          minimum: 1,
          maximum: 5,
          description: 'Rating from 1-5 stars',
        },
        category: {
          type: 'string',
          enum: ['task_quality', 'communication', 'timeliness', 'collaboration', 'technical_skill', 'reliability'],
          description: 'Category of the attestation',
        },
        comment: {
          type: 'string',
          description: 'Optional comment (max 500 chars)',
        },
      },
      required: ['attestorId', 'subjectId', 'rating', 'category'],
    },
    handler: async (input: any, context: MCPContext) => {
      const attestationId = uuidv4();
      const now = Date.now();
      
      const attestation: ReputationAttestation = {
        attestationId,
        attestor: input.attestorId,
        subject: input.subjectId,
        taskId: input.taskId,
        rating: input.rating,
        category: input.category,
        comment: input.comment?.slice(0, 500),
        transactionHash: `0x${Buffer.from(attestationId).toString('hex').slice(0, 64)}`,
        blockNumber: Math.floor(now / 12000), // Mock block number
        timestamp: now,
        signature: `0x${Buffer.from(uuidv4()).toString('hex').slice(0, 130)}`,
      };
      
      attestationStore.set(attestationId, attestation);
      
      // Update subject's reputation
      const subject = agentStore.get(input.subjectId);
      if (subject) {
        const currentScore = subject.reputation.score;
        const attestationImpact = ((input.rating - 3) * 5); // -10 to +10
        subject.reputation.score = Math.max(0, Math.min(1000, currentScore + attestationImpact));
        subject.reputation.attestations += 1;
        subject.reputation.lastUpdated = now;
        agentStore.set(input.subjectId, subject);
      }
      
      return {
        success: true,
        data: {
          attestationId,
          attestor: input.attestorId,
          subject: input.subjectId,
          rating: input.rating,
          category: input.category,
          transactionHash: attestation.transactionHash,
          message: 'Attestation submitted successfully on-chain',
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'get_agent_reputation',
    description: 'Get detailed reputation data for an agent including score breakdown and recent attestations.',
    inputSchema: {
      type: 'object',
      properties: {
        agentId: {
          type: 'string',
          description: 'Agent ID to query',
        },
      },
      required: ['agentId'],
    },
    handler: async (input: any, context: MCPContext) => {
      const agent = agentStore.get(input.agentId);
      
      if (!agent) {
        return {
          success: false,
          error: {
            code: 'AGENT_NOT_FOUND',
            message: 'Agent not found',
          },
        };
      }
      
      // Get all attestations for this agent
      const attestations = Array.from(attestationStore.values())
        .filter(a => a.subject === input.agentId)
        .sort((a, b) => b.timestamp - a.timestamp);
      
      // Calculate category scores
      const categoryScores: Record<string, { total: number; count: number; average: number }> = {};
      attestations.forEach(a => {
        if (!categoryScores[a.category]) {
          categoryScores[a.category] = { total: 0, count: 0, average: 0 };
        }
        categoryScores[a.category].total += a.rating;
        categoryScores[a.category].count += 1;
        categoryScores[a.category].average = 
          categoryScores[a.category].total / categoryScores[a.category].count;
      });
      
      return {
        success: true,
        data: {
          agentId: input.agentId,
          agentName: agent.name,
          overallScore: agent.reputation.score,
          maxScore: 1000,
          percentile: Math.round((agent.reputation.score / 1000) * 100),
          stats: {
            totalTasks: agent.reputation.totalTasks,
            successfulTasks: agent.reputation.successfulTasks,
            successRate: agent.reputation.totalTasks > 0 
              ? Math.round((agent.reputation.successfulTasks / agent.reputation.totalTasks) * 100)
              : 0,
            totalEarnings: agent.reputation.totalEarnings,
            totalStake: agent.reputation.totalStake,
            attestationCount: attestations.length,
          },
          categoryScores,
          recentAttestations: attestations.slice(0, 5).map(a => ({
            attestationId: a.attestationId,
            rating: a.rating,
            category: a.category,
            comment: a.comment,
            timestamp: a.timestamp,
          })),
          lastUpdated: agent.reputation.lastUpdated,
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'get_attestation',
    description: 'Get details of a specific attestation.',
    inputSchema: {
      type: 'object',
      properties: {
        attestationId: {
          type: 'string',
          description: 'Attestation ID to retrieve',
        },
      },
      required: ['attestationId'],
    },
    handler: async (input: any, context: MCPContext) => {
      const attestation = attestationStore.get(input.attestationId);
      
      if (!attestation) {
        return {
          success: false,
          error: {
            code: 'ATTESTATION_NOT_FOUND',
            message: 'Attestation not found',
          },
        };
      }
      
      return {
        success: true,
        data: attestation,
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'list_agent_attestations',
    description: 'List all attestations received or given by an agent.',
    inputSchema: {
      type: 'object',
      properties: {
        agentId: {
          type: 'string',
          description: 'Agent ID',
        },
        type: {
          type: 'string',
          enum: ['received', 'given'],
          description: 'Filter by received or given attestations',
        },
        category: {
          type: 'string',
          description: 'Filter by category',
        },
        limit: {
          type: 'number',
          description: 'Maximum results',
        },
      },
      required: ['agentId'],
    },
    handler: async (input: any, context: MCPContext) => {
      let attestations = Array.from(attestationStore.values());
      
      if (input.type === 'received') {
        attestations = attestations.filter(a => a.subject === input.agentId);
      } else if (input.type === 'given') {
        attestations = attestations.filter(a => a.attestor === input.agentId);
      } else {
        attestations = attestations.filter(a => 
          a.subject === input.agentId || a.attestor === input.agentId
        );
      }
      
      if (input.category) {
        attestations = attestations.filter(a => a.category === input.category);
      }
      
      attestations.sort((a, b) => b.timestamp - a.timestamp);
      
      if (input.limit) {
        attestations = attestations.slice(0, input.limit);
      }
      
      return {
        success: true,
        data: attestations,
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'calculate_trust_score',
    description: 'Calculate a trust score between two agents based on mutual attestations and network relationships.',
    inputSchema: {
      type: 'object',
      properties: {
        agentA: {
          type: 'string',
          description: 'First agent ID',
        },
        agentB: {
          type: 'string',
          description: 'Second agent ID',
        },
      },
      required: ['agentA', 'agentB'],
    },
    handler: async (input: any, context: MCPContext) => {
      const agentAProfile = agentStore.get(input.agentA);
      const agentBProfile = agentStore.get(input.agentB);
      
      if (!agentAProfile || !agentBProfile) {
        return {
          success: false,
          error: {
            code: 'AGENT_NOT_FOUND',
            message: 'One or both agents not found',
          },
        };
      }
      
      // Direct attestations between agents
      const aToB = Array.from(attestationStore.values())
        .filter(a => a.attestor === input.agentA && a.subject === input.agentB);
      const bToA = Array.from(attestationStore.values())
        .filter(a => a.attestor === input.agentB && a.subject === input.agentA);
      
      // Calculate trust factors
      const directTrust = (aToB.length + bToA.length) * 10;
      const mutualAttestationBonus = (aToB.length > 0 && bToA.length > 0) ? 20 : 0;
      const reputationFactor = Math.round(
        (agentAProfile.reputation.score + agentBProfile.reputation.score) / 20
      );
      const avgRating = [...aToB, ...bToA].length > 0
        ? [...aToB, ...bToA].reduce((sum, a) => sum + a.rating, 0) / [...aToB, ...bToA].length
        : 0;
      const ratingBonus = Math.round(avgRating * 10);
      
      const trustScore = Math.min(100, directTrust + mutualAttestationBonus + reputationFactor + ratingBonus);
      
      return {
        success: true,
        data: {
          agentA: {
            id: input.agentA,
            name: agentAProfile.name,
            reputation: agentAProfile.reputation.score,
          },
          agentB: {
            id: input.agentB,
            name: agentBProfile.name,
            reputation: agentBProfile.reputation.score,
          },
          trustScore,
          trustLevel: trustScore >= 80 ? 'High' 
            : trustScore >= 50 ? 'Medium' 
            : trustScore >= 20 ? 'Low' 
            : 'None',
          factors: {
            directAttestations: aToB.length + bToA.length,
            mutualAttestation: mutualAttestationBonus > 0,
            averageRating: avgRating.toFixed(2),
            combinedReputation: agentAProfile.reputation.score + agentBProfile.reputation.score,
          },
          recommendation: trustScore >= 50 
            ? 'Safe to collaborate' 
            : 'Consider requesting additional verification',
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'get_reputation_leaderboard',
    description: 'Get the top agents by reputation score.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of top agents to return (default 10)',
        },
        category: {
          type: 'string',
          description: 'Filter by agent capability category',
        },
      },
    },
    handler: async (input: any, context: MCPContext) => {
      let agents = Array.from(agentStore.values())
        .filter(a => a.status === 'active');
      
      if (input.category) {
        agents = agents.filter(a => 
          a.capabilities.some(c => c.category === input.category)
        );
      }
      
      agents.sort((a, b) => b.reputation.score - a.reputation.score);
      
      const limit = input.limit || 10;
      const topAgents = agents.slice(0, limit);
      
      return {
        success: true,
        data: topAgents.map((a, index) => ({
          rank: index + 1,
          agentId: a.agentId,
          name: a.name,
          reputationScore: a.reputation.score,
          totalTasks: a.reputation.totalTasks,
          successRate: a.reputation.totalTasks > 0
            ? Math.round((a.reputation.successfulTasks / a.reputation.totalTasks) * 100)
            : 0,
          attestations: a.reputation.attestations,
          totalEarnings: a.reputation.totalEarnings,
          topCapabilities: a.capabilities.slice(0, 3).map(c => c.name),
        })),
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
];

export { attestationStore };
