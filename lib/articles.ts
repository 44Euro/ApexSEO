import { Status } from "@prisma/client";
import { prisma } from "./prisma";
import { readingMinutes } from "./reading-time";

export const articleSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  content: true,
  coverImageUrl: true,
  status: true,
  metaTitle: true,
  metaDescription: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { id: true, name: true, slug: true, description: true } },
} as const;

type RawArticle = { content: string };

export function withReadingTime<T extends RawArticle>(article: T) {
  return { ...article, readMinutes: readingMinutes(article.content) };
}

export const publishedFilter = { status: Status.PUBLISHED } as const;

export async function getPublishedArticles(options?: { skip?: number; take?: number }) {
  const articles = await prisma.article.findMany({
    where: publishedFilter,
    orderBy: { publishedAt: "desc" },
    select: articleSelect,
    skip: options?.skip,
    take: options?.take,
  });
  return articles.map(withReadingTime);
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function getNavCategories() {
  const order = ["regulations", "strategy", "engineering", "history"];
  const categories = await prisma.category.findMany({ select: { name: true, slug: true } });
  return categories.sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug));
}

export async function getArticleBySlug(slug: string) {
  const article = await prisma.article.findUnique({ where: { slug }, select: articleSelect });
  return article ? withReadingTime(article) : null;
}
