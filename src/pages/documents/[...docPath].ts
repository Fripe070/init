import type { APIRoute, GetStaticPaths } from "astro";
import typstDocuments from "../../documents";

export const getStaticPaths = (async () => {
  const paths = [];
  for (const docs of Object.values(typstDocuments)) {
    for (const doc of docs) {
      paths.push({
        params: { docPath: doc.path },
        props: { document: doc },
      });
    }
  }
  return paths;
}) satisfies GetStaticPaths;

export const GET = (({ props }) => {
  return new Response(props.document.content, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}) satisfies APIRoute;
