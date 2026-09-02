import { countWords, readingMinutes } from "./reading-time";

export const META_TITLE_MAX = 60;
export const META_TITLE_MIN = 25;
export const META_DESC_MAX = 155;
export const META_DESC_MIN = 80;
export const OG_DESC_LIMIT = 90;

export const COUNTER_OUT_OF_RANGE = "#b5abfc";
export const COUNTER_IN_RANGE = "#75798c";
export const CHECK_PASS = "#9184d9";
export const CHECK_WARN = "#b5abfc";
export const CHECK_INFO = "#75798c";

export type CheckKind = "pass" | "warn" | "info";

export type SeoCheck = {
  kind: CheckKind;
  label: string;
};

export type SeoDraft = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  coverImageUrl: string;
};

export function resolveMetaTitle(draft: Pick<SeoDraft, "title" | "metaTitle">): string {
  return draft.metaTitle || draft.title;
}

export function resolveMetaDescription(
  draft: Pick<SeoDraft, "excerpt" | "metaDescription">,
): string {
  return draft.metaDescription || draft.excerpt;
}

function imagesMissingAlt(markdown: string): number {
  const matches = markdown.matchAll(/!\[([^\]]*)\]\([^)]*\)/g);
  let missing = 0;
  for (const match of matches) {
    if (!match[1].trim()) missing++;
  }
  return missing;
}

export function buildChecks(draft: SeoDraft, takenSlugs: string[]): SeoCheck[] {
  const titleLength = resolveMetaTitle(draft).length;
  const slugTaken = takenSlugs.includes(draft.slug);
  const missingAlt = imagesMissingAlt(draft.content);

  return [
    { kind: "pass", label: "มี h1 เดียวในหน้า (ชื่อบทความ)" },
    !draft.slug
      ? { kind: "warn", label: "ยังไม่ได้ตั้ง slug" }
      : slugTaken
        ? { kind: "warn", label: "slug นี้ถูกใช้กับบทความอื่นแล้ว" }
        : { kind: "pass", label: "slug ไม่ซ้ำกับบทความอื่น" },
    titleLength > META_TITLE_MAX
      ? { kind: "warn", label: "meta title ยาวเกิน 60 ตัวอักษร Google จะตัด" }
      : { kind: "pass", label: "meta title อยู่ในช่วงที่ดี" },
    draft.coverImageUrl
      ? { kind: "pass", label: "มี coverImageUrl สำหรับ OG image" }
      : { kind: "warn", label: "ยังไม่มี coverImageUrl จะ fallback เป็น OG image ของเว็บ" },
    missingAlt > 0
      ? { kind: "warn", label: `มีรูปในเนื้อหา ${missingAlt} ภาพที่ยังไม่ได้ใส่ alt` }
      : { kind: "info", label: "รูปในเนื้อหาต้องมี alt ครบทุกภาพ" },
  ];
}

export function deriveSeoPanel(draft: SeoDraft, takenSlugs: string[] = []) {
  const serpTitle = resolveMetaTitle(draft);
  const serpDescription = resolveMetaDescription(draft);
  const titleLength = serpTitle.length;
  const descriptionLength = serpDescription.length;
  const words = countWords(draft.content);

  return {
    titleLength,
    descriptionLength,
    titleColor:
      titleLength > META_TITLE_MAX || titleLength < META_TITLE_MIN
        ? COUNTER_OUT_OF_RANGE
        : COUNTER_IN_RANGE,
    descriptionColor:
      descriptionLength > META_DESC_MAX || descriptionLength < META_DESC_MIN
        ? COUNTER_OUT_OF_RANGE
        : COUNTER_IN_RANGE,
    titleBarWidth: `${Math.min(100, (titleLength / META_TITLE_MAX) * 100)}%`,
    descriptionBarWidth: `${Math.min(100, (descriptionLength / META_DESC_MAX) * 100)}%`,
    titleHint: draft.metaTitle
      ? titleLength > META_TITLE_MAX
        ? "ยาวเกิน Google จะตัดท้าย"
        : "ความยาวโอเค"
      : "ว่างอยู่ — จะ fallback ไปใช้ชื่อบทความ",
    descriptionHint: draft.metaDescription
      ? descriptionLength > META_DESC_MAX
        ? "ยาวเกิน 155 อาจถูกตัด"
        : "ความยาวโอเค"
      : "ว่างอยู่ — จะ fallback ไปใช้ excerpt",
    serpTitle,
    serpDescription,
    ogDescription: serpDescription.slice(0, OG_DESC_LIMIT),
    wordCount: words,
    readMinutes: readingMinutes(draft.content),
    checks: buildChecks(draft, takenSlugs),
  };
}
