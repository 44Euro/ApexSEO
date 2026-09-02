import type { Metadata } from "next";
import Link from "next/link";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { SearchResultRow } from "@/components/ArticleRow";
import { prisma } from "@/lib/prisma";
import { articleSelect, getNavCategories, publishedFilter, withReadingTime } from "@/lib/articles";
import { SearchForm } from "./SearchForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ค้นหาบทความ",
  robots: { index: false, follow: true },
};

type SearchParams = Promise<{ q?: string }>;

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const query = ((await searchParams).q ?? "").trim();
  const categories = await getNavCategories();

  const results = query
    ? (
        await prisma.article.findMany({
          where: {
            ...publishedFilter,
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { excerpt: { contains: query, mode: "insensitive" } },
            ],
          },
          orderBy: { publishedAt: "desc" },
          select: articleSelect,
        })
      ).map(withReadingTime)
    : [];

  return (
    <>
      <SiteNav categories={categories} showSearchButton={false} />

      <div style={{ padding: "44px 32px 24px", maxWidth: 760 }}>
        <h1 className="m-0 mb-[20px] text-[34px]">ค้นหาบทความ</h1>
        <SearchForm query={query} />
        {query && (
          <p className="mt-[16px] mb-0 text-[13px] text-[#9397ab]">
            {results.length === 0
              ? `ไม่พบผลลัพธ์สำหรับ “${query}”`
              : `พบ ${results.length} บทความสำหรับ “${query}”`}
          </p>
        )}
      </div>

      <div className="flex flex-col" style={{ padding: "0 32px 44px", maxWidth: 760 }}>
        {results.map((article) => (
          <SearchResultRow key={article.id} article={article} />
        ))}

        {query && results.length === 0 && (
          <div className="flex flex-col items-start gap-[12px]" style={{ padding: "52px 0" }}>
            <MagnifyingGlass size={28} color="#595d6c" />
            <h3 className="m-0 text-[22px]">ไม่พบบทความที่ตรงกับคำค้นนี้</h3>
            <p className="m-0 text-[14px] text-[#9397ab]">ลองคำสั้นลง หรือดูตามหมวดแทน</p>
            <div className="mt-[6px] flex gap-[8px]">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  className="tag tag-outline"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <SiteFooter />
    </>
  );
}
