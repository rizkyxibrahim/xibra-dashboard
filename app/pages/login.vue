<script setup lang="ts">
definePageMeta({
  layout: "auth",
  middleware: "guest",
});

const route = useRoute();
const identifier = ref("");
const password = ref("");
const submitting = ref(false);
const error = ref<ApiErrorPayload | null>(null);

useHead({ title: "Sign in" });

const redirectTarget = computed(() => safeRedirectPath(route.query.redirect));

/**
 * Post-reset confirmation. The password reset page redirects here so the
 * success message survives the navigation without a query-only notice system.
 */
const notice = computed(() =>
  route.query.reset === "1"
    ? "Your password has been reset. Sign in with your new password."
    : null,
);

async function submit() {
  if (submitting.value) return;

  error.value = null;
  submitting.value = true;

  try {
    await login(identifier.value, password.value);
    await navigateTo(redirectTarget.value);
  } catch (cause) {
    error.value = toApiError(cause);
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <AppAuthHeading
    title="Welcome back"
    subtitle="Sign in to your private Xibra dashboard."
  />

  <AppAlert v-if="notice && !error" tone="success" class="mt-6 text-left">
    {{ notice }}
  </AppAlert>

  <AppAlert v-if="error" tone="error" class="mt-6 text-left">
    {{ error.message }}
    <p v-if="error.retryAfter" class="mt-1 text-xs">
      Try again in {{ error.retryAfter }} seconds.
    </p>
  </AppAlert>

  <form class="mt-8 space-y-5 text-left" novalidate @submit.prevent="submit">
    <AppField
      id="identifier"
      v-model="identifier"
      label="Username, email, or phone"
      autocomplete="username"
      :error="fieldError(error, 'identifier')"
      required
      autofocus
    />

    <AppField
      id="password"
      v-model="password"
      label="Password"
      type="password"
      autocomplete="current-password"
      :error="fieldError(error, 'password')"
      required
    />

    <p class="text-right">
      <NuxtLink
        to="/forgot-password"
        class="text-xs font-medium text-primary hover:underline"
      >
        Forgot your password?
      </NuxtLink>
    </p>

    <AppButton type="submit" block :loading="submitting">
      {{ submitting ? "Signing in…" : "Sign in" }}
    </AppButton>
  </form>

  <p class="mt-8 text-center text-xs text-default-400">
    Access is invitation-only. Contact the platform owner if you need an
    account.
  </p>
</template>
