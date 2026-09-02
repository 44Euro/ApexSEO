import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { AdminSidebar } from "@/components/AdminSidebar";
import { ArticleEditor } from "@/components/ArticleEditor";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const [session, categories, slugs] = await Promise.all([
    auth(),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.article.findMany({ select: { slug: true } }),
  ]);

  if (categories.length === 0) notFound();

  return (
    <div className="grid min-h-screen grid-cols-[216px_1fr] max-md:grid-cols-1">
      <AdminSidebar current="articles" email={session?.user?.email ?? ""} />
      <ArticleEditor
        articleId={null}
        categories={categories}
        takenSlugs={slugs.map((item) => item.slug)}
        initial={{
          title: "",
          slug: "",
          excerpt: "",
          content: "",
          coverImageUrl: "",
          metaTitle: "",
          metaDescription: "",
          categoryId: categories[0].id,
          status: "DRAFT",
          updatedLabel: "ยังไม่ได้บันทึก",
        }}
      />
    </div>
  );
}
