<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps<{ error: NuxtError }>();

useHead({ title: "Something went wrong" });

function goHome() {
  clearError({ redirect: "/" });
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-body-bg px-4 py-12">
    <div class="card w-full max-w-md">
      <div class="card-body text-center">
        <span
          class="mx-auto grid size-12 place-items-center rounded-xl bg-danger/10 text-danger"
          aria-hidden="true"
        >
          <AppIcon name="close" class="size-6" />
        </span>

        <p class="mt-4 text-xs font-semibold uppercase tracking-widest text-default-400">
          Error {{ props.error.status }}
        </p>
        <h1 class="mt-1 text-2xl font-semibold tracking-tight text-default-900">
          Something went wrong
        </h1>
        <p class="mt-2 text-sm text-default-500">
          {{
            props.error.status === 404
              ? "The page you requested does not exist."
              : "The dashboard could not complete this request. Please try again."
          }}
        </p>

        <AppButton class="mt-6" block @click="goHome">
          Back to dashboard
        </AppButton>
      </div>
    </div>
  </div>
</template>
