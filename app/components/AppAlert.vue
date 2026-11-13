<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    tone?: "error" | "info" | "success";
    title?: string;
  }>(),
  { tone: "info" },
);

const tones = {
  error: "border-danger/20 bg-danger/5 text-danger",
  info: "border-default-200 bg-default-100 text-default-700",
  success: "border-success/20 bg-success/5 text-success",
} as const;

const classes = computed(() => [
  "rounded-lg border px-4 py-3 text-sm",
  tones[props.tone],
]);
</script>

<template>
  <div :class="classes" :role="tone === 'error' ? 'alert' : 'status'">
    <p v-if="title" class="font-semibold">{{ title }}</p>
    <div :class="title ? 'mt-1' : ''">
      <slot />
    </div>
  </div>
</template>
