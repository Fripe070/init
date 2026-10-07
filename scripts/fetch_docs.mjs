//@ts-check
import { execFileSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const DIR = resolve(import.meta.dirname, "../init-documents");
const REPO = process.env.INIT_DOC_REPO || "https://github.com/initit/documents.git";
const BRANCH = process.env.INIT_DOC_BRANCH || "main";
const TOKEN = process.env.GITHUB_TOKEN || process.env.INIT_DOC_TOKEN;

const isCI = Boolean(process.env.NETLIFY || process.env.CI);
const force = process.argv.includes("--force") || process.argv.includes("-f");

if (isCI || force) {
  rmSync(DIR, { recursive: true, force: true });
}

if (!existsSync(DIR)) {
  console.log("Cloning documents...");
  const repo = REPO.replace(/^https?:\/\//, "");
  const repoUrl = TOKEN ? `https://${TOKEN}@${repo}` : REPO;

  execFileSync(
    "git",
    ["clone", "--depth", "1", "--branch", BRANCH, repoUrl, DIR],
    { stdio: "inherit" },
  );
} else {
  console.log(`${DIR} already exists. Skipping.`);
}
