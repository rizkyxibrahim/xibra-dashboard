<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    type?: "button" | "submit";
    variant?: "primary" | "secondary" | "ghost";
    loading?: boolean;
    disabled?: boolean;
    block?: boolean;
  }>(),
  {
    type: "button",
    variant: "primary",
    loading: false,
    disabled: false,
    block: false,
  },
);

const variants = {
  primary:
    "bg-primary text-white shadow-sm hover:bg-primary/90 focus-visible:ring-primary/40",
  secondary:
    "border-default-300 bg-card text-default-700 shadow-sm hover:bg-default-100 focus-visible:ring-default-400/40",
  ghost:
    "text-default-600 hover:bg-default-100 hover:text-default-900 focus-visible:ring-default-400/40",
} as const;

const classes = computed(() => [
  "btn",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  variants[props.variant],
  props.block ? "w-full" : "",
]);
</script>

<template>
  <button
    :type="type"
    :class="classes"
    :disabled="disabled || loading"
    :aria-busy="loading ? 'true' : undefined"
  >
    <svg
      v-if="loading"
      class="size-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
    <slot />
  </button>
</template>
