import type { APIRoute } from "astro";
import typstDocuments from "../documents";

export const GET = ((request) => {
  // TODO: Include all data needed for the heim Protocol type
  //       https://github.com/itsektionen/heim/blob/efbba986070ae71e727a07f7c2b0dd962efac992/types/index.ts#L15-L20
  const documentList = Object.fromEntries(
    Object.entries(typstDocuments).map(([key, documents]) => [
      key,
      documents.map((entry) => ({
        id: entry.path,
        name: entry.name,
        url: new URL(`/documents/${entry.path}`, request.url).href,
      })),
    ]),
  );
  return new Response(JSON.stringify(documentList), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}) satisfies APIRoute;
