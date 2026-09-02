import Link from "next/link";
import { CoverPlaceholder } from "./CoverPlaceholder";
import { CategoryTag } from "./CategoryTag";
import { formatThaiDate } from "@/lib/site";

type Article = {
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string | null;
  publishedAt: Date | null;
  category: { name: string; slug: string };
  readMinutes: number;
};

export function BlogListRow({ article }: { article: Article }) {
  return (
    <Link href={`/blog/${article.slug}`} className="block text-inherit">
      <article
        className="grid grid-cols-[196px_1fr] items-start gap-[24px] py-[22px] transition-colors hover:bg-[rgba(233,233,237,.03)] max-md:grid-cols-1"
        style={{ borderBottom: "1px solid rgba(233,233,237,.08)" }}
      >
        <CoverPlaceholder
          src={article.coverImageUrl}
          alt={article.title}
          label="cover 800×500"
          aspect="16/10"
        />
        <div className="flex flex-col gap-[9px]">
          <div className="flex items-center gap-[10px]">
            <CategoryTag name={article.category.name} />
            <span className="text-[12px] text-[#75798c]">
              {article.publishedAt ? formatThaiDate(article.publishedAt) : "—"} · อ่าน{" "}
              {article.readMinutes} นาที
            </span>
          </div>
          <h3 className="m-0 text-[23px] max-w-[32ch]">{article.title}</h3>
          <p className="m-0 text-[14px] text-[#b2b6ca] max-w-[74ch] [text-wrap:pretty]">
            {article.excerpt}
          </p>
        </div>
      </article>
    </Link>
  );
}

export function CategoryListRow({ article }: { article: Article }) {
  return (
    <Link href={`/blog/${article.slug}`} className="block text-inherit">
      <article
        className="grid grid-cols-[150px_1fr] items-start gap-[22px] py-[20px] transition-colors hover:bg-[rgba(233,233,237,.03)] max-md:grid-cols-1"
        style={{ borderBottom: "1px solid rgba(233,233,237,.08)" }}
      >
        <CoverPlaceholder
          src={article.coverImageUrl}
          alt={article.title}
          label="cover"
          aspect="16/10"
        />
        <div className="flex flex-col gap-[8px]">
          <span className="text-[12px] text-[#75798c]">
            {article.publishedAt ? formatThaiDate(article.publishedAt) : "—"} · อ่าน{" "}
            {article.readMinutes} นาที
          </span>
          <h3 className="m-0 text-[21px]">{article.title}</h3>
          <p className="m-0 text-[14px] text-[#b2b6ca] max-w-[74ch] [text-wrap:pretty]">
            {article.excerpt}
          </p>
        </div>
      </article>
    </Link>
  );
}

export function SearchResultRow({ article }: { article: Article }) {
  return (
    <Link href={`/blog/${article.slug}`} className="block text-inherit">
      <article
        className="flex flex-col gap-[7px] py-[18px]"
        style={{ borderBottom: "1px solid rgba(233,233,237,.08)" }}
      >
        <div className="flex items-center gap-[10px]">
          <CategoryTag name={article.category.name} variant="neutral" />
          <span className="text-[12px] text-[#75798c]">
            {article.publishedAt ? formatThaiDate(article.publishedAt) : "—"}
          </span>
        </div>
        <h3 className="m-0 text-[20px]">{article.title}</h3>
        <p className="m-0 text-[14px] text-[#b2b6ca] [text-wrap:pretty]">{article.excerpt}</p>
      </article>
    </Link>
  );
}
