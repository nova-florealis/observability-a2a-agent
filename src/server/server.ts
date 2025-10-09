/**
 * A2A Observability Agent Server
 * Main entry point for starting the observability agent server
 */

import "dotenv/config";
import { Payments } from "@nevermined-io/payments";

// Import configuration
import { paymentsConfig, serverConfig, createAgentCard } from './config/agent-config.js';

// Import services
import { setupAgentAndPlan } from './services/agent-setup.js';

// Import agent
import { ObservabilityAgentExecutor } from './agent.js';

/**
 * Main function to start the observability agent server
 */
async function main() {
  try {
    console.log("🚀 Starting Observability A2A Agent setup...");

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }

    // Initialize the payments service
    const paymentsService = Payments.getInstance(paymentsConfig);

    // Setup agent and plan
    const { agentId, planId } = await setupAgentAndPlan(paymentsService);

    // Update server config with the actual IDs
    serverConfig.agentId = agentId;
    serverConfig.planId = planId;

    // Create updated agent card with the actual IDs
    const updatedAgentCard = createAgentCard();

    // Initialize the agent executor
    console.log("🔧 Initializing agent executor...");
    const agentExecutor = new ObservabilityAgentExecutor(paymentsService);

    // Start the A2A server
    console.log("🌐 Starting A2A server...");
    paymentsService.a2a.start({
      agentCard: updatedAgentCard,
      executor: agentExecutor,
      port: serverConfig.port,
      basePath: "/a2a/",
      handlerOptions: {
        defaultBatch: false,  // Batch mode by default for all requests
        defaultMarginPercent: undefined,  // Use fixed credits (not margin-based)
      },
    });

    console.log("🚀 Observability A2A Agent started successfully!");
    console.log(
      `📍 Server running on: http://localhost:${serverConfig.port}/a2a/`
    );
    console.log(
      `📋 Agent Card: http://localhost:${serverConfig.port}/a2a/.well-known/agent.json`
    );
    
    console.log("================================================");
    console.log("");
    console.log("🧪 Test with these examples:");
    console.log("- Write a haiku about AI (GPT text)");
    console.log("- Generate an image of a wizard (Image simulation)");
    console.log("- Create a jazz ballad (Song simulation)");
    console.log("- Generate a short film (Video simulation)");
    console.log("- Create a music video about AI (Combined generation)");
    console.log("");
    console.log("Press Ctrl+C to stop the server");

    process.on("SIGINT", () => {
      console.log("\n🛑 Shutting down Observability A2A Agent...");
      console.log("✅ Server stopped");
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Error starting agent:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ Failed to start application:", error);
  process.exit(1);
});