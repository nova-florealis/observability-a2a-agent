/**
 * A2A Observability Agent Client
 * Tests all observability agent capabilities through the A2A protocol
 */

import { Payments } from "@nevermined-io/payments";
import "dotenv/config";

// Import configuration and setup functions
import { loadConfig, createA2AClient, checkPlanBalance } from './config/client-config.js';

// Import webhook server
import { startWebhookReceiver } from './services/webhook-server.js';

// Import test modules
import { testGPTTextGeneration } from './tests/gpt-tests.js';
import { testImageGeneration, testSongGeneration, testVideoGeneration, testCombinedGeneration } from './tests/media-tests.js';
import { testStreamingSSE, testPushNotification, testErrorHandling } from './tests/advanced-tests.js';

const config = loadConfig();
const payments = Payments.getInstance({
  environment: config.environment,
  nvmApiKey: config.nvmApiKey,
});


/**
 * Main entrypoint to run all test scenarios for the Observability A2A agent.
 */
async function main() {
  console.log("🚀 Starting Observability A2A Agent Client Tests...\n");
  
  await checkPlanBalance(config, payments);
  const client = createA2AClient(config, payments);

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