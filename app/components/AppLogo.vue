<script setup lang="ts">
withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })
</script>

<template>
    <NuxtLink to="/"
        class="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
        <span class="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-600 text-white shadow-sm"
            aria-hidden="true">
            <svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2.25"
                stroke-linecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
            </svg>
        </span>
        <span v-if="!compact" class="text-lg font-semibold tracking-tight text-slate-900">Xibra</span>
    </NuxtLink>
</template>