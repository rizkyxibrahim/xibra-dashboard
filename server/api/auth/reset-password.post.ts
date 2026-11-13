import { readBody } from "nuxt/server";
import { assertSameOrigin, defineBffHandler } from "../../utils/bff";
import { callXibraApi } from "../../utils/xibra-api";

type ResetPasswordBody = {
  token?: unknown;
  password?: unknown;
  password_confirmation?: unknown;
};

/**
 * Consume a single-use reset token and set the new password.
 *
 * The API revokes every existing token on success, so any dashboard session
 * belonging to the account becomes invalid.
 */
export default defineBffHandler(async (event) => {
  assertSameOrigin(event);

  const body = await readBody<ResetPasswordBody>(event);

  await callXibraApi("/auth/reset-password", {
    method: "POST",
    body: {
      token: typeof body?.token === "string" ? body.token.trim() : "",
      // Passwords are never trimmed: surrounding spaces are significant.
      password: typeof body?.password === "string" ? body.password : "",
      password_confirmation:
        typeof body?.password_confirmation === "string"
          ? body.password_confirmation
          : "",
    },
  });

  return { success: true };
});
