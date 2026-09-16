//@ts-check
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

const DIR = "init-documents";
const REPO = process.env.INIT_DOC_REPO || "https://github.com/initit/documents.git";
const BRANCH = process.env.INIT_DOC_BRANCH || "main";
const TOKEN = process.env.GITHUB_TOKEN || process.env.INIT_DOC_TOKEN;

const repo = REPO.replace(/^https?:\/\//, "");
const repoUrl = TOKEN ? `https://${TOKEN}@${repo}` : `https://${repo}`;

if (!existsSync(DIR)) {
  console.log("Missing documents. Cloning...");
  execFileSync(
    "git",
    ["clone", "--depth", "1", "--branch", BRANCH, repoUrl, DIR],
    { stdio: "inherit" },
  );
} else if (process.env.NETLIFY || process.env.CI) {
  console.log("CI environment detected. Pulling latest documents...");
  execFileSync("git", ["-C", DIR, "pull"], { stdio: "inherit" });
} else {
  console.log(`${DIR} Already exists. Skipping.`);
}
