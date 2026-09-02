import Link from "next/link";
import { CoverPlaceholder } from "./CoverPlaceholder";
import { formatThaiDate } from "@/lib/site";

type Props = {
  article: {
    title: string;
    slug: string;
    excerpt: string;
    coverImageUrl: string | null;
    publishedAt: Date | null;
    category: { name: string };
    readMinutes: number;
  };
  withCover?: boolean;
  withExcerpt?: boolean;
};

export function ArticleCard({ article, withCover = true, withExcerpt = true }: Props) {
  return (
    <Link href={`/blog/${article.slug}`} className="text-inherit">
      <div
        className="card elev-sm h-full transition-shadow hover:shadow-[0_0_0_1px_#75798c]"
        style={withCover ? { padding: 16, gap: 10 } : undefined}
      >
        {withCover && (
          <CoverPlaceholder
            src={article.coverImageUrl}
            alt={article.title}
            label="cover 800×450"
            aspect="16/9"
          />
        )}
        <div className="card-kicker">{article.category.name}</div>
        <div className="card-title" style={withCover ? { fontSize: 18 } : undefined}>
          {article.title}
        </div>
        {withExcerpt && <p className="card-body">{article.excerpt}</p>}
        <div className="card-meta">
          {article.publishedAt ? formatThaiDate(article.publishedAt) : "—"} · อ่าน{" "}
          {article.readMinutes} นาที
        </div>
      </div>
    </Link>
  );
}
