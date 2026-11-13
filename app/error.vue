<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

useHead({ title: 'Something went wrong' })

function goHome() {
    clearError({ redirect: '/' })
}
</script>

<template>
    <div class="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div
            class="w-full max-w-md rounded-card border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/60">
            <p class="text-sm font-semibold text-brand-600">{{ props.error.status }}</p>
            <h1 class="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Something went wrong</h1>
            <p class="mt-2 text-sm text-slate-500">
                {{ props.error.status === 404
                    ? 'The page you requested does not exist.'
                    : 'The dashboard could not complete this request. Please try again.' }}
            </p>
            <AppButton class="mt-6" block @click="goHome">Back to dashboard</AppButton>
        </div>
    </div>
</template>