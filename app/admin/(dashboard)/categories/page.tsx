import { auth } from "@/auth";
import { AdminSidebar } from "@/components/AdminSidebar";
import { prisma } from "@/lib/prisma";
import { CategoriesPanel, type CategoryRow } from "./CategoriesPanel";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const [session, categories] = await Promise.all([
    auth(),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { articles: true } } },
    }),
  ]);

  const rows: CategoryRow[] = categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    articleCount: category._count.articles,
  }));

  return (
    <div className="relative grid min-h-screen grid-cols-[216px_1fr] max-md:grid-cols-1">
      <AdminSidebar current="categories" email={session?.user?.email ?? ""} />
      <div className="flex flex-col gap-[20px]" style={{ padding: "24px 28px" }}>
        <CategoriesPanel categories={rows} />
      </div>
    </div>
  );
}
