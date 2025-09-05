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
  requestId: string
): Promise<number> {
  try {
    console.log('Applying margin-based pricing...');
    const updatedCostData = await payments.observability.applyMarginPricing(requestId);
    
    if (updatedCostData) {
      const finalCreditAmount = parseFloat(updatedCostData.credit_amount) || 0;
      console.log(`Applied margin. Final credits: ${finalCreditAmount}`);
      return finalCreditAmount;
    }
  } catch (error) {
    console.error('Error applying margin pricing:', error);
  }
  
  return 0;
}