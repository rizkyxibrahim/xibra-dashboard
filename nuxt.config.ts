import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      htmlAttrs: { lang: "en" },
      title: "Private dashboard",
      titleTemplate: "%s · Xibra",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "robots", content: "noindex, nofollow" },
      ],
    },
  },

  runtimeConfig: {
    // Server-only. Never exposed to the browser.
    // Override with NUXT_XIBRA_API_BASE_URL.
    xibraApiBaseUrl: "http://127.0.0.1:8000",
  },

  typescript: {
    strict: true,
  },
});
