/**
 * Inline icon set.
 *
 * The dashboard deliberately ships a tiny hand-picked icon set instead of an
 * icon package that resolves names over the network at runtime. That keeps the
 * private dashboard free of third-party requests and avoids shipping a large
 * icon bundle for a handful of glyphs.
 *
 * Paths follow the Lucide 24x24 grid.
 */
export type IconDefinition = {
  paths: string[];
  circles?: Array<{ cx: number; cy: number; r: number }>;
};

export const iconSet = {
  menu: { paths: ["M4 6h16", "M4 12h16", "M4 18h16"] },
  close: { paths: ["M18 6 6 18", "m6 6 12 12"] },
  dashboard: {
    paths: ["M3 3h8v8H3z", "M13 3h8v5h-8z", "M13 10h8v11h-8z", "M3 13h8v8H3z"],
  },
  sun: {
    paths: [
      "M12 2v2",
      "M12 20v2",
      "M4.93 4.93l1.41 1.41",
      "M17.66 17.66l1.41 1.41",
      "M2 12h2",
      "M20 12h2",
      "M4.93 19.07l1.41-1.41",
      "M17.66 6.34l1.41-1.41",
    ],
    circles: [{ cx: 12, cy: 12, r: 4 }],
  },
  moon: {
    paths: ["M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"],
  },
  "chevron-down": { paths: ["m6 9 6 6 6-6"] },
  "log-out": {
    paths: [
      "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",
      "m16 17 5-5-5-5",
      "M21 12H9",
    ],
  },
  user: {
    paths: ["M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"],
    circles: [{ cx: 12, cy: 7, r: 4 }],
  },
  mail: { paths: ["M4 5h16v14H4z", "m4 7 8 6 8-6"] },
  phone: {
    paths: [
      "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2z",
    ],
  },
  shield: { paths: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"] },
  check: { paths: ["M20 6 9 17l-5-5"] },
  activity: { paths: ["M22 12h-4l-3 9L9 3l-3 9H2"] },
  clock: {
    paths: ["M12 6v6l4 2"],
    circles: [{ cx: 12, cy: 12, r: 10 }],
  },
} satisfies Record<string, IconDefinition>;

export type IconName = keyof typeof iconSet;
