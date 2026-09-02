import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CategoryListRow } from "@/components/ArticleRow";
import { JsonLd } from "@/components/JsonLd";
import { prisma } from "@/lib/prisma";
import { articleSelect, getNavCategories, publishedFilter, withReadingTime } from "@/lib/articles";
import { breadcrumbJsonLd, collectionPageJsonLd, listMetadata } from "@/lib/seo";

export const revalidate = 3600;

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({ select: { slug: true } });
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const category = await prisma.category.findUnique({ where: { slug: (await params).slug } });
  if (!category) return {};
  return listMetadata({
    title: category.name,
    description: category.description,
    path: `/category/${category.slug}`,
  });
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const [categories, articlesRaw] = await Promise.all([
    getNavCategories(),
    prisma.article.findMany({
      where: { ...publishedFilter, categoryId: category.id },
      orderBy: { publishedAt: "desc" },
      select: articleSelect,
    }),
  ]);
  const articles = articlesRaw.map(withReadingTime);

  return (
    <>
      <JsonLd
        data={collectionPageJsonLd({
          name: category.name,
          description: category.description,
          path: `/category/${category.slug}`,
          articles,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "หน้าแรก", path: "/" },
          { name: category.name, path: `/category/${category.slug}` },
        ])}
      />
      <SiteNav categories={categories} current={category.slug} />

      <div
        style={{ padding: "44px 32px 30px", borderBottom: "1px solid rgba(233,233,237,.08)" }}
      >
        <Breadcrumb
          trail={[{ name: "หน้าแรก", href: "/" }, { name: category.name }]}
          className="mb-[14px]"
        />
        <h1 className="m-0 mb-[12px] text-[38px]">{category.name}</h1>
        <p className="m-0 max-w-[60ch] text-[15px] text-[#b2b6ca] [text-wrap:pretty]">
          {category.description}
        </p>
        <p className="mt-[12px] mb-0 text-[13px] text-[#75798c]">{articles.length} บทความ</p>
      </div>

      <div className="flex flex-col" style={{ padding: "8px 32px 44px" }}>
        {articles.map((article) => (
          <CategoryListRow key={article.id} article={article} />
        ))}
      </div>

      <SiteFooter />
    </>
  );
}
