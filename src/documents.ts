import type { Loader } from "astro/loaders";
import { z } from "astro/zod";

export interface Repository {
  owner: string;
  name: string;
  branch: string;
}

const repoKey = (repo: Repository) =>
  `${repo.owner}/${repo.name}/${repo.branch}`;

const filesCache = new Map<string, string[]>();
export async function fetchFiles(repo: Repository): Promise<string[]> {
  const key = repoKey(repo);
  if (filesCache.has(key)) return filesCache.get(key) as string[];

  console.log(
    `Fetching file list from GitHub repository: ${repo.owner}/${repo.name} (branch: ${repo.branch})`,
  );

  const response = await fetch(
    `https://api.github.com/repos/${repo.owner}/${repo.name}/git/trees/${repo.branch}?recursive=1`,
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch repository data: ${response.statusText}`);
  }
  const data = await response.json();
  const files = data.tree
    .filter((node: { type: string }) => node.type === "blob")
    .map((node: { path: string }) => node.path);
  filesCache.set(key, files);
  return files;
}

const contentCache = new Map<string, string>();
async function fetchFileContent(
  path: string,
  repo: Repository,
): Promise<string> {
  const key = `${repoKey(repo)}/${path}`;
  if (contentCache.has(key)) return contentCache.get(key) as string;
  console.log(
    `Fetching file content from GitHub: ${repo.owner}/${repo.name}/${repo.branch}/${path}`,
  );

  const response = await fetch(
    `https://raw.githubusercontent.com/${repo.owner}/${repo.name}/${repo.branch}/${path}`,
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch file content: ${response.statusText}`);
  }
  const content = await response.text();
  contentCache.set(key, content);
  return content;
}

export interface InitDocument {
  id: string;
  content: string;
}

export function documentLoader(options: {
  repo: Repository;
  directory?: string;
  pattern?: RegExp;
}): Loader {
  return {
    name: "document-loader",
    load: async ({ store, parseData }) => {
      // Ensure directory ends with a slash
      options.directory = options.directory?.replace(/\/?$/, "/");

      const filePaths = await fetchFiles(options.repo);
      store.clear();
      for (const filePath of filePaths
        .filter((path) => path.startsWith(options.directory || ""))
        .filter((path) => !options.pattern || options.pattern.test(path))) {
        const id = filePath
          .slice((options.directory || "").length)
          .split("/")
          .slice(0, -1)
          .join("/");
        const content = await fetchFileContent(filePath, options.repo);
        const data = await parseData({ id, data: { content } });
        store.set({ id, data });
      }
    },
    schema: z.object({
      content: z.string(),
    }),
  } satisfies Loader;
}
