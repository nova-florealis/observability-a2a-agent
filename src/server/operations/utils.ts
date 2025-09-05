import crypto from "crypto";
import { Payments } from "@nevermined-io/payments";

export function generateDeterministicAgentId(): string {
  return process.env.NVM_AGENT_DID!;
}

export function generateSessionId(): string {
  return crypto.randomBytes(16).toString("hex");
}

export async function applyMarginCalculation(
  payments: Payments,
  requestId: string,
  batchId?: string
): Promise<number> {
  try {
    const target = batchId ? `batch ${batchId}` : `request ${requestId}`;
    console.log(`Applying margin-based pricing to ${target}...`);
    
    const updatedCostData = await payments.observability.applyMarginPricing(requestId, batchId);
    
    if (updatedCostData) {
      // For batch operations, the response includes total_credits
      // For single requests, the response includes the full cost data with credit_amount
      const finalCreditAmount = batchId 
        ? (updatedCostData.total_credits || 0)
        : (parseFloat(updatedCostData.credit_amount) || 0);
      
      console.log(`Applied margin to ${target}. Final credits: ${finalCreditAmount}`);
      return finalCreditAmount;
    }
  } catch (error) {
    console.error('Error applying margin pricing:', error);
  }
  
  return 0;
}