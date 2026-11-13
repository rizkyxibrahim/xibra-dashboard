import { clearSession, getCookie, getSession, useSession } from "nuxt/server";
import type { RequestEvent, SessionConfig } from "nuxt/server";
import type { ApiUser } from "./xibra-api";

export const SESSION_COOKIE = "xibra_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export type SessionUser = {
  id: number;
  name: string;
  username: string;
  email: string | null;
  phone: string | null;
  roles: Array<{ name: string; label: string }>;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
};

export type XibraSession = {
  token: string;
  user: SessionUser;
  issuedAt: number;
};

/**
 * The session is sealed with a secret derived from NUXT_APP_SECRET.
 * Cookie defaults from Nuxt are httpOnly, sameSite=lax and path=/;
 * `secure` is relaxed only outside production so local HTTP works.
 */
const sessionConfig: SessionConfig = {
  name: SESSION_COOKIE,
  maxAge: SESSION_MAX_AGE_SECONDS,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  },
};

export function toSessionUser(user: ApiUser): SessionUser {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    phone: user.phone,
    roles: user.roles.map((role) => ({ name: role.name, label: role.label })),
    emailVerifiedAt: user.email_verified_at,
    lastLoginAt: user.last_login_at,
  };
}

export async function readSession(
  event: RequestEvent,
): Promise<XibraSession | undefined> {
  // Avoid sealing an empty session cookie for anonymous visitors.
  if (!getCookie(event, SESSION_COOKIE)) return undefined;

  const session = await getSession<XibraSession>(event, sessionConfig);
  if (typeof session.data.token !== "string" || session.data.token === "")
    return undefined;

  return session.data;
}

export async function writeSession(
  event: RequestEvent,
  data: XibraSession,
): Promise<void> {
  const session = await useSession<XibraSession>(event, sessionConfig);
  await session.update(data);
}

export async function destroySession(event: RequestEvent): Promise<void> {
  await clearSession(event, sessionConfig);
}
