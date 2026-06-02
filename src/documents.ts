import path from "node:path";

const importedDocs = import.meta.glob("/init-documents/**/*.typ", {
  query: "?raw",
});

export interface DocumentEntry {
  path: string;
  content: string;
}

const typstDocuments: {
  protocols: DocumentEntry[];
  reports: DocumentEntry[];
  statutes: DocumentEntry[];
} = {
  protocols: [],
  reports: [],
  statutes: [],
};
for (const dir of Object.keys(typstDocuments)) {
  const matching = Object.keys(importedDocs).filter((p) =>
    path.matchesGlob(p, `/init-documents/${dir}/**/*.typ`),
  );
  for (const path of matching) {
    const mod = await importedDocs[path]();
    const document = (mod as { default: string }).default;
    const relativePath = path.split(`/init-documents/${dir}/`)[1];
    typstDocuments[dir as keyof typeof typstDocuments].push({
      path: relativePath,
      content: document,
    });
  }
}
export default typstDocuments;
