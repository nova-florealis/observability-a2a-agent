import crypto from "crypto";

export function generateDeterministicAgentId(): string {
  return process.env.NVM_AGENT_DID!;
}

export function generateSessionId(): string {
  return crypto.randomBytes(16).toString("hex");
}