<template>
  <div
    class="relative flex min-h-screen items-center justify-center overflow-hidden bg-body-bg px-4 py-12"
  >
    <div class="absolute inset-0" aria-hidden="true">
      <svg
        class="absolute inset-0 size-full fill-default-900/[0.03] stroke-default-900/[0.06] dark:fill-white/[0.03] dark:stroke-white/[0.06]"
      >
        <defs>
          <pattern
            id="authPattern"
            width="56"
            height="56"
            patternUnits="userSpaceOnUse"
            x="50%"
            y="16"
          >
            <path d="M.5 56V.5H72" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" stroke-width="0" fill="url(#authPattern)" />
      </svg>
    </div>

    <div class="card relative z-10 w-full max-w-md">
      <div class="px-7 py-10 sm:px-9">
        <div class="flex justify-center">
          <AppLogo />
        </div>
        <slot />
      </div>
    </div>
  </div>
</template>
