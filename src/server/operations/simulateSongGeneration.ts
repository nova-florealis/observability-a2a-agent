import { Payments } from "@nevermined-io/payments";
import { generateDeterministicAgentId, generateSessionId } from "./utils.js";

export async function simulateSongGeneration(
  payments: Payments,
  prompt: string,
  credit_amount: number,
  batchId?: string
): Promise<any> {
  console.log(`\nSimulating song generation for: "${prompt}"`);
  
  const agentId = generateDeterministicAgentId();
  const sessionId = generateSessionId();
  
  // Create custom properties for song generation operations
  const customProperties = {
    agentid: agentId,
    sessionid: sessionId,
    planid: process.env.NVM_PLAN_DID || 'did:nv:0000000000000000000000000000000000000000',
    plan_type: process.env.NVM_PLAN_TYPE || 'credit_based',
    credit_amount: credit_amount,
    credit_usd_rate: 0.001,
    credit_price_usd: 0.001 * credit_amount,
    operation: 'simulated_song_generation',
    batch_id: batchId || '',
    is_batch_request: batchId ? 1 : 0
  };

  // Generate simulated song data first to match original pattern
  const jobId = `simulated-job-${Math.floor(Math.random() * 1000000)}`;
  const mv = "chirp-v4"; // Default value from original
  const storedRequestData = { 
    prompt, 
    options: {
      title: "AI Generated Song",
      tags: ["ai-generated", "simulated"],
      lyrics: "This is a simulated song for testing purposes"
    }, 
    mv 
  };

  return await payments.observability.withHeliconeLogging(
    'SunoClient',
    {
      model: `ttapi/suno/${mv}`, // Use template literal like original
      inputData: {
        jobId: jobId,
        operation: "fetch_song",
        requestData: storedRequestData
      }
    },
    async () => {      
      return {
        songResponse: {
          jobId,
          music: {
            musicId: `music-${jobId}`,
            title: "AI Generated Simulated Song",
            audioUrl: "https://download.samplelib.com/wav/sample-15s.wav",
            duration: 15,
          },
        },
        quota: 6
      };
    },
    (internalResult) => internalResult.songResponse,
    (internalResult) => payments.observability.calculateSongUsage(internalResult.quota),
    'song',
    customProperties
  );
}