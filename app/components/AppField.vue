<script setup lang="ts">
const model = defineModel<string>({ required: true })

withDefaults(
    defineProps<{
        id: string
        label: string
        type?: string
        autocomplete?: string
        hint?: string
        error?: string
        required?: boolean
        autofocus?: boolean
    }>(),
    {
        type: 'text',
        required: false,
        autofocus: false,
    },
)
</script>

<template>
    <div class="space-y-1.5">
        <label :for="id" class="block text-sm font-medium text-slate-700">{{ label }}</label>

        <input :id="id" v-model="model" :type="type" :autocomplete="autocomplete" :required="required"
            :autofocus="autofocus" :aria-invalid="error ? 'true' : undefined"
            :aria-describedby="error ? `${id}-error` : hint ? `${id}-hint` : undefined"
            class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            :class="error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30' : ''">

        <p v-if="error" :id="`${id}-error`" class="text-sm text-red-600">{{ error }}</p>
        <p v-else-if="hint" :id="`${id}-hint`" class="text-sm text-slate-500">{{ hint }}</p>
    </div>
</template>