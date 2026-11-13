<script setup lang="ts">
const { theme } = useShell();

useHead({
  htmlAttrs: { "data-theme": theme },
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
