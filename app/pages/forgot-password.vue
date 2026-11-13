<script setup lang="ts">
definePageMeta({ layout: "auth" });

const email = ref("");
const submitting = ref(false);
const sent = ref(false);
const error = ref<ApiErrorPayload | null>(null);

useHead({ title: "Forgot password" });

async function submit() {
  if (submitting.value) return;

  error.value = null;
  submitting.value = true;

  try {
    await $fetch("/api/auth/forgot-password", {
      method: "POST",
      body: { email: email.value },
    });

    sent.value = true;
  } catch (cause) {
    error.value = toApiError(cause);
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <AppAuthHeading
    title="Forgot password"
    subtitle="We will email you a single-use reset link."
  />

  <template v-if="sent">
    <AppAlert tone="success" class="mt-8 text-left" title="Check your inbox">
      If an active account exists for that email address, a reset link has been
      sent. The link expires in 60 minutes and can be used once.
    </AppAlert>

    <AppButton class="mt-6" block @click="navigateTo('/login')">
      Back to sign in
    </AppButton>
  </template>

  <template v-else>
    <AppAlert v-if="error" tone="error" class="mt-6 text-left">
      {{ error.message }}
      <p v-if="error.retryAfter" class="mt-1 text-xs">
        Try again in {{ error.retryAfter }} seconds.
      </p>
    </AppAlert>

    <form class="mt-8 space-y-5 text-left" novalidate @submit.prevent="submit">
      <AppField
        id="email"
        v-model="email"
        type="email"
        label="Email address"
        autocomplete="email"
        :error="fieldError(error, 'email')"
        required
        autofocus
      />

      <AppButton type="submit" block :loading="submitting">
        {{ submitting ? "Sending…" : "Send reset link" }}
      </AppButton>
    </form>

    <p class="mt-6 text-center text-xs text-default-400">
      <NuxtLink
        to="/login"
        class="font-medium text-primary hover:underline"
      >
        Back to sign in
      </NuxtLink>
    </p>
  </template>
</template>
