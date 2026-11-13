import { clearSession, getCookie, getSession, useSession } from "nuxt/server";
import type { RequestEvent, SessionConfig } from "nuxt/server";

/**
 * Short-lived onboarding session.
 *
 * This cookie only exists between invitation redemption and account
 * completion. It carries the API onboarding session token, which is a bearer
 * credential, so it is sealed and httpOnly like the main session and is never
 * returned to the browser.
 */
export const ONBOARDING_COOKIE = "xibra_onboarding";

/** Matches the API onboarding session TTL (config `xibra.onboarding`). */
export const ONBOARDING_MAX_AGE_SECONDS = 60 * 15;

export type OnboardingSession = {
  token: string;
  expiresAt: string | null;
  roleLabel: string | null;
};

const onboardingConfig: SessionConfig = {
  name: ONBOARDING_COOKIE,
  maxAge: ONBOARDING_MAX_AGE_SECONDS,
  cookie: {
    httpOnly: true,
    secure: !import.meta.dev,
    sameSite: "lax",
    path: "/",
  },
};

export async function readOnboardingSession(
  event: RequestEvent,
): Promise<OnboardingSession | undefined> {
  // Avoid sealing an empty cookie for visitors without a pending session.
  if (!getCookie(event, ONBOARDING_COOKIE)) return undefined;

  const session = await getSession<OnboardingSession>(event, onboardingConfig);
  if (typeof session.data.token !== "string" || session.data.token === "")
    return undefined;

  return session.data;
}

export async function writeOnboardingSession(
  event: RequestEvent,
  data: OnboardingSession,
): Promise<void> {
  const session = await useSession<OnboardingSession>(event, onboardingConfig);
  await session.update(data);
}

export async function destroyOnboardingSession(
  event: RequestEvent,
): Promise<void> {
  await clearSession(event, onboardingConfig);
}
