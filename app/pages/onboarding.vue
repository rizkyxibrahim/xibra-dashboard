<script setup lang="ts">
definePageMeta({ layout: "auth", middleware: "guest" });

useHead({ title: "Complete your account" });

type OnboardingSessionInfo = {
  active: boolean;
  roleLabel: string | null;
  expiresAt: string | null;
};

/** Session failures that cannot be retried with the same cookie. */
const TERMINAL_CODES = new Set([
  "ONBOARDING_SESSION_MISSING",
  "ONBOARDING_SESSION_INVALID",
  "ONBOARDING_SESSION_EXPIRED",
  "ONBOARDING_SESSION_CONSUMED",
]);

const request = import.meta.server ? useRequestFetch() : $fetch;

const { data } = await useAsyncData("onboarding-session", () =>
  request<OnboardingSessionInfo>("/api/onboarding/session"),
);

const info = computed<OnboardingSessionInfo>(
  () => data.value ?? { active: false, roleLabel: null, expiresAt: null },
);

const form = reactive({
  name: "",
  username: "",
  email: "",
  phone: "",
  password: "",
  passwordConfirmation: "",
});

const submitting = ref(false);
const expired = ref(false);
const error = ref<ApiErrorPayload | null>(null);
const formError = ref<string | null>(null);

const unavailable = computed(() => !info.value.active || expired.value);

const subtitle = computed(() => {
  if (info.value.roleLabel) {
    return `You are joining as ${info.value.roleLabel}. Choose your identity and password.`;
  }

  return "Choose your identity and password.";
});

async function submit() {
  if (submitting.value) return;

  error.value = null;
  formError.value = null;

  if (form.password.length < 12) {
    formError.value = "Choose a password with at least 12 characters.";
    return;
  }

  if (form.password !== form.passwordConfirmation) {
    formError.value = "The password confirmation does not match.";
    return;
  }

  submitting.value = true;

  try {
    await $fetch("/api/onboarding/complete", {
      method: "POST",
      body: {
        name: form.name,
        username: form.username,
        email: form.email,
        phone: form.phone,
        password: form.password,
      },
    });

    await navigateTo("/");
  } catch (cause) {
    error.value = toApiError(cause);

    if (TERMINAL_CODES.has(error.value.code)) expired.value = true;
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div v-if="unavailable">
    <AppAuthHeading
      title="Onboarding unavailable"
      subtitle="This onboarding session is no longer valid."
    />

    <AppAlert tone="error" class="mt-8 text-left" title="Session expired">
      Onboarding sessions last 15 minutes and can be used once. Ask the platform
      owner for a new invitation.
    </AppAlert>

    <AppButton class="mt-6" block @click="navigateTo('/login')">
      Go to sign in
    </AppButton>
  </div>

  <div v-else>
    <AppAuthHeading title="Complete your account" :subtitle="subtitle" />

    <p
      v-if="info.expiresAt"
      class="mt-3 text-center text-xs text-default-400"
    >
      This session expires {{ formatDateTime(info.expiresAt) }}.
    </p>

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
        id="name"
        v-model="form.name"
        label="Full name"
        autocomplete="name"
        :error="fieldError(error, 'name')"
        required
        autofocus
      />

      <AppField
        id="username"
        v-model="form.username"
        label="Username"
        autocomplete="username"
        hint="Lowercase letters, numbers, dots, hyphens, and underscores."
        :error="fieldError(error, 'username')"
        required
      />

      <AppField
        id="email"
        v-model="form.email"
        type="email"
        label="Email address (optional)"
        autocomplete="email"
        hint="Needed for password recovery and email verification."
        :error="fieldError(error, 'email')"
      />

      <AppField
        id="phone"
        v-model="form.phone"
        type="tel"
        label="Phone number (optional)"
        autocomplete="tel"
        hint="International format, for example +6281234567890."
        :error="fieldError(error, 'phone')"
      />

      <AppField
        id="password"
        v-model="form.password"
        type="password"
        label="Password"
        autocomplete="new-password"
        hint="At least 12 characters."
        :error="fieldError(error, 'password')"
        required
      />

      <AppField
        id="password_confirmation"
        v-model="form.passwordConfirmation"
        type="password"
        label="Confirm password"
        autocomplete="new-password"
        required
      />

      <AppButton type="submit" block :loading="submitting">
        {{ submitting ? "Creating account…" : "Create account" }}
      </AppButton>
    </form>

    <p class="mt-6 text-center text-xs text-default-400">
      Your role is assigned by the invitation and cannot be changed here.
    </p>
  </div>
</template>
