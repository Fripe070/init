// @ts-check
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

import netlify from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
  site:
    process.env.DEPLOY_PRIME_URL ||
    process.env.URL ||
    (process.env.CI === "true"
      ? "https://init.kth.it"
      : "http://localhost:4321"),

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: netlify({
    devFeatures: {
      edgeFunctions: false,
    },
  }),
});
