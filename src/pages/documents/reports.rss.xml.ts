import type { APIRoute } from "astro";
import { documentFeed, feeds } from "../../feeds";

export const GET = ((context) => documentFeed(context, feeds.reports)) satisfies APIRoute;
