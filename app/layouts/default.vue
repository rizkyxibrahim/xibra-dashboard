<script setup lang="ts">
const route = useRoute()
const user = useAuthUser()
const navigation = useNavigation()
const signingOut = ref(false)

async function handleSignOut() {
    if (signingOut.value) return

    signingOut.value = true
    try {
        await logout()
    } finally {
        signingOut.value = false
    }

    await navigateTo('/login')
}
</script>

<template>
    <div class="min-h-screen bg-slate-50">
        <header class="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
            <div class="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3 sm:px-6">
                <AppLogo />

                <nav class="order-3 flex w-full items-center gap-1 sm:order-none sm:w-auto" aria-label="Primary">
                    <NuxtLink v-for="item in navigation" :key="item.to" :to="item.to"
                        class="rounded-lg px-3 py-1.5 text-sm font-medium transition" :class="route.path === item.to
                            ? 'bg-brand-50 text-brand-700'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'">
                        {{ item.label }}
                    </NuxtLink>
                </nav>

                <div class="ml-auto flex items-center gap-3">
                    <div v-if="user" class="hidden text-right sm:block">
                        <p class="text-sm font-semibold text-slate-900">{{ user.name }}</p>
                        <p class="text-xs text-slate-500">@{{ user.username }}</p>
                    </div>
                    <AppButton variant="secondary" :loading="signingOut" @click="handleSignOut">
                        Sign out
                    </AppButton>
                </div>
            </div>
        </header>

        <main class="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
            <slot />
        </main>
    </div>
</template>