<script setup lang="ts">
definePageMeta({ layout: "auth" });

const route = useRoute();
const user = useAuthUser();

const token = computed(() => {
  const value = route.params.token;
  return (Array.isArray(value) ? value[0] : value) ?? "";
});

const status = ref<"redeeming" | "failed">("redeeming");
const error = ref<ApiErrorPayload | null>(null);

useHead({ title: "Invitation" });

async function redeem() {
  status.value = "redeeming";
  error.value = null;

  try {
    await $fetch("/api/invitations/redeem", {
      method: "POST",
      body: { secret: token.value },
    });

    await navigateTo("/onboarding");
  } catch (cause) {
    error.value = toApiError(cause);
    status.value = "failed";
  }
}

onMounted(async () => {
  // A signed-in visitor must not redeem an invitation for a second account.
  // The session is resolved here because this page has no auth middleware.
  if (user.value) return;

  try {
    if (await loadAuthUser()) return;
  } catch {
    // Ignore: redemption below surfaces real API problems with a message.
  }

  if (token.value === "") {
    error.value = {
      message: "This invitation link is incomplete.",
      code: "INVITATION_TOKEN_MISSING",
    };
    status.value = "failed";
    return;
  }

  void redeem();
});
</script>

<template>
  <AppAuthHeading
    title="Invitation"
    :subtitle="
      user
        ? 'You are already signed in.'
        : 'Validating your invitation before you continue.'
    "
  />

  <div v-if="user" class="mt-8 space-y-5">
    <AppAlert tone="info">
      You are signed in as <strong>{{ user.name }}</strong>. Invitation links
      create a new account, so sign out first if you need to redeem this one.
    </AppAlert>

    <AppButton block @click="navigateTo('/')">Go to dashboard</AppButton>
  </div>

  <div
    v-else-if="status === 'redeeming'"
    class="mt-10 flex flex-col items-center gap-3"
  >
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
    <p class="text-sm text-default-500">Validating your invitation…</p>
  </div>

  <div v-else class="mt-8 space-y-5">
    <AppAlert v-if="error" tone="error" title="Invitation not accepted">
      {{ error.message }}
      <p v-if="error.retryAfter" class="mt-1 text-xs">
        Try again in {{ error.retryAfter }} seconds.
      </p>
    </AppAlert>

    <AppButton block @click="redeem">Try again</AppButton>

    <p class="text-center text-xs text-default-400">
      Invitations are single-use and expire. Ask the platform owner for a new
      one if this link no longer works.
    </p>
  </div>
</template>
