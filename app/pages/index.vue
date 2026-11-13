<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const user = useAuthUser();

useHead({ title: "Overview" });

const greeting = computed(() => {
  const firstName = user.value?.name.trim().split(/\s+/)[0];
  return firstName ? `Welcome back, ${firstName}` : "Welcome back";
});

const roleLabels = computed(
  () => user.value?.roles.map((role) => role.label).join(", ") || "Member",
);
</script>

<template>
  <div v-if="user" class="space-y-6">
    <AppPageTitle title="Overview" subtitle="Your private Xibra workspace" />

    <section class="card">
      <div class="card-body flex flex-wrap items-center justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest text-primary">
            Signed in
          </p>
          <h2 class="mt-1 text-2xl font-semibold tracking-tight text-default-900">
            {{ greeting }}
          </h2>
          <p class="mt-1 text-sm text-default-500">
            Last sign-in {{ formatDateTime(user.lastLoginAt) }}
          </p>
        </div>
        <span class="badge bg-primary/10 text-primary">{{ roleLabels }}</span>
      </div>
    </section>

    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article class="card">
        <div class="card-header">
          <h2 class="card-title">Account</h2>
          <AppIcon name="user" class="size-4 text-default-400" />
        </div>
        <dl class="card-body space-y-3 text-sm">
          <div>
            <dt class="text-default-500">Name</dt>
            <dd class="font-medium text-default-900">{{ user.name }}</dd>
          </div>
          <div>
            <dt class="text-default-500">Username</dt>
            <dd class="font-medium text-default-900">@{{ user.username }}</dd>
          </div>
          <div>
            <dt class="text-default-500">Role</dt>
            <dd class="font-medium text-default-900">{{ roleLabels }}</dd>
          </div>
        </dl>
      </article>

      <article class="card">
        <div class="card-header">
          <h2 class="card-title">Contact</h2>
          <AppIcon name="mail" class="size-4 text-default-400" />
        </div>
        <dl class="card-body space-y-3 text-sm">
          <div>
            <dt class="text-default-500">Email</dt>
            <dd class="flex flex-wrap items-center gap-2 font-medium text-default-900">
              <span>{{ user.email ?? "Not provided" }}</span>
              <span
                v-if="user.email"
                class="badge"
                :class="
                  user.emailVerifiedAt
                    ? 'bg-success/10 text-success'
                    : 'bg-warning/10 text-warning'
                "
              >
                {{ user.emailVerifiedAt ? "Verified" : "Not verified" }}
              </span>
            </dd>
          </div>
          <div>
            <dt class="text-default-500">Phone</dt>
            <dd class="font-medium text-default-900">
              {{ user.phone ?? "Not provided" }}
            </dd>
          </div>
        </dl>
      </article>

      <article class="card">
        <div class="card-header">
          <h2 class="card-title">Security</h2>
          <AppIcon name="shield" class="size-4 text-default-400" />
        </div>
        <dl class="card-body space-y-3 text-sm">
          <div>
            <dt class="text-default-500">Last sign-in</dt>
            <dd class="font-medium text-default-900">
              {{ formatDateTime(user.lastLoginAt) }}
            </dd>
          </div>
          <div>
            <dt class="text-default-500">Session storage</dt>
            <dd class="font-medium text-default-900">Sealed httpOnly cookie</dd>
          </div>
        </dl>
        <div class="card-footer">
          <p class="text-xs text-default-400">
            Signing out revokes this session and the API token behind it.
          </p>
        </div>
      </article>
    </section>
  </div>
</template>
