import { defineCollection } from "astro:content";
import { documentLoader, type Repository } from "./documents";

const REPO: Repository = {
  owner: process.env.GITHUB_OWNER || "Fripe070",
  name: process.env.GITHUB_REPO || "documents",
  branch: process.env.GITHUB_BRANCH || "feat/init-ial-migration",
};

const protocols = defineCollection({
  loader: documentLoader({
    repo: REPO,
    directory: "protocols/",
    pattern: /\.typ$/,
  }),
});
const reports = defineCollection({
  loader: documentLoader({
    repo: REPO,
    directory: "reports/",
    pattern: /\.typ$/,
  }),
});

export const collections = { protocols, reports };
