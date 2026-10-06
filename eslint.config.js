import { includeIgnoreFile } from "eslint/config";
import { fileURLToPath } from "node:url";
import eslintPluginAstro from "eslint-plugin-astro";
import eslintConfigPrettier from "eslint-config-prettier";

const gitignorePath = fileURLToPath(new URL("./.gitignore", import.meta.url));

export default [
    includeIgnoreFile(gitignorePath),
    ...eslintPluginAstro.configs.recommended,
    eslintConfigPrettier,
];
