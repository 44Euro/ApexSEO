import { prisma } from "@/lib/prisma";
import { publishedFilter } from "@/lib/articles";
import { SITE_DESCRIPTION, SITE_NAME, absoluteUrl, siteUrl } from "@/lib/site";

export const revalidate = 3600;

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (char) => {
    switch (char) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      default: return "&quot;";
    }
  });
}

export async function GET() {
  const articles = await prisma.article.findMany({
    where: publishedFilter,
    orderBy: { publishedAt: "desc" },
    select: { title: true, slug: true, excerpt: true, publishedAt: true },
  });

  const items = articles
    .map(
      (article) => `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${absoluteUrl(`/blog/${article.slug}`)}</link>
      <guid>${absoluteUrl(`/blog/${article.slug}`)}</guid>
      <description>${escapeXml(article.excerpt)}</description>
      <pubDate>${article.publishedAt?.toUTCString() ?? ""}</pubDate>
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>th</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
