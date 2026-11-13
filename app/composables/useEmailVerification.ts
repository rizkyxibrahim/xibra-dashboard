export type VerificationFeedback = {
  tone: "success" | "error";
  message: string;
};

/**
 * Request a fresh email verification link.
 *
 * Shared by the overview banner and the account settings page so the
 * rate-limit messaging stays identical in both places.
 */
export function useEmailVerification() {
  const sending = ref(false);
  const feedback = ref<VerificationFeedback | null>(null);

  async function send(): Promise<void> {
    if (sending.value) return;

    sending.value = true;
    feedback.value = null;

    try {
      await $fetch("/api/auth/email/resend", { method: "POST" });
      feedback.value = {
        tone: "success",
        message: "Verification link sent. Check your inbox.",
      };
    } catch (cause) {
      const payload = toApiError(cause);

      feedback.value = {
        tone: "error",
        message: payload.retryAfter
          ? `${payload.message} Try again in ${payload.retryAfter} seconds.`
          : payload.message,
      };
    } finally {
      sending.value = false;
    }
  }

  return { sending, feedback, send };
}
