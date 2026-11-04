import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || "https://templatehub.example",
  output: "static",
  integrations: [
    react(),
    sitemap({ filter: (page) => !page.includes("/demos/") }),
  ],
  prefetch: true,
  markdown: { syntaxHighlight: false },
  security: {
    csp: {
      styleDirective: {
        resources: [
          { resource: "'self'", kind: "element" },
          { resource: "'unsafe-inline'", kind: "attribute" },
        ],
      },
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "frame-src 'self'",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'",
      ],
    },
  },
  vite: { plugins: [tailwindcss()], build: { assetsInlineLimit: 0 } },
});
