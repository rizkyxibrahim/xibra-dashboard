<template>
    <div class="relative flex min-h-screen flex-col bg-slate-50">
        <div class="pointer-events-none absolute inset-x-0 top-0 h-64 bg-linear-to-b from-brand-100/70 to-transparent"
            aria-hidden="true" />

        <header class="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
            <AppLogo />
            <span class="text-xs font-medium uppercase tracking-wider text-slate-400">Private access</span>
        </header>

        <main class="relative z-10 flex flex-1 items-start justify-center px-6 pb-16 pt-4 sm:items-center sm:pt-0">
            <div class="w-full max-w-md">
                <slot />
            </div>
        </main>

        <footer class="relative z-10 px-6 pb-6 text-center text-xs text-slate-400">
            Xibra Platform · Invitation-only access
        </footer>
    </div>
</template>