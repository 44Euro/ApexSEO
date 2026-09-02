import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "@phosphor-icons/react/dist/ssr";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CategoryTag } from "@/components/CategoryTag";
import { CoverPlaceholder } from "@/components/CoverPlaceholder";
import { Prose } from "@/components/Prose";
import { prisma } from "@/lib/prisma";
import { articleSelect, withReadingTime } from "@/lib/articles";
import { formatThaiDate } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Preview",
  robots: { index: false, follow: false },
};

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const found = await prisma.article.findUnique({ where: { id }, select: articleSelect });
  if (!found) notFound();
  const article = withReadingTime(found);

  return (
    <>
      <div
        className="flex items-center gap-[12px]"
        style={{
          padding: "14px 24px",
          borderBottom: "1px solid rgba(233,233,237,.1)",
          background: "#13151f",
        }}
      >
        <Link href="/admin/articles" className="btn btn-icon btn-secondary" title="กลับ">
          <ArrowLeft size={16} />
        </Link>
        <span className="text-[15px]">Preview</span>
        <span className={article.status === "PUBLISHED" ? "tag tag-accent" : "tag tag-neutral"}>
          {article.status === "PUBLISHED" ? "Published" : "Draft"}
        </span>
        <span className="text-[11.5px] text-[#75798c]">
          หน้านี้ไม่ถูก index และเข้าได้เฉพาะตอนล็อกอิน
        </span>
        <Link href={`/admin/articles/${article.id}/edit`} className="btn btn-secondary ml-auto">
          แก้ไข
        </Link>
      </div>

      <article className="mx-auto max-w-[760px]" style={{ padding: "44px 32px 56px" }}>
        <Breadcrumb
          trail={[
            { name: "หน้าแรก" },
            { name: article.category.name },
            { name: article.title },
          ]}
          className="mb-[22px]"
        />
        <CategoryTag name={article.category.name} />
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
          <span>อัปเดต {formatThaiDate(article.updatedAt)}</span>
        </div>

        <CoverPlaceholder
          src={article.coverImageUrl}
          alt={article.title}
          label={"cover 1200×630 (= OG image)"}
          aspect="16/9"
          size="lg"
          className="mt-[26px] mb-[34px]"
        />

        <Prose markdown={article.content} />
      </article>
    </>
  );
}
