# Observability A2A Agent

A2A (Agent-to-Agent) implementation of the Observability GPT Agent with clean client/server architecture. This agent integrates GPT capabilities with full observability through Helicone, using the Nevermined payments library and A2A protocol.

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

The project is organized into two main directories with clear separation of concerns:

### Server Architecture (`src/server/`)

**Main Files:**
- `server.ts` - Main server entry point with startup logic
- `agent.ts` - `ObservabilityAgentExecutor` class implementing `AgentExecutor` interface

**Configuration:**
- `config/agent-config.ts` - Agent metadata, API attributes, plan configuration, and agent card definitions

**Services:**
- `services/agent-setup.ts` - Agent and plan registration and setup functions

**Handlers:**
- `handlers/task-handlers.ts` - All task handling logic for different operation types

**Operations:**
- `operations/` - Server-specific operations (GPT calls, media simulation)
  - `callGPT.ts` - OpenAI integration with Helicone observability
  - `simulateImageGeneration.ts` - Image generation simulation
  - `simulateSongGeneration.ts` - Music generation simulation
  - `simulateVideoGeneration.ts` - Video generation simulation
  - `utils.ts` - Shared utilities for operations
  - `index.ts` - Exports for all operations

### Client Architecture (`src/client/`)

**Main File:**
- `client.ts` - Main client entry point that runs all tests

**Configuration:**
- `config/client-config.ts` - Client configuration, A2A client setup, and plan balance management

**Services:**
- `services/webhook-server.ts` - Express webhook server for push notifications

**Tests:**
- `tests/gpt-tests.ts` - GPT text generation tests
- `tests/media-tests.ts` - Image, song, video, and combined generation tests
- `tests/advanced-tests.ts` - Streaming SSE, push notifications, and error handling tests

**Utils:**
- `utils/client-utils.ts` - Shared client utilities for sending messages and retrieving tasks

## Installation

```bash
# Install dependencies
npm install

# Copy environment template (if available)
cp .env.example .env

# Edit .env with your actual API keys
# nano .env  # or your preferred editor
```

## Configuration

Create a `.env` file with your configuration:

```env
# Nevermined Environment Configuration
NVM_ENVIRONMENT=testing                    # Environment: testing, staging_sandbox, or production

# Nevermined Agent & Plan Configuration (Publisher - Server Side)
NVM_AGENT_DID=your_agent_did              # Agent DID - created during agent registration
NVM_PLAN_DID=your_plan_did                # Plan DID - created during plan registration  
PUBLISHER_API_KEY=your_publisher_api_key  # API key for agent/plan creation and management

# Nevermined Subscriber Configuration (Client Side)
SUBSCRIBER_API_KEY=your_subscriber_api_key # API key for consuming agent services

# Server Configuration
PORT=41244                                # Port for the A2A agent server (default: 41244)
ASYNC_EXECUTION=true                       # Enable async execution for push notifications

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key        # Required: OpenAI API key for GPT operations

# Helicone Observability Configuration
HELICONE_API_KEY=your_helicone_api_key    # Required: Helicone API key for observability tracking

# Webhook Configuration (Optional)
WEBHOOK_PORT=4001                         # Port for webhook receiver (default: 4001)
WEBHOOK_URL=http://localhost:4001/webhook # Webhook URL for push notifications
```

### Environment Variables Explained

**Required Variables:**
- `OPENAI_API_KEY` - Your OpenAI API key for GPT text generation
- `HELICONE_API_KEY` - Your Helicone API key for observability tracking
- `PUBLISHER_API_KEY` - Nevermined API key for server-side operations
- `SUBSCRIBER_API_KEY` - Nevermined API key for client-side operations

**Auto-Generated (if not provided):**
- `NVM_AGENT_DID` - Will be generated during first server startup
- `NVM_PLAN_DID` - Will be generated during first server startup

**Optional Variables:**
- `NVM_ENVIRONMENT` - Defaults to "testing"
- `PORT` - Defaults to 41244
- `WEBHOOK_PORT` - Defaults to 4001
- `WEBHOOK_URL` - Defaults to http://localhost:4001/webhook
- `ASYNC_EXECUTION` - Defaults to true (required for push notifications)

## Getting Started

1. **Clone and Install**:
   ```bash
   git clone <repository-url>
   cd observability-a2a-agent
   npm install
   ```

2. **Set up Environment Variables**:
   - Copy `.env.example` to `.env` (if available)
   - Or create a new `.env` file with the variables listed above
   - Get your API keys from:
     - OpenAI: https://platform.openai.com/api-keys
     - Helicone: https://helicone.ai
     - Nevermined: Contact Nevermined team

3. **First Run**:
   ```bash
   # Start the server (this will create agent and plan if they don't exist)
   npm run start:server
   
   # In another terminal, run the client tests
   npm run start:client
   ```

## Usage

### Build
```bash
npm run build
```

### Run Server
```bash
# Production (compiled)
npm start

# Development with TypeScript
npm run start:server
# or
npm run dev
# or  
npm run dev:server
```

### Run Client Tests
```bash
# Run comprehensive test suite
npm run start:client
# or
npm test
# or
npm run dev:client
```

### Quick Start
```bash
# Terminal 1: Start agent server
npm run start:server

# Terminal 2: Run client tests (wait for server to be ready)
npm run start:client
```

### Available Scripts

**Server Scripts:**
- `npm start` - Run compiled server (production)
- `npm run start:server` - Run server in development mode
- `npm run dev` - Alias for start:server
- `npm run dev:server` - Explicitly run server in dev mode

**Client Scripts:**
- `npm run start:client` - Run client tests
- `npm test` - Alias for start:client
- `npm run dev:client` - Run client in dev mode

**Build Scripts:**
- `npm run build` - Compile TypeScript to JavaScript

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

## Project Structure

```
src/
├── client/                          # Client-side code
│   ├── client.ts                   # Main client entry point
│   ├── config/
│   │   └── client-config.ts        # Client configuration & setup
│   ├── services/
│   │   └── webhook-server.ts       # Webhook server for push notifications
│   ├── tests/                      # All client test modules
│   │   ├── advanced-tests.ts       # Streaming, push notifications, error handling
│   │   ├── gpt-tests.ts           # GPT text generation tests
│   │   └── media-tests.ts         # Image/song/video/combined generation tests
│   └── utils/
│       └── client-utils.ts        # Shared client utilities
└── server/                         # Server-side code  
    ├── server.ts                   # Main server entry point
    ├── agent.ts                    # ObservabilityAgentExecutor class
    ├── config/
    │   └── agent-config.ts        # Agent configuration, metadata, cards
    ├── handlers/
    │   └── task-handlers.ts       # All task handling logic
    ├── operations/                # Server-specific operations
    │   ├── callGPT.ts
    │   ├── index.ts
    │   ├── simulateImageGeneration.ts
    │   ├── simulateSongGeneration.ts
    │   ├── simulateVideoGeneration.ts
    │   └── utils.ts
    └── services/
        └── agent-setup.ts         # Agent and plan setup functions
```

## Requirements

- Node.js >= 18.0.0
- Valid API keys for OpenAI, Helicone, and Nevermined
- Active Nevermined agent and plan configuration

## Troubleshooting

**Server won't start:**
- Check that all required environment variables are set
- Ensure OpenAI API key is valid
- Verify Helicone API key is correct
- Check that port 41244 is available

**Client tests fail:**
- Ensure server is running first
- Check that SUBSCRIBER_API_KEY is valid
- Verify webhook port 4001 is available
- Make sure plan has sufficient credits

**Push notifications not working:**
- Set `ASYNC_EXECUTION=true` in environment
- Check webhook server is accessible
- Verify webhook URL configuration