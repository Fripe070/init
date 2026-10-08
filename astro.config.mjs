// @ts-check
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

import netlify from "@astrojs/netlify";

function getSiteUrl() {
    if (process.env.CONTEXT === "deploy-preview") return process.env.DEPLOY_PRIME_URL;

    if (process.env.CONTEXT === "production" || process.env.CI === "true")
        return "https://init.kth.it";

    return process.env.SITE_URL || "http://localhost:4321";
}

// https://astro.build/config
export default defineConfig({
    site: getSiteUrl(),

    vite: {
        plugins: [tailwindcss()],
    },

    adapter: netlify({
        devFeatures: {
            edgeFunctions: false,
        },
    }),
});
