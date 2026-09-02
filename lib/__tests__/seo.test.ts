import { describe, expect, it } from "vitest";
import { articleMetadata, blogPostingJsonLd, breadcrumbJsonLd, websiteJsonLd } from "../seo";

const article = {
  title: "Ground effect คืออะไร",
  slug: "ground-effect",
  excerpt: "พื้นรถดูดตัวรถลงกับถนนได้อย่างไร",
  metaTitle: null,
  metaDescription: null,
  coverImageUrl: null,
  publishedAt: new Date("2026-08-06T02:00:00.000Z"),
  updatedAt: new Date("2026-08-09T09:45:00.000Z"),
  category: { name: "Engineering", slug: "engineering" },
};

describe("articleMetadata", () => {
  it("falls back to title and excerpt when meta fields are null", () => {
    const meta = articleMetadata(article);
    expect(meta.title).toBe(article.title);
    expect(meta.description).toBe(article.excerpt);
  });

  it("uses the explicit meta fields when present", () => {
    const meta = articleMetadata({ ...article, metaTitle: "ตั้งเอง", metaDescription: "อธิบายเอง" });
    expect(meta.title).toBe("ตั้งเอง");
    expect(meta.description).toBe("อธิบายเอง");
  });

  it("sets a self-referencing canonical", () => {
    expect(articleMetadata(article).alternates?.canonical).toContain("/blog/ground-effect");
  });

  it("marks the page as an article with both timestamps", () => {
    const og = articleMetadata(article).openGraph as Record<string, unknown>;
    expect(og.type).toBe("article");
    expect(og.publishedTime).toBe(article.publishedAt.toISOString());
    expect(og.modifiedTime).toBe(article.updatedAt.toISOString());
  });

  it("falls back to the site OG image when the article has no cover", () => {
    const og = articleMetadata(article).openGraph as { images: { url: string }[] };
    expect(og.images[0].url).toContain("/opengraph-image");
  });

  it("uses the cover image when one is set", () => {
    const og = articleMetadata({ ...article, coverImageUrl: "https://cdn.example.com/a.jpg" })
      .openGraph as { images: { url: string }[] };
    expect(og.images[0].url).toBe("https://cdn.example.com/a.jpg");
  });

  it("requests a large twitter card", () => {
    expect((articleMetadata(article).twitter as { card: string }).card).toBe("summary_large_image");
  });
});

describe("JSON-LD", () => {
  it("binds SearchAction to the search route", () => {
    const site = websiteJsonLd() as { potentialAction: { target: { urlTemplate: string } } };
    expect(site.potentialAction.target.urlTemplate).toContain("/search?q={query}");
  });

  it("emits BlogPosting with both dates", () => {
    const json = blogPostingJsonLd(article) as Record<string, unknown>;
    expect(json["@type"]).toBe("BlogPosting");
    expect(json.datePublished).toBe(article.publishedAt.toISOString());
    expect(json.dateModified).toBe(article.updatedAt.toISOString());
  });

  it("numbers breadcrumb positions from one", () => {
    const crumbs = breadcrumbJsonLd([
      { name: "หน้าแรก", path: "/" },
      { name: "Engineering", path: "/category/engineering" },
    ]) as { itemListElement: { position: number }[] };
    expect(crumbs.itemListElement.map((item) => item.position)).toEqual([1, 2]);
  });
});
