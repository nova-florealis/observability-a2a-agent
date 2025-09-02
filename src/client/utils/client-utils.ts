/**
 * Client Utility Functions
 */

import { v4 as uuidv4 } from "uuid";
import type { MessageSendParams, GetTaskResponse } from "@nevermined-io/payments";

/**
 * Sends a message to the agent using automatic token management.
 */
export async function sendMessage(client: any, message: string, operationType?: string): Promise<any> {
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
export async function getTask(client: any, taskId: string): Promise<GetTaskResponse> {
  const params = { id: taskId };
  return client.getA2ATask(params);
}