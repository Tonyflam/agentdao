/**
 * AgentDAO - Collaboration Tools
 * 
 * MCP tools for agent-to-agent collaboration workflows
 */

import { v4 as uuidv4 } from 'uuid';
import { MCPContext } from '../../types';

interface Collaboration {
  collaborationId: string;
  initiatorAgentId: string;
  participantAgentIds: string[];
  taskId?: string;
  type: 'task_delegation' | 'knowledge_sharing' | 'consensus_building' | 'pipeline' | 'swarm';
  status: 'proposed' | 'accepted' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  workflow: WorkflowStep[];
  sharedContext: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

interface WorkflowStep {
  stepId: string;
  agentId: string;
  action: string;
  inputs: Record<string, any>;
  outputs?: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: number;
  completedAt?: number;
}

const collaborationStore = new Map<string, Collaboration>();

export const collaborationTools = [
  {
    name: 'propose_collaboration',
    description: `Propose a collaboration with other agents. This enables complex workflows where multiple specialized agents work together - one agent might analyze data, another trade based on findings, and a third verify results. Supports delegation, pipelines, swarms, and consensus.`,
    inputSchema: {
      type: 'object',
      properties: {
        initiatorAgentId: {
          type: 'string',
          description: 'Agent ID proposing the collaboration',
        },
        participantAgentIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Agent IDs to collaborate with',
        },
        taskId: {
          type: 'string',
          description: 'Associated task ID (optional)',
        },
        type: {
          type: 'string',
          enum: ['task_delegation', 'knowledge_sharing', 'consensus_building', 'pipeline', 'swarm'],
          description: 'Type of collaboration',
        },
        workflow: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              agentId: { type: 'string' },
              action: { type: 'string' },
              inputs: { type: 'object' },
            },
          },
          description: 'Workflow steps defining each agent\'s role',
        },
        sharedContext: {
          type: 'object',
          description: 'Initial context shared between all agents',
        },
        rewardSplit: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              agentId: { type: 'string' },
              percentage: { type: 'number' },
            },
          },
          description: 'How rewards are split among participants',
        },
      },
      required: ['initiatorAgentId', 'participantAgentIds', 'type'],
    },
    handler: async (input: any, context: MCPContext) => {
      const collaborationId = uuidv4();
      const now = Date.now();
      
      const workflow: WorkflowStep[] = (input.workflow || []).map((step: any) => ({
        stepId: uuidv4(),
        agentId: step.agentId,
        action: step.action,
        inputs: step.inputs || {},
        status: 'pending',
      }));
      
      const collaboration: Collaboration = {
        collaborationId,
        initiatorAgentId: input.initiatorAgentId,
        participantAgentIds: input.participantAgentIds,
        taskId: input.taskId,
        type: input.type,
        status: 'proposed',
        workflow,
        sharedContext: input.sharedContext || {},
        createdAt: now,
        updatedAt: now,
      };
      
      collaborationStore.set(collaborationId, collaboration);
      
      return {
        success: true,
        data: {
          collaborationId,
          type: collaboration.type,
          participants: collaboration.participantAgentIds.length + 1,
          workflowSteps: workflow.length,
          status: 'proposed',
          message: 'Collaboration proposed. Waiting for participant acceptance.',
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'respond_to_collaboration',
    description: 'Accept or reject a collaboration proposal.',
    inputSchema: {
      type: 'object',
      properties: {
        collaborationId: {
          type: 'string',
          description: 'Collaboration ID',
        },
        agentId: {
          type: 'string',
          description: 'Responding agent ID',
        },
        accept: {
          type: 'boolean',
          description: 'Whether to accept the collaboration',
        },
        message: {
          type: 'string',
          description: 'Optional response message',
        },
      },
      required: ['collaborationId', 'agentId', 'accept'],
    },
    handler: async (input: any, context: MCPContext) => {
      const collab = collaborationStore.get(input.collaborationId);
      
      if (!collab) {
        return {
          success: false,
          error: {
            code: 'COLLABORATION_NOT_FOUND',
            message: 'Collaboration not found',
          },
        };
      }
      
      if (!collab.participantAgentIds.includes(input.agentId)) {
        return {
          success: false,
          error: {
            code: 'NOT_PARTICIPANT',
            message: 'Agent is not a participant in this collaboration',
          },
        };
      }
      
      if (input.accept) {
        collab.status = 'accepted';
        collab.updatedAt = Date.now();
        collaborationStore.set(input.collaborationId, collab);
        
        return {
          success: true,
          data: {
            collaborationId: input.collaborationId,
            status: 'accepted',
            message: 'Collaboration accepted. Ready to start workflow.',
          },
          meta: {
            requestId: context.requestId,
            timestamp: context.timestamp,
          },
        };
      } else {
        collab.status = 'cancelled';
        collab.updatedAt = Date.now();
        collaborationStore.set(input.collaborationId, collab);
        
        return {
          success: true,
          data: {
            collaborationId: input.collaborationId,
            status: 'cancelled',
            message: 'Collaboration rejected.',
          },
          meta: {
            requestId: context.requestId,
            timestamp: context.timestamp,
          },
        };
      }
    },
  },
  
  {
    name: 'start_workflow',
    description: 'Start executing a collaboration workflow.',
    inputSchema: {
      type: 'object',
      properties: {
        collaborationId: {
          type: 'string',
          description: 'Collaboration ID',
        },
        agentId: {
          type: 'string',
          description: 'Agent ID starting the workflow (must be initiator)',
        },
      },
      required: ['collaborationId', 'agentId'],
    },
    handler: async (input: any, context: MCPContext) => {
      const collab = collaborationStore.get(input.collaborationId);
      
      if (!collab) {
        return {
          success: false,
          error: {
            code: 'COLLABORATION_NOT_FOUND',
            message: 'Collaboration not found',
          },
        };
      }
      
      if (collab.initiatorAgentId !== input.agentId) {
        return {
          success: false,
          error: {
            code: 'NOT_INITIATOR',
            message: 'Only the initiator can start the workflow',
          },
        };
      }
      
      if (collab.status !== 'accepted') {
        return {
          success: false,
          error: {
            code: 'NOT_ACCEPTED',
            message: 'Collaboration must be accepted before starting',
          },
        };
      }
      
      collab.status = 'in_progress';
      if (collab.workflow.length > 0) {
        collab.workflow[0].status = 'running';
        collab.workflow[0].startedAt = Date.now();
      }
      collab.updatedAt = Date.now();
      collaborationStore.set(input.collaborationId, collab);
      
      return {
        success: true,
        data: {
          collaborationId: input.collaborationId,
          status: 'in_progress',
          currentStep: collab.workflow[0]?.stepId,
          currentAgent: collab.workflow[0]?.agentId,
          message: 'Workflow started. First step is now running.',
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'complete_workflow_step',
    description: 'Mark a workflow step as completed with outputs.',
    inputSchema: {
      type: 'object',
      properties: {
        collaborationId: {
          type: 'string',
          description: 'Collaboration ID',
        },
        stepId: {
          type: 'string',
          description: 'Step ID being completed',
        },
        agentId: {
          type: 'string',
          description: 'Agent ID completing the step',
        },
        outputs: {
          type: 'object',
          description: 'Output data from this step',
        },
        updateSharedContext: {
          type: 'object',
          description: 'Updates to the shared context',
        },
      },
      required: ['collaborationId', 'stepId', 'agentId', 'outputs'],
    },
    handler: async (input: any, context: MCPContext) => {
      const collab = collaborationStore.get(input.collaborationId);
      
      if (!collab) {
        return {
          success: false,
          error: {
            code: 'COLLABORATION_NOT_FOUND',
            message: 'Collaboration not found',
          },
        };
      }
      
      const stepIndex = collab.workflow.findIndex(s => s.stepId === input.stepId);
      if (stepIndex === -1) {
        return {
          success: false,
          error: {
            code: 'STEP_NOT_FOUND',
            message: 'Workflow step not found',
          },
        };
      }
      
      const step = collab.workflow[stepIndex];
      if (step.agentId !== input.agentId) {
        return {
          success: false,
          error: {
            code: 'NOT_STEP_OWNER',
            message: 'Only the assigned agent can complete this step',
          },
        };
      }
      
      // Complete this step
      step.status = 'completed';
      step.outputs = input.outputs;
      step.completedAt = Date.now();
      
      // Update shared context
      if (input.updateSharedContext) {
        collab.sharedContext = {
          ...collab.sharedContext,
          ...input.updateSharedContext,
        };
      }
      
      // Start next step or complete collaboration
      const nextStep = collab.workflow[stepIndex + 1];
      if (nextStep) {
        nextStep.status = 'running';
        nextStep.startedAt = Date.now();
        // Pass outputs as inputs to next step
        nextStep.inputs = {
          ...nextStep.inputs,
          previousStepOutputs: step.outputs,
        };
      } else {
        collab.status = 'completed';
      }
      
      collab.updatedAt = Date.now();
      collaborationStore.set(input.collaborationId, collab);
      
      return {
        success: true,
        data: {
          collaborationId: input.collaborationId,
          completedStep: input.stepId,
          collaborationStatus: collab.status,
          nextStep: nextStep?.stepId,
          nextAgent: nextStep?.agentId,
          message: nextStep 
            ? 'Step completed. Next step started.'
            : 'Workflow completed successfully!',
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'get_collaboration_status',
    description: 'Get the current status and details of a collaboration.',
    inputSchema: {
      type: 'object',
      properties: {
        collaborationId: {
          type: 'string',
          description: 'Collaboration ID',
        },
      },
      required: ['collaborationId'],
    },
    handler: async (input: any, context: MCPContext) => {
      const collab = collaborationStore.get(input.collaborationId);
      
      if (!collab) {
        return {
          success: false,
          error: {
            code: 'COLLABORATION_NOT_FOUND',
            message: 'Collaboration not found',
          },
        };
      }
      
      const completedSteps = collab.workflow.filter(s => s.status === 'completed').length;
      const currentStep = collab.workflow.find(s => s.status === 'running');
      
      return {
        success: true,
        data: {
          collaborationId: collab.collaborationId,
          type: collab.type,
          status: collab.status,
          initiator: collab.initiatorAgentId,
          participants: collab.participantAgentIds,
          taskId: collab.taskId,
          progress: {
            completedSteps,
            totalSteps: collab.workflow.length,
            percentage: collab.workflow.length > 0 
              ? Math.round((completedSteps / collab.workflow.length) * 100)
              : 0,
          },
          currentStep: currentStep ? {
            stepId: currentStep.stepId,
            agentId: currentStep.agentId,
            action: currentStep.action,
            startedAt: currentStep.startedAt,
          } : null,
          sharedContext: collab.sharedContext,
          createdAt: collab.createdAt,
          updatedAt: collab.updatedAt,
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'list_agent_collaborations',
    description: 'List all collaborations an agent is involved in.',
    inputSchema: {
      type: 'object',
      properties: {
        agentId: {
          type: 'string',
          description: 'Agent ID to query',
        },
        status: {
          type: 'string',
          enum: ['proposed', 'accepted', 'in_progress', 'completed', 'failed', 'cancelled'],
          description: 'Filter by status',
        },
      },
      required: ['agentId'],
    },
    handler: async (input: any, context: MCPContext) => {
      let collabs = Array.from(collaborationStore.values()).filter(c =>
        c.initiatorAgentId === input.agentId ||
        c.participantAgentIds.includes(input.agentId)
      );
      
      if (input.status) {
        collabs = collabs.filter(c => c.status === input.status);
      }
      
      return {
        success: true,
        data: collabs.map(c => ({
          collaborationId: c.collaborationId,
          type: c.type,
          status: c.status,
          role: c.initiatorAgentId === input.agentId ? 'initiator' : 'participant',
          participantCount: c.participantAgentIds.length + 1,
          taskId: c.taskId,
          createdAt: c.createdAt,
        })),
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'delegate_subtask',
    description: 'Delegate a portion of a task to another agent.',
    inputSchema: {
      type: 'object',
      properties: {
        delegatorAgentId: {
          type: 'string',
          description: 'Agent ID delegating the work',
        },
        delegateeAgentId: {
          type: 'string',
          description: 'Agent ID receiving the delegation',
        },
        taskId: {
          type: 'string',
          description: 'Parent task ID',
        },
        subtaskDescription: {
          type: 'string',
          description: 'Description of the delegated work',
        },
        subtaskInputs: {
          type: 'object',
          description: 'Input data for the subtask',
        },
        rewardShare: {
          type: 'number',
          description: 'Percentage of reward to share with delegatee',
        },
      },
      required: ['delegatorAgentId', 'delegateeAgentId', 'subtaskDescription'],
    },
    handler: async (input: any, context: MCPContext) => {
      // Create a collaboration for the delegation
      const collaborationId = uuidv4();
      const now = Date.now();
      
      const collaboration: Collaboration = {
        collaborationId,
        initiatorAgentId: input.delegatorAgentId,
        participantAgentIds: [input.delegateeAgentId],
        taskId: input.taskId,
        type: 'task_delegation',
        status: 'proposed',
        workflow: [
          {
            stepId: uuidv4(),
            agentId: input.delegateeAgentId,
            action: input.subtaskDescription,
            inputs: input.subtaskInputs || {},
            status: 'pending',
          },
        ],
        sharedContext: {
          delegator: input.delegatorAgentId,
          rewardShare: input.rewardShare || 10,
        },
        createdAt: now,
        updatedAt: now,
      };
      
      collaborationStore.set(collaborationId, collaboration);
      
      return {
        success: true,
        data: {
          collaborationId,
          delegator: input.delegatorAgentId,
          delegatee: input.delegateeAgentId,
          subtask: input.subtaskDescription,
          rewardShare: input.rewardShare || 10,
          status: 'proposed',
          message: 'Subtask delegation proposed. Waiting for acceptance.',
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
];

export { collaborationStore };
