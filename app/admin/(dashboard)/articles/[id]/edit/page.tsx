import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { AdminSidebar } from "@/components/AdminSidebar";
import { ArticleEditor } from "@/components/ArticleEditor";
import { prisma } from "@/lib/prisma";
import { formatThaiDate } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ published?: string }>;
}) {
  const { id } = await params;
  const [session, article, categories, slugs] = await Promise.all([
    auth(),
    prisma.article.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.article.findMany({ where: { NOT: { id } }, select: { slug: true } }),
  ]);

  if (!article) notFound();

  return (
    <div className="grid min-h-screen grid-cols-[216px_1fr] max-md:grid-cols-1">
      <AdminSidebar current="articles" email={session?.user?.email ?? ""} />
      <ArticleEditor
        articleId={article.id}
        categories={categories}
        takenSlugs={slugs.map((item) => item.slug)}
        initialToast={(await searchParams).published === "1"}
        initial={{
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          content: article.content,
          coverImageUrl: article.coverImageUrl ?? "",
          metaTitle: article.metaTitle ?? "",
          metaDescription: article.metaDescription ?? "",
          categoryId: article.categoryId,
          status: article.status,
          updatedLabel: `แก้ไขล่าสุด ${formatThaiDate(article.updatedAt)}`,
        }}
      />
    </div>
  );
}
