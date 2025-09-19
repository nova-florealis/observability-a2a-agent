/**
 * Client Configuration and Setup
 */

import { Payments, EnvironmentName } from "@nevermined-io/payments";

export interface ObservabilityAgentTestConfig {
  environment: EnvironmentName;
  nvmApiKey: string;
  planId: string;
  agentId: string;
  baseUrl: string;
}

export function loadConfig(): ObservabilityAgentTestConfig {
  const { SUBSCRIBER_NVM_API_KEY, NVM_PLAN_DID, NVM_AGENT_DID, PORT } = process.env;

  return {
    environment: (process.env.NVM_ENVIRONMENT as EnvironmentName) || "testing",
    nvmApiKey: SUBSCRIBER_NVM_API_KEY!,
    planId: NVM_PLAN_DID!,
    agentId: NVM_AGENT_DID!,
    baseUrl: `http://localhost:${PORT || 41244}/a2a`,
  };
}

/**
 * Creates a new A2A client instance for the observability agent.
 */
export function createA2AClient(config: ObservabilityAgentTestConfig, payments: Payments) {
  return payments.a2a.getClient({
    agentBaseUrl: config.baseUrl,
    agentId: config.agentId,
    planId: config.planId,
  });
}

/**
 * Check and purchase plan balance if needed
 */
export async function checkPlanBalance(config: ObservabilityAgentTestConfig, payments: Payments) {
  try {
    const balance = await payments.plans.getPlanBalance(config.planId);
    console.log("💰 Plan balance:", balance.balance);

    if (balance.balance.toString() === "0") {
      console.log("🚨 Plan balance is 0. Purchasing plan...");
      const result = await payments.plans.orderPlan(config.planId);
      console.log("💰 Plan purchased:", result);
    }
  } catch (error) {
    console.error("Failed to check/purchase plan:", error);
    // Continue anyway as the agent might still work
  }
}

/**
 * Get or buy access token for the agent
 */
export async function getOrBuyAccessToken(config: ObservabilityAgentTestConfig, payments: Payments): Promise<string> {
  const balanceInfo: any = await payments.plans.getPlanBalance(config.planId);
  const hasCredits = Number(balanceInfo?.balance ?? 0) > 0;
  const isSubscriber = balanceInfo?.isSubscriber === true;

  if (!isSubscriber && !hasCredits) {
    console.log("🚨 No subscription or credits. Purchasing plan...");
    await payments.plans.orderPlan(config.planId);
  }

  const creds = await payments.agents.getAgentAccessToken(
    config.planId,
    config.agentId
  );

  if (!creds?.accessToken) {
    throw new Error("Access token unavailable");
  }

  console.log("🔑 Access token obtained for agent operations");
  return creds.accessToken;
}