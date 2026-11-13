<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const user = useAuthUser()

useHead({ title: 'Overview' })

const greeting = computed(() => {
    const firstName = user.value?.name.trim().split(/\s+/)[0]
    return firstName ? `Welcome back, ${firstName}` : 'Welcome back'
})

const roleLabels = computed(
    () => user.value?.roles.map((role) => role.label).join(', ') || 'Member',
)
</script>

<template>
    <div v-if="user" class="space-y-8">
        <section class="space-y-1">
            <p class="text-sm font-medium text-brand-600">Overview</p>
            <h1 class="text-3xl font-semibold tracking-tight text-slate-900">{{ greeting }}</h1>
            <p class="text-sm text-slate-500">This is your private Xibra dashboard.</p>
        </section>

        <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <article class="rounded-card border border-slate-200 bg-white p-5 shadow-sm">
                <h2 class="text-sm font-semibold text-slate-900">Account</h2>
                <dl class="mt-4 space-y-3 text-sm">
                    <div>
                        <dt class="text-slate-500">Name</dt>
                        <dd class="font-medium text-slate-900">{{ user.name }}</dd>
                    </div>
                    <div>
                        <dt class="text-slate-500">Username</dt>
                        <dd class="font-medium text-slate-900">@{{ user.username }}</dd>
                    </div>
                    <div>
                        <dt class="text-slate-500">Role</dt>
                        <dd class="font-medium text-slate-900">{{ roleLabels }}</dd>
                    </div>
                </dl>
            </article>

            <article class="rounded-card border border-slate-200 bg-white p-5 shadow-sm">
                <h2 class="text-sm font-semibold text-slate-900">Contact</h2>
                <dl class="mt-4 space-y-3 text-sm">
                    <div>
                        <dt class="text-slate-500">Email</dt>
                        <dd class="flex flex-wrap items-center gap-2 font-medium text-slate-900">
                            <span>{{ user.email ?? 'Not provided' }}</span>
                            <span v-if="user.email" class="rounded-full px-2 py-0.5 text-xs font-semibold" :class="user.emailVerifiedAt
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'">
                                {{ user.emailVerifiedAt ? 'Verified' : 'Not verified' }}
                            </span>
                        </dd>
                    </div>
                    <div>
                        <dt class="text-slate-500">Phone</dt>
                        <dd class="font-medium text-slate-900">{{ user.phone ?? 'Not provided' }}</dd>
                    </div>
                </dl>
            </article>

            <article class="rounded-card border border-slate-200 bg-white p-5 shadow-sm">
                <h2 class="text-sm font-semibold text-slate-900">Security</h2>
                <dl class="mt-4 space-y-3 text-sm">
                    <div>
                        <dt class="text-slate-500">Last sign-in</dt>
                        <dd class="font-medium text-slate-900">{{ formatDateTime(user.lastLoginAt) }}</dd>
                    </div>
                    <div>
                        <dt class="text-slate-500">Session storage</dt>
                        <dd class="font-medium text-slate-900">Sealed httpOnly cookie</dd>
                    </div>
                </dl>
                <p class="mt-4 text-xs text-slate-400">
                    Signing out revokes this session and the API token behind it.
                </p>
            </article>
        </section>
    </div>
</template>