import tailwindcss from "@tailwindcss/vite";
import type { Plugin } from "vite";

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
    // Override with NUXT_PUBLIC_API_BASE.
    xibraApiBaseUrl: "http://127.0.0.1:8000",
  },

  typescript: {
    strict: true,
  },
});
function defineNuxtConfig(arg0: {
  compatibilityDate: string;
  devtools: { enabled: boolean };
  css: string[];
  vite: { plugins: Plugin<any>[][] };
  app: {
    head: {
      htmlAttrs: { lang: string };
      title: string;
      titleTemplate: string;
      meta: { name: string; content: string }[];
    };
  };
  runtimeConfig: {
    // Server-only. Never exposed to the browser.
    // Override with NUXT_PUBLIC_API_BASE.
    xibraApiBaseUrl: string;
  };
  typescript: { strict: boolean };
});
