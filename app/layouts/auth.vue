<template>
  <div class="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-16">
    <div class="card z-10 w-full max-w-md">
      <div class="px-8 py-10 text-center sm:px-10 sm:py-12">
        <NuxtLink to="/" class="inline-flex justify-center" aria-label="Xibra Platform">
          <AppLogo />
        </NuxtLink>

        <div class="mt-8">
          <slot />
        </div>
      </div>
    </div>

    <!-- Decorative background drawn inline: no external image is requested. -->
    <div class="absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg
        class="absolute inset-0 size-full fill-black/[0.02] stroke-black/5 dark:fill-white/[0.025] dark:stroke-white/[0.025]">
        <defs>
          <pattern id="authPattern" width="56" height="56" patternUnits="userSpaceOnUse" x="50%" y="16">
            <path d="M.5 56V.5H72" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" stroke-width="0" fill="url(#authPattern)" />
      </svg>
    </div>
  </div>
</template>