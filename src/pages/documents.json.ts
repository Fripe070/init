import type { APIRoute } from "astro";
import typstDocuments from "../documents";

export const GET = ((request) => {
  interface DocumentMetadata {
    title?: string;
    date?: string;
    location?: string;
  }
  interface DocumentEntry {
    path: string;
    name: string;
    url: string;
    metadata: DocumentMetadata;
  }
  const documentList: Record<string, DocumentEntry[]> = {};
  for (const [key, documents] of Object.entries(typstDocuments)) {
    documentList[key] = [];
    for (const entry of documents) {

      documentList[key].push({
        path: entry.path,
        name: entry.name,
        metadata: {
          title: entry.metadata.title,
          date: entry.metadata.date ? new Date(entry.metadata.date).toISOString().split("T")[0] : undefined,
          location: entry.metadata.location,
        },
        url: new URL(`/documents/${entry.path}`, request.url).href,
      });
    }
  }
  return new Response(JSON.stringify(documentList), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}) satisfies APIRoute;
