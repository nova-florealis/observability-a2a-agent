/**
 * A2A Observability Agent Server
 * Integrates GPT operations with Helicone observability through the A2A protocol
 */

import "dotenv/config";
import {
  Payments,
  PlanCreditsType,
  PlanPriceType,
  PlanRedemptionType,
  EnvironmentName,
} from "@nevermined-io/payments";
import type {
  AgentCard,
  TaskHandlerResult,
  TaskStatusUpdateEvent,
  ExecutionEventBus,
  AgentExecutor,
  RequestContext,
  AgentMetadata,
  AgentAPIAttributes,
  PlanMetadata,
  PlanPriceConfig,
} from "@nevermined-io/payments";

import { v4 as uuidv4 } from "uuid";
import { callGPT, simulateSongGeneration, simulateImageGeneration, simulateVideoGeneration } from "./operations/index.js";

// ============================================================================
// CONFIGURATION
// ============================================================================
const ZeroAddress = "0x0000000000000000000000000000000000000000";

const paymentsConfig = {
  environment: (process.env.NVM_ENVIRONMENT as EnvironmentName) || "staging_sandbox",
  nvmApiKey: process.env.PUBLISHER_API_KEY!,
};

const serverConfig = {
  port: parseInt(process.env.PORT || "41244"),
  agentId: process.env.NVM_AGENT_DID!,
  planId: process.env.NVM_PLAN_DID!,
  tokenAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as `0x${string}`,
};

// ============================================================================
// AGENT AND PLAN CONFIGURATION
// ============================================================================

const agentMetadata: AgentMetadata = {
  name: "Observability GPT Agent",
  description:
    "An AI agent with GPT capabilities and full observability through Helicone. Supports text generation, image/video/song simulation with different credit costs.",
  tags: ["gpt", "observability", "helicone", "ai", "a2a"],
  dateCreated: new Date(),
};

const agentApi: AgentAPIAttributes = {
  endpoints: [{ POST: `http://localhost:${serverConfig.port}/a2a` }],
  openEndpoints: [
    `http://localhost:${serverConfig.port}/a2a/.well-known/agent.json`,
  ],
  authType: "none",
};

const planMetadata: PlanMetadata = {
  name: "Observability GPT Credits Plan",
  description:
    "Plan for accessing the Observability GPT Agent with dynamic credit costs based on operation type",
  tags: ["gpt", "observability", "credits"],
  isTrialPlan: false,
};

const priceConfig: PlanPriceConfig = {
  priceType: PlanPriceType.FIXED_PRICE,
  tokenAddress: serverConfig.tokenAddress,
  amounts: [100_000n],
  receivers: [],
  feeController: ZeroAddress,
  contractAddress: ZeroAddress,
};

const creditsConfig = {
  creditsType: PlanCreditsType.FIXED,
  redemptionType: PlanRedemptionType.ONLY_OWNER,
  proofRequired: false,
  durationSecs: 0n,
  amount: 1000n,
  minAmount: 1n,
  maxAmount: 1n,
};

// ============================================================================
// AGENT CARD DEFINITION
// ============================================================================

const baseAgentCard: AgentCard = {
  name: "Observability GPT Agent",
  description:
    "An AI agent with GPT capabilities and full observability through Helicone. Supports various content generation tasks with different credit costs.",
  url: `http://localhost:${serverConfig.port}/a2a/`,
  provider: {
    organization: "Nevermined",
    url: "https://nevermined.io",
  },
  version: "1.0.0",
  capabilities: {
    streaming: true,
    pushNotifications: true,
    stateTransitionHistory: true,
  },
  securitySchemes: undefined,
  security: undefined,
  defaultInputModes: ["text/plain"],
  defaultOutputModes: ["text/plain"],
  skills: [
    {
      id: "gpt_text",
      name: "GPT Text Generation",
      description: "Generate text responses using GPT with observability tracking",
      tags: ["gpt", "text", "ai"],
      examples: ["Write a haiku about AI", "Explain quantum computing", "What's the meaning of life?"],
      inputModes: ["text/plain"],
      outputModes: ["text/plain"],
    },
    {
      id: "image_generation", 
      name: "Image Generation Simulation",
      description: "Simulate image generation with observability tracking",
      tags: ["image", "simulation", "generation"],
      examples: ["Generate an image of a wizard", "Create a surreal landscape"],
      inputModes: ["text/plain"],
      outputModes: ["text/plain"],
    },
    {
      id: "song_generation",
      name: "Song Generation Simulation", 
      description: "Simulate music/song generation with observability tracking",
      tags: ["music", "song", "simulation"],
      examples: ["Create a jazz ballad", "Generate a rock anthem"],
      inputModes: ["text/plain"],
      outputModes: ["text/plain"],
    },
    {
      id: "video_generation",
      name: "Video Generation Simulation",
      description: "Simulate video generation with observability tracking", 
      tags: ["video", "simulation", "generation"],
      examples: ["Generate a short film", "Create an animated sequence"],
      inputModes: ["text/plain"],
      outputModes: ["text/plain"],
    },
    {
      id: "combined_generation",
      name: "Combined Generation",
      description: "Execute multiple generation tasks in a batch with shared observability tracking",
      tags: ["batch", "combined", "multi-modal"],
      examples: ["Create a music video about AI", "Generate a multimedia story"],
      inputModes: ["text/plain"],
      outputModes: ["text/plain"],
    },
  ],
  supportsAuthenticatedExtendedCard: false,
};

const agentCard = Payments.a2a.buildPaymentAgentCard(baseAgentCard, {
  paymentType: "dynamic",
  credits: 1,
  costDescription:
    "Variable credits: GPT Text (1-12), Image (2-4), Song (3-7), Video (6-9), Combined (varies)",
  planId: serverConfig.planId,
  agentId: serverConfig.agentId,
});

// ============================================================================
// AGENT EXECUTOR
// ============================================================================

class ObservabilityAgentExecutor implements AgentExecutor {
  private payments: Payments;

  constructor(payments: Payments) {
    this.payments = payments;
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

    try {
      // Route to appropriate handler based on client-provided operation type or fallback to general
      switch (operationType) {
        case 'gpt_text':
          return {
            result: await this.handleGPTTextRequest(userText),
            expectsMoreUpdates: false,
          };
        case 'image_generation':
          return {
            result: await this.handleImageGenerationRequest(userText),
            expectsMoreUpdates: false,
          };
        case 'song_generation':
          return {
            result: await this.handleSongGenerationRequest(userText),
            expectsMoreUpdates: false,
          };
        case 'video_generation':
          return {
            result: await this.handleVideoGenerationRequest(userText),
            expectsMoreUpdates: false,
          };
        case 'combined_generation':
          return {
            result: await this.handleCombinedGenerationRequest(userText),
            expectsMoreUpdates: false,
          };
        default:
          return {
            result: await this.handleGeneralRequest(userText),
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


  // ============================================================================
  // TASK HANDLERS
  // ============================================================================

  private async handleGPTTextRequest(userText: string): Promise<TaskHandlerResult> {
    const creditAmount = 5;
    
    try {
      const response = await callGPT(this.payments, userText, creditAmount);
      
      return {
        parts: [
          {
            kind: "text",
            text: `🤖 GPT Response:\n${response}`,
          },
        ],
        metadata: {
          creditsUsed: creditAmount,
          planId: serverConfig.planId,
          operationType: "gpt_text",
          prompt: userText,
        },
        state: "completed",
      };
    } catch (error) {
      throw new Error(`GPT request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleImageGenerationRequest(userText: string): Promise<TaskHandlerResult> {
    const creditAmount = 3;
    
    try {
      const result = await simulateImageGeneration(this.payments, userText, creditAmount);
      
      return {
        parts: [
          {
            kind: "text", 
            text: `🎨 Image Generated:\nSize: ${result.width}x${result.height}\nURL: ${result.url}\nPixels: ${result.pixels}`,
          },
        ],
        metadata: {
          creditsUsed: creditAmount,
          planId: serverConfig.planId,
          operationType: "image_generation",
          imageData: result,
        },
        state: "completed",
      };
    } catch (error) {
      throw new Error(`Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleSongGenerationRequest(userText: string): Promise<TaskHandlerResult> {
    const creditAmount = 5;
    
    try {
      const result = await simulateSongGeneration(this.payments, userText, creditAmount);
      
      return {
        parts: [
          {
            kind: "text",
            text: `🎵 Song Generated:\nTitle: ${result.music.title}\nDuration: ${result.music.duration}s\nURL: ${result.music.audioUrl}`,
          },
        ],
        metadata: {
          creditsUsed: creditAmount,
          planId: serverConfig.planId,
          operationType: "song_generation",
          songData: result,
        },
        state: "completed",
      };
    } catch (error) {
      throw new Error(`Song generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleVideoGenerationRequest(userText: string): Promise<TaskHandlerResult> {
    const creditAmount = 8;
    
    try {
      const result = await simulateVideoGeneration(this.payments, userText, creditAmount);
      
      return {
        parts: [
          {
            kind: "text",
            text: `🎬 Video Generated:\nDuration: ${result.duration}s\nAspect Ratio: ${result.aspectRatio}\nURL: ${result.url}\nMode: ${result.mode}`,
          },
        ],
        metadata: {
          creditsUsed: creditAmount,
          planId: serverConfig.planId,
          operationType: "video_generation",
          videoData: result,
        },
        state: "completed",
      };
    } catch (error) {
      throw new Error(`Video generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleCombinedGenerationRequest(userText: string): Promise<TaskHandlerResult> {
    const creditAmount = 15; // Fixed cost for combined operations
    const batchId = uuidv4();
    
    try {
      const gptResult = await callGPT(this.payments, userText, creditAmount, batchId);
      const imageResult = await simulateImageGeneration(this.payments, userText, creditAmount, batchId);
      const songResult = await simulateSongGeneration(this.payments, userText, creditAmount, batchId);
      const videoResult = await simulateVideoGeneration(this.payments, userText, creditAmount, batchId);
      
      return {
        parts: [
          {
            kind: "text",
            text: `🎯 Combined Generation Complete:\n\n🤖 GPT: ${gptResult}\n\n🎨 Image: ${imageResult.width}x${imageResult.height}\n\n🎵 Song: ${songResult.music.title} (${songResult.music.duration}s)\n\n🎬 Video: ${videoResult.duration}s (${videoResult.aspectRatio})`,
          },
        ],
        metadata: {
          creditsUsed: creditAmount,
          planId: serverConfig.planId,
          operationType: "combined_generation",
          batchId,
          results: { gptResult, imageResult, songResult, videoResult },
        },
        state: "completed",
      };
    } catch (error) {
      throw new Error(`Combined generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleGeneralRequest(userText: string): Promise<TaskHandlerResult> {
    return {
      parts: [
        {
          kind: "text",
          text:
            `🔍 Observability GPT Agent received: "${userText}"\n\n` +
            `I can help you with:\n` +
            `• GPT text generation (1-12 credits)\n` +
            `• Image generation simulation (2-4 credits)\n` +
            `• Song generation simulation (3-7 credits)\n` +
            `• Video generation simulation (6-9 credits)\n` +
            `• Combined multimedia generation (15 credits)\n\n` +
            `All operations include full observability through Helicone!`,
        },
      ],
      metadata: {
        creditsUsed: 1,
        planId: serverConfig.planId,
        operationType: "general",
      },
      state: "completed",
    };
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

// ============================================================================
// AGENT AND PLAN SETUP FUNCTIONS
// ============================================================================

/**
 * Checks if an agent exists and returns its information.
 * @param paymentsService - The payments service instance.
 * @param agentId - The agent ID to check.
 * @returns The agent information if it exists, null otherwise.
 */
async function checkAgentExists(
  paymentsService: any,
  agentId: string
): Promise<any> {
  try {
    const agent = await paymentsService.agents.getAgent(agentId);
    console.log(`✅ Agent found: ${agentId}`);
    return agent;
  } catch (error) {
    console.log(`❌ Agent not found: ${agentId}`);
    return null;
  }
}

/**
 * Checks if a plan exists and returns its information.
 * @param paymentsService - The payments service instance.
 * @param planId - The plan ID to check.
 * @returns The plan information if it exists, null otherwise.
 */
async function checkPlanExists(
  paymentsService: any,
  planId: string
): Promise<any> {
  try {
    const plan = await paymentsService.plans.getPlan(planId);
    console.log(`✅ Plan found: ${planId}`);
    return plan;
  } catch (error) {
    console.log(`❌ Plan not found: ${planId}`);
    return null;
  }
}

/**
 * Creates a new agent and plan if they don't exist.
 * @param paymentsService - The payments service instance.
 * @returns An object containing the agentId and planId.
 */
async function setupAgentAndPlan(paymentsService: any): Promise<{
  agentId: string;
  planId: string;
}> {
  console.log("🔧 Setting up agent and plan...");

  // Check if agent and plan already exist
  const existingAgent = await checkAgentExists(
    paymentsService,
    serverConfig.agentId
  );
  const existingPlan = await checkPlanExists(
    paymentsService,
    serverConfig.planId
  );

  if (existingAgent && existingPlan) {
    console.log(
      "✅ Agent and plan already exist, using existing configuration"
    );
    return {
      agentId: serverConfig.agentId,
      planId: serverConfig.planId,
    };
  }

  // If either doesn't exist, create both
  console.log("🆕 Creating new agent and plan...");

  priceConfig.receivers = [paymentsService.getAccountAddress()];

  try {
    const planResult = await paymentsService.plans.registerPlan(
      planMetadata,
      priceConfig,
      creditsConfig
    );

    console.log(`✅ Plan created successfully!`);
    console.log(`   Plan ID: ${planResult.planId}`);
    console.log(`   Transaction Hash: ${planResult.txHash}`);

    const agentResult = await paymentsService.agents.registerAgent(
      agentMetadata,
      agentApi,
      [planResult.planId]
    );

    console.log(`✅ Agent created successfully!`);
    console.log(`   Agent ID: ${agentResult.agentId}`);
    console.log(`   Transaction Hash: ${agentResult.txHash}`);

    return {
      agentId: agentResult.agentId,
      planId: planResult.planId,
    };
  } catch (error) {
    console.error("❌ Error creating agent and plan:", error);
    throw error;
  }
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function main() {
  try {
    console.log("🚀 Starting Observability A2A Agent setup...");

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }

    // Initialize the payments service
    const paymentsService = Payments.getInstance(paymentsConfig);

    // Setup agent and plan
    const { agentId, planId } = await setupAgentAndPlan(paymentsService);

    // Update server config with the actual IDs
    serverConfig.agentId = agentId;
    serverConfig.planId = planId;

    // Update agent card with the actual IDs
    const updatedAgentCard = Payments.a2a.buildPaymentAgentCard(baseAgentCard, {
      paymentType: "dynamic",
      credits: 1,
      costDescription:
        "Variable credits: GPT Text (1-12), Image (2-4), Song (3-7), Video (6-9), Combined (varies)",
      planId: serverConfig.planId,
      agentId: serverConfig.agentId,
    });

    // Start the A2A server
    console.log("🌐 Starting A2A server...");
    paymentsService.a2a.start({
      agentCard: updatedAgentCard,
      executor: new ObservabilityAgentExecutor(paymentsService),
      port: serverConfig.port,
      basePath: "/a2a/",
    });

    console.log("🚀 Observability A2A Agent started successfully!");
    console.log(
      `📍 Server running on: http://localhost:${serverConfig.port}/a2a/`
    );
    console.log(
      `📋 Agent Card: http://localhost:${serverConfig.port}/a2a/.well-known/agent.json`
    );
    
    console.log("================================================");
    console.log("");
    console.log("🧪 Test with these examples:");
    console.log("- Write a haiku about AI (GPT text)");
    console.log("- Generate an image of a wizard (Image simulation)");
    console.log("- Create a jazz ballad (Song simulation)");
    console.log("- Generate a short film (Video simulation)");
    console.log("- Create a music video about AI (Combined generation)");
    console.log("");
    console.log("Press Ctrl+C to stop the server");

    process.on("SIGINT", () => {
      console.log("\n🛑 Shutting down Observability A2A Agent...");
      console.log("✅ Server stopped");
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Error starting agent:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ Failed to start application:", error);
  process.exit(1);
});