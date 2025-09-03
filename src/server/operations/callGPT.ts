import OpenAI from "openai";
import { Payments } from "@nevermined-io/payments";
import { generateDeterministicAgentId, generateSessionId } from "./utils.js";
import { GPTResult } from "../types/operationTypes.js";

export async function callGPT(
  payments: Payments,
  prompt: string,
  credit_amount?: number,
  credit_usd_rate?: number,
  margin_percent?: number,
  batchId?: string
): Promise<GPTResult> {
  try {
    console.log(`\nCalling GPT with prompt: "${prompt}"`);    
    const requestId = crypto.randomUUID();
    console.log('Generated Request ID:', requestId);
    
    const agentId = generateDeterministicAgentId();
    const sessionId = generateSessionId();
    
    // Create custom properties for GPT operations
    const customProperties = {
      agentid: agentId,
      sessionid: sessionId,
      planid: process.env.NVM_PLAN_DID || 'did:nv:0000000000000000000000000000000000000000',
      plan_type: process.env.NVM_PLAN_TYPE || 'credit_based',
      credit_amount: credit_amount || 0,
      credit_usd_rate: credit_usd_rate || 1,
      credit_price_usd: credit_usd_rate || 1 * (credit_amount || 0),
      margin_percent: margin_percent || 0,
      is_margin_based: margin_percent ? 1 : 0,
      operation: 'gpt_completion',
      batch_id: batchId || '',
      is_batch_request: batchId ? 1 : 0
    };

    // Create OpenAI client with observability
    const openai = new OpenAI(payments.observability.withHeliconeOpenAI(
      process.env.OPENAI_API_KEY!,
      requestId,
      customProperties
    ));
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a simulacrum of a mind that provides concise and creative responses.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content || "No response generated";
    console.log(`GPT Response: "${response}"`);
    
    // Handle margin-based pricing if applicable
    let finalCreditAmount = credit_amount || 0;
    
    if (margin_percent && margin_percent > 0) {
      try {
        console.log('Applying margin-based pricing...');
        const updatedCostData = await payments.observability.applyMarginPricing(requestId, margin_percent);
        
        if (updatedCostData) {
          finalCreditAmount = parseFloat(updatedCostData.credit_amount) || 0;
          console.log(`Applied ${margin_percent}% margin. Final credits: ${finalCreditAmount}`);
        }
      } catch (error) {
        console.error('Error applying margin pricing:', error);
      }
    }
    
    // Return result with credit information
    return {
      result: response,
      credits: finalCreditAmount,
      requestId,
      isMarginBased: !!(margin_percent && margin_percent > 0)
    };
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
}