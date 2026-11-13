<script setup lang="ts">
definePageMeta({ layout: "auth" });

const route = useRoute();

const token = computed(() =>
  typeof route.query.token === "string" ? route.query.token : "",
);

const password = ref("");
const confirmation = ref("");
const submitting = ref(false);
const formError = ref<string | null>(null);
const error = ref<ApiErrorPayload | null>(null);

useHead({ title: "Reset password" });

const linkInvalid = computed(
  () =>
    token.value === "" ||
    error.value?.code === "PASSWORD_RESET_TOKEN_INVALID",
);

async function submit() {
  if (submitting.value) return;

  error.value = null;
  formError.value = null;

  if (password.value.length < 12) {
    formError.value = "Choose a password with at least 12 characters.";
    return;
  }

  if (password.value !== confirmation.value) {
    formError.value = "The password confirmation does not match.";
    return;
  }

  submitting.value = true;

  try {
    await $fetch("/api/auth/reset-password", {
      method: "POST",
      body: {
        token: token.value,
        password: password.value,
        password_confirmation: confirmation.value,
      },
    });

    await navigateTo("/login?reset=1");
  } catch (cause) {
    error.value = toApiError(cause);
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <template v-if="linkInvalid">
    <AppAuthHeading
      title="Reset link unavailable"
      subtitle="This password reset link cannot be used."
    />

    <AppAlert tone="error" class="mt-8 text-left" title="Invalid or expired link">
      Reset links expire after 60 minutes and can be used once. Request a new
      link to continue.
    </AppAlert>

    <AppButton class="mt-6" block @click="navigateTo('/forgot-password')">
      Request a new link
    </AppButton>
  </template>

  <template v-else>
    <AppAuthHeading
      title="Choose a new password"
      subtitle="All active sessions will be signed out once the password changes."
    />

    <AppAlert v-if="error" tone="error" class="mt-6 text-left">
      {{ error.message }}
      <p v-if="error.retryAfter" class="mt-1 text-xs">
        Try again in {{ error.retryAfter }} seconds.
      </p>
    </AppAlert>

    <AppAlert v-if="formError" tone="error" class="mt-6 text-left">
      {{ formError }}
    </AppAlert>

    <form class="mt-6 space-y-5 text-left" novalidate @submit.prevent="submit">
      <AppField
        id="password"
        v-model="password"
        type="password"
        label="New password"
        autocomplete="new-password"
        hint="At least 12 characters."
        :error="fieldError(error, 'password')"
        required
        autofocus
      />

      <AppField
        id="password_confirmation"
        v-model="confirmation"
        type="password"
        label="Confirm new password"
        autocomplete="new-password"
        required
      />

      <AppButton type="submit" block :loading="submitting">
        {{ submitting ? "Saving…" : "Set new password" }}
      </AppButton>
    </form>
  </template>
</template>
