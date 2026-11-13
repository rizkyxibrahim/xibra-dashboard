<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
    defineProps<{
        type?: 'button' | 'submit'
        variant?: 'primary' | 'secondary' | 'ghost'
        loading?: boolean
        disabled?: boolean
        block?: boolean
    }>(),
    {
        type: 'button',
        variant: 'primary',
        loading: false,
        disabled: false,
        block: false,
    },
)

const variants = {
    primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700 focus-visible:ring-brand-500',
    secondary: 'border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:ring-slate-400',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400',
} as const

const classes = computed(() => [
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    variants[props.variant],
    props.block ? 'w-full' : '',
])
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