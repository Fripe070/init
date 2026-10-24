import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import typstDocuments, { getDocumentUrl, type DocumentDir } from "./documents";

interface FeedConfig {
  path: string;
  title: string;
  description: string;
  dirs: DocumentDir[];
}

export const feeds = {
  all: {
    path: "/documents/rss.xml",
    title: "init documents",
    description: "Meeting protocols and chapter meeting reports from init",
    dirs: ["protocols", "reports"],
  },
  protocols: {
    path: "/documents/protocols.rss.xml",
    title: "init meeting protocols",
    description: "Meeting protocols for internal meetings in init",
    dirs: ["protocols"],
  },
  reports: {
    path: "/documents/reports.rss.xml",
    title: "init SM reports",
    description: "init reports for chapter meetings",
    dirs: ["reports"],
  },
} satisfies Record<string, FeedConfig>;

export function documentFeed(
  { site }: Pick<APIContext, "site">,
  { title, description, dirs }: FeedConfig,
) {
  const items = dirs
    .flatMap((dir) => typstDocuments[dir])
    .map((doc) => ({
      title: doc.metadata.title ?? doc.name,
      pubDate: doc.metadata.date,
      link: getDocumentUrl(doc),
    }))
    .toSorted((a, b) => (b.pubDate?.getTime() ?? 0) - (a.pubDate?.getTime() ?? 0));

  return rss({ title, description, site: site!, items });
}
