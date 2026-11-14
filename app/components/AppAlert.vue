<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    tone?: "error" | "info" | "success" | "warning";
    title?: string;
  }>(),
  { tone: "info" },
);

/** Tinted surfaces taken from the template's highlight-card palette. */
const tones = {
  error: "border-danger/20 bg-danger/10 text-danger",
  info: "border-info/20 bg-info/10 text-info",
  success: "border-success/20 bg-success/10 text-success",
  warning: "border-warning/20 bg-warning/10 text-warning",
} as const;

const classes = computed(() => [
  "rounded-md border px-4 py-3 text-sm",
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