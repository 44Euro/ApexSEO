import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock } from "@phosphor-icons/react/dist/ssr";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CategoryTag } from "@/components/CategoryTag";
import { CoverPlaceholder } from "@/components/CoverPlaceholder";
import { ShareButtons } from "@/components/ShareButtons";
import { ArticleCard } from "@/components/ArticleCard";
import { JsonLd } from "@/components/JsonLd";
import { Prose } from "@/components/Prose";
import { prisma } from "@/lib/prisma";
import {
  articleSelect,
  getArticleBySlug,
  getNavCategories,
  publishedFilter,
  withReadingTime,
} from "@/lib/articles";
import { articleMetadata, blogPostingJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { absoluteUrl, formatThaiDate } from "@/lib/site";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const articles = await prisma.article.findMany({
    where: publishedFilter,
    select: { slug: true },
  });
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const article = await getArticleBySlug((await params).slug);
  if (!article || article.status !== "PUBLISHED") return {};
  return articleMetadata(article);
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article || article.status !== "PUBLISHED") notFound();

  const [categories, relatedRaw] = await Promise.all([
    getNavCategories(),
    prisma.article.findMany({
      where: { ...publishedFilter, categoryId: article.category.id, NOT: { id: article.id } },
      orderBy: { publishedAt: "desc" },
      take: 2,
      select: articleSelect,
    }),
  ]);
  const related = relatedRaw.map(withReadingTime);
  const url = absoluteUrl(`/blog/${article.slug}`);

  return (
    <>
      <JsonLd data={blogPostingJsonLd(article)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "หน้าแรก", path: "/" },
          { name: article.category.name, path: `/category/${article.category.slug}` },
          { name: article.title, path: `/blog/${article.slug}` },
        ])}
      />
      <SiteNav categories={categories} current={article.category.slug} />

      <article className="mx-auto max-w-[760px]" style={{ padding: "44px 32px 0" }}>
        <Breadcrumb
          trail={[
            { name: "หน้าแรก", href: "/" },
            { name: article.category.name, href: `/category/${article.category.slug}` },
            { name: article.title },
          ]}
          className="mb-[22px]"
        />
        <CategoryTag name={article.category.name} slug={article.category.slug} />
        <h1 className="mt-[16px] mb-[18px] text-[44px] leading-[1.1] max-md:text-[32px]">
          {article.title}
        </h1>
        <p className="m-0 mb-[22px] text-[18px] text-[#cfd3e5] [text-wrap:pretty]">
          {article.excerpt}
        </p>

        <div
          className="flex flex-wrap items-center gap-[14px] text-[13px] text-[#9397ab]"
          style={{
            padding: "14px 0",
            borderTop: "1px solid rgba(233,233,237,.1)",
            borderBottom: "1px solid rgba(233,233,237,.1)",
          }}
        >
          <span className="inline-flex items-center gap-[6px]">
            <Clock size={15} />
            อ่าน {article.readMinutes} นาที
          </span>
          <span className="opacity-40">·</span>
          <span>เผยแพร่ {article.publishedAt ? formatThaiDate(article.publishedAt) : "—"}</span>
          <span className="opacity-40">·</span>
          <span>อัปเดต {formatThaiDate(article.updatedAt)}</span>
          <ShareButtons url={url} title={article.title} />
        </div>

        <CoverPlaceholder
          src={article.coverImageUrl}
          alt={article.title}
          label={`cover 1200×630 (= OG image)\nภาพประกอบบทความ พื้นหลังมืด\nalt: "${article.title}"`}
          aspect="16/9"
          size="lg"
          priority
          className="mt-[26px] mb-[8px]"
        />
        <p className="m-0 mb-[34px] text-[11px] text-[#75798c]">ภาพ: ใส่ credit ที่นี่</p>

        <Prose markdown={article.content} />

        <div
          className="mt-[44px] elev-sm"
          style={{ padding: "20px 22px", borderRadius: 8, background: "#232532" }}
        >
          <div className="card-kicker mb-[8px]">สรุปสั้น</div>
          <p className="m-0 text-[14px] text-[#cfd3e5] [text-wrap:pretty]">{article.excerpt}</p>
        </div>

        <div
          className="mt-[34px] flex flex-wrap items-center gap-[8px]"
          style={{ paddingTop: 22, borderTop: "1px solid rgba(233,233,237,.1)" }}
        >
          <span className="mr-[6px] text-[12px] text-[#75798c]">หมวด</span>
          <CategoryTag name={article.category.name} slug={article.category.slug} variant="outline" />
          <Link href="/blog" className="btn btn-ghost ml-auto">
            ← กลับไปหน้ารายการ
          </Link>
        </div>
      </article>

      {related.length > 0 && (
        <section className="mx-auto max-w-[760px]" style={{ padding: "52px 32px 56px" }}>
          <h6 className="m-0 mb-[18px] text-[#9397ab]">
            อ่านต่อในหมวด {article.category.name}
          </h6>
          <div className="grid grid-cols-2 gap-[16px] max-md:grid-cols-1">
            {related.map((item) => (
              <ArticleCard key={item.id} article={item} withCover={false} withExcerpt={false} />
            ))}
          </div>
        </section>
      )}

      <SiteFooter />
    </>
  );
}
