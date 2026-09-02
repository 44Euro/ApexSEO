import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_NAME, absoluteUrl, siteUrl } from "./site";
import { resolveMetaDescription, resolveMetaTitle } from "./seo-panel";

type ArticleSeoInput = {
  title: string;
  slug: string;
  excerpt: string;
  metaTitle: string | null;
  metaDescription: string | null;
  coverImageUrl: string | null;
  publishedAt: Date | null;
  updatedAt: Date;
  category: { name: string; slug: string };
};

const defaultOgImage = absoluteUrl("/opengraph-image");

function ogImageFor(coverImageUrl: string | null): string {
  return coverImageUrl || defaultOgImage;
}

export function articleMetadata(article: ArticleSeoInput): Metadata {
  const title = resolveMetaTitle({ title: article.title, metaTitle: article.metaTitle ?? "" });
  const description = resolveMetaDescription({
    excerpt: article.excerpt,
    metaDescription: article.metaDescription ?? "",
  });
  const url = absoluteUrl(`/blog/${article.slug}`);
  const image = ogImageFor(article.coverImageUrl);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      siteName: SITE_NAME,
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: article.title }],
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export function listMetadata(options: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = absoluteUrl(options.path);
  return {
    title: options.title,
    description: options.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      title: options.title,
      description: options.description,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: { card: "summary_large_image", title: options.title, description: options.description },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl,
    description: SITE_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absoluteUrl("/search?q={query}"),
      },
      "query-input": "required name=query",
    },
  };
}

export function blogPostingJsonLd(article: ArticleSeoInput) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: resolveMetaTitle({ title: article.title, metaTitle: article.metaTitle ?? "" }),
    description: resolveMetaDescription({
      excerpt: article.excerpt,
      metaDescription: article.metaDescription ?? "",
    }),
    image: [ogImageFor(article.coverImageUrl)],
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(`/blog/${article.slug}`) },
    articleSection: article.category.name,
    author: { "@type": "Organization", name: SITE_NAME, url: siteUrl },
    publisher: { "@type": "Organization", name: SITE_NAME, url: siteUrl },
  };
}

export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export function collectionPageJsonLd(options: {
  name: string;
  description: string;
  path: string;
  articles: { title: string; slug: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: options.name,
    description: options.description,
    url: absoluteUrl(options.path),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: options.articles.map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/blog/${article.slug}`),
        name: article.title,
      })),
    },
  };
}
