/**
 * GPT Text Generation Tests
 */

import { sendMessage } from '../utils/client-utils.js';

/**
 * Test: GPT Text Generation
 */
export async function testGPTTextGeneration(client: any) {
  console.log("\n🤖 Testing GPT Text Generation\n");
  
  const textPrompts = [
    "Write a haiku about artificial intelligence",
    "Explain quantum computing in one sentence",
    "What's the meaning of life in 10 words or less?",
    "Tell me a joke about debugging",
  ];

  for (const prompt of textPrompts) {
    try {
      console.log(`\n📝 Testing: "${prompt}"`);
      await sendMessage(client, prompt, 'gpt_text');
      console.log("---");
    } catch (error) {
      console.error(`Failed to process GPT prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  console.log("\n✅ GPT text generation test completed!\n");
}