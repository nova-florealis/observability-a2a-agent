# Observability A2A Agent

A2A (Agent-to-Agent) implementation of the Observability GPT Agent with client/server architecture. This agent integrates GPT capabilities with full observability through Helicone, using the Nevermined payments library and A2A protocol.

## Features

**Core Capabilities:**
- **GPT Text Generation** - AI text responses with observability tracking (1-12 credits)
- **Image Generation Simulation** - Simulated image creation with metadata (2-4 credits) 
- **Song Generation Simulation** - Simulated music generation with details (3-7 credits)
- **Video Generation Simulation** - Simulated video creation with specs (6-9 credits)
- **Combined Generation** - Batch operations across all media types (15 credits)

**A2A Protocol Support:**
- Bearer token authentication
- Dynamic credit costs based on operation complexity
- Streaming responses via Server-Sent Events
- Push notifications via webhooks
- Task status tracking and polling
- Error handling and validation

**Observability Integration:**
- Full Helicone integration for API monitoring
- Session and agent ID tracking
- Credit usage and cost tracking
- Batch operation correlation
- Custom properties for each operation type

## Architecture

**Server (`src/agent.ts`):**
- `ObservabilityAgentExecutor` implementing `AgentExecutor` interface
- Request routing based on content detection
- Integration with original operations from `src/operations/`
- Dynamic credit calculation per operation type
- Full A2A protocol compliance

**Client (`src/client.ts`):**
- Comprehensive test suite for all agent capabilities
- Streaming and push notification testing
- Webhook receiver for notifications
- Error handling and validation
- Plan balance management

**Operations (`src/operations/`):**
- Copied from original observability agent
- `callGPT.ts` - OpenAI integration with Helicone
- `simulateImageGeneration.ts` - Image generation simulation
- `simulateSongGeneration.ts` - Music generation simulation
- `simulateVideoGeneration.ts` - Video generation simulation

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file with your configuration:

```env
# Nevermined Configuration  
NVM_ENVIRONMENT=testing
NVM_AGENT_DID=your_agent_id
NVM_PLAN_DID=your_plan_id
NVM_PLAN_TYPE=credit_based
PUBLISHER_API_KEY=your_publisher_api_key
SUBSCRIBER_API_KEY=your_subscriber_api_key

# Server Configuration
PORT=41244
ASYNC_EXECUTION=true

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Helicone Observability
HELICONE_API_KEY=your_helicone_api_key
```

## Usage

### Build
```bash
npm run build
```

### Run Server
```bash
# Production
npm start

# Development with auto-reload
npm run dev
```

### Run Client Tests
```bash
# Run comprehensive test suite
npm run client

# Development mode
npm run debug:client
```

### Quick Test
```bash
# Terminal 1: Start agent server
npm start

# Terminal 2: Run client tests
npm run client
```

## API Endpoints

- **Agent Server**: `http://localhost:41244/a2a/`
- **Agent Card**: `http://localhost:41244/a2a/.well-known/agent.json`
- **Webhook Receiver**: `http://localhost:4001/webhook`

## Test Examples

**GPT Text Generation:**
- "Write a haiku about artificial intelligence"
- "Explain quantum computing in one sentence"
- "What's the meaning of life in 10 words or less?"

**Image Generation:**
- "Generate an image of a wizard teaching calculus"
- "Create a picture of time having an existential crisis"

**Song Generation:**
- "Create a melancholy ballad about debugging at 3am"
- "Generate a jazz fusion for coffee shop philosophers"

**Video Generation:**
- "Generate a short film about gravity taking a day off"
- "Create a video of colors arguing about importance"

**Combined Generation:**
- "Create a music video about ontologies for teenagers"
- "Generate a multimedia story about AI consciousness"

## Credit Costs

- **GPT Text**: 1-12 credits (based on prompt length)
- **Image Generation**: 2-4 credits (based on complexity)
- **Song Generation**: 3-7 credits (based on complexity) 
- **Video Generation**: 6-9 credits (based on complexity)
- **Combined Generation**: 15 credits (fixed for batch operations)

## Observability

All operations are tracked through Helicone with custom properties:
- Agent ID and session ID
- Plan ID and credit information
- Operation type and batch correlation
- Cost tracking and USD conversion
- Request/response monitoring

## Requirements

- Node.js >= 18.0.0
- Valid API keys for OpenAI, Helicone, and Nevermined
- Active Nevermined agent and plan configuration

## Differences from Original

This A2A implementation extends the original observability agent with:
- Full A2A protocol support (client/server architecture)
- Dynamic credit costs based on operation type
- Streaming and push notification capabilities
- Comprehensive test suite and validation
- Enhanced error handling and task management
- Plan balance management and auto-purchasing# observability-a2a-agent
