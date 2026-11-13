import { readBody } from "nuxt/server";
import { assertSameOrigin, defineBffHandler } from "../../utils/bff";
import {
  callXibraApi,
  XibraApiError,
  type ApiUser,
} from "../../utils/xibra-api";
import {
  destroyOnboardingSession,
  readOnboardingSession,
} from "../../utils/onboarding-session";
import { readSession, toSessionUser, writeSession } from "../../utils/session";

type CompleteBody = {
  name?: unknown;
  username?: unknown;
  email?: unknown;
  phone?: unknown;
  password?: unknown;
};

const DEVICE_NAME = "xibra-dashboard";

/**
 * Session failures that cannot be retried. Once the API rejects the session
 * the cookie is useless, so it is dropped to settle the page on its expired
 * state instead of looping.
 */
const TERMINAL_SESSION_CODES = new Set([
  "ONBOARDING_SESSION_INVALID",
  "ONBOARDING_SESSION_EXPIRED",
  "ONBOARDING_SESSION_CONSUMED",
]);

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Create the invited account and sign the new user in.
 *
 * The onboarding session token comes from the sealed cookie, never from the
 * request body, so the browser cannot choose which invitation to complete.
 */
export default defineBffHandler(async (event) => {
  assertSameOrigin(event);

  // Defense in depth: an authenticated visitor must never replace their
  // session by creating a second account through an invitation link.
  if (await readSession(event)) {
    throw new XibraApiError(
      409,
      "ALREADY_AUTHENTICATED",
      "You are already signed in.",
    );
  }

  const session = await readOnboardingSession(event);

  if (!session) {
    throw new XibraApiError(
      410,
      "ONBOARDING_SESSION_MISSING",
      "This onboarding session has expired. Ask the platform owner for a new invitation.",
    );
  }

  const body = await readBody<CompleteBody>(event);
  const email = text(body?.email);
  const phone = text(body?.phone);

  try {
    const result = await callXibraApi<{ token: string; user: ApiUser }>(
      "/onboarding/complete",
      {
        method: "POST",
        body: {
          session_token: session.token,
          name: text(body?.name),
          username: text(body?.username),
          email: email === "" ? null : email,
          phone: phone === "" ? null : phone,
          // Passwords are never trimmed: surrounding spaces are significant.
          password: typeof body?.password === "string" ? body.password : "",
          device_name: DEVICE_NAME,
        },
      },
    );

    const user = toSessionUser(result.user);

    await writeSession(event, {
      token: result.token,
      user,
      issuedAt: Date.now(),
    });
    await destroyOnboardingSession(event);

    // The token stays on the server.
    return { user };
  } catch (error) {
    if (
      error instanceof XibraApiError &&
      TERMINAL_SESSION_CODES.has(error.code)
    ) {
      await destroyOnboardingSession(event);
    }

    throw error;
  }
});
