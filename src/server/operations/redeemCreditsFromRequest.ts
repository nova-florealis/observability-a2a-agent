import { Payments, StartAgentRequest } from "@nevermined-io/payments";

export async function redeemCreditsFromRequest(
  payments: Payments,
  agentRequestId: string,
  requestAccessToken: string,
  creditsToRedeem: bigint = 1n
): Promise<any> {
  try {
    console.log(`Redeeming ${creditsToRedeem} credits for request ${agentRequestId}`);

    const redemptionResult = await payments.requests.redeemCreditsFromRequest(
      agentRequestId,
      requestAccessToken,
      creditsToRedeem
    );

    const result = {
      ...redemptionResult,
      creditsRedeemed: Number(creditsToRedeem)
    };

    console.log("Credit redemption result:", result);
    return result;
  } catch (error) {
    console.error("Failed to redeem credits:", error);
    return {
      creditsRedeemed: 0,
      error: error
    };
  }
}