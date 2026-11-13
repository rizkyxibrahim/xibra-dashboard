<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
    defineProps<{
        tone?: 'error' | 'info' | 'success'
        title?: string
    }>(),
    { tone: 'info' },
)

const tones = {
    error: 'border-red-200 bg-red-50 text-red-800',
    info: 'border-slate-200 bg-slate-50 text-slate-700',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
} as const

const classes = computed(() => ['rounded-xl border px-4 py-3 text-sm', tones[props.tone]])
</script>

<template>
    <div :class="classes" :role="tone === 'error' ? 'alert' : 'status'">
        <p v-if="title" class="font-semibold">{{ title }}</p>
        <div :class="title ? 'mt-1' : ''">
            <slot />
        </div>
    </div>
</template>