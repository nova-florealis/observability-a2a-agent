import { Payments } from "@nevermined-io/payments";
import { generateDeterministicAgentId, generateSessionId } from "./utils.js";

/**
 * Generates the model name based on mode, duration, and version.
 */
function generateModelName(mode: string, duration: number, version: string): string {
  return `piapi/kling-v${version}/text-to-video/${mode}-${duration}s`;
}

export async function simulateVideoGeneration(
  payments: Payments,
  prompt: string,
  credit_amount: number,
  batchId?: string
): Promise<any> {
  // Randomly select 5s or 10s duration
  const finalDuration = Math.random() > 0.5 ? 5 : 10;
  
  console.log(`\nSimulating video generation for: "${prompt}" (${finalDuration}s)`);
  
  const agentId = generateDeterministicAgentId();
  const sessionId = generateSessionId();
  
  // Create custom properties for video generation operations
  const customProperties = {
    agentid: agentId,
    sessionid: sessionId,
    planid: process.env.NVM_PLAN_DID || 'did:nv:0000000000000000000000000000000000000000',
    plan_type: process.env.NVM_PLAN_TYPE || 'credit_based',
    credit_amount: credit_amount,
    credit_usd_rate: 0.001,
    credit_price_usd: 0.001 * credit_amount,
    operation: 'simulated_video_generation',
    batch_id: batchId || '',
    is_batch_request: batchId ? 1 : 0
  };

  const SIMULATED_VIDEO_URLS = [
    "https://download.samplelib.com/mp4/sample-5s.mp4",
    "https://download.samplelib.com/mp4/sample-10s.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
  ];

  const mode = "std";
  const modelName = generateModelName(mode, finalDuration, "1.6");

  return await payments.observability.withHeliconeLogging(
    'VideoGeneratorAgent',
    {
      model: modelName,
      inputData: {
        prompt: prompt,
        duration: finalDuration,
        mode: mode,
        aspect_ratio: "16:9",
        version: "1.6"
      }
    },
    async () => {      
      // Randomly select a simulated video URL
      const url = SIMULATED_VIDEO_URLS[Math.floor(Math.random() * SIMULATED_VIDEO_URLS.length)];
      
      return {
        videoUrl: url,
        duration: finalDuration,
        aspectRatio: "16:9",
        mode: mode,
        version: "1.6"
      };
    },
    (internalResult) => ({
      url: internalResult.videoUrl,
      duration: internalResult.duration,
      aspectRatio: internalResult.aspectRatio,
      mode: internalResult.mode,
      version: internalResult.version
    }),
    (internalResult) => payments.observability.calculateVideoUsage(),
    'video',
    customProperties
  );
}