<script setup lang="ts">
const model = defineModel<string>({ required: true });

withDefaults(
  defineProps<{
    id: string;
    label: string;
    type?: string;
    autocomplete?: string;
    hint?: string;
    error?: string;
    required?: boolean;
    autofocus?: boolean;
  }>(),
  {
    type: "text",
    required: false,
    autofocus: false,
  },
);
</script>

<template>
  <div>
    <label :for="id" class="form-label">{{ label }}</label>

    <input
      :id="id"
      v-model="model"
      :type="type"
      :autocomplete="autocomplete"
      :required="required"
      :autofocus="autofocus"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="
        error ? `${id}-error` : hint ? `${id}-hint` : undefined
      "
      class="form-input"
      :class="
        error
          ? 'border-danger/60 focus:border-danger focus:ring-danger/20'
          : ''
      "
    />

    <p v-if="error" :id="`${id}-error`" class="mt-1.5 text-xs text-danger">
      {{ error }}
    </p>
    <p
      v-else-if="hint"
      :id="`${id}-hint`"
      class="mt-1.5 text-xs text-default-500"
    >
      {{ hint }}
    </p>
  </div>
</template>
