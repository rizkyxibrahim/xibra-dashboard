import { readBody } from "nuxt/server";
import { assertSameOrigin, defineBffHandler } from "../../utils/bff";
import { callXibraApi, XibraApiError } from "../../utils/xibra-api";
import { writeOnboardingSession } from "../../utils/onboarding-session";

type RedeemBody = {
  secret?: unknown;
};

type RedeemResult = {
  session_token: string;
  expires_at: string | null;
  invitation?: {
    role: { name: string; label: string };
    expires_at: string | null;
  };
};

/**
 * Validate an invitation secret and open an onboarding session.
 *
 * No account exists yet. The onboarding session token returned by the API is
 * a bearer credential: it is stored in a sealed httpOnly cookie and never
 * reaches the browser.
 */
export default defineBffHandler(async (event) => {
  assertSameOrigin(event);

  const body = await readBody<RedeemBody>(event);
  const secret = typeof body?.secret === "string" ? body.secret.trim() : "";

  if (secret === "") {
    throw new XibraApiError(
      422,
      "VALIDATION_ERROR",
      "An invitation code is required.",
      { fields: { secret: ["An invitation code is required."] } },
    );
  }

  const result = await callXibraApi<RedeemResult>("/invitations/redeem", {
    method: "POST",
    body: { secret },
  });

  await writeOnboardingSession(event, {
    token: result.session_token,
    expiresAt: result.expires_at ?? null,
    roleLabel: result.invitation?.role.label ?? null,
  });

  return {
    roleLabel: result.invitation?.role.label ?? null,
    expiresAt: result.expires_at ?? null,
  };
});
