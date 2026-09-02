import { Status } from "@prisma/client";
import { auth } from "@/auth";
import { AdminSidebar } from "@/components/AdminSidebar";
import { prisma } from "@/lib/prisma";
import { formatThaiDate } from "@/lib/site";
import { ArticlesTable, type AdminRow } from "./ArticlesTable";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ status?: string }>;

function parseStatus(value: string | undefined): "ALL" | "PUBLISHED" | "DRAFT" {
  if (value === "PUBLISHED" || value === "DRAFT") return value;
  return "ALL";
}

export default async function AdminArticlesPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth();
  const status = parseStatus((await searchParams).status);

  const [articles, publishedCount, draftCount, totalCount] = await Promise.all([
    prisma.article.findMany({
      where: status === "ALL" ? undefined : { status: status as Status },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
        category: { select: { name: true } },
      },
    }),
    prisma.article.count({ where: { status: Status.PUBLISHED } }),
    prisma.article.count({ where: { status: Status.DRAFT } }),
    prisma.article.count(),
  ]);

  const rows: AdminRow[] = articles.map((article) => ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    status: article.status,
    categoryName: article.category.name,
    updatedLabel: formatThaiDate(article.updatedAt),
  }));

  return (
    <div className="relative grid min-h-screen grid-cols-[216px_1fr] max-md:grid-cols-1">
      <AdminSidebar current="articles" email={session?.user?.email ?? ""} />
      <div className="flex flex-col gap-[18px]" style={{ padding: "24px 28px" }}>
        <ArticlesTable
          rows={rows}
          status={status}
          publishedCount={publishedCount}
          draftCount={draftCount}
          totalCount={totalCount}
        />
      </div>
    </div>
  );
}
