<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
  }>(),
  { subtitle: undefined },
);
</script>

<template>
  <div class="mt-8 text-center">
    <h1 class="text-2xl font-semibold tracking-tight text-default-900">
      {{ title }}
    </h1>
    <p v-if="subtitle" class="mt-2 text-sm text-default-500">
      {{ subtitle }}
    </p>
  </div>
</template>
