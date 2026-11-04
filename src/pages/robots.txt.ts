import type { APIRoute } from "astro";
export const GET: APIRoute = ({ site }) =>
  new Response(
    `User-agent: *\nAllow: /\nDisallow: /demos/\nSitemap: ${site}sitemap-index.xml\n`,
  );
