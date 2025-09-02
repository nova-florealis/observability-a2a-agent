/**
 * A2A Observability Agent Client
 * Tests all observability agent capabilities through the A2A protocol
 */

import {
  Payments,
  EnvironmentName,
  MessageSendParams,
  GetTaskResponse,
  SetTaskPushNotificationConfigResponse,
  PushNotificationConfig,
} from "@nevermined-io/payments";
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";
import express from "express";

interface ObservabilityAgentTestConfig {
  environment: EnvironmentName;
  nvmApiKey: string;
  planId: string;
  agentId: string;
  baseUrl: string;
}

function loadConfig(): ObservabilityAgentTestConfig {
  const { SUBSCRIBER_API_KEY, NVM_PLAN_DID, NVM_AGENT_DID, PORT } = process.env;

  return {
    environment: (process.env.NVM_ENVIRONMENT as EnvironmentName) || "testing",
    nvmApiKey: SUBSCRIBER_API_KEY!,
    planId: NVM_PLAN_DID!,
    agentId: NVM_AGENT_DID!,
    baseUrl: `http://localhost:${PORT || 41244}/a2a`,
  };
}

const config = loadConfig();
const payments = Payments.getInstance({
  environment: config.environment,
  nvmApiKey: config.nvmApiKey,
});

/**
 * Creates a new A2A client instance for the observability agent.
 */
function createA2AClient(cfg: ObservabilityAgentTestConfig) {
  return payments.a2a.getClient({
    agentBaseUrl: cfg.baseUrl,
    agentId: cfg.agentId,
    planId: cfg.planId,
  });
}

/**
 * Sends a message to the agent using automatic token management.
 */
async function sendMessage(client: any, message: string, operationType?: string): Promise<any> {
  const messageId = uuidv4();
  const params: MessageSendParams = {
    message: {
      messageId,
      role: "user",
      kind: "message",
      parts: [{ kind: "text", text: message }],
      metadata: operationType ? { operationType } : undefined,
    },
  };
  const response = await client.sendA2AMessage(params);
  console.log("🚀 ~ sendMessage ~ response:", response);
  return response;
}

/**
 * Retrieves a task by its ID using automatic token management.
 */
async function getTask(client: any, taskId: string): Promise<GetTaskResponse> {
  const params = { id: taskId };
  return client.getA2ATask(params);
}

/**
 * Sets the push notification configuration for a given task.
 */
async function setPushNotificationConfig(
  client: any,
  taskId: string,
  pushNotificationConfig: PushNotificationConfig
): Promise<SetTaskPushNotificationConfigResponse> {
  return client.setA2ATaskPushNotificationConfig({
    taskId,
    pushNotificationConfig,
  });
}

/**
 * Starts a webhook receiver for push notifications.
 */
function startWebhookReceiver(client: any) {
  const app = express();
  app.use(express.json());
  app.post("/webhook", async (req, res) => {
    console.log("[Webhook] Notification received:", req.body);
    const task = await getTask(client, req.body.taskId);
    console.log("[Webhook] Task:", JSON.stringify(task, null, 2));
    res.status(200).send("OK");
  });
  const port = process.env.WEBHOOK_PORT || 4001;
  const server = app.listen(port, () => {
    console.log(
      `[Webhook] Listening for push notifications on http://localhost:${port}/webhook`
    );
  });
  return server;
}

/**
 * Test: GPT Text Generation
 */
async function testGPTTextGeneration(client: any) {
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

/**
 * Test: Image Generation Simulation
 */
async function testImageGeneration(client: any) {
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
async function testSongGeneration(client: any) {
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
async function testVideoGeneration(client: any) {
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
async function testCombinedGeneration(client: any) {
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

/**
 * Test: Streaming SSE using the modern RegisteredPaymentsClient API
 */
async function testStreamingSSE(client: any) {
  console.log("\n📡 Testing Streaming SSE\n");
  const messageId = uuidv4();
  const params: MessageSendParams = {
    message: {
      messageId,
      role: "user",
      kind: "message",
      parts: [{ kind: "text", text: "Write a haiku about streaming data" }],
      metadata: { operationType: 'gpt_text' },
    },
  };
  try {
    const stream = await client.sendA2AMessageStream(params);
    for await (const event of stream) {
      console.log("[Streaming Event]", event);
      if (event?.result?.status?.final === true) {
        console.log("[Streaming Event] Final event received.");
        break;
      }
    }
    console.log("✅ Streaming SSE test completed\n");
  } catch (err) {
    console.error("Streaming SSE error:", err);
  }
}

/**
 * Test: Push Notification using the modern RegisteredPaymentsClient API
 */
async function testPushNotification(client: any) {
  if (process.env.ASYNC_EXECUTION === "false" || !process.env.ASYNC_EXECUTION) {
    console.log(
      "🚨 Async execution is disabled. Push notification test will fail."
    );
    return;
  }
  
  console.log("\n🔔 Testing Push Notifications\n");
  
  const webhookUrl = process.env.WEBHOOK_URL || "http://localhost:4001/webhook";
  const pushNotification: PushNotificationConfig = {
    url: webhookUrl,
    token: "observability-test-token",
    authentication: {
      credentials: "observability-test-token",
      schemes: ["bearer"],
    },
  };
  
  // 1. Send message to create a task
  const response = await sendMessage(client, "Create a GPT haiku with push notification", 'gpt_text');
  let taskId = (response as any)?.result?.id;
  if (!taskId) {
    console.error("No taskId found in response:", response);
    return;
  }
  
  // 2. Associate the pushNotification config
  const setResult = await setPushNotificationConfig(
    client,
    taskId,
    pushNotification
  );
  if (!setResult) {
    console.error("Failed to set push notification config");
    return;
  }
  console.log(`Push notification config set for taskId: ${taskId}`);
  console.log(
    "\n✅ Push notification test: config set. Check webhook receiver after task completion.\n"
  );
}

/**
 * Test: Error handling in the A2A payments client.
 */
async function testErrorHandling(client: any) {
  console.log("\n❌ Testing error handling\n");
  
  const messageId = uuidv4();
  const params: MessageSendParams = {
    message: {
      messageId,
      role: "user",
      kind: "message",
      parts: [],
    },
  };
  try {
    await client.sendA2AMessage(params);
    console.error(
      "❌ Error: The agent did not throw an error for a malformed message."
    );
  } catch (err) {
    const error = err as Error;
    console.log("✅ Error correctly caught:", error.message || error);
  }
}

/**
 * Check and purchase plan balance if needed
 */
async function checkPlanBalance(config: ObservabilityAgentTestConfig) {
  try {
    const balance = await payments.plans.getPlanBalance(config.planId);
    console.log("💰 Plan balance:", balance.balance);
    
    if (balance.balance.toString() === "0") {
      console.log("🚨 Plan balance is 0. Purchasing plan...");
      const result = await payments.plans.orderPlan(config.planId);
      console.log("💰 Plan purchased:", result);
    }
  } catch (error) {
    console.error("Failed to check/purchase plan:", error);
    // Continue anyway as the agent might still work
  }
}

/**
 * Main entrypoint to run all test scenarios for the Observability A2A agent.
 */
async function main() {
  console.log("🚀 Starting Observability A2A Agent Client Tests...\n");
  
  await checkPlanBalance(config);
  const client = createA2AClient(config);

  // Start webhook receiver for push notifications
  const server = startWebhookReceiver(client);

  // Run all test suites
  await testGPTTextGeneration(client);
  await testImageGeneration(client);
  await testSongGeneration(client); 
  await testVideoGeneration(client);
  await testCombinedGeneration(client);
  
  // Test streaming and push notifications
  await testStreamingSSE(client);
  await testPushNotification(client);
  
  // Test error handling
  await testErrorHandling(client);
  
  console.log("\n🎉 All Observability A2A Agent tests completed!\n");
  console.log("📊 Check your Helicone dashboard for observability metrics!");
  
  // Close the webhook server to allow graceful termination
  server.close(() => {
    console.log("\n🔒 Webhook server closed. Exiting gracefully...");
    process.exit(0);
  });
}

// Run main function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}