import { readBody } from "nuxt/server";
import { assertSameOrigin, defineBffHandler } from "../../utils/bff";
import { callXibraApi } from "../../utils/xibra-api";

type ForgotPasswordBody = {
  email?: unknown;
};

/**
 * Request a password reset link.
 *
 * The API answers identically for every outcome, so the BFF adds nothing that
 * could reveal whether an account exists. Only validation errors are surfaced.
 */
export default defineBffHandler(async (event) => {
  assertSameOrigin(event);

  const body = await readBody<ForgotPasswordBody>(event);
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  await callXibraApi("/auth/forgot-password", {
    method: "POST",
    body: { email },
  });

  return { success: true };
});
