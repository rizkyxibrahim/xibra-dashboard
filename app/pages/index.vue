<script setup lang="ts">
import type { ActivityItem } from "~/utils/activity";

definePageMeta({ middleware: "auth" });

const user = useAuthUser();

useHead({ title: "Overview" });

type ActivityResponse = { items: ActivityItem[] };

const request = import.meta.server ? useRequestFetch() : $fetch;

const {
  data: activity,
  error: activityError,
  pending: activityPending,
  refresh: refreshActivity,
} = await useAsyncData(
  "overview-activity",
  () => request<ActivityResponse>("/api/me/activity"),
  { default: () => ({ items: [] }) },
);

const greeting = computed(() => {
  const firstName = user.value?.name.trim().split(/\s+/)[0];
  return firstName ? `Welcome back, ${firstName}` : "Welcome back";
});

const roleLabels = computed(
  () => user.value?.roles.map((role) => role.label).join(", ") || "Member",
);

const memberSince = computed(() => formatDate(user.value?.createdAt));

const emailFooter = computed(() => {
  if (!user.value?.email) return "Add an email to enable password recovery.";

  return user.value.emailVerifiedAt
    ? "Verification completed."
    : "Verification pending.";
});
const needsVerification = computed(
  () => Boolean(user.value?.email) && !user.value?.emailVerifiedAt,
);

const activityItems = computed(() =>
  (activity.value?.items ?? []).map((item) => ({
    ...item,
    description: describeActivity(item.action),
  })),
);

const { sending, feedback, send } = useEmailVerification();

async function resendVerification() {
  await send();

  // A successful send is itself an audited event, so refresh the list.
  if (feedback.value?.tone === "success") await refreshActivity();
}
</script>

<template>
  <div v-if="user" class="space-y-6">
    <AppPageTitle title="Overview" subtitle="Your private Xibra workspace" />

    <AppAlert v-if="needsVerification" tone="info" class="text-left">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p>
          Verify <strong>{{ user.email }}</strong> to enable password recovery.
        </p>
        <AppButton variant="secondary" size="sm" :loading="sending" @click="resendVerification">
          {{ sending ? "Sending…" : "Resend link" }}
        </AppButton>
      </div>
      <p v-if="feedback" class="mt-2 text-xs" :class="feedback.tone === 'success' ? 'text-success' : 'text-danger'">
        {{ feedback.message }}
      </p>
    </AppAlert>

    <!-- Welcome banner: tinted card, matching the template's highlight cards. -->
    <section class="card overflow-hidden bg-primary/10">
      <div class="card-body flex flex-wrap items-center justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest text-primary">
            Signed in
          </p>
          <h2 class="mt-1 text-2xl font-semibold tracking-tight text-default-900">
            {{ greeting }}
          </h2>
          <p class="mt-1 text-sm text-default-700">
            Last sign-in {{ formatDateTime(user.lastLoginAt) }}
          </p>
        </div>
        <span class="badge bg-primary text-white">{{ roleLabels }}</span>
      </div>
    </section>

    <!-- Summary cards share one structure, so every footer line lines up. -->
    <section class="grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <article class="card h-full overflow-hidden bg-success/15">
        <div class="card-body relative flex h-full flex-col">
          <AppIcon name="mail" class="absolute -end-10 top-0 size-32 text-success/10" />
          <div class="btn btn-icon size-12 bg-success text-white">
            <AppIcon name="mail" class="size-6" />
          </div>
          <h5 class="mt-5 mb-2 truncate text-lg font-semibold text-default-900">
            {{ user.email ?? "Not provided" }}
          </h5>
          <p class="text-sm text-default-700">Email</p>
          <p class="mt-auto flex min-h-8 items-center gap-2 pt-3 text-xs text-default-600">
            <AppIcon v-if="user.email" :name="user.emailVerifiedAt ? 'check' : 'shield'" class="size-4 shrink-0"
              :class="user.emailVerifiedAt ? 'text-success' : 'text-warning'" />
            <span class="truncate">{{ emailFooter }}</span>
          </p>
        </div>
      </article>

      <article class="card h-full overflow-hidden bg-secondary/15">
        <div class="card-body relative flex h-full flex-col">
          <AppIcon name="shield" class="absolute -end-10 top-0 size-32 text-secondary/10" />
          <div class="btn btn-icon size-12 bg-secondary text-white">
            <AppIcon name="shield" class="size-6" />
          </div>
          <h5 class="mt-5 mb-2 truncate text-lg font-semibold text-default-900">
            {{ roleLabels }}
          </h5>
          <p class="text-sm text-default-700">Role</p>
          <p class="mt-auto flex min-h-8 items-center pt-3 text-xs text-default-600">
            <span class="truncate">Assigned by invitation.</span>
          </p>
        </div>
      </article>

      <article class="card h-full overflow-hidden bg-info/15">
        <div class="card-body relative flex h-full flex-col">
          <AppIcon name="clock" class="absolute -end-10 top-0 size-32 text-info/10" />
          <div class="btn btn-icon size-12 bg-info text-white">
            <AppIcon name="clock" class="size-6" />
          </div>
          <h5 class="mt-5 mb-2 truncate text-lg font-semibold text-default-900">
            {{ memberSince }}
          </h5>
          <p class="text-sm text-default-700">Member since</p>
          <p class="mt-auto flex min-h-8 items-center pt-3 text-xs text-default-600">
            <span class="truncate">Username <strong>@{{ user.username }}</strong></span>
          </p>
        </div>
      </article>
    </section>

    <section class="grid gap-5 xl:grid-cols-3">
      <article class="card xl:col-span-2">
        <div class="card-header">
          <div>
            <h2 class="card-title">Recent activity</h2>
            <p class="text-xs text-default-400">
              Security events recorded for your account.
            </p>
          </div>
          <AppButton variant="ghost" size="sm" :loading="activityPending" @click="refreshActivity()">
            Refresh
          </AppButton>
        </div>

        <div v-if="activityError" class="card-body">
          <AppAlert tone="error" class="text-left">
            Activity could not be loaded. Try refreshing the list.
          </AppAlert>
        </div>

        <ul v-else-if="activityItems.length > 0" class="divide-y divide-default-200">
          <li v-for="item in activityItems" :key="item.id" class="flex items-start gap-3 px-5 py-3">
            <span class="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-default-100 text-default-500"
              aria-hidden="true">
              <AppIcon :name="item.description.icon" class="size-4" />
            </span>
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-default-900">
                {{ item.description.label }}
              </p>
              <p class="text-xs text-default-400">
                {{ formatDateTime(item.createdAt) }}
              </p>
            </div>
          </li>
        </ul>

        <p v-else class="px-5 py-6 text-sm text-default-500">
          {{ activityPending ? "Loading activity…" : "No recorded activity yet." }}
        </p>
      </article>

      <article class="card">
        <div class="card-header">
          <h2 class="card-title">Contact</h2>
          <AppIcon name="user" class="size-4 text-default-400" />
        </div>
        <dl class="card-body space-y-3 text-sm">
          <div>
            <dt class="text-default-500">Email</dt>
            <dd class="truncate font-medium text-default-900">
              {{ user.email ?? "Not provided" }}
            </dd>
          </div>
          <div>
            <dt class="text-default-500">Phone</dt>
            <dd class="font-medium text-default-900">
              {{ user.phone ?? "Not provided" }}
            </dd>
          </div>
          <div>
            <dt class="text-default-500">Last sign-in</dt>
            <dd class="font-medium text-default-900">
              {{ formatDateTime(user.lastLoginAt) }}
            </dd>
          </div>
        </dl>
        <div class="card-footer">
          <p class="text-xs text-default-400">
            Session stored in a sealed httpOnly cookie. Signing out revokes the
            API token behind it.
          </p>
        </div>
      </article>
    </section>
  </div>
</template>