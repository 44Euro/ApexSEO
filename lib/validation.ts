import { z } from "zod";

export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const articleSchema = z.object({
  title: z.string().trim().min(1, "ต้องกรอกชื่อบทความ"),
  slug: z
    .string()
    .trim()
    .min(1, "ต้องกรอก slug")
    .regex(slugPattern, "slug ใช้ได้เฉพาะ a-z, 0-9 และ - เท่านั้น"),
  excerpt: z.string().trim().min(1, "ต้องกรอก excerpt"),
  content: z.string().trim().min(1, "ต้องกรอกเนื้อหา"),
  categoryId: z.string().trim().min(1, "ต้องเลือกหมวดหมู่"),
  coverImageUrl: z
    .string()
    .trim()
    .refine((value) => value === "" || /^https?:\/\/.+/.test(value), "ต้องเป็น URL ที่ขึ้นต้นด้วย http"),
  metaTitle: z.string().trim(),
  metaDescription: z.string().trim(),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1, "ต้องกรอกชื่อหมวด"),
  slug: z
    .string()
    .trim()
    .min(1, "ต้องกรอก slug")
    .regex(slugPattern, "slug ใช้ได้เฉพาะ a-z, 0-9 และ - เท่านั้น"),
  description: z.string().trim().min(1, "ต้องกรอกคำอธิบายหมวด"),
});

export type ArticleInput = z.infer<typeof articleSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;

export type FormState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
