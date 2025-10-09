import OpenAI from "openai";
import { Payments, StartAgentRequest } from "@nevermined-io/payments";
import { GPTResult } from "../types/operationTypes.js";

export async function callGPT(
  payments: Payments,
  prompt: string,
  credit_amount?: number,
  credit_usd_rate?: number,
  margin_percent?: number,
  batchId?: string,
  requestAccessToken?: string,
  startAgentRequest?: StartAgentRequest
): Promise<GPTResult> {
  try {
    console.log(`\nCalling GPT with prompt: "${prompt}"`);    
    const requestId = crypto.randomUUID();
    console.log('Generated Request ID:', requestId);

    // Create custom properties for GPT operations
    const customProperties = {
      agentid: process.env.NVM_AGENT_ID!,
      sessionid: crypto.randomUUID(),
      operation: "gpt_completion",
    };

    // Create OpenAI client with observability
    const openai = new OpenAI(payments.observability.withOpenAI(
      process.env.OPENAI_API_KEY!,
      startAgentRequest!,
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
    
    // Return result with credit information
    return {
      result: response,
      credits: credit_amount || 0,
      requestId,
      isMarginBased: !!(margin_percent && margin_percent > 0)
    };
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
}