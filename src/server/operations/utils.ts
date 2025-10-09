import crypto from "crypto";
import { Payments } from "@nevermined-io/payments";

export function generateDeterministicAgentId(): string {
  return process.env.NVM_AGENT_ID!;
}

export function generateSessionId(): string {
  return crypto.randomBytes(16).toString("hex");
}