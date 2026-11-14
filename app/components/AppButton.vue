<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    type?: "button" | "submit";
    variant?: "primary" | "secondary" | "ghost" | "danger" | "danger-ghost";
    size?: "sm" | "md";
    /** Square icon-only button. Pass aria-label when used without text. */
    icon?: boolean;
    loading?: boolean;
    disabled?: boolean;
    block?: boolean;
  }>(),
  {
    type: "button",
    variant: "primary",
    size: "md",
    icon: false,
    loading: false,
    disabled: false,
    block: false,
  },
);

/** Template button variants (outline, ghost, primary) plus two danger tones. */
const variants = {
  primary: "bg-primary text-white hover:bg-primary/90",
  secondary:
    "border border-default-200 bg-transparent text-default-600 hover:border-primary/10 hover:bg-primary/10 hover:text-primary",
  ghost: "bg-transparent text-default-600 hover:bg-primary/10 hover:text-primary",
  danger: "bg-danger text-white hover:bg-danger/90",
  "danger-ghost": "bg-transparent text-danger hover:bg-danger/10",
} as const;

const classes = computed(() => [
  "btn",
  props.size === "sm" && !props.icon ? "btn-sm" : "",
  props.icon ? "btn-icon" : "",
  variants[props.variant],
  props.block ? "w-full" : "",
]);
</script>

<template>
  <button :type="type" :class="classes" :disabled="disabled || loading" :aria-busy="loading ? 'true' : undefined">
    <svg v-if="loading" class="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
    <slot />
  </button>
</template>