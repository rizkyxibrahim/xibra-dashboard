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
  <div class="flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight text-default-900">
        {{ title }}
      </h1>
      <p v-if="subtitle" class="mt-1 text-sm text-default-500">
        {{ subtitle }}
      </p>
    </div>
    <slot />
  </div>
</template>
