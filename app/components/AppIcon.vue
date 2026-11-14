<script setup lang="ts">
import { computed } from "vue";
import { iconComponents, type IconName } from "~/utils/icons";

const props = defineProps<{ name: IconName }>();

const component = computed(() => iconComponents[props.name]);
</script>

<template>
  <component :is="component" aria-hidden="true" focusable="false" class="shrink-0" :stroke-width="1.75" />
</template>