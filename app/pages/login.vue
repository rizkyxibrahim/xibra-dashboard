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
  <div class="mt-8 text-center">
    <h1 class="text-2xl font-semibold tracking-tight text-default-900">
      Welcome back
    </h1>
    <p class="mt-2 text-sm text-default-500">
      Sign in to your private Xibra dashboard.
    </p>
  </div>

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

    <AppButton type="submit" block :loading="submitting">
      {{ submitting ? "Signing in…" : "Sign in" }}
    </AppButton>
  </form>

  <p class="mt-8 text-center text-xs text-default-400">
    Access is invitation-only. Contact the platform owner if you need an
    account.
  </p>
</template>
