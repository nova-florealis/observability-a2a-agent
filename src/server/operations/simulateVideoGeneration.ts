import { Payments, StartAgentRequest } from "@nevermined-io/payments";
import { VideoResult } from "../types/operationTypes.js";

/**
 * Generates the model name based on mode, duration, and version.
 */
function generateModelName(mode: string, duration: number, version: string): string {
  return `piapi/kling-v${version}/text-to-video/${mode}-${duration}s`;
}

export async function simulateVideoGeneration(
  payments: Payments,
  prompt: string,
  startAgentRequest: StartAgentRequest
): Promise<VideoResult> {
  // Randomly select 5s or 10s duration
  const finalDuration = Math.random() > 0.5 ? 5 : 10;

  console.log(`\nSimulating video generation for: "${prompt}" (${finalDuration}s)`);

  // Create custom properties for video generation operations
  const customProperties = {
    agentid: process.env.NVM_AGENT_ID!,
    sessionid: crypto.randomUUID(),
    operation: "simulated_video_generation",
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

  const requestId = crypto.randomUUID();
  console.log('Generated Request ID for video generation:', requestId);

  const videoResult = await payments.observability.withHeliconeLogging(
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
    startAgentRequest!,
    customProperties
  );

  return {
    result: videoResult,
    requestId,
  };
}