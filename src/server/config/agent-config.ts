/**
 * Agent Configuration and Setup
 */

import {
  Payments,
  PlanCreditsType,
  PlanPriceType,
  PlanRedemptionType,
  EnvironmentName,
} from "@nevermined-io/payments";
import type {
  AgentCard,
  AgentMetadata,
  AgentAPIAttributes,
  PlanMetadata,
  PlanPriceConfig,
} from "@nevermined-io/payments";

// ============================================================================
// CONFIGURATION CONSTANTS
// ============================================================================
const ZeroAddress = "0x0000000000000000000000000000000000000000";

export const paymentsConfig = {
  environment: (process.env.NVM_ENVIRONMENT as EnvironmentName) || "staging_sandbox",
  nvmApiKey: process.env.BUILDER_NVM_API_KEY!,
};

export const serverConfig = {
  port: parseInt(process.env.PORT || "41244"),
  agentId: process.env.NVM_AGENT_ID!,
  planId: process.env.NVM_PLAN_ID!,
  tokenAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as `0x${string}`,
};

// ============================================================================
// AGENT AND PLAN METADATA
// ============================================================================

export const agentMetadata: AgentMetadata = {
  name: "Observability GPT Agent",
  description:
    "An AI agent with GPT capabilities and full observability through Helicone. Supports text generation, image/video/song simulation with different credit costs.",
  tags: ["gpt", "observability", "helicone", "ai", "a2a"],
  dateCreated: new Date(),
};

export const agentApi: AgentAPIAttributes = {
  endpoints: [{ POST: `http://localhost:${serverConfig.port}/a2a` }],
  openEndpoints: [
    `http://localhost:${serverConfig.port}/a2a/.well-known/agent.json`,
  ],
  authType: "none",
};

export const planMetadata: PlanMetadata = {
  name: "Observability GPT Credits Plan",
  description:
    "Plan for accessing the Observability GPT Agent with dynamic credit costs based on operation type",
  tags: ["gpt", "observability", "credits"],
  isTrialPlan: false,
};

export const priceConfig: PlanPriceConfig = {
  priceType: PlanPriceType.FIXED_PRICE,
  tokenAddress: serverConfig.tokenAddress,
  amounts: [100_000n],
  receivers: [],
  feeController: ZeroAddress,
  contractAddress: ZeroAddress,
};

export const creditsConfig = {
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

export const baseAgentCard: AgentCard = {
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

export function createAgentCard() {
  return Payments.a2a.buildPaymentAgentCard(baseAgentCard, {
    paymentType: "dynamic",
    credits: 1,
    costDescription:
      "Variable credits: GPT Text (1-12), Image (2-4), Song (3-7), Video (6-9), Combined (varies)",
    planId: serverConfig.planId,
    agentId: serverConfig.agentId,
  });
}