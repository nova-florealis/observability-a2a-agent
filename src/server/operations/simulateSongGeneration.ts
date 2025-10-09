import { Payments, StartAgentRequest } from "@nevermined-io/payments";
import { SongResult } from "../types/operationTypes.js";

export async function simulateSongGeneration(
  payments: Payments,
  prompt: string,
  startAgentRequest: StartAgentRequest
): Promise<SongResult> {
  console.log(`\nSimulating song generation for: "${prompt}"`);

  // Create custom properties for song generation operations
  const customProperties = {
    agentid: process.env.NVM_AGENT_ID!,
    sessionid: crypto.randomUUID(),
    operation: "simulated_song_generation",
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

  const requestId = crypto.randomUUID();
  console.log('Generated Request ID for song generation:', requestId);

  const songResult = await payments.observability.withHeliconeLogging(
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
    startAgentRequest!,
    customProperties
  );

  return {
    result: songResult,
    requestId,
  };
}