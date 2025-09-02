/**
 * Task Handlers for Observability Agent
 */

import { v4 as uuidv4 } from "uuid";
import type { TaskHandlerResult, Payments } from "@nevermined-io/payments";
import { callGPT, simulateImageGeneration, simulateSongGeneration, simulateVideoGeneration } from "../operations/index.js";

interface ServerConfig {
  planId: string;
}

export class TaskHandlers {
  constructor(private payments: Payments, private serverConfig: ServerConfig) {}

  async handleGPTTextRequest(userText: string): Promise<TaskHandlerResult> {
    const creditAmount = 5;
    
    try {
      const response = await callGPT(this.payments, userText, creditAmount);
      
      return {
        parts: [
          {
            kind: "text",
            text: `🤖 GPT Response:\n${response}`,
          },
        ],
        metadata: {
          creditsUsed: creditAmount,
          planId: this.serverConfig.planId,
          operationType: "gpt_text",
          prompt: userText,
        },
        state: "completed",
      };
    } catch (error) {
      throw new Error(`GPT request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleImageGenerationRequest(userText: string): Promise<TaskHandlerResult> {
    const creditAmount = 3;
    
    try {
      const result = await simulateImageGeneration(this.payments, userText, creditAmount);
      
      return {
        parts: [
          {
            kind: "text", 
            text: `🎨 Image Generated:\nSize: ${result.width}x${result.height}\nURL: ${result.url}\nPixels: ${result.pixels}`,
          },
        ],
        metadata: {
          creditsUsed: creditAmount,
          planId: this.serverConfig.planId,
          operationType: "image_generation",
          imageData: result,
        },
        state: "completed",
      };
    } catch (error) {
      throw new Error(`Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleSongGenerationRequest(userText: string): Promise<TaskHandlerResult> {
    const creditAmount = 5;
    
    try {
      const result = await simulateSongGeneration(this.payments, userText, creditAmount);
      
      return {
        parts: [
          {
            kind: "text",
            text: `🎵 Song Generated:\nTitle: ${result.music.title}\nDuration: ${result.music.duration}s\nURL: ${result.music.audioUrl}`,
          },
        ],
        metadata: {
          creditsUsed: creditAmount,
          planId: this.serverConfig.planId,
          operationType: "song_generation",
          songData: result,
        },
        state: "completed",
      };
    } catch (error) {
      throw new Error(`Song generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleVideoGenerationRequest(userText: string): Promise<TaskHandlerResult> {
    const creditAmount = 8;
    
    try {
      const result = await simulateVideoGeneration(this.payments, userText, creditAmount);
      
      return {
        parts: [
          {
            kind: "text",
            text: `🎬 Video Generated:\nDuration: ${result.duration}s\nAspect Ratio: ${result.aspectRatio}\nURL: ${result.url}\nMode: ${result.mode}`,
          },
        ],
        metadata: {
          creditsUsed: creditAmount,
          planId: this.serverConfig.planId,
          operationType: "video_generation",
          videoData: result,
        },
        state: "completed",
      };
    } catch (error) {
      throw new Error(`Video generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleCombinedGenerationRequest(userText: string): Promise<TaskHandlerResult> {
    const creditAmount = 15; // Fixed cost for combined operations
    const batchId = uuidv4();
    
    try {
      const gptResult = await callGPT(this.payments, userText, creditAmount, batchId);
      const imageResult = await simulateImageGeneration(this.payments, userText, creditAmount, batchId);
      const songResult = await simulateSongGeneration(this.payments, userText, creditAmount, batchId);
      const videoResult = await simulateVideoGeneration(this.payments, userText, creditAmount, batchId);
      
      return {
        parts: [
          {
            kind: "text",
            text: `🎯 Combined Generation Complete:\n\n🤖 GPT: ${gptResult}\n\n🎨 Image: ${imageResult.width}x${imageResult.height}\n\n🎵 Song: ${songResult.music.title} (${songResult.music.duration}s)\n\n🎬 Video: ${videoResult.duration}s (${videoResult.aspectRatio})`,
          },
        ],
        metadata: {
          creditsUsed: creditAmount,
          planId: this.serverConfig.planId,
          operationType: "combined_generation",
          batchId,
          results: { gptResult, imageResult, songResult, videoResult },
        },
        state: "completed",
      };
    } catch (error) {
      throw new Error(`Combined generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleGeneralRequest(userText: string): Promise<TaskHandlerResult> {
    return {
      parts: [
        {
          kind: "text",
          text:
            `🔍 Observability GPT Agent received: "${userText}"\n\n` +
            `I can help you with:\n` +
            `• GPT text generation (1-12 credits)\n` +
            `• Image generation simulation (2-4 credits)\n` +
            `• Song generation simulation (3-7 credits)\n` +
            `• Video generation simulation (6-9 credits)\n` +
            `• Combined multimedia generation (15 credits)\n\n` +
            `All operations include full observability through Helicone!`,
        },
      ],
      metadata: {
        creditsUsed: 1,
        planId: this.serverConfig.planId,
        operationType: "general",
      },
      state: "completed",
    };
  }
}