<script setup lang="ts">
const route = useRoute();
const user = useAuthUser();
const navigation = useNavigation();

const sidenavOpen = ref(false);
const signingOut = ref(false);

const activeItem = computed(() =>
  navigation.value.find((item) => item.to === route.path),
);

const pageLabel = computed(() => activeItem.value?.label ?? "Dashboard");

watch(
  () => route.fullPath,
  () => {
    sidenavOpen.value = false;
  },
);

async function handleSignOut() {
  if (signingOut.value) return;

  signingOut.value = true;
  try {
    await logout();
  } finally {
    signingOut.value = false;
  }

  await navigateTo("/login");
}
</script>

<template>
  <div class="min-h-screen bg-body-bg">
    <div
      v-if="sidenavOpen"
      class="fixed inset-0 z-40 bg-default-950/40 lg:hidden"
      aria-hidden="true"
      @click="sidenavOpen = false"
    />

    <aside
      class="fixed inset-y-0 left-0 z-50 flex w-sidenav-width flex-col border-r border-default-200 bg-card transition-transform duration-300 lg:translate-x-0"
      :class="sidenavOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div
        class="flex h-topbar-height shrink-0 items-center justify-between border-b border-default-200 px-5"
      >
        <AppLogo />
        <button
          type="button"
          class="btn btn-icon text-default-500 hover:bg-default-100 lg:hidden"
          aria-label="Close navigation"
          @click="sidenavOpen = false"
        >
          <AppIcon name="close" class="size-5" />
        </button>
      </div>

      <nav class="flex-1 overflow-y-auto px-3 py-4" aria-label="Primary">
        <p
          class="px-3 pb-2 text-[11px] font-semibold uppercase tracking-widest text-default-400"
        >
          Workspace
        </p>
        <ul class="space-y-1">
          <li v-for="item in navigation" :key="item.to">
            <NuxtLink
              :to="item.to"
              class="menu-link"
              :class="{ 'menu-link-active': route.path === item.to }"
            >
              <AppIcon :name="item.icon" class="size-4.5 shrink-0" />
              <span class="truncate">{{ item.label }}</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="border-t border-default-200 px-5 py-4">
        <p class="text-xs font-medium text-default-500">Xibra Platform</p>
        <p class="mt-1 text-[11px] text-default-400">
          Private workspace · invitation only
        </p>
      </div>
    </aside>

    <div class="flex min-h-screen flex-col lg:pl-sidenav-width">
      <header
        class="sticky top-0 z-30 flex h-topbar-height items-center gap-3 border-b border-default-200 bg-card/90 px-4 backdrop-blur sm:px-6"
      >
        <button
          type="button"
          class="btn btn-icon text-default-500 hover:bg-default-100 lg:hidden"
          aria-label="Open navigation"
          @click="sidenavOpen = true"
        >
          <AppIcon name="menu" class="size-5" />
        </button>

        <p class="truncate text-sm font-semibold text-default-900">
          {{ pageLabel }}
        </p>

        <div class="ml-auto flex items-center gap-1.5">
          <AppThemeToggle />
          <AppUserMenu
            :user="user"
            :signing-out="signingOut"
            @sign-out="handleSignOut"
          />
        </div>
      </header>

      <main class="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <slot />
      </main>

      <footer
        class="border-t border-default-200 px-4 py-4 text-xs text-default-400 sm:px-6"
      >
        © {{ new Date().getFullYear() }} Xibra Platform
      </footer>
    </div>
  </div>
</template>
