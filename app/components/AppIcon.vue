<script setup lang="ts">
import { computed } from "vue";
import { iconSet, type IconDefinition, type IconName } from "~/utils/icons";

const props = defineProps<{ name: IconName }>();

const icon = computed<IconDefinition>(() => iconSet[props.name]);
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <circle
      v-for="(circle, index) in icon.circles ?? []"
      :key="`circle-${index}`"
      :cx="circle.cx"
      :cy="circle.cy"
      :r="circle.r"
    />
    <path
      v-for="(path, index) in icon.paths"
      :key="`path-${index}`"
      :d="path"
    />
  </svg>
</template>
