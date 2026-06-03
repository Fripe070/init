import path from "node:path";

const importedDocs = import.meta.glob("/init-documents/**/*.typ", {
  query: "?raw",
});
const DOCUMENT_ROOT = "/init-documents/" as const; // unfortunately can't use above

export type DocumentDir = "protocols" | "reports" | "statutes";
export interface DocumentEntry {
  name: string;
  path: string;
  content: string;
}
const typstDocuments: Record<DocumentDir, DocumentEntry[]> = {
  protocols: [],
  reports: [],
  statutes: [],
};

for (const documentDir of Object.keys(typstDocuments) as DocumentDir[]) {
  const matching = Object.keys(importedDocs).filter((p) =>
    path.matchesGlob(p, path.join(DOCUMENT_ROOT, documentDir, "**/*.typ")),
  );
  for (const docPath of matching) {
    const docModule = (await importedDocs[docPath]()) as { default: string };

    const name = (() => {
      switch (documentDir) {
        case "statutes":
          return path.basename(docPath, ".typ"); // file name
        default:
          return path.basename(path.join(docPath, "..")); // dir name
      }
    })();

    // going to and from a url normalises the path regardless of platform
    const displayPath = new URL(
      path.relative(DOCUMENT_ROOT, docPath),
      "file://",
    ).pathname.slice(1); // Slice away leading slash

    typstDocuments[documentDir].push({
      name: name,
      path: displayPath,
      content: docModule.default,
    });
  }
}

if (import.meta.env.DEV) {
  // All documents should have unique paths
  const allDocs = Object.values(typstDocuments).flat();
  const uniquePaths = new Set(allDocs.map((doc) => doc.path));
  if (uniquePaths.size !== allDocs.length) {
    throw new Error("Document paths are not unique");
  }
}

export default typstDocuments;
