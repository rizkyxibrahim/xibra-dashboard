import { assertSameOrigin, defineBffHandler } from "../../../utils/bff";
import { callXibraApi, XibraApiError } from "../../../utils/xibra-api";
import { readSession } from "../../../utils/session";

/**
 * Send a verification link to the authenticated user's email address.
 *
 * Requires a valid dashboard session; the token never leaves the server.
 */
export default defineBffHandler(async (event) => {
  assertSameOrigin(event);

  const session = await readSession(event);

  if (!session) {
    throw new XibraApiError(
      401,
      "UNAUTHENTICATED",
      "Authentication is required.",
    );
  }

  await callXibraApi("/auth/email/verification", {
    method: "POST",
    token: session.token,
  });

  return { success: true };
});
