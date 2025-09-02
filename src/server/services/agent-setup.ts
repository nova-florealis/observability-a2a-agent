/**
 * Agent and Plan Setup Functions
 */

import { Payments } from "@nevermined-io/payments";
import { serverConfig, agentMetadata, agentApi, planMetadata, priceConfig, creditsConfig } from '../config/agent-config.js';

/**
 * Checks if an agent exists and returns its information.
 */
async function checkAgentExists(
  paymentsService: Payments,
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
 */
async function checkPlanExists(
  paymentsService: Payments,
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
 */
export async function setupAgentAndPlan(paymentsService: Payments): Promise<{
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

  const accountAddress = paymentsService.getAccountAddress();
  if (!accountAddress) {
    throw new Error("Unable to get account address from payments service");
  }
  priceConfig.receivers = [accountAddress];

  try {
    const planResult = await paymentsService.plans.registerPlan(
      planMetadata,
      priceConfig,
      creditsConfig
    );

    console.log(`✅ Plan created successfully!`);
    console.log(`   Plan ID: ${planResult.planId}`);
    if ('txHash' in planResult) {
      console.log(`   Transaction Hash: ${(planResult as any).txHash}`);
    }

    const agentResult = await paymentsService.agents.registerAgent(
      agentMetadata,
      agentApi,
      [planResult.planId]
    );

    console.log(`✅ Agent created successfully!`);
    console.log(`   Agent ID: ${agentResult.agentId}`);
    if ('txHash' in agentResult) {
      console.log(`   Transaction Hash: ${(agentResult as any).txHash}`);
    }

    return {
      agentId: agentResult.agentId,
      planId: planResult.planId,
    };
  } catch (error) {
    console.error("❌ Error creating agent and plan:", error);
    throw error;
  }
}