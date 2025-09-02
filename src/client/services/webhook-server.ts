/**
 * Webhook Server for Push Notifications
 */

import express from "express";
import { getTask } from '../utils/client-utils.js';

/**
 * Starts a webhook receiver for push notifications.
 */
export function startWebhookReceiver(client: any) {
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