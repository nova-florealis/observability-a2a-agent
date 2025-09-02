/**
 * Advanced Tests (Streaming, Push Notifications, Error Handling)
 */

import { v4 as uuidv4 } from "uuid";
import type { MessageSendParams, PushNotificationConfig, SetTaskPushNotificationConfigResponse } from "@nevermined-io/payments";
import { sendMessage, getTask } from '../utils/client-utils.js';

/**
 * Test: Streaming SSE using the modern RegisteredPaymentsClient API
 */
export async function testStreamingSSE(client: any) {
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
export async function testPushNotification(client: any) {
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
export async function testErrorHandling(client: any) {
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