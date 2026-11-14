import VueApexCharts from "vue3-apexcharts";

/**
 * Client-only: ApexCharts draws into the DOM and has no server rendering.
 * Registered globally so `<apexchart>` is available in any page once a chart
 * is needed. Not used by any page yet.
 */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueApexCharts);
});
