import { Payments } from "@nevermined-io/payments";
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
  batchId?: string
): Promise<ImageResult> {
  console.log(`\nSimulating image generation for: "${prompt}"`);
  
  const agentId = generateDeterministicAgentId();
  const sessionId = generateSessionId();
  
  // Create custom properties for image generation operations
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
    operation: 'simulated_image_generation',
    batch_id: batchId || '',
    is_batch_request: batchId ? 1 : 0
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
    requestId,
    customProperties
  );
  
  // Handle margin-based pricing if applicable
  let finalCreditAmount = credit_amount || 0;
  
  if (margin_percent && margin_percent > 0) {
    try {
      // Wait a moment for Helicone to process the data
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
    result: imageResult,
    credits: finalCreditAmount,
    requestId,
    isMarginBased: !!(margin_percent && margin_percent > 0)
  };
}