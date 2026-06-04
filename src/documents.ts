import { NodeCompiler } from "@myriaddreamin/typst-ts-node-compiler";
import path from "node:path";

const importedDocs = import.meta.glob("/init-documents/**/*.typ", {
  query: "?raw",
});
const DOCUMENT_ROOT = "/init-documents/" as const; // unfortunately can't use above

export interface DocumentMetadata {
  title?: string;
  date?: Date;
  location?: string;
}

let cachedCompiler: NodeCompiler | null = null;
export async function getCompiler(): Promise<NodeCompiler> {
  if (cachedCompiler) return cachedCompiler;
  cachedCompiler = await NodeCompiler.create({
    workspace: "init-documents",
    fontArgs: [{ fontPaths: ["init-documents/assets/fonts"] }],
  });
  return cachedCompiler;
}

async function queryDocument(
  content: string,
  selector: string,
    field?: string,
): Promise<unknown[] | undefined> {
  const compiler = await getCompiler();
  try {
    const result = compiler.query(
      { mainFileContent: content },
      { selector: selector, field: field },
    );
    console.log(
      `Query result for selector "${selector}"${field ? ` and field "${field}"` : ""}:`,
      result,
    );
    return result;
  } catch (error) {
    console.error(
      `Error querying document with selector "${selector}"${field ? ` and field "${field}"` : ""}:`,
      error,
    );
    throw error;
  }
}

export async function extractMetadata(
  content: string,
): Promise<DocumentMetadata> {
  const title = (await queryDocument(content, "<title>", "value"))?.[0] as string | undefined;
  const dateStr = (await queryDocument(content, "<date>", "value"))?.[0] as string | undefined;
  const location = (await queryDocument(content, "<location>", "value"))?.[0] as string | undefined;

  let date: Date | undefined;
  if (dateStr) {
    const parsedDate = new Date(dateStr);
    if (isNaN(parsedDate.getDate())) {
      console.warn(`Invalid date format "${dateStr}". Skipping date...`);
    } else {
      date = parsedDate;
    }
  }

  return {
    title: title || undefined,
    date: date,
    location: location || undefined,
  };
}

export interface DocumentEntry {
  name: string;
  path: string;
  content: string;
  metadata: DocumentMetadata;
}

export type DocumentDir = "protocols" | "reports" | "statutes";
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

    const docMetadata = await extractMetadata(docModule.default);

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
    ).pathname
      .replace(/^\//, "")
      .replace(/\.typ$/, "");

    typstDocuments[documentDir].push({
      name: name,
      path: displayPath,
      content: docModule.default,
      metadata: docMetadata,
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
