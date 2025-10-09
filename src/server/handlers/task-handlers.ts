/**
 * Task Handlers for Observability Agent
 */

import type { TaskHandlerResult, Payments, StartAgentRequest } from "@nevermined-io/payments";
import { callGPT, simulateImageGeneration, simulateSongGeneration, simulateVideoGeneration } from "../operations/index.js";

interface ServerConfig {
  planId: string;
}

export class TaskHandlers {
  constructor(private payments: Payments, private serverConfig: ServerConfig) {}

  async handleGPTTextRequest(userText: string, startAgentRequest: StartAgentRequest): Promise<TaskHandlerResult> {
    const creditAmount = 5;

    try {
      const response = await callGPT(this.payments, userText, startAgentRequest);

      return {
        parts: [
          {
            kind: "text",
            text: `🤖 GPT Response:\n${response.result}`,
          },
        ],
        metadata: {
          creditsUsed: creditAmount,
          planId: this.serverConfig.planId,
          operationType: "gpt_text",
          prompt: userText,
          requestId: response.requestId,
        },
        state: "completed",
      };
    } catch (error) {
      throw new Error(`GPT request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleImageGenerationRequest(userText: string, startAgentRequest: StartAgentRequest): Promise<TaskHandlerResult> {
    const creditAmount = 3;

    try {
      const result = await simulateImageGeneration(this.payments, userText, startAgentRequest);

      return {
        parts: [
          {
            kind: "text",
            text: `🎨 Image Generated:\nSize: ${result.result.width}x${result.result.height}\nURL: ${result.result.url}\nPixels: ${result.result.pixels}`,
          },
        ],
        metadata: {
          creditsUsed: creditAmount,
          planId: this.serverConfig.planId,
          operationType: "image_generation",
          imageData: result.result,
          requestId: result.requestId,
        },
        state: "completed",
      };
    } catch (error) {
      throw new Error(`Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleSongGenerationRequest(userText: string, startAgentRequest: StartAgentRequest): Promise<TaskHandlerResult> {
    const creditAmount = 5;

    try {
      const result = await simulateSongGeneration(this.payments, userText, startAgentRequest);

      return {
        parts: [
          {
            kind: "text",
            text: `🎵 Song Generated:\nTitle: ${result.result.music.title}\nDuration: ${result.result.music.duration}s\nURL: ${result.result.music.audioUrl}`,
          },
        ],
        metadata: {
          creditsUsed: creditAmount,
          planId: this.serverConfig.planId,
          operationType: "song_generation",
          songData: result.result,
          requestId: result.requestId,
        },
        state: "completed",
      };
    } catch (error) {
      throw new Error(`Song generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleVideoGenerationRequest(userText: string, startAgentRequest: StartAgentRequest): Promise<TaskHandlerResult> {
    const creditAmount = 0.5;

    try {
      const result = await simulateVideoGeneration(this.payments, userText, startAgentRequest);

      return {
        parts: [
          {
            kind: "text",
            text: `🎬 Video Generated:\nDuration: ${result.result.duration}s\nAspect Ratio: ${result.result.aspectRatio}\nURL: ${result.result.url}\nMode: ${result.result.mode}`,
          },
        ],
        metadata: {
          creditsUsed: creditAmount,
          planId: this.serverConfig.planId,
          operationType: "video_generation",
          videoData: result.result,
          requestId: result.requestId,
        },
        state: "completed",
      };
    } catch (error) {
      throw new Error(`Video generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleCombinedGenerationRequest(userText: string, startAgentRequest: StartAgentRequest): Promise<TaskHandlerResult> {
    const creditAmount = 2; // Fixed cost for combined operations

    try {
      const gptResult = await callGPT(this.payments, userText, startAgentRequest);
      const imageResult = await simulateImageGeneration(this.payments, userText, startAgentRequest);
      const songResult = await simulateSongGeneration(this.payments, userText, startAgentRequest);
      const videoResult = await simulateVideoGeneration(this.payments, userText, startAgentRequest);

      return {
        parts: [
          {
            kind: "text",
            text: `🎯 Combined Generation Complete:\n\n🤖 GPT: ${gptResult.result}\n\n🎨 Image: ${imageResult.result.width}x${imageResult.result.height}\n\n🎵 Song: ${songResult.result.music.title} (${songResult.result.music.duration}s)\n\n🎬 Video: ${videoResult.result.duration}s (${videoResult.result.aspectRatio})`,
          },
        ],
        metadata: {
          creditsUsed: creditAmount,
          planId: this.serverConfig.planId,
          operationType: "combined_generation",
          results: {
            gpt: { requestId: gptResult.requestId, data: gptResult.result },
            image: { requestId: imageResult.requestId, data: imageResult.result },
            song: { requestId: songResult.requestId, data: songResult.result },
            video: { requestId: videoResult.requestId, data: videoResult.result }
          },
        },
        state: "completed",
      };
    } catch (error) {
      throw new Error(`Combined generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleGeneralRequest(userText: string, startAgentRequest: StartAgentRequest): Promise<TaskHandlerResult> {
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