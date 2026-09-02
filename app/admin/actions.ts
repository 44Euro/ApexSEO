"use server";

import { Prisma, Status } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { articleSchema, categorySchema, type FormState } from "@/lib/validation";

async function requireSession() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
}

function readArticleForm(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    excerpt: String(formData.get("excerpt") ?? ""),
    content: String(formData.get("content") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    coverImageUrl: String(formData.get("coverImageUrl") ?? ""),
    metaTitle: String(formData.get("metaTitle") ?? ""),
    metaDescription: String(formData.get("metaDescription") ?? ""),
  };
}

function revalidateArticle(slug: string, categorySlug: string) {
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/blog");
  revalidatePath("/");
  revalidatePath(`/category/${categorySlug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/rss.xml");
}

function duplicateSlugError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function saveArticle(
  articleId: string | null,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSession();

  const publish = formData.get("publish") === "1";

  const parsed = articleSchema.safeParse(readArticleForm(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0]);
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    const count = Object.keys(fieldErrors).length;
    return { ok: false, message: `บันทึกไม่ได้ — มี ${count} ช่องที่ต้องแก้`, fieldErrors };
  }

  const input = parsed.data;
  const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
  if (!category) {
    return { ok: false, message: "ไม่พบหมวดหมู่ที่เลือก", fieldErrors: { categoryId: "หมวดหมู่ไม่ถูกต้อง" } };
  }

  const existing = articleId
    ? await prisma.article.findUnique({
        where: { id: articleId },
        select: { slug: true, status: true, category: { select: { slug: true } } },
      })
    : null;

  const data = {
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt,
    content: input.content,
    categoryId: input.categoryId,
    coverImageUrl: input.coverImageUrl || null,
    metaTitle: input.metaTitle || null,
    metaDescription: input.metaDescription || null,
    status: publish ? Status.PUBLISHED : existing?.status ?? Status.DRAFT,
    publishedAt:
      publish && existing?.status !== Status.PUBLISHED ? new Date() : undefined,
  };

  let savedId = articleId;
  try {
    if (articleId) {
      await prisma.article.update({ where: { id: articleId }, data });
    } else {
      const created = await prisma.article.create({
        data: { ...data, publishedAt: publish ? new Date() : null },
      });
      savedId = created.id;
    }
  } catch (error) {
    if (duplicateSlugError(error)) {
      return {
        ok: false,
        message: "บันทึกไม่ได้ — มี 1 ช่องที่ต้องแก้",
        fieldErrors: { slug: "slug นี้ถูกใช้แล้ว (unique constraint) — ลองเติมปีหรือคำขยาย" },
      };
    }
    throw error;
  }

  revalidateArticle(input.slug, category.slug);
  if (existing && existing.slug !== input.slug) revalidatePath(`/blog/${existing.slug}`);
  if (existing && existing.category.slug !== category.slug) {
    revalidatePath(`/category/${existing.category.slug}`);
  }
  revalidatePath("/admin/articles");

  if (!articleId && savedId) {
    redirect(`/admin/articles/${savedId}/edit?${publish ? "published=1" : "saved=1"}`);
  }
  return { ok: true, message: publish ? "published" : "saved" };
}

export async function deleteArticle(articleId: string): Promise<void> {
  await requireSession();

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { slug: true, category: { select: { slug: true } } },
  });
  if (!article) return;

  await prisma.article.delete({ where: { id: articleId } });
  revalidateArticle(article.slug, article.category.slug);
  revalidatePath("/admin/articles");
}

export async function createCategory(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireSession();

  const parsed = categorySchema.safeParse({
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    description: String(formData.get("description") ?? ""),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0]);
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return {
      ok: false,
      message: `บันทึกไม่ได้ — มี ${Object.keys(fieldErrors).length} ช่องที่ต้องแก้`,
      fieldErrors,
    };
  }

  try {
    await prisma.category.create({ data: parsed.data });
  } catch (error) {
    if (duplicateSlugError(error)) {
      return {
        ok: false,
        message: "บันทึกไม่ได้ — มี 1 ช่องที่ต้องแก้",
        fieldErrors: { slug: "slug นี้ถูกใช้แล้ว (unique constraint)" },
      };
    }
    throw error;
  }

  revalidatePath("/admin/categories");
  revalidatePath("/blog");
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  return { ok: true, message: "created" };
}

export async function updateCategory(
  categoryId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSession();

  const parsed = categorySchema.safeParse({
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    description: String(formData.get("description") ?? ""),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0]);
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return {
      ok: false,
      message: `บันทึกไม่ได้ — มี ${Object.keys(fieldErrors).length} ช่องที่ต้องแก้`,
      fieldErrors,
    };
  }

  const previous = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!previous) return { ok: false, message: "ไม่พบหมวดหมู่" };

  try {
    await prisma.category.update({ where: { id: categoryId }, data: parsed.data });
  } catch (error) {
    if (duplicateSlugError(error)) {
      return {
        ok: false,
        message: "บันทึกไม่ได้ — มี 1 ช่องที่ต้องแก้",
        fieldErrors: { slug: "slug นี้ถูกใช้แล้ว (unique constraint)" },
      };
    }
    throw error;
  }

  revalidatePath(`/category/${previous.slug}`);
  revalidatePath(`/category/${parsed.data.slug}`);
  revalidatePath("/admin/categories");
  revalidatePath("/sitemap.xml");
  return { ok: true, message: "updated" };
}

export async function deleteCategory(categoryId: string): Promise<void> {
  await requireSession();

  const count = await prisma.article.count({ where: { categoryId } });
  if (count > 0) return;

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) return;

  await prisma.category.delete({ where: { id: categoryId } });
  revalidatePath(`/category/${category.slug}`);
  revalidatePath("/admin/categories");
  revalidatePath("/sitemap.xml");
}
