<script setup lang="ts">
definePageMeta({ layout: "auth" });

const route = useRoute();

const token = computed(() =>
  typeof route.query.token === "string" ? route.query.token : "",
);

const MISSING_TOKEN_ERROR: ApiErrorPayload = {
  message:
    "This page needs a verification link. Open the link from your email to verify your address.",
  code: "EMAIL_VERIFICATION_TOKEN_MISSING",
};

const status = ref<"verifying" | "verified" | "failed">(
  token.value === "" ? "failed" : "verifying",
);
const error = ref<ApiErrorPayload | null>(
  token.value === "" ? MISSING_TOKEN_ERROR : null,
);

useHead({ title: "Verify email" });

onMounted(async () => {
  // The server already rendered the "link missing" state for this case.
  if (token.value === "") return;

  try {
    await $fetch("/api/auth/email/verify", {
      method: "POST",
      body: { token: token.value },
    });

    status.value = "verified";
  } catch (cause) {
    error.value = toApiError(cause);
    status.value = "failed";
  } finally {
    // The token is single-use, so it should not linger in the address bar or
    // in browser history. Replacing the entry keeps Back from re-submitting it.
    await navigateTo("/verify-email", { replace: true });
  }
});
</script>

<template>
  <div v-if="status === 'verifying'" class="mt-10 flex flex-col items-center gap-3">
    <svg
      class="size-6 animate-spin text-primary"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
    <p class="text-sm text-default-500">Verifying your email address…</p>
  </div>

  <template v-else-if="status === 'verified'">
    <span
      class="mx-auto mt-8 grid size-12 place-items-center rounded-xl bg-success/10 text-success"
      aria-hidden="true"
    >
      <AppIcon name="check" class="size-6" />
    </span>

    <AppAuthHeading
      title="Email verified"
      subtitle="Your email address is now confirmed."
    />

    <AppAlert tone="success" class="mt-8 text-left">
      Password recovery is now available for this account.
    </AppAlert>

    <AppButton class="mt-6" block @click="navigateTo('/')">
      Continue
    </AppButton>
  </template>

  <template v-else>
    <span
      class="mx-auto mt-8 grid size-12 place-items-center rounded-xl bg-danger/10 text-danger"
      aria-hidden="true"
    >
      <AppIcon name="close" class="size-6" />
    </span>

    <AppAuthHeading
      title="Verification failed"
      subtitle="This link could not be used."
    />

    <AppAlert v-if="error" tone="error" class="mt-8 text-left">
      {{ error.message }}
      <p v-if="error.retryAfter" class="mt-1 text-xs">
        Try again in {{ error.retryAfter }} seconds.
      </p>
    </AppAlert>

    <p class="mt-4 text-center text-xs text-default-400">
      Sign in and request a new verification email if you still need to confirm
      your address.
    </p>

    <AppButton class="mt-6" block @click="navigateTo('/login')">
      Go to sign in
    </AppButton>
  </template>
</template>
