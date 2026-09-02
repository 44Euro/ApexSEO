import type { Metadata } from "next";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { Breadcrumb } from "@/components/Breadcrumb";
import { BlogListRow } from "@/components/ArticleRow";
import { CategoryTag } from "@/components/CategoryTag";
import { Pagination } from "@/components/Pagination";
import { JsonLd } from "@/components/JsonLd";
import { prisma } from "@/lib/prisma";
import { getNavCategories, getPublishedArticles, publishedFilter } from "@/lib/articles";
import { breadcrumbJsonLd, listMetadata } from "@/lib/seo";
import { ARTICLES_PER_PAGE } from "@/lib/site";

export const revalidate = 3600;

type SearchParams = Promise<{ page?: string }>;

function parsePage(value: string | undefined): number {
  const page = Number(value ?? "1");
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const page = parsePage((await searchParams).page);
  return listMetadata({
    title: page > 1 ? `บทความทั้งหมด — หน้า ${page}` : "บทความทั้งหมด",
    description:
      "รวมบทความ Formula 1 เชิงลึกทั้งหมดของ Apex Notes เรียงจากใหม่สุด ครอบคลุม Regulations, Strategy, Engineering และ History",
    path: page > 1 ? `/blog?page=${page}` : "/blog",
  });
}

export default async function BlogListPage({ searchParams }: { searchParams: SearchParams }) {
  const page = parsePage((await searchParams).page);
  const [categories, total] = await Promise.all([
    getNavCategories(),
    prisma.article.count({ where: publishedFilter }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / ARTICLES_PER_PAGE));
  const articles = await getPublishedArticles({
    skip: (page - 1) * ARTICLES_PER_PAGE,
    take: ARTICLES_PER_PAGE,
  });

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "หน้าแรก", path: "/" },
          { name: "บทความทั้งหมด", path: "/blog" },
        ])}
      />
      <SiteNav categories={categories} current="blog" />

      <div style={{ padding: "44px 32px 28px" }}>
        <Breadcrumb
          trail={[{ name: "หน้าแรก", href: "/" }, { name: "บทความทั้งหมด" }]}
          className="mb-[14px]"
        />
        <h1 className="m-0 mb-[10px] text-[38px]">บทความทั้งหมด</h1>
        <p className="m-0 text-[14px] text-[#9397ab]">{total} บทความ · เรียงจากใหม่สุด</p>
      </div>

      <div className="flex flex-wrap gap-[8px]" style={{ padding: "0 32px 12px" }}>
        <span className="tag tag-accent">ทั้งหมด</span>
        {categories.map((category) => (
          <CategoryTag
            key={category.slug}
            name={category.name}
            slug={category.slug}
            variant="neutral"
          />
        ))}
      </div>

      <div className="flex flex-col" style={{ padding: "20px 32px 8px" }}>
        {articles.map((article) => (
          <BlogListRow key={article.id} article={article} />
        ))}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} basePath="/blog" />
      <SiteFooter />
    </>
  );
}
