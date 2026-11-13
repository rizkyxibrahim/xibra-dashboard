export type AuthUser = {
  id: number;
  name: string;
  username: string;
  email: string | null;
  phone: string | null;
  roles: Array<{ name: string; label: string }>;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
};

export function useAuthUser() {
  return useState<AuthUser | null>("auth:user", () => null);
}

/**
 * Resolve the authenticated user from the BFF.
 *
 * On the server the incoming cookie header must be forwarded to the internal
 * route, so `useRequestFetch` is used there. On the client `$fetch` is enough.
 */
export async function loadAuthUser(): Promise<AuthUser | null> {
  const state = useAuthUser();
  const request = import.meta.server ? useRequestFetch() : $fetch;

  try {
    const { user } = await request<{ user: AuthUser }>("/api/auth/me");
    state.value = user;
    return user;
  } catch (error) {
    if (isUnauthorized(error)) {
      state.value = null;
      return null;
    }

    throw error;
  }
}

export async function login(
  identifier: string,
  password: string,
): Promise<AuthUser> {
  const { user } = await $fetch<{ user: AuthUser }>("/api/auth/login", {
    method: "POST",
    body: { identifier, password },
  });

  useAuthUser().value = user;
  return user;
}

export async function logout(): Promise<void> {
  try {
    await $fetch("/api/auth/logout", { method: "POST" });
  } finally {
    useAuthUser().value = null;
  }
}
