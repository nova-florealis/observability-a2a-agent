/**
 * A2A Observability Agent Executor
 * Agent class that handles task execution for the observability agent
 */

import { Payments } from "@nevermined-io/payments";
import type {
  TaskHandlerResult,
  TaskStatusUpdateEvent,
  ExecutionEventBus,
  AgentExecutor,
  RequestContext,
} from "@nevermined-io/payments";

import { v4 as uuidv4 } from "uuid";

// Import configuration
import { serverConfig } from './config/agent-config.js';

// Import task handlers
import { TaskHandlers } from './handlers/task-handlers.js';


// ============================================================================
// AGENT EXECUTOR
// ============================================================================

export class ObservabilityAgentExecutor implements AgentExecutor {
  private payments: Payments;
  private taskHandlers: TaskHandlers;

  constructor(payments: Payments) {
    this.payments = payments;
    this.taskHandlers = new TaskHandlers(payments, serverConfig);
    console.log("ObservabilityAgentExecutor initialized");
  }

  async handleTask(
    context: RequestContext,
    eventBus: ExecutionEventBus
  ): Promise<{ result: TaskHandlerResult; expectsMoreUpdates: boolean }> {
    const firstPart = context.userMessage.parts[0];
    const userText =
      firstPart && firstPart.kind === "text" ? firstPart.text : "";

    // Extract operation type from metadata if provided by client
    const operationType = context.userMessage.metadata?.operationType as string;

    console.log(`[Observability Agent] Received message: ${userText}`);
    console.log(`[Observability Agent] Operation type: ${operationType || 'auto-detect'}`);
    console.log(`🔑 [AgentExecutor] RequestContext keys:`, Object.keys(context));
    console.log(`🔑 [AgentExecutor] TaskId:`, context.taskId);
    console.log(`🔑 [AgentExecutor] Context details:`, JSON.stringify(context, null, 2));

    try {
      // Extract bearer token from message metadata
      const bearerToken = context.userMessage.metadata?.bearerToken as string;
      console.log('🔑 [AgentExecutor] Bearer token from metadata:', bearerToken ? bearerToken.substring(0, 20) + '...' : 'not found');

      // Use bearer token as access token (remove Bearer prefix if present)
      const accessToken = bearerToken?.startsWith('Bearer ')
        ? bearerToken.substring(7)
        : bearerToken || "placeholder-access-token";

      console.log('🔑 [AgentExecutor] Using access token:', accessToken.substring(0, 20) + '...');

      // Get proper agent request using the bearer token
      const agentId = serverConfig.agentId;
      const fullUrl = `http://localhost:${serverConfig.port}/a2a/`;

      const agentRequest = await this.payments.requests.startProcessingRequest(
        agentId,
        `Bearer ${bearerToken}`,
        fullUrl,
        'POST'
      );

      console.log('🔑 [AgentExecutor] StartAgentRequest obtained:', !!agentRequest);

      // Route to appropriate handler based on client-provided operation type or fallback to general
      switch (operationType) {
        case 'gpt_text':
          return {
            result: await this.taskHandlers.handleGPTTextRequest(userText, accessToken, agentRequest),
            expectsMoreUpdates: false,
          };
        case 'image_generation':
          return {
            result: await this.taskHandlers.handleImageGenerationRequest(userText, accessToken, agentRequest),
            expectsMoreUpdates: false,
          };
        case 'song_generation':
          return {
            result: await this.taskHandlers.handleSongGenerationRequest(userText, accessToken, agentRequest),
            expectsMoreUpdates: false,
          };
        case 'video_generation':
          return {
            result: await this.taskHandlers.handleVideoGenerationRequest(userText, accessToken, agentRequest),
            expectsMoreUpdates: false,
          };
        case 'combined_generation':
          return {
            result: await this.taskHandlers.handleCombinedGenerationRequest(userText, accessToken, agentRequest),
            expectsMoreUpdates: false,
          };
        default:
          return {
            result: await this.taskHandlers.handleGeneralRequest(userText, accessToken, agentRequest),
            expectsMoreUpdates: false,
          };
      }
    } catch (error) {
      console.error("[Observability Agent] Error processing request:", error);
      return {
        result: {
          parts: [
            {
              kind: "text",
              text: `Error: ${
                error instanceof Error ? error.message : "Unknown error occurred"
              }`,
            },
          ],
          metadata: {
            creditsUsed: 1,
            planId: serverConfig.planId,
            errorType: "processing_error",
          },
          state: "failed",
        },
        expectsMoreUpdates: false,
      };
    }
  }

  async cancelTask(taskId: string): Promise<void> {
    console.log(`[Observability Agent] Cancelling task: ${taskId}`);
  }

  async execute(
    requestContext: RequestContext,
    eventBus: ExecutionEventBus
  ): Promise<void> {
    const taskId = requestContext.taskId;
    const contextId = requestContext.contextId;
    const userMessage = requestContext.userMessage;

    try {
      let task = requestContext.task;
      if (!task) {
        task = {
          kind: "task",
          id: taskId,
          contextId,
          status: {
            state: "submitted",
            timestamp: new Date().toISOString(),
          },
          artifacts: [],
          history: [userMessage],
          metadata: userMessage.metadata,
        };
      }
      eventBus.publish(task);

      const { result, expectsMoreUpdates } = await this.handleTask(
        requestContext,
        eventBus
      );

      if (expectsMoreUpdates) {
        return;
      }

      const finalUpdate: TaskStatusUpdateEvent = {
        kind: "status-update",
        taskId,
        contextId,
        status: {
          state: result.state || "completed",
          message: {
            kind: "message",
            role: "agent",
            messageId: uuidv4(),
            parts: result.parts,
            taskId,
            contextId,
          },
          timestamp: new Date().toISOString(),
        },
        final: true,
        metadata: result.metadata,
      };
      eventBus.publish(finalUpdate);
      eventBus.finished();
    } catch (error) {
      const errorUpdate: TaskStatusUpdateEvent = {
        kind: "status-update",
        taskId,
        contextId,
        status: {
          state: "failed",
          message: {
            kind: "message",
            role: "agent",
            messageId: uuidv4(),
            parts: [
              {
                kind: "text",
                text: `Agent error: ${
                  error instanceof Error ? error.message : String(error)
                }`,
              },
            ],
            taskId,
            contextId,
          },
          timestamp: new Date().toISOString(),
        },
        final: true,
        metadata: { errorType: "agent_error" },
      };
      eventBus.publish(errorUpdate);
      eventBus.finished();
    }
  }
}