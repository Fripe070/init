import type { APIRoute, GetStaticPaths } from "astro";
import typstDocuments, { getCompiler } from "../../documents";

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

export const GET = (async ({ props }) => {
  const compiler = await getCompiler();
  const pdfBuffer = compiler.pdf({
    mainFileContent: props.document.content,
  });
  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
    },
  });
}) satisfies APIRoute;
