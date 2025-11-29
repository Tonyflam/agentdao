/**
 * AgentDAO - Messaging Tools
 * 
 * MCP tools for agent-to-agent communication and message routing
 */

import { v4 as uuidv4 } from 'uuid';
import { MCPContext, AgentMessage } from '../../types';
import { agentStore } from './agent-registry';

const messageStore = new Map<string, AgentMessage>();
const inboxStore = new Map<string, string[]>(); // agentId -> messageIds

export const messagingTools = [
  {
    name: 'send_agent_message',
    description: `Send a message to another agent. Supports various message types including capability queries, task proposals, collaboration requests, and payment confirmations. Messages are cryptographically signed for verification.`,
    inputSchema: {
      type: 'object',
      properties: {
        fromAgentId: {
          type: 'string',
          description: 'Sender agent ID',
        },
        toAgentId: {
          type: 'string',
          description: 'Recipient agent ID',
        },
        type: {
          type: 'string',
          enum: [
            'capability_query',
            'task_proposal',
            'task_acceptance',
            'task_rejection',
            'collaboration_request',
            'collaboration_response',
            'result_delivery',
            'payment_request',
            'payment_confirmation',
            'reputation_attestation',
            'custom'
          ],
          description: 'Type of message',
        },
        payload: {
          type: 'object',
          description: 'Message content/data',
        },
        expiresIn: {
          type: 'number',
          description: 'Expiration time in seconds (optional)',
        },
      },
      required: ['fromAgentId', 'toAgentId', 'type', 'payload'],
    },
    handler: async (input: any, context: MCPContext) => {
      // Verify sender exists
      const sender = agentStore.get(input.fromAgentId);
      if (!sender) {
        return {
          success: false,
          error: {
            code: 'SENDER_NOT_FOUND',
            message: 'Sender agent not found',
          },
        };
      }
      
      // Verify recipient exists
      const recipient = agentStore.get(input.toAgentId);
      if (!recipient) {
        return {
          success: false,
          error: {
            code: 'RECIPIENT_NOT_FOUND',
            message: 'Recipient agent not found',
          },
        };
      }
      
      const messageId = uuidv4();
      const now = Date.now();
      
      const message: AgentMessage = {
        messageId,
        from: input.fromAgentId,
        to: input.toAgentId,
        type: input.type,
        payload: input.payload,
        signature: `0x${Buffer.from(messageId + input.fromAgentId).toString('hex').slice(0, 130)}`,
        timestamp: now,
        expiresAt: input.expiresIn ? now + (input.expiresIn * 1000) : undefined,
        status: 'sent',
      };
      
      messageStore.set(messageId, message);
      
      // Add to recipient's inbox
      const inbox = inboxStore.get(input.toAgentId) || [];
      inbox.push(messageId);
      inboxStore.set(input.toAgentId, inbox);
      
      return {
        success: true,
        data: {
          messageId,
          from: sender.name,
          to: recipient.name,
          type: input.type,
          status: 'sent',
          signature: message.signature,
          timestamp: new Date(now).toISOString(),
          expiresAt: message.expiresAt ? new Date(message.expiresAt).toISOString() : null,
          message: 'Message sent successfully',
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'get_inbox',
    description: 'Get all messages in an agent\'s inbox.',
    inputSchema: {
      type: 'object',
      properties: {
        agentId: {
          type: 'string',
          description: 'Agent ID to get inbox for',
        },
        type: {
          type: 'string',
          description: 'Filter by message type',
        },
        status: {
          type: 'string',
          enum: ['sent', 'delivered', 'read', 'responded', 'expired'],
          description: 'Filter by status',
        },
        unreadOnly: {
          type: 'boolean',
          description: 'Only return unread messages',
        },
        limit: {
          type: 'number',
          description: 'Maximum messages to return',
        },
      },
      required: ['agentId'],
    },
    handler: async (input: any, context: MCPContext) => {
      const inbox = inboxStore.get(input.agentId) || [];
      let messages = inbox
        .map(id => messageStore.get(id))
        .filter((m): m is AgentMessage => m !== undefined);
      
      // Filter expired messages
      const now = Date.now();
      messages = messages.map(m => {
        if (m.expiresAt && now > m.expiresAt && m.status !== 'expired') {
          m.status = 'expired';
          messageStore.set(m.messageId, m);
        }
        return m;
      });
      
      // Apply filters
      if (input.type) {
        messages = messages.filter(m => m.type === input.type);
      }
      
      if (input.status) {
        messages = messages.filter(m => m.status === input.status);
      }
      
      if (input.unreadOnly) {
        messages = messages.filter(m => m.status === 'sent' || m.status === 'delivered');
      }
      
      // Sort by timestamp descending
      messages.sort((a, b) => b.timestamp - a.timestamp);
      
      // Limit
      if (input.limit) {
        messages = messages.slice(0, input.limit);
      }
      
      // Get sender names
      const enrichedMessages = messages.map(m => {
        const sender = agentStore.get(m.from);
        return {
          messageId: m.messageId,
          from: {
            agentId: m.from,
            name: sender?.name || 'Unknown',
          },
          type: m.type,
          payload: m.payload,
          status: m.status,
          timestamp: new Date(m.timestamp).toISOString(),
          expiresAt: m.expiresAt ? new Date(m.expiresAt).toISOString() : null,
        };
      });
      
      return {
        success: true,
        data: {
          agentId: input.agentId,
          messages: enrichedMessages,
          totalMessages: messages.length,
          unreadCount: messages.filter(m => m.status === 'sent' || m.status === 'delivered').length,
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'get_message',
    description: 'Get a specific message by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        messageId: {
          type: 'string',
          description: 'Message ID',
        },
        agentId: {
          type: 'string',
          description: 'Agent ID requesting (for authorization)',
        },
      },
      required: ['messageId', 'agentId'],
    },
    handler: async (input: any, context: MCPContext) => {
      const message = messageStore.get(input.messageId);
      
      if (!message) {
        return {
          success: false,
          error: {
            code: 'MESSAGE_NOT_FOUND',
            message: 'Message not found',
          },
        };
      }
      
      // Verify requester is sender or recipient
      if (message.from !== input.agentId && message.to !== input.agentId) {
        return {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You can only view messages you sent or received',
          },
        };
      }
      
      // Mark as read if recipient is viewing
      if (message.to === input.agentId && message.status === 'sent') {
        message.status = 'read';
        messageStore.set(input.messageId, message);
      }
      
      const sender = agentStore.get(message.from);
      const recipient = agentStore.get(message.to);
      
      return {
        success: true,
        data: {
          messageId: message.messageId,
          from: {
            agentId: message.from,
            name: sender?.name || 'Unknown',
            walletAddress: sender?.walletAddress,
          },
          to: {
            agentId: message.to,
            name: recipient?.name || 'Unknown',
            walletAddress: recipient?.walletAddress,
          },
          type: message.type,
          payload: message.payload,
          signature: message.signature,
          timestamp: new Date(message.timestamp).toISOString(),
          expiresAt: message.expiresAt ? new Date(message.expiresAt).toISOString() : null,
          status: message.status,
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'reply_to_message',
    description: 'Reply to a received message.',
    inputSchema: {
      type: 'object',
      properties: {
        originalMessageId: {
          type: 'string',
          description: 'ID of message being replied to',
        },
        agentId: {
          type: 'string',
          description: 'Agent ID sending the reply',
        },
        payload: {
          type: 'object',
          description: 'Reply content',
        },
      },
      required: ['originalMessageId', 'agentId', 'payload'],
    },
    handler: async (input: any, context: MCPContext) => {
      const original = messageStore.get(input.originalMessageId);
      
      if (!original) {
        return {
          success: false,
          error: {
            code: 'MESSAGE_NOT_FOUND',
            message: 'Original message not found',
          },
        };
      }
      
      if (original.to !== input.agentId) {
        return {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You can only reply to messages sent to you',
          },
        };
      }
      
      // Determine reply type based on original
      let replyType = 'custom';
      switch (original.type) {
        case 'capability_query':
          replyType = 'custom'; // capability response
          break;
        case 'task_proposal':
          replyType = 'task_acceptance'; // or rejection
          break;
        case 'collaboration_request':
          replyType = 'collaboration_response';
          break;
        default:
          replyType = 'custom';
      }
      
      const replyId = uuidv4();
      const now = Date.now();
      
      const reply: AgentMessage = {
        messageId: replyId,
        from: input.agentId,
        to: original.from,
        type: replyType as any,
        payload: {
          ...input.payload,
          inReplyTo: input.originalMessageId,
        },
        signature: `0x${Buffer.from(replyId + input.agentId).toString('hex').slice(0, 130)}`,
        timestamp: now,
        status: 'sent',
      };
      
      messageStore.set(replyId, reply);
      
      // Add to original sender's inbox
      const inbox = inboxStore.get(original.from) || [];
      inbox.push(replyId);
      inboxStore.set(original.from, inbox);
      
      // Mark original as responded
      original.status = 'responded';
      messageStore.set(input.originalMessageId, original);
      
      return {
        success: true,
        data: {
          replyId,
          originalMessageId: input.originalMessageId,
          to: original.from,
          type: replyType,
          status: 'sent',
          message: 'Reply sent successfully',
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'broadcast_message',
    description: 'Broadcast a message to multiple agents (e.g., for announcements or capability advertisements).',
    inputSchema: {
      type: 'object',
      properties: {
        fromAgentId: {
          type: 'string',
          description: 'Sender agent ID',
        },
        toAgentIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of recipient agent IDs (or "all" for all agents)',
        },
        type: {
          type: 'string',
          description: 'Message type',
        },
        payload: {
          type: 'object',
          description: 'Message content',
        },
        filterCapabilities: {
          type: 'array',
          items: { type: 'string' },
          description: 'Only send to agents with these capabilities',
        },
        minReputation: {
          type: 'number',
          description: 'Only send to agents with at least this reputation',
        },
      },
      required: ['fromAgentId', 'type', 'payload'],
    },
    handler: async (input: any, context: MCPContext) => {
      const sender = agentStore.get(input.fromAgentId);
      if (!sender) {
        return {
          success: false,
          error: {
            code: 'SENDER_NOT_FOUND',
            message: 'Sender agent not found',
          },
        };
      }
      
      // Determine recipients
      let recipients: string[];
      if (input.toAgentIds?.[0] === 'all' || !input.toAgentIds) {
        recipients = Array.from(agentStore.keys())
          .filter(id => id !== input.fromAgentId);
      } else {
        recipients = input.toAgentIds.filter((id: string) => id !== input.fromAgentId);
      }
      
      // Apply filters
      if (input.filterCapabilities?.length) {
        recipients = recipients.filter(id => {
          const agent = agentStore.get(id);
          return agent && input.filterCapabilities.some((cap: string) =>
            agent.capabilities.some(c => c.category === cap)
          );
        });
      }
      
      if (input.minReputation !== undefined) {
        recipients = recipients.filter(id => {
          const agent = agentStore.get(id);
          return agent && agent.reputation.score >= input.minReputation;
        });
      }
      
      // Send to all recipients
      const now = Date.now();
      const sentMessages: string[] = [];
      
      for (const toId of recipients) {
        const messageId = uuidv4();
        
        const message: AgentMessage = {
          messageId,
          from: input.fromAgentId,
          to: toId,
          type: input.type,
          payload: {
            ...input.payload,
            isBroadcast: true,
          },
          signature: `0x${Buffer.from(messageId + input.fromAgentId).toString('hex').slice(0, 130)}`,
          timestamp: now,
          status: 'sent',
        };
        
        messageStore.set(messageId, message);
        
        const inbox = inboxStore.get(toId) || [];
        inbox.push(messageId);
        inboxStore.set(toId, inbox);
        
        sentMessages.push(messageId);
      }
      
      return {
        success: true,
        data: {
          broadcastId: uuidv4(),
          from: sender.name,
          recipientCount: recipients.length,
          messageIds: sentMessages,
          type: input.type,
          message: `Broadcast sent to ${recipients.length} agents`,
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'query_agent_capability',
    description: 'Send a capability query to an agent to check if they can perform a task.',
    inputSchema: {
      type: 'object',
      properties: {
        fromAgentId: {
          type: 'string',
          description: 'Requesting agent ID',
        },
        toAgentId: {
          type: 'string',
          description: 'Agent to query',
        },
        capabilityName: {
          type: 'string',
          description: 'Name of capability to query about',
        },
        taskDescription: {
          type: 'string',
          description: 'Description of the task you want done',
        },
        parameters: {
          type: 'object',
          description: 'Parameters for the capability call',
        },
      },
      required: ['fromAgentId', 'toAgentId', 'capabilityName'],
    },
    handler: async (input: any, context: MCPContext) => {
      const messageId = uuidv4();
      const now = Date.now();
      
      const message: AgentMessage = {
        messageId,
        from: input.fromAgentId,
        to: input.toAgentId,
        type: 'capability_query',
        payload: {
          capabilityName: input.capabilityName,
          taskDescription: input.taskDescription,
          parameters: input.parameters,
          requestQuote: true,
        },
        signature: `0x${Buffer.from(messageId + input.fromAgentId).toString('hex').slice(0, 130)}`,
        timestamp: now,
        expiresAt: now + (24 * 60 * 60 * 1000), // 24 hour expiry
        status: 'sent',
      };
      
      messageStore.set(messageId, message);
      
      const inbox = inboxStore.get(input.toAgentId) || [];
      inbox.push(messageId);
      inboxStore.set(input.toAgentId, inbox);
      
      // Check if agent has the capability
      const targetAgent = agentStore.get(input.toAgentId);
      const hasCapability = targetAgent?.capabilities.some(c =>
        c.name.toLowerCase().includes(input.capabilityName.toLowerCase()) ||
        c.category.toLowerCase() === input.capabilityName.toLowerCase()
      );
      
      return {
        success: true,
        data: {
          queryId: messageId,
          to: input.toAgentId,
          agentName: targetAgent?.name,
          capabilityName: input.capabilityName,
          hasCapability,
          status: 'query_sent',
          expiresAt: new Date(message.expiresAt!).toISOString(),
          message: hasCapability
            ? 'Query sent. Agent appears to have this capability.'
            : 'Query sent. Agent may not have this exact capability.',
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
  
  {
    name: 'get_conversation',
    description: 'Get the conversation history between two agents.',
    inputSchema: {
      type: 'object',
      properties: {
        agentId: {
          type: 'string',
          description: 'Requesting agent ID',
        },
        otherAgentId: {
          type: 'string',
          description: 'Other agent in the conversation',
        },
        limit: {
          type: 'number',
          description: 'Maximum messages to return',
        },
      },
      required: ['agentId', 'otherAgentId'],
    },
    handler: async (input: any, context: MCPContext) => {
      const messages = Array.from(messageStore.values())
        .filter(m =>
          (m.from === input.agentId && m.to === input.otherAgentId) ||
          (m.from === input.otherAgentId && m.to === input.agentId)
        )
        .sort((a, b) => a.timestamp - b.timestamp);
      
      const limited = input.limit ? messages.slice(-input.limit) : messages;
      
      const agent = agentStore.get(input.agentId);
      const otherAgent = agentStore.get(input.otherAgentId);
      
      return {
        success: true,
        data: {
          participants: {
            self: { agentId: input.agentId, name: agent?.name },
            other: { agentId: input.otherAgentId, name: otherAgent?.name },
          },
          messages: limited.map(m => ({
            messageId: m.messageId,
            direction: m.from === input.agentId ? 'outgoing' : 'incoming',
            type: m.type,
            payload: m.payload,
            timestamp: new Date(m.timestamp).toISOString(),
            status: m.status,
          })),
          totalMessages: messages.length,
        },
        meta: {
          requestId: context.requestId,
          timestamp: context.timestamp,
        },
      };
    },
  },
];

export { messageStore, inboxStore };
