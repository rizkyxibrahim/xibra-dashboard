import { defineBffHandler } from "../../utils/bff";
import { readOnboardingSession } from "../../utils/onboarding-session";

/**
 * Describe the pending onboarding session without exposing its token.
 *
 * Always answers 200: the page decides between the form and the expired state
 * from `active`, so a missing cookie is a normal outcome rather than an error.
 */
export default defineBffHandler(async (event) => {
  const session = await readOnboardingSession(event);

  return {
    active: session !== undefined,
    roleLabel: session?.roleLabel ?? null,
    expiresAt: session?.expiresAt ?? null,
  };
});
