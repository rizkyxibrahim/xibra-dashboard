<script setup lang="ts">
const { theme, toggleTheme } = useShell();

const label = computed(() =>
  theme.value === "dark" ? "Switch to light theme" : "Switch to dark theme",
);
</script>

<template>
  <button
    type="button"
    class="btn btn-icon text-default-500 hover:bg-default-100 hover:text-default-900"
    :aria-label="label"
    :title="label"
    @click="toggleTheme"
  >
    <AppIcon :name="theme === 'dark' ? 'sun' : 'moon'" class="size-4.5" />
  </button>
</template>
