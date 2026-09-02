import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { ArticleCard } from "@/components/ArticleCard";
import { CoverPlaceholder } from "@/components/CoverPlaceholder";
import { CategoryTag } from "@/components/CategoryTag";
import { JsonLd } from "@/components/JsonLd";
import { getNavCategories, getPublishedArticles } from "@/lib/articles";
import { websiteJsonLd } from "@/lib/seo";
import { SITE_DESCRIPTION, SITE_TAGLINE, formatThaiDate } from "@/lib/site";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  description: SITE_DESCRIPTION,
};

export default async function HomePage() {
  const [categories, articles] = await Promise.all([getNavCategories(), getPublishedArticles({ take: 4 })]);
  const [featured, ...cards] = articles;

  return (
    <>
      <JsonLd data={websiteJsonLd()} />
      <SiteNav categories={categories} />

      <div style={{ padding: "64px 32px 48px", maxWidth: 900 }}>
        <div className="font-mono uppercase text-[11px] tracking-[.14em] text-[var(--color-accent)] mb-[18px]">
          Deep dives, not race reports
        </div>
        <h1 className="m-0 mb-[20px] text-[52px] max-w-[22ch] leading-[1.08] max-md:text-[36px]">
          {SITE_TAGLINE}
        </h1>
        <p className="m-0 text-[17px] text-[#b2b6ca] max-w-[58ch] [text-wrap:pretty]">
          ทำไม undercut ได้ผลบางสนาม ทำไม budget cap ทำให้ทีมใหญ่ปวดหัว ground effect กลับมาแล้วเปลี่ยนอะไร
          — เขียนยาว อ่านจบแล้วเข้าใจ ไม่ต้องตามข่าวทุกสัปดาห์
        </p>
      </div>

      <div className="flex items-baseline justify-between" style={{ padding: "0 32px 20px" }}>
        <h6 className="m-0 text-[#9397ab]">บทความล่าสุด</h6>
        <Link href="/blog" className="btn btn-ghost">
          ดูทั้งหมด →
        </Link>
      </div>

      {featured && (
        <article
          className="grid grid-cols-[1.05fr_1fr] items-center gap-[32px] max-lg:grid-cols-1"
          style={{ padding: "0 32px 40px" }}
        >
          <CoverPlaceholder
            src={featured.coverImageUrl}
            alt={featured.title}
            label={"cover 1600×1000 · featured\nภาพรถเข้าพิท มุมต่ำ พื้นหลังมืด\n(next/image priority)"}
            aspect="16/10"
            size="lg"
            priority
          />
          <div className="flex flex-col gap-[14px]">
            <div className="flex items-center gap-[10px]">
              <CategoryTag name={featured.category.name} slug={featured.category.slug} />
              <span className="text-[12px] text-[#75798c]">
                {featured.publishedAt ? formatThaiDate(featured.publishedAt) : "—"} · อ่าน{" "}
                {featured.readMinutes} นาที
              </span>
            </div>
            <h2 className="m-0 text-[34px] max-w-[24ch]">{featured.title}</h2>
            <p className="m-0 text-[15px] text-[#b2b6ca] max-w-[52ch] [text-wrap:pretty]">
              {featured.excerpt}
            </p>
            <Link href={`/blog/${featured.slug}`} className="btn btn-primary self-start mt-[4px]">
              อ่านบทความ
            </Link>
          </div>
        </article>
      )}

      <div style={{ padding: "0 32px 56px" }}>
        <div className="grid grid-cols-3 gap-[18px] max-lg:grid-cols-2 max-md:grid-cols-1">
          {cards.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
