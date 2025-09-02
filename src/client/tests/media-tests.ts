/**
 * Media Generation Tests (Image, Song, Video)
 */

import { sendMessage } from '../utils/client-utils.js';

/**
 * Test: Image Generation Simulation
 */
export async function testImageGeneration(client: any) {
  console.log("\n🎨 Testing Image Generation Simulation\n");
  
  const imagePrompts = [
    "Generate an image of a wizard teaching calculus",
    "Create a picture of time having an existential crisis",
    "Draw a simple landscape with mountains",
    "Paint a complex detailed futuristic cityscape",
  ];

  for (const prompt of imagePrompts) {
    try {
      console.log(`\n🖼️ Testing: "${prompt}"`);
      await sendMessage(client, prompt, 'image_generation');
      console.log("---");
    } catch (error) {
      console.error(`Failed to process image prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  console.log("\n✅ Image generation test completed!\n");
}

/**
 * Test: Song Generation Simulation
 */
export async function testSongGeneration(client: any) {
  console.log("\n🎵 Testing Song Generation Simulation\n");
  
  const songPrompts = [
    "Create a melancholy ballad about debugging at 3am",
    "Generate a jazz fusion for coffee shop philosophers",
    "Make a simple rock anthem about coding",
    "Create a complex jazz composition about algorithms",
  ];

  for (const prompt of songPrompts) {
    try {
      console.log(`\n🎶 Testing: "${prompt}"`);
      await sendMessage(client, prompt, 'song_generation');
      console.log("---");
    } catch (error) {
      console.error(`Failed to process song prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  console.log("\n✅ Song generation test completed!\n");
}

/**
 * Test: Video Generation Simulation
 */
export async function testVideoGeneration(client: any) {
  console.log("\n🎬 Testing Video Generation Simulation\n");
  
  const videoPrompts = [
    "Generate a short film about gravity taking a day off",
    "Create a video of colors arguing about importance",
    "Make a simple animated sequence about data structures",
    "Generate a complex film about the philosophy of code",
  ];

  for (const prompt of videoPrompts) {
    try {
      console.log(`\n🎥 Testing: "${prompt}"`);
      await sendMessage(client, prompt, 'video_generation');
      console.log("---");
    } catch (error) {
      console.error(`Failed to process video prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  console.log("\n✅ Video generation test completed!\n");
}

/**
 * Test: Combined Generation
 */
export async function testCombinedGeneration(client: any) {
  console.log("\n🎯 Testing Combined Generation\n");
  
  const combinedPrompts = [
    "Create a music video about ontologies for teenagers",
    "Generate a multimedia story about AI consciousness",
    "Make a combined presentation about quantum computing",
  ];

  for (const prompt of combinedPrompts) {
    try {
      console.log(`\n🌟 Testing: "${prompt}"`);
      await sendMessage(client, prompt, 'combined_generation');
      console.log("---");
    } catch (error) {
      console.error(`Failed to process combined prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  console.log("\n✅ Combined generation test completed!\n");
}