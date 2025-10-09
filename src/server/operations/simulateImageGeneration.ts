import { Payments, StartAgentRequest } from "@nevermined-io/payments";
import { generateDeterministicAgentId, generateSessionId } from "./utils.js";
import { ImageResult } from "../types/operationTypes.js";

/**
 * Helper function to calculate image size in pixels from width and height
 */
function calculatePixels(width: number, height: number): number {
  return width * height;
}

export async function simulateImageGeneration(
  payments: Payments,
  prompt: string,
  credit_amount?: number,
  credit_usd_rate?: number,
  margin_percent?: number,
  batchId?: string,
  startAgentRequest?: StartAgentRequest
): Promise<ImageResult> {
  console.log(`\nSimulating image generation for: "${prompt}"`);
  
  const agentId = generateDeterministicAgentId();
  const sessionId = generateSessionId();
  
  // Create custom properties for image generation operations
    // Create custom properties for GPT operations
    const customProperties = {
      agentid: process.env.NVM_AGENT_ID!,
      sessionid: crypto.randomUUID(),
      operation: "simulated_image_generation",
    };

  const SIMULATED_IMAGE_URLS = [
    "https://v3.fal.media/files/kangaroo/OyJfXujVSXxPby1bjYe--.png",
    "https://v3.fal.media/files/rabbit/iGjlnk6hZqq5LPtOOSdiu.png",
    "https://v3.fal.media/files/lion/sGrK0XLGX-V2-LOCMN6aW.png",
    "https://v3.fal.media/files/panda/VytitIH7qWYfrXzLvITxi.png",
    "https://v3.fal.media/files/panda/XJb6IFiXFUxxWvn6tyDBl.png",
    "https://v3.fal.media/files/zebra/7sNOX9UH0mLjndayQsIYw.png",
    "https://v3.fal.media/files/lion/Y5MynHlT3LFGUf-BrD6Dd.png",
    "https://v3.fal.media/files/rabbit/EmyU04RwnZGlODQt9z9WZ.png",
    "https://v3.fal.media/files/koala/9cnEfODPJLdoKLiM2_pND.png"
  ];

  const requestId = crypto.randomUUID();
  console.log('Generated Request ID for image generation:', requestId);

  const imageResult = await payments.observability.withHeliconeLogging(
    'ImageGeneratorAgent',
    {
      model: "fal-ai/flux-schnell/text-to-image",
      inputData: {
        prompt: prompt,
        image_size: "landscape_16_9",
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: true
      }
    },
    async () => {
      // Randomly select a simulated image URL
      const url = SIMULATED_IMAGE_URLS[Math.floor(Math.random() * SIMULATED_IMAGE_URLS.length)];
      
      // Calculate pixels for default dimensions (1024x576)
      const pixels = calculatePixels(1024, 576);
      console.log("Generated image pixels:", pixels);
      
      return {
        imageUrl: url,
        pixels: pixels,
        width: 1024,
        height: 576
      };
    },
    (internalResult) => ({
      url: internalResult.imageUrl,
      width: internalResult.width,
      height: internalResult.height,
      pixels: internalResult.pixels
    }),
    (internalResult) => payments.observability.calculateImageUsage(internalResult.pixels),
    'img',
    startAgentRequest!,
    customProperties
  );
  
  // Return result with credit information
  return {
    result: imageResult,
    credits: credit_amount || 0,
    requestId,
    isMarginBased: !!(margin_percent && margin_percent > 0)
  };
}