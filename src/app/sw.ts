import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig, RuntimeCaching } from "serwist";
import { Serwist, StaleWhileRevalidate, CacheFirst, ExpirationPlugin, CacheableResponsePlugin } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope;

const runtimeCaching: RuntimeCaching[] = [
  // Cache Convex API responses (vehicle listings, etc.)
  {
    matcher: /^https:\/\/.*\.convex\.cloud\/api\/query/,
    handler: new StaleWhileRevalidate({
      cacheName: "convex-query-cache",
      plugins: [
        new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 }),
        new CacheableResponsePlugin({ statuses: [0, 200] }),
      ],
    }),
  },
  // Cache images from Unsplash
  {
    matcher: /^https:\/\/images\.unsplash\.com\/.*/i,
    handler: new CacheFirst({
      cacheName: "unsplash-image-cache",
      plugins: [
        new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 }),
        new CacheableResponsePlugin({ statuses: [0, 200] }),
      ],
    }),
  },
  // Cache Next.js static assets
  {
    matcher: /^https:\/\/.*\/_next\/static\/.*/i,
    handler: new CacheFirst({
      cacheName: "nextjs-static-cache",
      plugins: [
        new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 365 }),
        new CacheableResponsePlugin({ statuses: [0, 200] }),
      ],
    }),
  },
  // Cache vehicle images from Convex storage
  {
    matcher: /^https:\/\/.*\.convex\.cloud\/storage\/.*/i,
    handler: new CacheFirst({
      cacheName: "convex-storage-cache",
      plugins: [
        new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 }),
        new CacheableResponsePlugin({ statuses: [0, 200] }),
      ],
    }),
  },
  // Default cache for everything else
  ...defaultCache,
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching,
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher: ({ request }) => request.mode === "navigate",
      },
    ],
  },
});

serwist.addEventListeners();
